# Kloset ML Service

Free, open-source, self-hosted garment extraction for Kloset. No paid APIs.

| Endpoint | What it does | Model |
|---|---|---|
| `POST /cutout` | Background removal → transparent PNG | [rembg](https://github.com/danielgatis/rembg) (u2net) |
| `POST /parse` | Garment parsing on worn photos: drops the person, returns garment-only cutouts, splits top/bottom when confident | [SegFormer B2 clothes](https://huggingface.co/mattmdjaga/segformer_b2_clothes) |
| `GET /health` | `{ status, parser }` | — |

## Run

```bash
cd ml-service
python -m venv .venv && .venv\Scripts\activate    # Windows
pip install -r requirements.txt                    # light: rembg + FastAPI

# OPTIONAL heavy extra for /parse (multi-GB torch download):
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install transformers

uvicorn main:app --host 0.0.0.0 --port 8001
```

First `/cutout` call downloads the u2net model (~170 MB) once; first `/parse`
call downloads SegFormer (~200 MB) once.

The Express backend finds this service via `ML_SERVICE_URL` in `backend/.env`
(default `http://localhost:8001`). If the service is down, slow, or installed
without torch, the backend silently degrades: cutout-only, or no cutout at
all — a wardrobe save never fails because of this service.
