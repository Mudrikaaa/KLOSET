const { GARMENT_ENUMS } = require('./garmentEnums');

// =========================================================================
// Vision auto-detection service (Gemini Flash).
//
// why: this is the ONLY file that knows which AI provider we use. The rest of
// the app depends solely on analyzeGarmentImage(buffer, mimeType) returning a
// sanitized { detected, lowConfidence } object (or detected: null on any
// failure). To switch providers later (OpenAI, Claude, a self-hosted model),
// rewrite the internals of this file and nothing else.
//
// The API key lives ONLY in backend/.env — it must never reach the Expo app.
// Requires Node 18+ (global fetch).
// =========================================================================

// why gemini-3.5-flash: probed against the live API (2026-07) — 2.x free tiers
// are retired for new keys and 2.5-flash is closed to new users; 3.5-flash is
// the current free-tier flash model with vision support.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
// why: 20s cap — a stylist filling the form manually takes ~60s, so any wait
// longer than this destroys the feature's whole value; better to fail silently
// and let the user fill the form themselves.
const TIMEOUT_MS = 20000;

const list = (arr) => arr.join(' | ');

/**
 * The prompt is built from the REAL enum values parsed out of the frontend
 * source (see garmentEnums.js) so the model can never invent an option the
 * form does not have.
 */
const buildPrompt = (e) => `You are a senior Indian-fashion stylist cataloguing a single garment photo for a wardrobe app.

Look at the image and return ONLY a strict JSON object (no prose, no markdown fences) with exactly these keys:

{
  "category": one of: ${list(e.categories)},
  "subType": one of: ${list(e.subTypes)},
  "style": one of: ${list(e.styles)},
  "colors": array of 1-3 dominant colors, each EXACTLY one of: ${list(e.colors)},
  "fit": one of: ${list(e.fits)},
  "fabric": one of: ${list(e.fabrics)},
  "length": one of: ${list(e.lengths)},
  "pattern": one of: ${list(e.patterns)},
  "neckline": one of: ${list(e.necklines)},
  "sleeve": one of: ${list(e.sleeves)},
  "structure": one of: ${list(e.structures)},
  "embellishment": one of: ${list(e.embellishments)},
  "opacity": one of: ${list(e.opacities)},
  "season": one of: ${list(e.seasons)},
  "occasions": array of 1-4 entries, each EXACTLY one of: ${list(e.occasions)}
}

Rules:
- Pick ONLY from the given options, character-for-character. NEVER invent a value.
- The subType must belong to the chosen category (e.g. "Anarkali" only under "Kurtas & Tunics").
- style: traditional Indian garments (kurtas, sarees, lehengas, dupattas, salwar/sharara/gharara, juttis, kolhapuris) are "Ethnic". Indo-western mixes (dhoti pants with a crop top, kurta over jeans) are "Fusion". "Western" is only for unambiguously western pieces. "Streetwear" needs clear streetwear styling (oversized graphic tees, cargos, chunky sneakers). "Minimal" is for clean solid-colour basics.
- Colors: order by dominance; name the shade precisely (e.g. deep bluish red on silk is "Maroon", not "Red"; a metallic zari border is "Gold (Metallic)").
- Indian garments: recognise crafts correctly — gota patti, zardozi, bandhani, mirror work, block print — and prefer the specific craft over generic "Embroidered" pattern when visible.
- Bandhani / leheriya tie-dye dots: set pattern to "Bandhani / Tie-Dye" (never "Printed"). If the piece ALSO carries a surface craft (gota patti, zardozi, mirror work), that craft takes the embellishment slot; use embellishment "Bandhani" only when no other craft is present.
- Fabric: a photo shows drape and sheen, not hand-feel — be conservative. Choose "Silk" only with strong evidence (dense lustrous weave, woven zari borders as on Banarasi). Light, floaty dupattas and sarees are usually "Georgette", "Chiffon" or "Cotton"; shiny synthetics are "Satin" or "Polyester". When torn between Silk and Georgette/Chiffon, choose the latter.
- For shoes/accessories use "Not Applicable" where a field does not apply.
- If genuinely unsure of a field, choose the most conservative plausible option; do not omit keys.`;

/**
 * Keep a value only if it is a real member of the allowed list.
 * why: even with a strict prompt, LLM output is untrusted input — anything the
 * form's enums don't contain would corrupt dropdown state on the client.
 */
const pickValid = (value, allowed) =>
  typeof value === 'string' && allowed.includes(value) ? value : undefined;

const pickValidArray = (value, allowed, max) =>
  Array.isArray(value)
    ? value.filter((v) => typeof v === 'string' && allowed.includes(v)).slice(0, max)
    : [];

const sanitize = (raw) => {
  const e = GARMENT_ENUMS;
  const detected = {
    category: pickValid(raw.category, e.categories),
    subType: pickValid(raw.subType, e.subTypes),
    style: pickValid(raw.style, e.styles),
    colors: pickValidArray(raw.colors, e.colors, 3),
    fit: pickValid(raw.fit, e.fits),
    fabric: pickValid(raw.fabric, e.fabrics),
    length: pickValid(raw.length, e.lengths),
    pattern: pickValid(raw.pattern, e.patterns),
    neckline: pickValid(raw.neckline, e.necklines),
    sleeve: pickValid(raw.sleeve, e.sleeves),
    structure: pickValid(raw.structure, e.structures),
    embellishment: pickValid(raw.embellishment, e.embellishments),
    opacity: pickValid(raw.opacity, e.opacities),
    season: pickValid(raw.season, e.seasons),
    occasions: pickValidArray(raw.occasions, e.occasions, 4),
  };
  // Drop empty keys so the client only touches fields we actually detected
  Object.keys(detected).forEach((k) => {
    const v = detected[k];
    if (v === undefined || (Array.isArray(v) && v.length === 0)) delete detected[k];
  });
  return detected;
};

/**
 * Analyze a garment image and return pre-fill values for the upload form.
 *
 * @param {Buffer} imageBuffer raw image bytes (from multer memory storage)
 * @param {string} mimeType e.g. 'image/jpeg'
 * @returns {Promise<{ detected: object|null, lowConfidence: string[] }>}
 *          detected is null whenever detection is unavailable or fails —
 *          callers must treat that as "user fills the form manually".
 */
const analyzeGarmentImage = async (imageBuffer, mimeType) => {
  // why: these need context a photo cannot show — fabric is hand-feel,
  // season is fabric weight, occasions are the owner's actual calendar —
  // so they are always flagged as AI guesses for the user to double-check.
  const lowConfidence = ['fabric', 'season', 'occasions'];

  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Vision] GEMINI_API_KEY not configured — skipping auto-detection.');
    return { detected: null, lowConfidence };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: buildPrompt(GARMENT_ENUMS) },
            { inline_data: { mime_type: mimeType, data: imageBuffer.toString('base64') } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,          // why: cataloguing task — we want determinism, not creativity
          responseMimeType: 'application/json',
          // why: flash models "think" by default, which measured ~18s per photo;
          // enum-constrained visual cataloguing doesn't need reasoning depth,
          // it needs speed — a stylist wants the form filled in a few seconds.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[Vision] Gemini API error ${response.status}:`, errText.slice(0, 500));
      return { detected: null, lowConfidence };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('[Vision] Gemini returned no text candidate.');
      return { detected: null, lowConfidence };
    }

    const detected = sanitize(JSON.parse(text));
    console.log('[Vision] Detection succeeded:', Object.keys(detected).join(', '));
    return { detected, lowConfidence };
  } catch (err) {
    // Timeouts, network failures, malformed JSON — all collapse to "no
    // detection"; the upload flow must keep working without AI.
    console.error('[Vision] Detection failed:', err.name === 'AbortError' ? `timeout after ${TIMEOUT_MS}ms` : err.message);
    return { detected: null, lowConfidence };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Quick classification for the extraction pipeline: is this a photo of a
 * WORN outfit, and does it contain a separable top + bottom?
 * Free Gemini pass, strict JSON, and — like everything in this file — any
 * failure resolves to null so the caller falls back safely.
 */
const classifyGarmentPhoto = async (imageBuffer, mimeType) => {
  if (!process.env.GEMINI_API_KEY) return null;

  const e = GARMENT_ENUMS;
  const prompt = `You are cataloguing a clothing photo for a wardrobe app. Return ONLY strict JSON (no prose, no fences):

{
  "wornByPerson": true if a person is wearing the clothes in the photo, false for flat-lays / hangers / product shots,
  "separableTopBottom": true ONLY if the photo shows a distinct upper garment AND a distinct lower garment that are separate pieces of clothing (e.g. kurta + jeans, blouse + skirt). false for any one-piece or matched set: saree, lehenga set, sharara/gharara set, anarkali, gown, dress, co-ord set, jumpsuit,
  "lowerGarment": null, or when separableTopBottom is true: { "category": one of: ${'Bottoms | Ethnic Bottoms'}, "subType": one of: ${list(e.subTypes.filter((s) => ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Culottes', 'Joggers', 'Leggings', 'Churidar', 'Patiala', 'Palazzo', 'Dhoti Pants', 'Sharara', 'Gharara'].includes(s)))} }
}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBuffer.toString('base64') } },
          ],
        }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const raw = JSON.parse(text);
    return {
      wornByPerson: !!raw.wornByPerson,
      separableTopBottom: !!raw.separableTopBottom,
      lowerGarment: raw.lowerGarment && typeof raw.lowerGarment === 'object'
        ? {
            category: ['Bottoms', 'Ethnic Bottoms'].includes(raw.lowerGarment.category) ? raw.lowerGarment.category : 'Bottoms',
            subType: pickValid(raw.lowerGarment.subType, GARMENT_ENUMS.subTypes),
          }
        : null,
    };
  } catch (err) {
    console.error('[Vision] classifyGarmentPhoto failed:', err.name === 'AbortError' ? 'timeout' : err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { analyzeGarmentImage, classifyGarmentPhoto };
