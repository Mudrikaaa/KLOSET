export type Height = 'Petite' | 'Average' | 'Tall';
export type BodyShape = 'Hourglass' | 'Pear' | 'Apple' | 'Rectangle' | 'Inverted Triangle';
export type SkinTone = 'Fair' | 'Wheatish' | 'Dusky' | 'Deep';
export type Undertone = 'Warm' | 'Cool' | 'Neutral';
export type StylePreference = 'Minimal' | 'Ethnic' | 'Western' | 'Fusion' | 'Streetwear';
export type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Ethnic' | 'Outers' | 'Shoes';

export type Fit = 'Oversized' | 'Relaxed' | 'Regular' | 'Slim' | 'Fitted' | 'Boxy';
export type Fabric = 'Cotton' | 'Silk' | 'Chiffon' | 'Denim' | 'Linen' | 'Georgette' | 'Velvet' | 'Polyester' | 'Knit' | 'Other';
export type Length = 'Crop' | 'Short' | 'Knee-length' | 'Midi' | 'Maxi' | 'Full' | 'Not Applicable';
export type Pattern = 'Solid' | 'Stripes' | 'Floral' | 'Geometric' | 'Checks' | 'Embroidered' | 'Printed' | 'Abstract';
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
}

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  category: Category;
  color: Color;
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

