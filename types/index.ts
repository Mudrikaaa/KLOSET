export type Height = 'Petite' | 'Average' | 'Tall';
export type BodyShape = 'Hourglass' | 'Pear' | 'Apple' | 'Rectangle' | 'Inverted Triangle';
export type SkinTone = 'Fair' | 'Wheatish' | 'Dusky' | 'Deep';
export type Undertone = 'Warm' | 'Cool' | 'Neutral';
export type StylePreference = 'Minimal' | 'Ethnic' | 'Western' | 'Fusion' | 'Streetwear';
export type Category =
  | 'Tops' | 'Bottoms' | 'Dresses'
  | 'Kurtas & Tunics' | 'Sarees' | 'Lehengas' | 'Suits & Sets'
  | 'Dupattas & Stoles' | 'Ethnic Bottoms'
  | 'Outers' | 'Shoes' | 'Accessories';

export type GarmentSubType =
  // Tops
  | 'T-shirt' | 'Shirt' | 'Blouse' | 'Crop Top' | 'Tank Top' | 'Camisole' | 'Bodysuit' | 'Tube Top'
  // Bottoms
  | 'Jeans' | 'Trousers' | 'Shorts' | 'Skirt' | 'Culottes' | 'Joggers' | 'Leggings'
  // Dresses
  | 'Maxi Dress' | 'Midi Dress' | 'Mini Dress' | 'Bodycon' | 'A-line Dress' | 'Shift Dress' | 'Wrap Dress'
  // Ethnic tops / kurtas
  | 'Straight Kurta' | 'Anarkali' | 'A-line Kurta' | 'Short Kurti' | 'Kaftan' | 'Peplum Kurta'
  // Sarees
  | 'Saree' | 'Pre-stitched Saree' | 'Saree Blouse'
  // Lehengas
  | 'Lehenga Skirt' | 'Lehenga Set' | 'Choli / Blouse'
  // Suits & sets
  | 'Salwar Kameez' | 'Sharara Set' | 'Gharara Set' | 'Co-ord Set' | 'Palazzo Set'
  // Ethnic bottoms
  | 'Churidar' | 'Patiala' | 'Palazzo' | 'Dhoti Pants' | 'Sharara' | 'Gharara'
  // Dupattas
  | 'Dupatta' | 'Stole' | 'Scarf'
  // Outers
  | 'Jacket' | 'Blazer' | 'Cardigan' | 'Shrug' | 'Waistcoat' | 'Hoodie' | 'Sweater' | 'Cape'
  // Shoes
  | 'Heels' | 'Flats' | 'Sneakers' | 'Boots' | 'Sandals' | 'Juttis' | 'Kolhapuris' | 'Wedges'
  // Accessories
  | 'Bag' | 'Belt' | 'Watch' | 'Sunglasses' | 'Hair Accessory'
  | 'Other';

export type WaistPosition = 'High-waisted' | 'Mid-rise' | 'Low-rise' | 'Not Applicable';

export type Structure = 'Structured' | 'Semi-structured' | 'Fluid / Flowy' | 'Stretchy / Bodycon';

export type Embellishment =
  | 'None' | 'Machine Embroidery' | 'Hand Embroidery' | 'Zardozi' | 'Mirror Work'
  | 'Sequin / Mukaish' | 'Thread Work' | 'Gota Patti' | 'Beadwork'
  | 'Block Print' | 'Bandhani' | 'Kalamkari' | 'Applique' | 'Lace' | 'Other';

export type Opacity = 'Opaque' | 'Semi-sheer' | 'Sheer';

export type Fabric =
  | 'Cotton' | 'Silk' | 'Chiffon' | 'Denim' | 'Linen' | 'Georgette' | 'Velvet'
  | 'Polyester' | 'Knit' | 'Crepe' | 'Satin' | 'Organza' | 'Net' | 'Brocade'
  | 'Chanderi' | 'Banarasi' | 'Tussar Silk' | 'Rayon' | 'Lycra / Stretch'
  | 'Leather / Faux Leather' | 'Wool' | 'Fleece' | 'Other';

export type Fit = 'Oversized' | 'Relaxed' | 'Regular' | 'Slim' | 'Fitted' | 'Boxy';
export type Length = 'Crop' | 'Short' | 'Knee-length' | 'Midi' | 'Maxi' | 'Full' | 'Not Applicable';
// why 'Bandhani / Tie-Dye' lives here AND 'Bandhani' in Embellishment: bandhani
// is a resist-DYE pattern, so pattern is its true home. Keeping the
// embellishment entry lets a plain bandhani piece read as its craft, but when a
// garment carries both bandhani and a surface craft (the classic gota patti +
// bandhani dupatta), the craft takes the embellishment slot and bandhani is
// captured as the pattern.
export type Pattern = 'Solid' | 'Stripes' | 'Floral' | 'Geometric' | 'Checks' | 'Bandhani / Tie-Dye' | 'Embroidered' | 'Printed' | 'Abstract';
export type Neckline = 'Round' | 'V-neck' | 'Boat' | 'Collar' | 'Off-shoulder' | 'Halter' | 'High-neck' | 'Not Applicable';
export type Sleeve = 'Sleeveless' | 'Half' | '3/4' | 'Full' | 'Not Applicable';
export type Season = 'Summer' | 'Winter' | 'Monsoon' | 'All-season';

export type Color = 
  | 'White' | 'Black' | 'Grey' | 'Beige' | 'Navy' | 'Blue' | 'Light Blue' | 'Indigo' 
  | 'Maroon' | 'Burgundy' | 'Red' | 'Pink' | 'Lavender' | 'Purple' | 'Emerald' | 'Green' 
  | 'Olive' | 'Teal' | 'Yellow' | 'Mustard' | 'Orange' | 'Rust' | 'Coral' | 'Peach' 
  | 'Brown' | 'Chocolate' | 'Gold' | 'Silver';

export type Formality = 'Casual' | 'Smart Casual' | 'Semi-formal' | 'Formal' | 'Festive' | 'Party';
export type Coverage = 'Minimal' | 'Moderate' | 'Conservative';

export type CoveragePreference = 'Modest' | 'Moderate' | 'Open';
export type OccasionFrequency = 
  | 'Mostly Casual' | 'Mix of Everything' | 'Lots of Functions and Events' 
  | 'Professional Environment Daily';
export type ColorComfort = 'Neutrals Only' | 'Some Color' | 'Bold and Colorful';

export type AgeRange = '16-21' | '22-27' | '28-35' | '36-45' | '45+';

// Real sizes as used in Indian shopping apps
export type TopSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';
export type BottomSize = '24' | '26' | '28' | '30' | '32' | '34' | '36' | '38' | '40';
export type BraSize =
  | '28B' | '28C' | '28D'
  | '30B' | '30C' | '30D' | '30DD'
  | '32B' | '32C' | '32D' | '32DD'
  | '34B' | '34C' | '34D' | '34DD'
  | '36B' | '36C' | '36D' | '36DD'
  | '38C' | '38D' | '38DD'
  | '40C' | '40D' | '40DD';
export type ShoeSize = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';

// More granular — captures what body part the user prefers to de-emphasize
export type ComfortZone = 'Arms' | 'Midsection' | 'Thighs' | 'Hips' | 'None';

export type City =
  | 'Mumbai' | 'Delhi' | 'Bangalore' | 'Chennai' | 'Kolkata'
  | 'Hyderabad' | 'Pune' | 'Jaipur' | 'Ahmedabad' | 'Lucknow'
  | 'Chandigarh' | 'Goa' | 'Other';

export type BudgetTier = 'Budget-friendly' | 'Mid-range' | 'Premium' | 'Luxury';

// Jewelry types the user regularly wears (multi-select)
export type JewelryType =
  | 'Earrings' | 'Necklace / Chain' | 'Bangles / Bracelets' | 'Rings'
  | 'Anklets' | 'Maang Tikka' | 'Nose Pin / Nath' | 'Brooch'
  | 'Watch' | 'Waist Chain / Kamarband' | 'None';

export interface UserStyleProfile {
  id: string;
  name: string;
  email: string;
  height: Height;
  bodyShape: BodyShape;
  skinTone: SkinTone;
  undertone: Undertone;
  stylePreference: StylePreference;
  coveragePreference: CoveragePreference;
  occasionFrequency: OccasionFrequency;
  colorComfort: ColorComfort;
  // NEW fields
  ageRange?: AgeRange;
  topSize?: TopSize;
  bottomSize?: BottomSize;
  braSize?: BraSize;
  shoeSize?: ShoeSize;
  comfortZones?: ComfortZone[];    // multi-select: areas user prefers to minimize
  city?: City;
  budgetTier?: BudgetTier;
  jewelryTypes?: JewelryType[];    // multi-select: which jewelry types user wears
  avoidList?: string[];            // free-text tags: "ruffles", "pastels", "bodycon"
}

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  category: Category;
  subType?: GarmentSubType;         // NEW
  colors: string[];                 // CHANGED from single 'color: Color'
  style: StylePreference;
  tags: string[];
  createdAt: string;
  fit: Fit;
  fabric: Fabric;
  length: Length;
  pattern: Pattern;
  neckline: Neckline;
  sleeve: Sleeve;
  season: Season;
  occasions: string[];
  waistPosition?: WaistPosition;    // NEW
  structure?: Structure;            // NEW
  embellishment?: Embellishment;    // NEW
  opacity?: Opacity;               // NEW
}

export interface Outfit {
  id: string;
  title: string;
  imageUrl: string;
  occasions: string[];
  style: string;
  heights: Height[];
  bodyShapes: BodyShape[];
  skinTones: SkinTone[];
  undertones?: Undertone[];
  description: string;
  explanation?: string;
  formality: Formality;
  coverage: Coverage;
  season: Season;
  colorPalette: string[];
  matchScore?: number;
}

export interface Swipe {
  id: string;
  userId: string;
  outfitId: string;
  direction: 'like' | 'dislike';
  createdAt: string;
}

export interface SwipeHistoryItem {
  id: string;
  direction: 'like' | 'dislike';
  swipedAt: string;
  outfit: {
    id: string;
    title: string;
    imageUrl: string;
    style: string;
  };
}

