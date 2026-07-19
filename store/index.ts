import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserStyleProfile, Height, BodyShape, SkinTone, Undertone, StylePreference,
  WardrobeItem, Category, Fit, Fabric, Length, Pattern, Neckline, Sleeve,
  Season, Color, CoveragePreference, OccasionFrequency, ColorComfort,
  SwipeHistoryItem, ClosetSection, SectionKind
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
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'userId' | 'createdAt'>) => Promise<WardrobeItem[]>;
  recordSwipe: (outfitId: string, direction: 'like' | 'dislike') => Promise<void>;
  fetchSwipeHistory: () => Promise<void>;
  signOut: () => Promise<void>;
  // Closet sections (shelves & drawers)
  sections: ClosetSection[];
  fetchSections: () => Promise<void>;
  createSection: (name: string, kind: SectionKind) => Promise<void>;
  renameSection: (id: string, name: string) => Promise<void>;
  reorderSections: (orderedIds: string[]) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  moveItemToSection: (itemId: string, sectionId: string) => Promise<void>;
}

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
      wardrobeItems: [],
      swipeHistory: [],

      login: async (email, password = '') => {
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
          // why: no mock fallback — a new user's wardrobe is genuinely empty,
          // and the home screen's empty state should reflect that honestly.
          const items = await api.fetchWardrobeItems();
          set({ wardrobeItems: items });
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
          wardrobeItems: [],
        });
        console.log('[KLOSET-DEBUG] [Stage 2 - Zustand set()] signup state updated:', {
          isAuthenticated: get().isAuthenticated,
          tokenExists: !!get().token,
          tokenLength: get().token?.length || 0,
        });
      },

      saveProfile: async (profileData) => {
        const state = get();
        if (!state.profile) return;

        const updatedUser = await api.updateProfile(profileData);
        set({
          profile: updatedUser,
          hasSeenOnboarding: true,
        });
      },

      addWardrobeItem: async (item) => {
        console.log('[KLOSET-DEBUG] addWardrobeItem triggered with item:', { ...item, imageUrl: item.imageUrl.substring(0, 100) });
        try {
          // One upload may create multiple items (worn photo split into
          // top + bottom by the extraction pipeline) — append them all.
          const newItems = await api.addWardrobeItem(item);
          set((state) => ({
            wardrobeItems: [...state.wardrobeItems, ...newItems]
          }));
          return newItems;
        } catch (err) {
          console.error('[KLOSET-DEBUG] Failed to sync wardrobe item to Express backend:', err);
          throw err;
        }
      },

      // --- Closet sections (shelves & drawers) ---
      sections: [],

      fetchSections: async () => {
        if (!get().isAuthenticated) return;
        try {
          const sections = await api.getSections();
          set({ sections });
        } catch (err) {
          console.error('[KLOSET-DEBUG] Failed to fetch sections:', err);
        }
      },

      createSection: async (name, kind) => {
        await api.createSection(name, kind);
        await get().fetchSections();
      },

      renameSection: async (id, name) => {
        await api.renameSection(id, name);
        set((state) => ({
          sections: state.sections.map((s) => (s.id === id ? { ...s, name } : s)),
        }));
      },

      reorderSections: async (orderedIds) => {
        // Optimistic: reorder locally first so drag-to-reorder feels instant
        set((state) => ({
          sections: [...state.sections].sort(
            (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
          ),
        }));
        await api.reorderSections(orderedIds);
      },

      deleteSection: async (id) => {
        await api.deleteSection(id);
        // Items were reassigned server-side; refresh both lists
        await get().fetchSections();
        try {
          const items = await api.fetchWardrobeItems();
          set({ wardrobeItems: items });
        } catch (err) {
          console.warn('[KLOSET-DEBUG] Wardrobe refresh after section delete failed:', err);
        }
      },

      moveItemToSection: async (itemId, sectionId) => {
        const updated = await api.moveItemToSection(itemId, sectionId);
        set((state) => ({
          wardrobeItems: state.wardrobeItems.map((w) => (w.id === itemId ? updated : w)),
          sections: state.sections, // counts refresh on next fetchSections
        }));
      },

      recordSwipe: async (outfitId, direction) => {
        console.log('[KLOSET-DEBUG] recordSwipe triggered:', { outfitId, direction });
        try {
          await api.recordSwipe(outfitId, direction);
          if (direction === 'like') {
            await get().fetchSwipeHistory();
          }
        } catch (err) {
          console.error('[KLOSET-DEBUG] Failed to record swipe on backend:', err);
          throw err;
        }
      },

      fetchSwipeHistory: async () => {
        if (!get().isAuthenticated) return;
        try {
          const history = await api.getSwipeHistory();
          set({ swipeHistory: history || [] });
        } catch (err) {
          console.error('[KLOSET-DEBUG] Failed to fetch swipe history:', err);
        }
      },

      signOut: async () => {
        set({
          isAuthenticated: false,
          token: null,
          profile: null,
          hasSeenOnboarding: false,
          wardrobeItems: [],
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

