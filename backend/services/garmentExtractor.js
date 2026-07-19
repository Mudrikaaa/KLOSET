const { classifyGarmentPhoto } = require('./visionService');

// ============================================================================
// garmentExtractor — orchestrates the free, self-hosted extraction pipeline.
//
// Flow per uploaded photo:
//   1. Gemini classification (free tier): worn or flat? separable top+bottom?
//   2. Taxonomy veto: self-contained garments are NEVER split.
//   3. Worn photo  -> ml-service /parse (SegFormer): garment-only cutouts with
//      the person removed; split top/bottom only when allowed AND confident.
//      Flat photo  -> ml-service /cutout (rembg): background removal.
//   4. ANY failure, timeout, or missing service -> fewer/no cutouts.
//
// Contract: extractGarments never throws and never blocks a save — the
// caller stores the original photo regardless, and cutouts are a bonus.
// ============================================================================

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';
// why generous timeouts: SegFormer on a laptop CPU takes 10-30s per photo.
// The save waits at most this long and then proceeds without a cutout.
const CUTOUT_TIMEOUT_MS = 25000;
const PARSE_TIMEOUT_MS = 45000;

// why this veto list: these garments are one styling unit even when they have
// visually distinct halves. A lehenga set's choli+skirt, a sharara/gharara
// suit, a co-ord, an anarkali over churidar, a gown, a saree with blouse —
// splitting them would create wardrobe rows the owner would never style
// independently, and the composer would then pair them wrongly. Sets stay one
// item; only genuinely independent separates (kurta+jeans, top+skirt) split.
const SELF_CONTAINED_CATEGORIES = new Set([
  'Sarees', 'Lehengas', 'Suits & Sets', 'Dresses', 'Dupattas & Stoles',
]);
const SELF_CONTAINED_SUBTYPES = new Set([
  'Anarkali', 'Kaftan', 'Bodysuit',
]);

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const imageForm = (buffer, mimeType) => {
  const form = new FormData();
  form.append('image', new Blob([buffer], { type: mimeType }), 'photo');
  return form;
};

const callCutout = async (buffer, mimeType) => {
  const res = await fetchWithTimeout(
    `${ML_SERVICE_URL}/cutout`,
    { method: 'POST', body: imageForm(buffer, mimeType) },
    CUTOUT_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(`cutout ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

const callParse = async (buffer, mimeType) => {
  const res = await fetchWithTimeout(
    `${ML_SERVICE_URL}/parse`,
    { method: 'POST', body: imageForm(buffer, mimeType) },
    PARSE_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(`parse ${res.status}`);
  return res.json();
};

const isSelfContained = (category, subType) =>
  SELF_CONTAINED_CATEGORIES.has(category) || SELF_CONTAINED_SUBTYPES.has(subType);

/**
 * @param {Buffer} buffer   original photo
 * @param {string} mimeType
 * @param {{category: string, subType: string|null}} taxonomy the user-confirmed
 *        taxonomy of the (primary) garment in the photo
 * @returns {Promise<{cutouts: Array<{role: 'single'|'top'|'bottom', buffer: Buffer}>,
 *                    lowerGarment: {category: string, subType: string|null}|null}>}
 */
const extractGarments = async (buffer, mimeType, taxonomy = {}) => {
  const none = { cutouts: [], lowerGarment: null };
  try {
    const classification = await classifyGarmentPhoto(buffer, mimeType); // null on failure
    const worn = classification ? classification.wornByPerson : false;
    const splitAllowed =
      !isSelfContained(taxonomy.category, taxonomy.subType) &&
      !!(classification && classification.separableTopBottom);

    if (worn) {
      // Person in frame: rembg would keep the person, so garment parsing is
      // the only path to a clean garment-only cutout.
      try {
        const parsed = await callParse(buffer, mimeType);
        if (parsed.mode === 'split' && splitAllowed && parsed.top && parsed.bottom) {
          return {
            cutouts: [
              { role: 'top', buffer: Buffer.from(parsed.top.png_b64, 'base64') },
              { role: 'bottom', buffer: Buffer.from(parsed.bottom.png_b64, 'base64') },
            ],
            lowerGarment: classification ? classification.lowerGarment : null,
          };
        }
        if ((parsed.mode === 'split' || parsed.mode === 'single') && parsed.single) {
          return { cutouts: [{ role: 'single', buffer: Buffer.from(parsed.single.png_b64, 'base64') }], lowerGarment: null };
        }
        return none; // mode 'none' — parser found no garment worth cutting
      } catch (err) {
        console.warn('[Extractor] parse unavailable, falling back to rembg cutout:', err.message);
        // Fall through: a background-removed photo of the person wearing the
        // garment still beats nothing for a worn photo.
      }
    }

    const cutout = await callCutout(buffer, mimeType);
    return { cutouts: [{ role: 'single', buffer: cutout }], lowerGarment: null };
  } catch (err) {
    console.warn('[Extractor] extraction skipped:', err.message);
    return none;
  }
};

module.exports = { extractGarments, isSelfContained };
