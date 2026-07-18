const fs = require('fs');
const path = require('path');

// =========================================================================
// Garment enum extraction for the vision prompt.
//
// why: the AI must only ever answer with values the app actually understands
// (exact union members from types/index.ts, exact swatch names from
// constants/ColorPalette.ts, exact occasion strings from app/upload.tsx).
// Instead of hand-copying those lists here — where they would silently drift —
// we parse the real frontend source files at server startup. If the frontend
// files are not present (e.g. the backend/ folder is deployed alone to
// Render), we fall back to the SNAPSHOT below, which mirrors the frontend at
// the time of writing.
// =========================================================================

const FRONTEND_ROOT = path.join(__dirname, '..', '..');

// Fallback snapshot — keep in sync with types/index.ts, ColorPalette.ts and
// upload.tsx when those change. Only used when the source files are absent.
const SNAPSHOT = {
  categories: [
    'Tops', 'Bottoms', 'Dresses',
    'Kurtas & Tunics', 'Sarees', 'Lehengas', 'Suits & Sets',
    'Dupattas & Stoles', 'Ethnic Bottoms',
    'Outers', 'Shoes', 'Accessories'
  ],
  subTypes: [
    'T-shirt', 'Shirt', 'Blouse', 'Crop Top', 'Tank Top', 'Camisole', 'Bodysuit', 'Tube Top',
    'Jeans', 'Trousers', 'Shorts', 'Skirt', 'Culottes', 'Joggers', 'Leggings',
    'Maxi Dress', 'Midi Dress', 'Mini Dress', 'Bodycon', 'A-line Dress', 'Shift Dress', 'Wrap Dress',
    'Straight Kurta', 'Anarkali', 'A-line Kurta', 'Short Kurti', 'Kaftan', 'Peplum Kurta',
    'Saree', 'Pre-stitched Saree', 'Saree Blouse',
    'Lehenga Skirt', 'Lehenga Set', 'Choli / Blouse',
    'Salwar Kameez', 'Sharara Set', 'Gharara Set', 'Co-ord Set', 'Palazzo Set',
    'Churidar', 'Patiala', 'Palazzo', 'Dhoti Pants', 'Sharara', 'Gharara',
    'Dupatta', 'Stole', 'Scarf',
    'Jacket', 'Blazer', 'Cardigan', 'Shrug', 'Waistcoat', 'Hoodie', 'Sweater', 'Cape',
    'Heels', 'Flats', 'Sneakers', 'Boots', 'Sandals', 'Juttis', 'Kolhapuris', 'Wedges',
    'Bag', 'Belt', 'Watch', 'Sunglasses', 'Hair Accessory', 'Other'
  ],
  styles: ['Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear'],
  fits: ['Oversized', 'Relaxed', 'Regular', 'Slim', 'Fitted', 'Boxy'],
  fabrics: [
    'Cotton', 'Silk', 'Chiffon', 'Denim', 'Linen', 'Georgette', 'Velvet',
    'Polyester', 'Knit', 'Crepe', 'Satin', 'Organza', 'Net', 'Brocade',
    'Chanderi', 'Banarasi', 'Tussar Silk', 'Rayon', 'Lycra / Stretch',
    'Leather / Faux Leather', 'Wool', 'Fleece', 'Other'
  ],
  lengths: ['Crop', 'Short', 'Knee-length', 'Midi', 'Maxi', 'Full', 'Not Applicable'],
  patterns: ['Solid', 'Stripes', 'Floral', 'Geometric', 'Checks', 'Bandhani / Tie-Dye', 'Embroidered', 'Printed', 'Abstract'],
  necklines: ['Round', 'V-neck', 'Boat', 'Collar', 'Off-shoulder', 'Halter', 'High-neck', 'Not Applicable'],
  sleeves: ['Sleeveless', 'Half', '3/4', 'Full', 'Not Applicable'],
  structures: ['Structured', 'Semi-structured', 'Fluid / Flowy', 'Stretchy / Bodycon'],
  embellishments: [
    'None', 'Machine Embroidery', 'Hand Embroidery', 'Zardozi', 'Mirror Work',
    'Sequin / Mukaish', 'Thread Work', 'Gota Patti', 'Beadwork',
    'Block Print', 'Bandhani', 'Kalamkari', 'Applique', 'Lace', 'Other'
  ],
  opacities: ['Opaque', 'Semi-sheer', 'Sheer'],
  seasons: ['Summer', 'Winter', 'Monsoon', 'All-season'],
  colors: [
    'White', 'Off-White', 'Ivory', 'Cream',
    'Beige', 'Sand', 'Taupe', 'Camel', 'Khaki',
    'Brown', 'Chocolate', 'Coffee', 'Tan',
    'Light Grey', 'Grey', 'Charcoal', 'Slate', 'Black',
    'Red', 'Crimson', 'Scarlet', 'Maroon', 'Burgundy', 'Wine',
    'Pink', 'Blush', 'Dusty Rose', 'Hot Pink', 'Magenta', 'Coral', 'Salmon', 'Peach', 'Rose Gold',
    'Orange', 'Rust', 'Burnt Orange', 'Terracotta', 'Tangerine',
    'Yellow', 'Mustard', 'Lemon', 'Turmeric', 'Gold',
    'Green', 'Emerald', 'Sage', 'Olive', 'Mint', 'Teal', 'Forest Green', 'Bottle Green', 'Pistachio',
    'Light Blue', 'Sky Blue', 'Blue', 'Cobalt', 'Royal Blue', 'Navy', 'Indigo', 'Denim Blue', 'Powder Blue', 'Ice Blue',
    'Lavender', 'Lilac', 'Purple', 'Plum', 'Mauve', 'Aubergine', 'Violet',
    'Silver', 'Gold (Metallic)', 'Copper', 'Bronze', 'Multi-color'
  ],
  occasions: [
    'Diwali Party (Family)', 'Diwali Party (Friends)', 'Holi', 'Navratri / Garba', 'Eid', 'Regional Festival',
    'Pooja / Temple Visit', 'Baby Shower / Godh Bharai',
    'Mehendi Function', 'Sangeet Night', 'Wedding (Close Family)', 'Wedding (Guest)', 'Reception', 'Cocktail / Pre-wedding',
    'Engagement Ceremony', 'Roka / Sagai',
    'First Day of College', 'College Farewell', 'College Fest (Day)', 'College Fest (Night)', 'College Trip',
    'Internship (Startup)', 'Internship (Corporate)',
    'Job Interview (Tech)', 'Job Interview (Corporate)', 'Office (Startup)', 'Office (Formal)', 'Client Meeting', 'WFH / Video Call',
    'Casual Outing', 'Mall / Shopping Day', 'Brunch / Cafe', 'Dinner Date', 'First Date', 'Night Out', 'House Party',
    'My Birthday', "Friend's Birthday", 'Travel Day', 'Airport / Travel Look', 'Gym / Workout', 'Beach / Pool Day',
    'Hill Station Trip', 'Heritage City Sightseeing', 'Graduation Day', 'Award Ceremony / Convocation', 'Anniversary Dinner'
  ],
};

/** Pull every single- or double-quoted string literal out of a source chunk. */
const extractQuoted = (chunk) => {
  const out = [];
  const re = /'([^']+)'|"([^"]+)"/g;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    out.push(m[1] !== undefined ? m[1] : m[2]);
  }
  return out;
};

/** Extract the string-literal members of `export type <Name> = ... ;` */
const extractUnion = (source, typeName) => {
  const re = new RegExp(`export type ${typeName} =([^;]+);`);
  const m = source.match(re);
  return m ? extractQuoted(m[1]) : null;
};

const tryRead = (relPath) => {
  try {
    return fs.readFileSync(path.join(FRONTEND_ROOT, relPath), 'utf8');
  } catch (e) {
    return null;
  }
};

/** Parse the live frontend sources; any list we cannot parse falls back to SNAPSHOT. */
const loadEnums = () => {
  const enums = { ...SNAPSHOT };

  const typesSrc = tryRead('types/index.ts');
  if (typesSrc) {
    const unions = {
      categories: 'Category',
      subTypes: 'GarmentSubType',
      styles: 'StylePreference',
      fits: 'Fit',
      fabrics: 'Fabric',
      lengths: 'Length',
      patterns: 'Pattern',
      necklines: 'Neckline',
      sleeves: 'Sleeve',
      structures: 'Structure',
      embellishments: 'Embellishment',
      opacities: 'Opacity',
      seasons: 'Season',
    };
    for (const [key, typeName] of Object.entries(unions)) {
      const values = extractUnion(typesSrc, typeName);
      if (values && values.length > 0) enums[key] = values;
    }
  }

  const paletteSrc = tryRead('constants/ColorPalette.ts');
  if (paletteSrc) {
    const names = [];
    const re = /name:\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(paletteSrc)) !== null) names.push(m[1]);
    if (names.length > 0) enums.colors = names;
  }

  const uploadSrc = tryRead('app/upload.tsx');
  if (uploadSrc) {
    const m = uploadSrc.match(/const INDIAN_OCCASIONS = \[([\s\S]*?)\];/);
    if (m) {
      const occ = extractQuoted(m[1]);
      if (occ.length > 0) enums.occasions = occ;
    }
  }

  return enums;
};

// Parsed once at startup — enum lists only change with a code change + restart.
const GARMENT_ENUMS = loadEnums();

module.exports = { GARMENT_ENUMS };
