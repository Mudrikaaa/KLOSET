const {
  getAllowedFormalities,
  getOccasionColorBlacklist,
  getOccasionStyleProfile,
  PALETTE_MOODS,
  isNeutral,
  isMetallic,
  colorUndertone,
  colorsHarmonize,
} = require('./stylistRules');

// ============================================================================
// outfitComposer — builds complete outfits from the USER'S OWN wardrobe.
//
// Philosophy (mirrors the catalog engine's contract):
//  * HARD rules  = occasion formality band, coverage preference, cultural
//    colour vetoes, pairing coherence (a silk saree never meets sneakers).
//  * SOFT scores = style lane fit, palette mood, undertone flattery, style
//    preference. Preferences rank; they never veto.
// Every outfit ships with a short multi-line WHY, because a suggestion the
// owner can't defend is a suggestion they won't wear.
// ============================================================================

// --- Formality ladder: 0 athleisure … 4 black-tie-adjacent -----------------

const FORMALITY_BAND = {
  'Casual': [0, 1.5],
  'Smart Casual': [1, 2.5],
  'Semi-formal': [2, 3.2],
  'Festive': [2.5, 4],
  'Party': [2, 4],
  'Formal': [3, 4],
};

const DRESSY_FABRICS = new Set(['Silk', 'Banarasi', 'Brocade', 'Velvet', 'Organza', 'Satin', 'Chanderi', 'Tussar Silk', 'Georgette', 'Crepe', 'Net']);
const CASUAL_FABRICS = new Set(['Denim', 'Knit', 'Fleece', 'Lycra / Stretch']);
const RICH_EMBELLISHMENTS = new Set(['Zardozi', 'Gota Patti', 'Sequin / Mukaish', 'Mirror Work', 'Hand Embroidery', 'Beadwork']);

const SUBTYPE_FORMALITY = {
  // shoes
  'Heels': 3, 'Wedges': 2.5, 'Juttis': 2.5, 'Kolhapuris': 2, 'Flats': 2, 'Sandals': 1.5, 'Boots': 1.5, 'Sneakers': 0.5,
  // outers
  'Blazer': 3, 'Waistcoat': 2.5, 'Cape': 2.5, 'Shrug': 2, 'Cardigan': 1.5, 'Jacket': 1, 'Sweater': 1, 'Hoodie': 0.5,
  // tops
  'Blouse': 2, 'Shirt': 2, 'Bodysuit': 1.5, 'Camisole': 1.5, 'T-shirt': 0.5, 'Tank Top': 0.5, 'Crop Top': 1, 'Tube Top': 1.5,
  // bottoms
  'Trousers': 2, 'Culottes': 1.5, 'Skirt': 1.5, 'Jeans': 1, 'Shorts': 0.5, 'Joggers': 0.5, 'Leggings': 0.5,
};

const CATEGORY_FORMALITY = {
  'Sarees': 3, 'Lehengas': 3.5, 'Suits & Sets': 2.5, 'Kurtas & Tunics': 2,
  'Dresses': 2, 'Dupattas & Stoles': 2, 'Ethnic Bottoms': 2,
  'Tops': 1, 'Bottoms': 1.5, 'Outers': 1.5, 'Shoes': 1.5, 'Accessories': 1.5,
};

/** Infer a 0–4 formality level for a wardrobe item from what it IS. */
const itemFormality = (item) => {
  let level = SUBTYPE_FORMALITY[item.sub_type] ?? CATEGORY_FORMALITY[item.category] ?? 1.5;
  if (RICH_EMBELLISHMENTS.has(item.embellishment)) level += 1;
  else if (item.embellishment && item.embellishment !== 'None') level += 0.5;
  if (DRESSY_FABRICS.has(item.fabric)) level += 0.7;
  if (CASUAL_FABRICS.has(item.fabric)) level -= 0.7;
  return Math.max(0, Math.min(4, level));
};

const ETHNIC_CATEGORIES = new Set(['Kurtas & Tunics', 'Sarees', 'Lehengas', 'Suits & Sets', 'Dupattas & Stoles', 'Ethnic Bottoms']);

// --- Coverage: honour the user's comfort as a hard rule --------------------

const isRevealing = (item) => {
  if (item.opacity === 'Sheer') return true;
  if (['Crop Top', 'Tube Top', 'Tank Top', 'Camisole', 'Mini Dress', 'Bodycon', 'Shorts'].includes(item.sub_type)) return true;
  if (item.category === 'Dresses' && ['Crop', 'Short'].includes(item.length)) return true;
  return false;
};

const passesCoverage = (item, coverage) => {
  if (coverage === 'Open') return true;
  if (coverage === 'Moderate') return item.opacity !== 'Sheer' || item.category === 'Dupattas & Stoles';
  // Modest
  return !isRevealing(item) || item.category === 'Dupattas & Stoles';
};

// --- Season -----------------------------------------------------------------

const seasonOk = (item, season) =>
  !season || !item.season || item.season === 'All-season' || item.season === season;

// --- Outfit templates: how a stylist actually assembles a look --------------
// Each template lists slots; required slots must fill from the wardrobe,
// optional ones join when a coherent piece exists.

const TEMPLATES = [
  { key: 'saree',     lane: 'Ethnic', slots: [{ cat: 'Sarees', req: true }, { cat: 'Shoes', req: false }] },
  { key: 'lehenga',   lane: 'Ethnic', slots: [{ cat: 'Lehengas', req: true }, { cat: 'Dupattas & Stoles', req: false }, { cat: 'Shoes', req: false }] },
  { key: 'suit-set',  lane: 'Ethnic', slots: [{ cat: 'Suits & Sets', req: true }, { cat: 'Dupattas & Stoles', req: false }, { cat: 'Shoes', req: false }] },
  { key: 'kurta-set', lane: 'Ethnic', slots: [{ cat: 'Kurtas & Tunics', req: true }, { cat: 'Ethnic Bottoms', req: true }, { cat: 'Dupattas & Stoles', req: false }, { cat: 'Shoes', req: false }] },
  // why this template exists: kurta-over-jeans is the everyday Indian fusion
  // uniform, and crop-top-with-sharara/palazzo is its dressed-up sibling.
  { key: 'fusion-kurta', lane: 'Fusion', slots: [{ cat: 'Kurtas & Tunics', req: true }, { cat: 'Bottoms', req: true }, { cat: 'Shoes', req: false }] },
  { key: 'fusion-top', lane: 'Fusion', slots: [{ cat: 'Tops', req: true }, { cat: 'Ethnic Bottoms', req: true }, { cat: 'Dupattas & Stoles', req: false }, { cat: 'Shoes', req: false }] },
  { key: 'dress',     lane: 'Western', slots: [{ cat: 'Dresses', req: true }, { cat: 'Outers', req: false }, { cat: 'Shoes', req: false }] },
  { key: 'separates', lane: 'Western', slots: [{ cat: 'Tops', req: true }, { cat: 'Bottoms', req: true }, { cat: 'Outers', req: false }, { cat: 'Shoes', req: false }] },
];

// Streetwear/Minimal ride on 'separates'/'dress' — the lane of a composed
// outfit is refined from its pieces' own style tags below.
const outfitLane = (template, items) => {
  const styles = items.map((i) => i.style).filter(Boolean);
  if (template.lane === 'Fusion') return 'Fusion';
  if (styles.length && styles.every((s) => s === 'Streetwear')) return 'Streetwear';
  if (styles.length && styles.every((s) => s === 'Minimal')) return 'Minimal';
  return template.lane;
};

// --- Pairing coherence (hard) -----------------------------------------------

const patternIsLoud = (item) =>
  item.pattern && !['Solid', 'Embroidered'].includes(item.pattern);

// why: a plain, solid, unembellished basic in neutral colours is a chameleon —
// a white palazzo dresses up under a gota patti anarkali and down under a tee.
// Chameleons don't get a vote in the formality-gap check (they adapt), though
// they still count toward the outfit's average register.
const isChameleonBasic = (item) =>
  ['Tops', 'Bottoms', 'Ethnic Bottoms'].includes(item.category) &&
  item.pattern === 'Solid' &&
  (!item.embellishment || item.embellishment === 'None') &&
  (item.colors || []).every(isNeutral);

const pairingOk = (items) => {
  const main = items.filter((i) => !['Shoes', 'Accessories', 'Dupattas & Stoles', 'Outers'].includes(i.category));
  const opinionated = main.filter((i) => !isChameleonBasic(i));
  const levels = opinionated.map(itemFormality);
  // why 1.6: one register of difference is styling; two is a costume error
  // (this is the rule that keeps silk sarees away from sneakers).
  if (levels.length > 1 && Math.max(...levels) - Math.min(...levels) > 1.6) return false;
  const shoes = items.find((i) => i.category === 'Shoes');
  if (shoes && levels.length) {
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    if (Math.abs(itemFormality(shoes) - avg) > 1.8) return false;
  }
  // One statement per outfit: at most one loudly patterned main piece.
  if (main.filter(patternIsLoud).length > 1) return false;
  // Colours must harmonize across the whole look.
  return colorsHarmonize(items.flatMap((i) => i.colors || []));
};

// --- Scoring (soft) ----------------------------------------------------------

const scoreOutfit = (items, lane, occasion, profile, user) => {
  let score = 0;
  const colors = [...new Set(items.flatMap((i) => i.colors || []))];

  // Lane fit: earlier in the occasion's lane list = more naturally at home
  const laneIdx = profile.lanes.indexOf(lane);
  if (laneIdx >= 0) score += Math.max(0, 3 - laneIdx);

  // Palette mood fit
  const moodColors = new Set(profile.paletteMoods.flatMap((m) => PALETTE_MOODS[m] || []));
  if (moodColors.size && colors.some((c) => moodColors.has(c))) score += 2;

  // Statement discipline: rich rooms reward embellishment, clean rooms punish it
  const rich = items.some((i) => RICH_EMBELLISHMENTS.has(i.embellishment));
  if (profile.statement === 'rich' && rich) score += 2;
  if (profile.statement === 'clean' && rich) score -= 2;

  // Undertone flattery (same rule as the catalog engine)
  if (user.undertone === 'Warm' && colors.some((c) => colorUndertone(c) === 'warm' && !isNeutral(c))) score += 2;
  if (user.undertone === 'Cool' && colors.some((c) => colorUndertone(c) === 'cool' && !isNeutral(c))) score += 2;

  // Style preference nudge
  if (user.style_pref && lane === user.style_pref) score += 1;

  // Items the user explicitly tagged for this occasion know something we don't
  score += items.filter((i) => (i.occasions || []).includes(occasion)).length;

  // Practicality: heavyweight formal pieces are a styling error in
  // floor-sitting / stain-prone / travel-light rooms even when the formality
  // band tolerates them (a zardozi banarasi at a mehendi, packed for a trek).
  if (profile.avoidHeavy && items.some((i) => itemFormality(i) > 3.4)) score -= 3;

  // Footwear coherence: shoes should speak the outfit's language, and
  // flats-friendly rooms (mehendi, temple, shopping marathons) punish heels.
  const shoe = items.find((i) => i.category === 'Shoes');
  if (shoe) {
    if (shoe.style === lane) score += 1;
    const flat = ['Flats', 'Juttis', 'Kolhapuris', 'Sandals', 'Sneakers'].includes(shoe.sub_type);
    if (profile.flatsFriendly && flat) score += 1;
    if (profile.flatsFriendly && shoe.sub_type === 'Heels') score -= 1;
  }

  return score;
};

// --- The WHY: 4–5 short lines, specific to this outfit and this user --------

const LANE_LABEL = { Ethnic: 'traditional', Fusion: 'indo-western', Western: 'western', Minimal: 'minimal', Streetwear: 'street-style' };

const BODY_NOTES = {
  saree: 'The saree\'s vertical drape lengthens and skims — the most universally flattering line in Indian dressing.',
  lehenga: 'A fitted waist with full flare defines the narrowest point and moves beautifully.',
  'kurta-set': 'The kurta\'s straight fall skims the midsection while the bottom keeps the line clean.',
  'suit-set': 'A matched set reads instantly put-together with zero styling decisions.',
  'fusion-kurta': 'Kurta-over-denim keeps casual\'s ease with ethnic\'s polish.',
  'fusion-top': 'A fitted top over flared ethnic bottoms balances every proportion.',
  dress: 'One piece, one line — the dress decides the silhouette for you.',
  separates: 'Separates let you control exactly where the eye rests.',
};

// 4–5 lines: what it is, why it suits the room, why the colours suit YOU,
// why the silhouette works, and (when present) the one-statement rule.
const buildExplanation = (templateKey, items, lane, occasion, profile, user, formalityWord) => {
  const lines = [];
  const names = items.map((i) => `${(i.colors || [])[0] || ''} ${i.sub_type || i.category}`.trim().toLowerCase());

  lines.push(`A ${LANE_LABEL[lane] || lane.toLowerCase()} look from your closet — ${names.join(' + ')} — pitched at ${occasion}'s ${formalityWord.toLowerCase()} register.`);

  if (profile.note) lines.push(profile.note.charAt(0).toUpperCase() + profile.note.slice(1) + '.');

  const colors = [...new Set(items.flatMap((i) => i.colors || []))];
  const real = colors.filter((c) => !isNeutral(c));
  if (user.undertone && real.some((c) => colorUndertone(c) === user.undertone.toLowerCase())) {
    lines.push(`${real.join(' and ')} flatter your ${user.undertone.toLowerCase()} undertone${user.skin_tone ? ` and glow on ${user.skin_tone.toLowerCase()} skin` : ''}.`);
  } else if (real.length) {
    lines.push(`${real.join(' and ')} ${real.length > 1 ? 'stay in one colour story' : 'does the talking'}, with the rest kept quiet.`);
  } else {
    lines.push('An all-neutral palette — impossible to get wrong, easy to accessorise up or down.');
  }

  if (BODY_NOTES[templateKey]) lines.push(BODY_NOTES[templateKey]);

  const rich = items.find((i) => RICH_EMBELLISHMENTS.has(i.embellishment));
  if (rich) {
    lines.push(`The ${rich.embellishment.toLowerCase()} is your one statement — everything else steps back to let it work.`);
  }

  return lines.slice(0, 5).join('\n');
};

/**
 * Compose up to `limit` outfits from the user's wardrobe for an occasion.
 *
 * @param items    wardrobe_items rows (snake_case, colors[] populated)
 * @param user     users row (body_shape, skin_tone, undertone, style_pref,
 *                 coverage_preference, color_comfort)
 * @param occasion exact occasion string
 * @param opts     { season, coverage } — explicit spec overrides from the UI
 */
const composeOutfits = (items, user, occasion, opts = {}) => {
  const profile = getOccasionStyleProfile(occasion);
  const allowed = getAllowedFormalities(occasion) || ['Casual', 'Smart Casual'];
  const blacklist = new Set(getOccasionColorBlacklist(occasion));
  const coverage = opts.coverage || user.coverage_preference || 'Moderate';
  const season = opts.season || null;

  // Occasion's tolerated formality range = union of its registers' bands
  const lo = Math.min(...allowed.map((f) => FORMALITY_BAND[f][0]));
  const hi = Math.max(...allowed.map((f) => FORMALITY_BAND[f][1]));
  const formalityWord = allowed[0];

  // Hard-filter the wardrobe once
  const pool = items.filter((i) =>
    passesCoverage(i, coverage) &&
    seasonOk(i, season) &&
    !(i.colors || []).some((c) => blacklist.has(c))
  );
  const byCat = {};
  for (const i of pool) (byCat[i.category] = byCat[i.category] || []).push(i);

  const candidates = [];
  for (const tpl of TEMPLATES) {
    const required = tpl.slots.filter((s) => s.req);
    if (!required.every((s) => (byCat[s.cat] || []).length)) continue;

    // Anchor on the first required slot; try up to 4 anchors per template
    const anchors = (byCat[required[0].cat] || []).slice(0, 4);
    for (const anchor of anchors) {
      const picked = [anchor];
      let ok = true;
      for (const slot of tpl.slots.slice(1)) {
        const options = (byCat[slot.cat] || []).filter((o) => o.id !== anchor.id);
        // Greedy: best coherent partner for what's already picked
        const fit = options
          .filter((o) => pairingOk([...picked, o]))
          .sort((a, b) =>
            scoreOutfit([...picked, b], tpl.lane, occasion, profile, user) -
            scoreOutfit([...picked, a], tpl.lane, occasion, profile, user)
          )[0];
        if (fit) picked.push(fit);
        else if (slot.req) { ok = false; break; }
      }
      if (!ok || !pairingOk(picked)) continue;

      // Outfit-level formality must land inside the occasion's band
      const mains = picked.filter((i) => !['Shoes', 'Dupattas & Stoles'].includes(i.category));
      const level = mains.reduce((a, i) => a + itemFormality(i), 0) / mains.length;
      if (level < lo - 0.3 || level > hi + 0.3) continue;

      const lane = outfitLane(tpl, picked);
      const score = scoreOutfit(picked, lane, occasion, profile, user);
      const explanation = buildExplanation(tpl.key, picked, lane, occasion, profile, user, formalityWord);

      candidates.push({ templateKey: tpl.key, lane, items: picked, score, explanation });
    }
  }

  // Rank, and don't let one anchor garment dominate the list
  candidates.sort((a, b) => b.score - a.score);
  const seen = {};
  const result = [];
  for (const c of candidates) {
    const anchorId = c.items[0].id;
    seen[anchorId] = (seen[anchorId] || 0) + 1;
    if (seen[anchorId] > 2) continue;
    result.push(c);
    if (result.length >= (opts.limit || 6)) break;
  }
  return result;
};

module.exports = { composeOutfits, itemFormality };
