# ============================================================================
# Kloset ML service — garment extraction (100% free / open-source, self-hosted)
#
#   POST /cutout  : rembg background removal -> transparent PNG (whole subject)
#   POST /parse   : SegFormer clothes parsing on a WORN photo -> garment-only
#                   cutouts with the person removed; splits top/bottom when
#                   both are confidently present, and always returns a
#                   "single" union-of-garments cutout as the safe choice.
#   GET  /health  : { status, parser } — parser=false means torch/transformers
#                   aren't installed; /cutout still works.
#
# Run:  pip install -r requirements.txt
#       uvicorn main:app --host 0.0.0.0 --port 8001
#
# why a separate Python service: rembg and SegFormer are Python-ecosystem
# models with no production-grade Node ports. The Express backend calls this
# over HTTP and treats every failure as "no cutout" — a slow or dead model
# must never block a wardrobe save.
# ============================================================================
import base64
import io

import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, Response
from PIL import Image

app = FastAPI(title="Kloset ML Service")

# --- rembg (lightweight, ~170MB u2net model auto-downloaded on first use) ---
from rembg import new_session, remove

REMBG_SESSION = new_session("u2net")

# --- SegFormer clothes parser (heavy: torch + transformers). Loaded lazily
# and OPTIONAL — why: torch is a multi-GB install; the service must still
# provide /cutout on machines that only installed the light requirements. ----
_parser = None
_parser_failed = False


def get_parser():
    global _parser, _parser_failed
    if _parser is None and not _parser_failed:
        try:
            from transformers import SegformerForSemanticSegmentation, SegformerImageProcessor

            model_id = "mattmdjaga/segformer_b2_clothes"
            _parser = {
                "processor": SegformerImageProcessor.from_pretrained(model_id),
                "model": SegformerForSemanticSegmentation.from_pretrained(model_id),
            }
        except Exception as e:  # torch/transformers missing or download failed
            print(f"[parse] parser unavailable: {e}")
            _parser_failed = True
    return _parser


# mattmdjaga/segformer_b2_clothes label ids
LBL_UPPER, LBL_SKIRT, LBL_PANTS, LBL_DRESS, LBL_BELT, LBL_SCARF = 4, 5, 6, 7, 8, 17
PERSON_LABELS = {2, 11, 12, 13, 14, 15}  # hair, face, legs, arms
GARMENT_LABELS = {LBL_UPPER, LBL_SKIRT, LBL_PANTS, LBL_DRESS, LBL_BELT, LBL_SCARF}
# a mask must cover at least this fraction of the image to count as a real
# garment (filters out sliver misdetections like a sock labelled "pants")
MIN_COVERAGE = 0.03


def masked_png_b64(img: Image.Image, mask: np.ndarray) -> str:
    """Apply a boolean mask as alpha, crop to bounding box, return base64 PNG."""
    rgba = img.convert("RGBA")
    alpha = (mask * 255).astype(np.uint8)
    arr = np.array(rgba)
    arr[:, :, 3] = alpha
    ys, xs = np.where(mask)
    pad = 8
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, arr.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, arr.shape[1])
    out = Image.fromarray(arr[y0:y1, x0:x1])
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


@app.get("/health")
def health():
    return {"status": "ok", "parser": get_parser() is not None}


@app.post("/cutout")
async def cutout(image: UploadFile = File(...)):
    data = await image.read()
    out = remove(data, session=REMBG_SESSION)
    return Response(content=out, media_type="image/png")


@app.post("/parse")
async def parse(image: UploadFile = File(...)):
    parser = get_parser()
    if parser is None:
        return JSONResponse({"error": "parser_unavailable"}, status_code=503)

    import torch

    data = await image.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    # cap the working size — CPU inference on phone photos at full resolution
    # is minutes, not seconds; 1024px keeps masks crisp enough for cutouts
    img.thumbnail((1024, 1024))

    inputs = parser["processor"](images=img, return_tensors="pt")
    with torch.no_grad():
        logits = parser["model"](**inputs).logits
    seg = (
        torch.nn.functional.interpolate(logits, size=img.size[::-1], mode="bilinear", align_corners=False)
        .argmax(dim=1)[0]
        .numpy()
    )

    total = seg.size
    cov = {lbl: float((seg == lbl).sum()) / total for lbl in GARMENT_LABELS | PERSON_LABELS}
    person = sum(cov[l] for l in PERSON_LABELS) > 0.02

    upper_mask = seg == LBL_UPPER
    lower_mask = (seg == LBL_SKIRT) | (seg == LBL_PANTS)
    dress_mask = seg == LBL_DRESS
    union_mask = np.isin(seg, list(GARMENT_LABELS))

    upper_cov = float(upper_mask.sum()) / total
    lower_cov = float(lower_mask.sum()) / total
    dress_cov = float(dress_mask.sum()) / total
    union_cov = float(union_mask.sum()) / total

    if union_cov < MIN_COVERAGE:
        return JSONResponse({"person": person, "mode": "none"})

    result = {
        "person": person,
        "coverage": {"upper": upper_cov, "lower": lower_cov, "dress": dress_cov, "union": union_cov},
        # the union cutout (all garments, person dropped) is always offered —
        # it is the safe answer whenever splitting is vetoed or uncertain
        "single": {"png_b64": masked_png_b64(img, union_mask), "coverage": union_cov},
    }

    # Split only when BOTH pieces are confidently present and the outfit isn't
    # dominated by a one-piece (dress/gown/saree reads as 'dress' here).
    if upper_cov >= MIN_COVERAGE and lower_cov >= MIN_COVERAGE and dress_cov < max(upper_cov, lower_cov):
        result["mode"] = "split"
        result["top"] = {"png_b64": masked_png_b64(img, upper_mask), "coverage": upper_cov}
        result["bottom"] = {"png_b64": masked_png_b64(img, lower_mask), "coverage": lower_cov}
    else:
        result["mode"] = "single"

    return JSONResponse(result)
