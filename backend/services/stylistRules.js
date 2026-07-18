const fs = require('fs');
const path = require('path');

// ============================================================================
// stylistRules — the single "designer brain" for Kloset.
//
// Everything here is a fashion product decision, not an engineering one:
// which style lanes fit an occasion, which palettes flatter it, what culture
// forbids, and how formal each register is. Keep the rules DIRECTIONAL, not
// hyper-specific — the engine suggests lanes and vetoes clashes; it does not
// dictate exact garments.
//
// Grounding (verified July 2026, editorial sources + WedMeGood/Aza guides):
//  * Cocktail / pre-wedding is now an indo-western & western room — gowns,
//    liquid-metal drapes, sharara-with-halter fusion; jewel tones, metallics,
//    and black are all at home there.
//  * At the wedding CEREMONY guests avoid the bride's red AND stark white
//    (mourning connotation) and skew modest; reception/cocktail relax this.
//  * Mehendi = greens/yellows/pinks in light fabrics, flats or block heels
//    (henna-wet hands can't manage buttons or straps).
//  * Sangeet = metallics, sequin/mirror work, silhouettes that can dance.
//  * Haldi-adjacent events (godh bharai) = warm yellows, stain-forgiving.
// ============================================================================

// ---------------------------------------------------------------------------
// Occasion → allowed formality registers (hard filter downstream).
// ---------------------------------------------------------------------------
const occasionToFormality = {
  // Festive & Family
  'Diwali Party (Family)': ['Festive', 'Semi-formal'],
  'Diwali Party (Friends)': ['Festive', 'Party', 'Smart Casual'],
  'Holi': ['Casual'],
  'Navratri / Garba': ['Festive', 'Party'],
  'Eid': ['Festive', 'Semi-formal', 'Formal'],
  'Regional Festival': ['Festive', 'Semi-formal'],
  'Pooja / Temple Visit': ['Festive', 'Semi-formal'],

  // Weddings
  'Mehendi Function': ['Festive', 'Party'],
  'Sangeet Night': ['Party', 'Festive'],
  'Wedding (Close Family)': ['Formal', 'Festive'],
  'Wedding (Guest)': ['Festive', 'Semi-formal'],
  'Reception': ['Formal', 'Party'],
  'Cocktail / Pre-wedding': ['Party', 'Semi-formal'],
  'Engagement Ceremony': ['Semi-formal', 'Festive'],
  'Roka / Sagai': ['Semi-formal', 'Festive'],

  // College
  'First Day of College': ['Smart Casual', 'Casual'],
  'College Farewell': ['Semi-formal', 'Smart Casual'],
  'College Fest (Day)': ['Casual', 'Smart Casual'],
  'College Fest (Night)': ['Party', 'Smart Casual'],
  'College Trip': ['Casual'],
  'Internship (Startup)': ['Smart Casual', 'Casual'],
  'Internship (Corporate)': ['Smart Casual', 'Semi-formal'],

  // Professional
  'Job Interview (Tech)': ['Smart Casual', 'Semi-formal'],
  'Job Interview (Corporate)': ['Formal', 'Semi-formal'],
  'Office (Startup)': ['Smart Casual', 'Casual'],
  'Office (Formal)': ['Formal', 'Semi-formal'],
  'Client Meeting': ['Semi-formal', 'Formal'],

  // Social
  'Casual Outing': ['Casual', 'Smart Casual'],
  'Mall / Shopping Day': ['Casual', 'Smart Casual'],
  'Brunch / Cafe': ['Smart Casual', 'Casual'],
  'Dinner Date': ['Smart Casual', 'Semi-formal'],
  'First Date': ['Smart Casual', 'Semi-formal'],
  'Night Out': ['Party', 'Smart Casual'],
  'House Party': ['Smart Casual', 'Casual', 'Party'],

  // Special
  'My Birthday': ['Party', 'Smart Casual', 'Festive'],
  "Friend's Birthday": ['Party', 'Smart Casual'],
  'Travel Day': ['Casual'],
  'Airport / Travel Look': ['Smart Casual', 'Casual'],
  'Gym / Workout': ['Casual'],
  'Beach / Pool Day': ['Casual'],
  'WFH / Video Call': ['Smart Casual', 'Casual'],
  'Anniversary Dinner': ['Semi-formal', 'Formal'],
  'Baby Shower / Godh Bharai': ['Festive', 'Smart Casual'],
  'Hill Station Trip': ['Casual', 'Smart Casual'],
  'Heritage City Sightseeing': ['Casual', 'Smart Casual'],
  'Graduation Day': ['Semi-formal', 'Smart Casual', 'Festive'],
  'Award Ceremony / Convocation': ['Semi-formal', 'Formal'],
};

const getAllowedFormalities = (occasion) => {
  if (!occasion) return null;
  const occLower = occasion.toLowerCase();

  for (const [key, val] of Object.entries(occasionToFormality)) {
    if (key.toLowerCase() === occLower) return val;
  }
  // Fuzzy fallbacks for free-text occasions
  if (occLower.includes('wedding') || occLower.includes('cocktail') || occLower.includes('marriage')) {
    return ['Formal', 'Festive', 'Party'];
  }
  if (occLower.includes('party') || occLower.includes('night') || occLower.includes('dinner')) {
    return ['Festive', 'Party', 'Smart Casual'];
  }
  if (occLower.includes('office') || occLower.includes('work') || occLower.includes('interview')) {
    return ['Smart Casual', 'Semi-formal', 'Formal'];
  }
  if (occLower.includes('festival') || occLower.includes('diwali') || occLower.includes('pooja') || occLower.includes('eid')) {
    return ['Festive', 'Formal', 'Semi-formal'];
  }
  return ['Casual', 'Smart Casual'];
};

// ---------------------------------------------------------------------------
// Cultural colour rules (hard vetoes) — deliberately MINIMAL.
//
// OWNER'S DOCTRINE — keep Western and Indian etiquette separate:
// "Don't wear white / don't wear red / don't upstage the bride" is WESTERN
// wedding etiquette (the bride wears white there) that foreign-facing guides
// wrongly project onto Indian weddings. Indian weddings are maximalist —
// guests wear red, gold and full embellishment freely, and the app already
// asks the user's own preferences, so the engine assumes NO colour
// restrictions at weddings on anyone's behalf.
//
// The single veto kept: black for pooja/temple, a genuinely common Indian
// custom for religious rituals.
// ---------------------------------------------------------------------------
const getOccasionColorBlacklist = (occasion) => {
  const occLower = (occasion || '').toLowerCase();

  if (occLower.includes('pooja') || occLower.includes('temple')) {
    return ['Black'];
  }
  return [];
};

// ---------------------------------------------------------------------------
// Palette moods — groups of exact swatch names from constants/ColorPalette.ts.
// Used as soft scoring bias, never as a hard filter.
// ---------------------------------------------------------------------------
const PALETTE_MOODS = {
  jewel: ['Emerald', 'Bottle Green', 'Teal', 'Cobalt', 'Royal Blue', 'Navy', 'Indigo', 'Burgundy', 'Wine', 'Plum', 'Aubergine', 'Magenta', 'Maroon', 'Violet', 'Purple'],
  metallic: ['Gold', 'Gold (Metallic)', 'Silver', 'Copper', 'Bronze', 'Rose Gold'],
  pastel: ['Blush', 'Peach', 'Powder Blue', 'Sky Blue', 'Ice Blue', 'Lavender', 'Lilac', 'Mint', 'Pistachio', 'Dusty Rose', 'Cream', 'Off-White'],
  earthy: ['Rust', 'Terracotta', 'Olive', 'Camel', 'Mustard', 'Turmeric', 'Brown', 'Coffee', 'Tan', 'Sand', 'Khaki'],
  bright: ['Hot Pink', 'Orange', 'Tangerine', 'Yellow', 'Coral', 'Magenta', 'Red', 'Scarlet', 'Emerald', 'Teal'],
  neutral: ['White', 'Black', 'Grey', 'Light Grey', 'Charcoal', 'Beige', 'Navy', 'Cream', 'Ivory', 'Camel', 'Taupe', 'Khaki', 'Olive', 'Brown', 'Slate'],
  festiveGreens: ['Green', 'Emerald', 'Mint', 'Pistachio', 'Teal', 'Bottle Green', 'Sage'],
  haldiYellows: ['Yellow', 'Mustard', 'Turmeric', 'Gold', 'Orange', 'Peach', 'Coral'],
};

// ---------------------------------------------------------------------------
// Occasion style profiles.
// lanes: which style languages belong in the room, in order of how naturally
//        they sit there (used to rank composed outfits, never to hard-block —
//        a confident dresser can bring fusion almost anywhere).
// paletteMoods: soft colour bias for the room.
// statement: 'rich' rooms reward embellishment; 'clean' rooms punish it.
// flatsFriendly: rooms where heels are a liability, not a look.
// note: one editorial line the explanation generator can quote.
// ---------------------------------------------------------------------------
// avoidHeavy: rooms where heavyweight formal pieces (banarasi, zardozi-loaded
// silk) are a styling error even if the formality band tolerates them —
// mehendi means henna-wet hands and floor seating, trips mean packing light.
const DEFAULT_STYLE_PROFILE = {
  lanes: ['Western', 'Fusion', 'Minimal', 'Ethnic', 'Streetwear'],
  paletteMoods: [],
  statement: 'either',
  flatsFriendly: true,
  avoidHeavy: false,
  note: '',
};

const OCCASION_STYLE = {
  'Diwali Party (Family)': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['jewel', 'metallic', 'earthy'], statement: 'rich', flatsFriendly: true,
    note: 'family Diwali rewards traditional richness — warm metallics and jewel tones glow in diya light',
  },
  'Diwali Party (Friends)': {
    lanes: ['Fusion', 'Ethnic', 'Western'], paletteMoods: ['jewel', 'metallic', 'bright'], statement: 'rich', flatsFriendly: true,
    note: 'a friends\' Diwali takes festive with an edge — fusion separates and dressy western both belong',
  },
  'Holi': {
    lanes: ['Minimal', 'Western'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true, avoidHeavy: true,
    note: 'white cotton you can sacrifice is the only dress code — gulal shows truest on white',
  },
  'Navratri / Garba': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['bright', 'metallic'], statement: 'rich', flatsFriendly: true,
    note: 'garba is athletic — mirror work and bright chaniya-style flare that can spin for hours',
  },
  'Eid': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['pastel', 'jewel', 'metallic'], statement: 'rich', flatsFriendly: true,
    note: 'Eid elegance leans graceful — pastels, ivory-gold and flowing silhouettes over loud sparkle',
  },
  'Regional Festival': {
    lanes: ['Ethnic'], paletteMoods: ['bright', 'earthy', 'metallic'], statement: 'rich', flatsFriendly: true,
    note: 'regional festivals are where traditional weaves and crafts belong most',
  },
  'Pooja / Temple Visit': {
    lanes: ['Ethnic'], paletteMoods: ['pastel', 'earthy', 'haldiYellows'], statement: 'clean', flatsFriendly: true,
    note: 'temple dressing is modest and light — easy fabrics, covered shoulders, slip-off footwear',
  },
  'Mehendi Function': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['festiveGreens', 'haldiYellows', 'pastel'], statement: 'either', flatsFriendly: true, avoidHeavy: true,
    note: 'greens and yellows are mehendi\'s colours; light fabrics and flats, because henna-wet hands can\'t manage straps',
  },
  'Sangeet Night': {
    lanes: ['Ethnic', 'Fusion', 'Western'], paletteMoods: ['jewel', 'metallic', 'bright'], statement: 'rich', flatsFriendly: false,
    note: 'sangeet outfits must dance — sequins and metallics yes, trailing hems and fragile drapes no',
  },
  'Wedding (Close Family)': {
    lanes: ['Ethnic'], paletteMoods: ['jewel', 'metallic', 'bright'], statement: 'rich', flatsFriendly: false,
    note: 'an Indian wedding is the occasion to go all out — rich silks, reds, golds and heirloom-level embellishment all belong',
  },
  'Wedding (Guest)': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['jewel', 'bright', 'metallic', 'pastel'], statement: 'rich', flatsFriendly: false,
    note: 'Indian weddings are maximalist for everyone — dress up as much as you want; reds, jewel tones and heavy craft are all welcome',
  },
  'Reception': {
    lanes: ['Western', 'Fusion', 'Ethnic'], paletteMoods: ['jewel', 'metallic'], statement: 'rich', flatsFriendly: false,
    note: 'the reception is the evening-glamour slot — gowns and contemporary drapes sit beside silk sarees as equals',
  },
  'Cocktail / Pre-wedding': {
    lanes: ['Western', 'Fusion'], paletteMoods: ['jewel', 'metallic'], statement: 'rich', flatsFriendly: false,
    note: 'cocktail is the indo-western room — gowns, liquid-metal drapes and sharara-with-halter fusion own it, and black is welcome here',
  },
  'Engagement Ceremony': {
    lanes: ['Ethnic', 'Fusion', 'Western'], paletteMoods: ['pastel', 'metallic', 'jewel'], statement: 'rich', flatsFriendly: false,
    note: 'engagements photograph best in refined pastels and soft metallics — celebratory, not competitive',
  },
  'Roka / Sagai': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['pastel', 'metallic'], statement: 'either', flatsFriendly: true,
    note: 'an intimate roka wants graceful over grand — soft colour, light embellishment',
  },
  'First Day of College': {
    lanes: ['Western', 'Minimal', 'Streetwear'], paletteMoods: [], statement: 'clean', flatsFriendly: true,
    note: 'first impressions read best relaxed — effortless beats overdressed on day one',
  },
  'College Farewell': {
    lanes: ['Ethnic', 'Fusion', 'Western'], paletteMoods: ['pastel', 'jewel'], statement: 'either', flatsFriendly: false,
    note: 'farewell is college\'s one dress-up day — sarees and shararas make their campus debut',
  },
  'College Fest (Day)': {
    lanes: ['Streetwear', 'Western', 'Fusion'], paletteMoods: ['bright'], statement: 'clean', flatsFriendly: true,
    note: 'fest days are long and on your feet — statement tees and comfortable soles win',
  },
  'College Fest (Night)': {
    lanes: ['Western', 'Streetwear', 'Fusion'], paletteMoods: ['jewel', 'bright'], statement: 'either', flatsFriendly: true,
    note: 'fest nights want concert energy — dark base, one loud element',
  },
  'College Trip': {
    lanes: ['Streetwear', 'Western', 'Minimal'], paletteMoods: [], statement: 'clean', flatsFriendly: true, avoidHeavy: true,
    note: 'trips reward layers and repeat-wearable basics',
  },
  'Internship (Startup)': {
    lanes: ['Minimal', 'Western'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true,
    note: 'startup dressing is clean basics in good fits — deliberate, never fussy',
  },
  'Internship (Corporate)': {
    lanes: ['Western', 'Minimal'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true,
    note: 'corporate internships read polish from crisp collars and quiet colour',
  },
  'Job Interview (Tech)': {
    lanes: ['Minimal', 'Western'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true,
    note: 'tech interviews punish overdressing almost as much as underdressing — land exactly in the middle',
  },
  'Job Interview (Corporate)': {
    lanes: ['Western', 'Minimal'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true,
    note: 'a corporate interview is structured tailoring and zero distraction — let the answers talk',
  },
  'Office (Startup)': {
    lanes: ['Minimal', 'Western', 'Fusion'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true,
    note: 'the startup office is smart-casual — elevated basics, sneakers welcome',
  },
  'Office (Formal)': {
    lanes: ['Western', 'Minimal', 'Ethnic'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true,
    note: 'formal offices respect structure — tailoring, or a crisp cotton/silk-blend saree, both correct',
  },
  'Client Meeting': {
    lanes: ['Western', 'Minimal'], paletteMoods: ['neutral', 'jewel'], statement: 'clean', flatsFriendly: true,
    note: 'client meetings want authority with one deliberate note of colour',
  },
  'Casual Outing': {
    lanes: ['Western', 'Minimal', 'Streetwear', 'Fusion'], paletteMoods: [], statement: 'either', flatsFriendly: true,
    note: 'weekend ease — whatever repeats well and moves freely',
  },
  'Mall / Shopping Day': {
    lanes: ['Western', 'Streetwear', 'Minimal'], paletteMoods: [], statement: 'clean', flatsFriendly: true,
    note: 'shopping days need try-on-friendly clothes and shoes that survive marble floors',
  },
  'Brunch / Cafe': {
    lanes: ['Western', 'Fusion', 'Minimal'], paletteMoods: ['pastel', 'earthy'], statement: 'either', flatsFriendly: true,
    note: 'brunch is daylight dressing — soft colour, natural fabrics, photograph-ready ease',
  },
  'Dinner Date': {
    lanes: ['Western', 'Fusion'], paletteMoods: ['jewel', 'neutral'], statement: 'either', flatsFriendly: false,
    note: 'dinner wants one elevated element — texture, a sheer layer, or a deep colour, not all three',
  },
  'First Date': {
    lanes: ['Western', 'Fusion', 'Minimal'], paletteMoods: ['pastel', 'jewel'], statement: 'either', flatsFriendly: true,
    note: 'first dates are for looking like yourself on a good day — comfortable enough to forget the outfit',
  },
  'Night Out': {
    lanes: ['Western', 'Fusion', 'Streetwear'], paletteMoods: ['jewel', 'bright'], statement: 'rich', flatsFriendly: false,
    note: 'nights out love dark bases and one unmissable element',
  },
  'House Party': {
    lanes: ['Western', 'Fusion', 'Streetwear'], paletteMoods: ['bright', 'jewel'], statement: 'either', flatsFriendly: true,
    note: 'house parties are floor-sitting affairs — dressy up top, relaxed below',
  },
  'My Birthday': {
    lanes: ['Western', 'Fusion', 'Ethnic'], paletteMoods: ['bright', 'jewel', 'metallic'], statement: 'rich', flatsFriendly: false,
    note: 'your birthday is the one room where the statement piece answers to no one',
  },
  "Friend's Birthday": {
    lanes: ['Western', 'Fusion', 'Streetwear'], paletteMoods: ['bright', 'jewel'], statement: 'either', flatsFriendly: true,
    note: 'celebrate loudly, but leave the biggest statement for the birthday girl',
  },
  'Travel Day': {
    lanes: ['Minimal', 'Streetwear', 'Western'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true, avoidHeavy: true,
    note: 'travel outfits are judged at hour six — soft layers, zero fuss',
  },
  'Airport / Travel Look': {
    lanes: ['Minimal', 'Western', 'Streetwear'], paletteMoods: ['neutral', 'earthy'], statement: 'clean', flatsFriendly: true,
    note: 'the airport look is polished comfort — a good outer layer does all the talking',
  },
  'Gym / Workout': {
    lanes: ['Streetwear', 'Minimal'], paletteMoods: ['neutral'], statement: 'clean', flatsFriendly: true, avoidHeavy: true,
    note: 'performance first — stretch, sweat-wicking, done',
  },
  'Beach / Pool Day': {
    lanes: ['Western', 'Minimal'], paletteMoods: ['bright', 'pastel'], statement: 'clean', flatsFriendly: true, avoidHeavy: true,
    note: 'beachwear should survive salt, sun and the cafe afterwards',
  },
  'WFH / Video Call': {
    lanes: ['Minimal', 'Western'], paletteMoods: ['neutral', 'jewel'], statement: 'clean', flatsFriendly: true,
    note: 'on camera the collar is the outfit — texture beats flat colour through a webcam',
  },
  'Anniversary Dinner': {
    lanes: ['Western', 'Fusion', 'Ethnic'], paletteMoods: ['jewel'], statement: 'rich', flatsFriendly: false,
    note: 'anniversaries deserve the grown-up jewel tones — plum, wine, emerald over party glitter',
  },
  'Baby Shower / Godh Bharai': {
    lanes: ['Ethnic', 'Fusion'], paletteMoods: ['haldiYellows', 'pastel', 'festiveGreens'], statement: 'either', flatsFriendly: true,
    note: 'godh bharai loves auspicious warm tones — and long hours of sitting want forgiving drape',
  },
  'Hill Station Trip': {
    lanes: ['Streetwear', 'Western', 'Minimal'], paletteMoods: ['earthy', 'neutral'], statement: 'clean', flatsFriendly: true, avoidHeavy: true,
    note: 'hill weather flips hourly — two light layers beat one heavy one',
  },
  'Heritage City Sightseeing': {
    lanes: ['Western', 'Fusion', 'Minimal'], paletteMoods: ['earthy', 'pastel'], statement: 'clean', flatsFriendly: true,
    note: 'heritage walks want breathable cover and colours that sing against old stone',
  },
  'Graduation Day': {
    lanes: ['Ethnic', 'Western', 'Fusion'], paletteMoods: ['pastel', 'metallic'], statement: 'either', flatsFriendly: false,
    note: 'graduation photos outlive trends — timeless over loud',
  },
  'Award Ceremony / Convocation': {
    lanes: ['Ethnic', 'Western'], paletteMoods: ['jewel', 'neutral', 'metallic'], statement: 'either', flatsFriendly: false,
    note: 'on stage, structured and stately reads best — a silk saree or sharp tailoring, nothing that fidgets',
  },
};

const getOccasionStyleProfile = (occasion) =>
  OCCASION_STYLE[occasion] || DEFAULT_STYLE_PROFILE;

// ---------------------------------------------------------------------------
// Colour metadata parsed from constants/ColorPalette.ts (single source of
// truth). Falls back to undertone-only heuristics if the file is absent.
// ---------------------------------------------------------------------------
const loadColorMeta = () => {
  const meta = {};
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'constants', 'ColorPalette.ts'), 'utf8');
    const re = /name:\s*'([^']+)',\s*hex:\s*'[^']*',\s*family:\s*'([^']+)',\s*undertone:\s*'(\w+)'/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      meta[m[1]] = { family: m[2], undertone: m[3] };
    }
  } catch (e) {
    // Deployed without the frontend tree: neutral fallback below still works.
  }
  return meta;
};
const COLOR_META = loadColorMeta();

const NEUTRAL_SET = new Set(PALETTE_MOODS.neutral);
const METALLIC_SET = new Set(PALETTE_MOODS.metallic);

const isNeutral = (color) => NEUTRAL_SET.has(color);
const isMetallic = (color) => METALLIC_SET.has(color);
const colorUndertone = (color) => (COLOR_META[color] ? COLOR_META[color].undertone : 'neutral');
const colorFamily = (color) => (COLOR_META[color] ? COLOR_META[color].family : 'Unknown');

/**
 * Do these colours work together as one outfit?
 * The rule of thumb every stylist teaches: neutrals and metallics are free;
 * the remaining "real" colours must either share a family (tonal dressing)
 * or share an undertone (harmonious mixing). One real colour is always fine.
 */
const colorsHarmonize = (colors) => {
  const real = [...new Set(colors)].filter((c) => !isNeutral(c) && !isMetallic(c));
  if (real.length <= 1) return true;
  const families = new Set(real.map(colorFamily));
  if (families.size === 1) return true;
  const undertones = new Set(real.map(colorUndertone).filter((u) => u !== 'neutral'));
  return undertones.size <= 1;
};

module.exports = {
  occasionToFormality,
  getAllowedFormalities,
  getOccasionColorBlacklist,
  getOccasionStyleProfile,
  PALETTE_MOODS,
  COLOR_META,
  isNeutral,
  isMetallic,
  colorUndertone,
  colorsHarmonize,
};
