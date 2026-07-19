import { 
  UserStyleProfile, Height, BodyShape, SkinTone, Undertone, StylePreference, 
  WardrobeItem, Category, Fit, Fabric, Length, Pattern, Neckline, Sleeve, 
  Season, Color, CoveragePreference, OccasionFrequency, ColorComfort, Outfit,
  Swipe, SwipeHistoryItem, GarmentSubType, WaistPosition, Structure,
  Embellishment, Opacity, ClosetSection, SectionKind
} from '../types';

// Dynamic API Base URL detection for React Native development environment
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Default fallback to the developer's laptop local IP for physical devices/Expo Go
  return 'http://192.168.1.6:5000';
};


export const API_BASE_URL = getBaseUrl();

let authToken: string | null = null;

/**
 * Configure the active JWT authentication token.
 * This is called by the Zustand store subscription to avoid circular dependency.
 */
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getHeaders = (isMultipart = false) => {
  const headers: Record<string, string> = {};
  
  // Resolve token from local variable or dynamically from Zustand store to prevent rehydration race conditions
  let token = authToken;
  let source = 'local_variable';
  
  let storeState: any = null;
  try {
    const { useAppStore } = require('../store');
    storeState = useAppStore.getState();
  } catch (err) {
    // Ignore error during initial circular load
  }

  if (!token && storeState) {
    token = storeState.token;
    source = 'zustand_store';
  }

  console.log('[KLOSET-DEBUG] [getHeaders]', {
    tokenValueExists: !!token,
    hasHydrated: storeState ? storeState.hasHydrated : undefined,
    isAuthenticated: storeState ? storeState.isAuthenticated : undefined,
    tokenSource: source,
    isMultipart,
  });

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('[KLOSET-DEBUG] [getHeaders] Authorization header present:', !!headers['Authorization']);

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};


// Result shape of the backend vision auto-detection endpoint.
// All fields are optional — the backend only returns what it confidently
// validated against the real enums; season/occasions are always low-confidence.
export interface DetectedGarment {
  category?: Category;
  subType?: GarmentSubType;
  style?: StylePreference;
  colors?: string[];
  fit?: Fit;
  fabric?: Fabric;
  length?: Length;
  pattern?: Pattern;
  neckline?: Neckline;
  sleeve?: Sleeve;
  structure?: Structure;
  embellishment?: Embellishment;
  opacity?: Opacity;
  season?: Season;
  occasions?: string[];
}

export interface AnalyzeResult {
  detected: DetectedGarment | null;
  lowConfidence: string[];
}

// Optional per-request spec overrides when browsing suggestions — e.g. the
// user wants Moderate coverage ideas even though her profile says Open.
export interface SuggestionSpecs {
  season?: Season;
  coverage?: CoveragePreference;
  style?: StylePreference;
}

// A complete outfit composed from the user's own wardrobe items.
export interface WardrobeOutfit {
  id: string;
  lane: string;            // Ethnic | Fusion | Western | Minimal | Streetwear
  matchScore: number;
  explanation: string;     // 4-5 newline-separated "why this works" lines
  items: WardrobeItem[];
}

// Helper to map snake_case database wardrobe item to camelCase frontend wardrobe item
const mapWardrobeItem = (item: any): WardrobeItem => {
  return {
    id: item.id,
    userId: item.user_id,
    imageUrl: item.image_url,
    category: item.category as Category,
    colors: item.colors && item.colors.length > 0 ? item.colors : (item.color ? [item.color] : []),
    style: item.style as StylePreference,
    tags: item.tags || [],
    createdAt: item.created_at,
    fit: item.fit as Fit,
    fabric: item.fabric as Fabric,
    length: item.length as Length,
    pattern: item.pattern as Pattern,
    neckline: item.neckline as Neckline,
    sleeve: item.sleeve as Sleeve,
    season: item.season as Season,
    occasions: item.occasions || [],
    subType: item.sub_type as GarmentSubType,
    waistPosition: item.waist_position as WaistPosition,
    structure: item.structure as Structure,
    embellishment: item.embellishment as Embellishment,
    opacity: item.opacity as Opacity,
    sectionId: item.section_id || null,
    cutoutUrl: item.cutout_url || null,
    sourceGroupId: item.source_group_id || null,
  };
};

const mapSection = (s: any): ClosetSection => ({
  id: s.id,
  name: s.name,
  kind: s.kind as SectionKind,
  position: s.position,
  itemCount: s.itemCount,
  createdAt: s.createdAt,
});

export const api = {
  // Auth Operations
  signup: async (email: string, password?: string, name?: string): Promise<{ user: UserStyleProfile; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to sign up');
    }

    const data = await response.json();
    return {
      user: data.user,
      token: data.token,
    };
  },

  login: async (email: string, password?: string): Promise<{ user: UserStyleProfile; token: string }> => {
    console.log('[KLOSET-DEBUG] [api.login] Starting fetch request to:', `${API_BASE_URL}/auth/login`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    console.log('[KLOSET-DEBUG] [api.login] [Raw Response Metadata]', {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to log in');
    }

    const rawText = await response.text();
    console.log('[KLOSET-DEBUG] [api.login] [Raw Response Text]', rawText);

    const data = JSON.parse(rawText);
    console.log('[KLOSET-DEBUG] [api.login] [Parsed Response Object]', {
      keys: Object.keys(data),
      message: data.message,
      userExists: !!data.user,
      userKeys: data.user ? Object.keys(data.user) : [],
      tokenExists: !!data.token,
      tokenType: typeof data.token,
      tokenLength: data.token ? data.token.length : 0,
    });

    return {
      user: data.user,
      token: data.token,
    };
  },

  // Profile Operations
  getProfile: async (): Promise<UserStyleProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch profile');
    }

    return response.json();
  },

  updateProfile: async (profileData: {
    name?: string;
    height?: Height;
    bodyShape?: BodyShape;
    skinTone?: SkinTone;
    undertone?: Undertone;
    stylePreference?: StylePreference;
    coveragePreference?: CoveragePreference;
    occasionFrequency?: OccasionFrequency;
    colorComfort?: ColorComfort;
  }): Promise<UserStyleProfile> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update profile');
    }

    const data = await response.json();
    return data.user;
  },

  // Wardrobe Operations
  fetchWardrobeItems: async (): Promise<WardrobeItem[]> => {
    const response = await fetch(`${API_BASE_URL}/wardrobe`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch wardrobe items');
    }

    const data = await response.json();
    return (data || []).map(mapWardrobeItem);
  },

  // AI auto-detection: send the picked photo for analysis and get form
  // pre-fill values back. NEVER throws — any failure (offline backend, missing
  // API key, timeout) resolves to { detected: null } so the manual form flow
  // is never blocked by the AI layer.
  analyzeWardrobeImage: async (imageUri: string): Promise<AnalyzeResult> => {
    const fallback: AnalyzeResult = { detected: null, lowConfidence: ['fabric', 'season', 'occasions'] };
    // why: client-side cap slightly above the backend's 20s vision timeout, so
    // the backend's graceful null-response wins over an aborted request.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const formData = new FormData();
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const name = imageUri.split('/').pop() || `photo.${fileExt}`;
      formData.append('image', {
        uri: imageUri,
        name,
        type: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
      } as any);

      const response = await fetch(`${API_BASE_URL}/wardrobe/analyze`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) return fallback;
      const data = await response.json();
      return {
        detected: data?.detected ?? null,
        lowConfidence: data?.lowConfidence ?? fallback.lowConfidence,
      };
    } catch (err) {
      console.warn('[KLOSET-DEBUG] [api.analyzeWardrobeImage] Detection unavailable:', err);
      return fallback;
    } finally {
      clearTimeout(timer);
    }
  },

  // Returns EVERY item the upload created: usually one, but a worn photo of
  // separable top + bottom garments is split into two rows by the backend
  // extraction pipeline (self-contained sets like sarees never split).
  addWardrobeItem: async (item: Omit<WardrobeItem, 'id' | 'userId' | 'createdAt'>): Promise<WardrobeItem[]> => {
    const formData = new FormData();
    const fileExt = item.imageUrl.split('.').pop() || 'jpg';
    const name = item.imageUrl.split('/').pop() || `photo.${fileExt}`;

    // Append the file using standard React Native FormData file interface
    formData.append('image', {
      uri: item.imageUrl,
      name,
      type: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
    } as any);

    formData.append('category', item.category);
    formData.append('colors', JSON.stringify(item.colors || []));
    formData.append('color', item.colors && item.colors.length > 0 ? item.colors[0] : 'White');
    formData.append('style', item.style);
    if (item.fit) formData.append('fit', item.fit);
    if (item.fabric) formData.append('fabric', item.fabric);
    if (item.length) formData.append('length', item.length);
    if (item.pattern) formData.append('pattern', item.pattern);
    if (item.neckline) formData.append('neckline', item.neckline);
    if (item.sleeve) formData.append('sleeve', item.sleeve);
    if (item.season) formData.append('season', item.season);
    
    // NEW optional fields
    if (item.subType) formData.append('subType', item.subType);
    if (item.waistPosition) formData.append('waistPosition', item.waistPosition);
    if (item.structure) formData.append('structure', item.structure);
    if (item.embellishment) formData.append('embellishment', item.embellishment);
    if (item.opacity) formData.append('opacity', item.opacity);
    
    formData.append('occasions', JSON.stringify(item.occasions || []));
    formData.append('tags', JSON.stringify(item.tags || []));
    if (item.sectionId) formData.append('sectionId', item.sectionId);

    const response = await fetch(`${API_BASE_URL}/wardrobe`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add wardrobe item');
    }

    const data = await response.json();
    const rows = data.items && data.items.length ? data.items : [data.item];
    return rows.map(mapWardrobeItem);
  },

  // --- Closet sections (shelves & drawers) ---

  getSections: async (): Promise<ClosetSection[]> => {
    const response = await fetch(`${API_BASE_URL}/sections`, { method: 'GET', headers: getHeaders() });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch sections');
    }
    return ((await response.json()) || []).map(mapSection);
  },

  createSection: async (name: string, kind: SectionKind): Promise<ClosetSection> => {
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, kind }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create section');
    }
    return mapSection(await response.json());
  },

  renameSection: async (id: string, name: string): Promise<ClosetSection> => {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to rename section');
    }
    return mapSection(await response.json());
  },

  reorderSections: async (orderedIds: string[]): Promise<ClosetSection[]> => {
    const response = await fetch(`${API_BASE_URL}/sections/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ orderedIds }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to reorder sections');
    }
    return ((await response.json()) || []).map(mapSection);
  },

  deleteSection: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete section');
    }
  },

  moveItemToSection: async (itemId: string, sectionId: string): Promise<WardrobeItem> => {
    const response = await fetch(`${API_BASE_URL}/wardrobe/${itemId}/section`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sectionId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to move item');
    }
    const data = await response.json();
    return mapWardrobeItem(data.item);
  },

  getOutfits: async (): Promise<Outfit[]> => {
    const response = await fetch(`${API_BASE_URL}/outfits`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch outfits');
    }

    const data = await response.json();
    const outfits = (data || []).map((item: any) => ({
      ...item,
      heights: item.heights || ['Average'],
      bodyShapes: item.bodyShapes || [],
      skinTones: item.skinTones || [],
    }));

    console.log('[KLOSET-DEBUG] [api.getOutfits] Outfits loaded from backend:', {
      count: outfits.length,
      firstOutfitId: outfits.length > 0 ? outfits[0].id : null,
      firstOutfitTitle: outfits.length > 0 ? outfits[0].title : null,
    });

    return outfits;
  },

  recordSwipe: async (outfitId: string, direction: 'like' | 'dislike'): Promise<Swipe> => {
    const response = await fetch(`${API_BASE_URL}/swipes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ outfitId, direction }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to record swipe');
    }

    const data = await response.json();
    return {
      id: data.swipe.id,
      userId: data.swipe.userId || data.swipe.user_id,
      outfitId: data.swipe.outfitId || data.swipe.outfit_id,
      direction: data.swipe.direction,
      createdAt: data.swipe.swipedAt || data.swipe.swiped_at || new Date().toISOString(),
    };
  },

  getSwipeHistory: async (): Promise<SwipeHistoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/swipes`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch swipe history');
    }

    return response.json();
  },

  getSuggestions: async (occasion: string, specs?: SuggestionSpecs): Promise<Outfit[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('occasion', occasion);
    if (specs?.season) queryParams.append('season', specs.season);
    if (specs?.coverage) queryParams.append('coverage', specs.coverage);
    if (specs?.style) queryParams.append('style', specs.style);
    const response = await fetch(`${API_BASE_URL}/suggestions?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch suggestions');
    }

    const data = await response.json();
    return (data || []).map((item: any) => ({
      ...item,
      heights: item.heights || ['Average'],
      bodyShapes: item.bodyShapes || [],
      skinTones: item.skinTones || [],
    }));
  },

  // Closet-first: outfits composed from the user's OWN wardrobe, each with a
  // short why-this-works note. Item rows arrive snake_case from the DB and
  // are mapped here so the rest of the app only ever sees camelCase.
  getWardrobeSuggestions: async (occasion: string, specs?: SuggestionSpecs): Promise<{ wardrobeSize: number; outfits: WardrobeOutfit[] }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('occasion', occasion);
    if (specs?.season) queryParams.append('season', specs.season);
    if (specs?.coverage) queryParams.append('coverage', specs.coverage);
    const response = await fetch(`${API_BASE_URL}/suggestions/wardrobe?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch wardrobe suggestions');
    }

    const data = await response.json();
    return {
      wardrobeSize: data.wardrobeSize || 0,
      outfits: (data.outfits || []).map((o: any) => ({
        id: o.id,
        lane: o.lane,
        matchScore: o.matchScore,
        explanation: o.explanation,
        items: (o.items || []).map(mapWardrobeItem),
      })),
    };
  },
};
