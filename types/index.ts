export type BodyType = 'Petite' | 'Athletic' | 'Curvy' | 'Plus' | 'Tall';
export type SkinTone = 'Fair' | 'Wheatish' | 'Dusky' | 'Deep';
export type StylePreference = 'Minimal' | 'Ethnic' | 'Western' | 'Fusion' | 'Streetwear';
export type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Ethnic' | 'Outers' | 'Shoes';

export interface UserStyleProfile {
  id: string;
  name: string;
  email: string;
  bodyType: BodyType;
  skinTone: SkinTone;
  stylePreference: StylePreference;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  category: Category;
  color: string;
  style: string;
  tags: string[];
  createdAt: string;
}

export interface Outfit {
  id: string;
  title: string;
  imageUrl: string;
  occasions: string[];
  style: string;
  bodyTypes: BodyType[];
  skinTones: SkinTone[];
  description: string;
  explanation?: string;
}

export interface Swipe {
  id: string;
  userId: string;
  outfitId: string;
  direction: 'like' | 'dislike';
  createdAt: string;
}
