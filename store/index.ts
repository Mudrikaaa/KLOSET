import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserStyleProfile, Height, BodyShape, SkinTone, Undertone, StylePreference, 
  WardrobeItem, Category, Fit, Fabric, Length, Pattern, Neckline, Sleeve, 
  Season, Color, CoveragePreference, OccasionFrequency, ColorComfort,
  SwipeHistoryItem
} from '../types';
import { api, setAuthToken } from '../lib';

interface AppState {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  token: string | null;
  profile: UserStyleProfile | null;
  hasSeenOnboarding: boolean;
  wardrobeItems: WardrobeItem[];
  swipeHistory: SwipeHistoryItem[];
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  saveProfile: (profileData: Partial<UserStyleProfile>) => Promise<void>;
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  recordSwipe: (outfitId: string, direction: 'like' | 'dislike') => Promise<void>;
  fetchSwipeHistory: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DEFAULT_WARDROBE_ITEMS: WardrobeItem[] = [
  { 
    id: '1', 
    userId: 'user_1', 
    category: 'Tops', 
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60', 
    color: 'White', 
    style: 'Western', 
    tags: ['shirt', 'summer', 'linen'], 
    createdAt: new Date().toISOString(),
    fit: 'Regular',
    fabric: 'Linen',
    length: 'Short',
    pattern: 'Solid',
    neckline: 'Collar',
    sleeve: 'Half',
    season: 'Summer',
    occasions: ['Brunch / Cafe', 'Casual Outing']
  },
  { 
    id: '2', 
    userId: 'user_1', 
    category: 'Bottoms', 
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60', 
    color: 'Beige', 
    style: 'Western', 
    tags: ['chinos', 'casual'], 
    createdAt: new Date().toISOString(),
    fit: 'Regular',
    fabric: 'Cotton',
    length: 'Full',
    pattern: 'Solid',
    neckline: 'Not Applicable',
    sleeve: 'Not Applicable',
    season: 'All-season',
    occasions: ['Brunch / Cafe', 'Casual Outing', 'Office (Startup)']
  },
  { 
    id: '3', 
    userId: 'user_1', 
    category: 'Ethnic', 
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=60', 
    color: 'Maroon', 
    style: 'Ethnic', 
    tags: ['kurta', 'festive'], 
    createdAt: new Date().toISOString(),
    fit: 'Relaxed',
    fabric: 'Silk',
    length: 'Knee-length',
    pattern: 'Embroidered',
    neckline: 'Round',
    sleeve: 'Full',
    season: 'All-season',
    occasions: ['Diwali Party (Family)', 'Regional Festival', 'Wedding (Close Family)']
  },
  { 
    id: '4', 
    userId: 'user_1', 
    category: 'Outers', 
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60', 
    color: 'Indigo', 
    style: 'Western', 
    tags: ['jacket', 'denim'], 
    createdAt: new Date().toISOString(),
    fit: 'Relaxed',
    fabric: 'Denim',
    length: 'Short',
    pattern: 'Solid',
    neckline: 'Collar',
    sleeve: 'Full',
    season: 'Winter',
    occasions: ['Casual Outing', 'Brunch / Cafe', 'College Fest (Night)']
  },
  { 
    id: '5', 
    userId: 'user_1', 
    category: 'Shoes', 
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60', 
    color: 'Beige', 
    style: 'Western', 
    tags: ['sneakers', 'retro'], 
    createdAt: new Date().toISOString(),
    fit: 'Regular',
    fabric: 'Other',
    length: 'Not Applicable',
    pattern: 'Solid',
    neckline: 'Not Applicable',
    sleeve: 'Not Applicable',
    season: 'All-season',
    occasions: ['Casual Outing', 'First Day of College', 'Mall / Shopping Day']
  },
  { 
    id: '6', 
    userId: 'user_1', 
    category: 'Dresses', 
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60', 
    color: 'Emerald', 
    style: 'Western', 
    tags: ['dress', 'evening'], 
    createdAt: new Date().toISOString(),
    fit: 'Fitted',
    fabric: 'Silk',
    length: 'Midi',
    pattern: 'Solid',
    neckline: 'V-neck',
    sleeve: 'Sleeveless',
    season: 'Summer',
    occasions: ['Cocktail / Pre-wedding', 'Dinner Date', 'Night Out']
  },
];

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const customStorage = {
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    console.log(`[KLOSET-DEBUG] [Stage 4 - AsyncStorage getItem] key: ${name}`, {
      valueExists: !!value,
      valueLength: value ? value.length : 0,
    });
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`[KLOSET-DEBUG] [Stage 4 - AsyncStorage getItem parsed] state:`, {
          isAuthenticated: parsed?.state?.isAuthenticated,
          tokenExists: !!parsed?.state?.token,
          tokenLength: parsed?.state?.token ? parsed?.state?.token.length : 0,
        });
      } catch (err) {
        console.error('[KLOSET-DEBUG] Failed to parse AsyncStorage value:', err);
      }
    }
    return value;
  },
  setItem: async (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      console.log(`[KLOSET-DEBUG] [Stage 4 - AsyncStorage setItem] key: ${name}`, {
        isAuthenticated: parsed?.state?.isAuthenticated,
        tokenExists: !!parsed?.state?.token,
        tokenLength: parsed?.state?.token ? parsed?.state?.token.length : 0,
      });
    } catch (err) {
      console.error('[KLOSET-DEBUG] Failed to parse setItem value:', err);
    }
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    console.log(`[KLOSET-DEBUG] [Stage 4 - AsyncStorage removeItem] key: ${name}`);
    await AsyncStorage.removeItem(name);
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasHydrated: false,
      token: null,
      profile: null,
      hasSeenOnboarding: false,
      wardrobeItems: DEFAULT_WARDROBE_ITEMS,
      swipeHistory: [],
      
      login: async (email, password = '') => {
        if (email === 'guest@kloset.com') {
          set({
            isAuthenticated: true,
            token: 'guest_token',
            profile: {
              id: 'guest_user',
              name: 'Guest Stylist',
              email: 'guest@kloset.com',
              height: 'Average',
              bodyShape: 'Hourglass',
              skinTone: 'Wheatish',
              undertone: 'Neutral',
              stylePreference: 'Fusion',
              coveragePreference: 'Moderate',
              occasionFrequency: 'Mix of Everything',
              colorComfort: 'Some Color',
              ageRange: '22-27',
              topSize: 'M',
              bottomSize: '30',
              braSize: '32C',
              shoeSize: '6',
              comfortZones: ['None'],
              city: 'Mumbai',
              budgetTier: 'Mid-range',
              jewelryTypes: ['Earrings', 'Watch'],
              avoidList: [],
            },
            hasSeenOnboarding: true,
          });
          return;
        }

        const data = await api.login(email, password);
        console.log('[KLOSET-DEBUG] [store.login] Immediately before Zustand set()', {
          dataKeys: Object.keys(data || {}),
          userExists: !!data?.user,
          tokenExists: !!data?.token,
          tokenType: typeof data?.token,
          tokenLength: data?.token ? data.token.length : 0,
        });

        set({
          isAuthenticated: true,
          token: data.token,
          profile: data.user,
          hasSeenOnboarding: !!(
            data.user?.height && 
            data.user?.bodyShape && 
            data.user?.skinTone && 
            data.user?.undertone && 
            data.user?.stylePreference &&
            data.user?.coveragePreference &&
            data.user?.occasionFrequency &&
            data.user?.colorComfort
          ),
        });

        console.log('[KLOSET-DEBUG] [store.login] Immediately after Zustand set()', {
          isAuthenticated: get().isAuthenticated,
          tokenExistsInState: !!get().token,
          tokenInStateLength: get().token?.length || 0,
        });

        setTimeout(() => {
          console.log('[KLOSET-DEBUG] [store.login] Store state 1 second after login', {
            isAuthenticated: get().isAuthenticated,
            tokenExistsInState: !!get().token,
            tokenInStateLength: get().token?.length || 0,
          });
        }, 1000);

        try {
          const items = await api.fetchWardrobeItems();
          set({ wardrobeItems: items.length > 0 ? items : DEFAULT_WARDROBE_ITEMS });
        } catch (err) {
          console.warn('Error fetching wardrobe items after login:', err);
        }

        try {
          await get().fetchSwipeHistory();
        } catch (err) {
          console.warn('Error fetching swipe history after login:', err);
        }
      },

      signup: async (email, password = '', name = 'Style Lover') => {
        const data = await api.signup(email, password, name);
        console.log('[KLOSET-DEBUG] [Stage 1 - Signup Response] data received:', {
          userExists: !!data.user,
          tokenExists: !!data.token,
          tokenLength: data.token ? data.token.length : 0,
        });
        set({
          isAuthenticated: true,
          token: data.token,
          profile: data.user,
          hasSeenOnboarding: false,
          wardrobeItems: DEFAULT_WARDROBE_ITEMS,
        });
        console.log('[KLOSET-DEBUG] [Stage 2 - Zustand set()] signup state updated:', {
          isAuthenticated: get().isAuthenticated,
          tokenExists: !!get().token,
          tokenLength: get().token?.length || 0,
        });
      },

      saveProfile: async (profileData) => {
        const state = get();
        if (state.profile?.id === 'guest_user') {
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...profileData } as UserStyleProfile : null,
            hasSeenOnboarding: true,
          }));
          return;
        }

        if (!state.profile) return;

        const updatedUser = await api.updateProfile(profileData);
        set({
          profile: updatedUser,
          hasSeenOnboarding: true,
        });
      },

      addWardrobeItem: async (item) => {
        console.log('[KLOSET-DEBUG] addWardrobeItem triggered with item:', { ...item, imageUrl: item.imageUrl.substring(0, 100) });
        const state = get();
        const userId = state.profile?.id || 'user_1';

        console.log('[KLOSET-DEBUG] Auth state:', state.isAuthenticated, 'User ID:', userId);

        if (state.isAuthenticated && userId !== 'guest_user') {
          console.log('[KLOSET-DEBUG] Starting database and image upload sync to Express backend for new wardrobe item');
          try {
            const newItem = await api.addWardrobeItem(item);
            console.log('[KLOSET-DEBUG] Express backend upload and sync successful!');
            
            set((state) => ({
              wardrobeItems: [
                ...state.wardrobeItems,
                newItem
              ]
            }));
            console.log('[KLOSET-DEBUG] Local state updated. addWardrobeItem complete!');
          } catch (err) {
            console.error('[KLOSET-DEBUG] Failed to sync wardrobe item to Express backend:', err);
            throw err;
          }
        } else {
          const itemId = generateUUID();
          const createdAt = new Date().toISOString();
          const newItem: WardrobeItem = {
            ...item,
            id: itemId,
            userId,
            imageUrl: item.imageUrl,
            createdAt,
          };
          set((state) => ({
            wardrobeItems: [
              ...state.wardrobeItems,
              newItem
            ]
          }));
        }
      },

      recordSwipe: async (outfitId, direction) => {
        console.log('[KLOSET-DEBUG] recordSwipe triggered:', { outfitId, direction });
        const state = get();
        const userId = state.profile?.id || 'user_1';

        if (state.isAuthenticated && userId !== 'guest_user') {
          try {
            const newSwipe = await api.recordSwipe(outfitId, direction);
            console.log('[KLOSET-DEBUG] Swipe recorded successfully on backend:', newSwipe);
            
            if (direction === 'like') {
              await get().fetchSwipeHistory();
            }
          } catch (err) {
            console.error('[KLOSET-DEBUG] Failed to record swipe on backend:', err);
            throw err;
          }
        } else {
          console.log('[KLOSET-DEBUG] Guest swipe recorded locally only.');
        }
      },

      fetchSwipeHistory: async () => {
        const state = get();
        const userId = state.profile?.id || 'user_1';
        if (state.isAuthenticated && userId !== 'guest_user') {
          console.log('[KLOSET-DEBUG] Fetching swipe history from backend...');
          try {
            const history = await api.getSwipeHistory();
            set({ swipeHistory: history || [] });
            console.log('[KLOSET-DEBUG] Swipe history loaded:', history.length);
          } catch (err) {
            console.error('[KLOSET-DEBUG] Failed to fetch swipe history:', err);
          }
        }
      },

      signOut: async () => {
        set({
          isAuthenticated: false,
          token: null,
          profile: null,
          hasSeenOnboarding: false,
          wardrobeItems: DEFAULT_WARDROBE_ITEMS,
          swipeHistory: [],
        });
      },
    }),
    {
      name: 'kloset-app-storage',
      storage: createJSONStorage(() => customStorage),
      // Exclude hasHydrated from persistence — it must always start as false on cold
      // start and only become true once onRehydrateStorage completes. If it were
      // persisted, it would be restored as true immediately during rehydration,
      // before setAuthToken has run, causing background syncs to fire with no token.
      partialize: (state) => {
        const partial = {
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          profile: state.profile,
          hasSeenOnboarding: state.hasSeenOnboarding,
          wardrobeItems: state.wardrobeItems,
        };
        console.log('[KLOSET-DEBUG] [Stage 3 - Persist partialize()] partial state to save:', {
          isAuthenticated: partial.isAuthenticated,
          tokenExists: !!partial.token,
          tokenLength: partial.token ? partial.token.length : 0,
        });
        return partial;
      },
      merge: (persistedState: any, currentState) => {
        console.log('[KLOSET-DEBUG] [Stage 5 - Persist merge()] merging state:', {
          persistedExists: !!persistedState,
          persistedIsAuthenticated: persistedState?.isAuthenticated,
          persistedTokenExists: !!persistedState?.token,
          persistedTokenLength: persistedState?.token ? persistedState?.token.length : 0,
        });
        return {
          ...currentState,
          ...persistedState,
          hasHydrated: false, // Ensure hasHydrated is always false during initial merge/rehydration
        };
      },
      onRehydrateStorage: () => (state) => {
        console.log('[KLOSET-DEBUG] [Stage 5 - Persist onRehydrateStorage] rehydration callback:', {
          stateExists: !!state,
          isAuthenticated: state?.isAuthenticated,
          tokenExists: !!state?.token,
          tokenLength: state?.token ? state?.token.length : 0,
        });
        if (state?.token) {
          setAuthToken(state.token);
        }
        useAppStore.setState({ hasHydrated: true });
        console.log('[KLOSET-DEBUG] [Stage 5 - Persist onRehydrateStorage] hasHydrated set to true.');
      },
    }

  )
);

// Subscribe to token changes to keep the api client updated
useAppStore.subscribe((state) => {
  console.log('[KLOSET-DEBUG] [Stage 6 - Store Subscribe] state updated:', {
    hasHydrated: state.hasHydrated,
    isAuthenticated: state.isAuthenticated,
    tokenExists: !!state.token,
    tokenLength: state.token ? state.token.length : 0,
  });
  setAuthToken(state.token);
});

