import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStyleProfile, BodyType, SkinTone, StylePreference, WardrobeItem, Category } from '../types';

interface AppState {
  isAuthenticated: boolean;
  profile: UserStyleProfile | null;
  hasSeenOnboarding: boolean;
  wardrobeItems: WardrobeItem[];
  login: (email: string, name?: string) => void;
  signup: (email: string, name: string) => void;
  saveProfile: (profileData: { bodyType: BodyType; skinTone: SkinTone; stylePreference: StylePreference }) => void;
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'userId' | 'createdAt'>) => void;
  signOut: () => void;
}

const DEFAULT_WARDROBE_ITEMS: WardrobeItem[] = [
  { id: '1', userId: 'user_1', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60', color: 'White', style: 'Western', tags: ['shirt', 'summer', 'linen'], createdAt: new Date().toISOString() },
  { id: '2', userId: 'user_1', category: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60', color: 'Beige', style: 'Western', tags: ['chinos', 'casual'], createdAt: new Date().toISOString() },
  { id: '3', userId: 'user_1', category: 'Ethnic', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=60', color: 'Maroon', style: 'Ethnic', tags: ['kurta', 'festive'], createdAt: new Date().toISOString() },
  { id: '4', userId: 'user_1', category: 'Outers', imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60', color: 'Indigo', style: 'Western', tags: ['jacket', 'denim'], createdAt: new Date().toISOString() },
  { id: '5', userId: 'user_1', category: 'Shoes', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60', color: 'Cream', style: 'Western', tags: ['sneakers', 'retro'], createdAt: new Date().toISOString() },
  { id: '6', userId: 'user_1', category: 'Dresses', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60', color: 'Emerald', style: 'Western', tags: ['dress', 'evening'], createdAt: new Date().toISOString() },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      profile: null,
      hasSeenOnboarding: false,
      wardrobeItems: DEFAULT_WARDROBE_ITEMS,
      login: (email, name = 'Style Lover') => set({
        isAuthenticated: true,
        profile: {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          name,
          email,
          bodyType: 'Curvy',
          skinTone: 'Wheatish',
          stylePreference: 'Fusion',
        },
        hasSeenOnboarding: false, // Will determine if they need to do onboarding
      }),
      signup: (email, name) => set({
        isAuthenticated: true,
        profile: {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          name,
          email,
          bodyType: 'Curvy',
          skinTone: 'Wheatish',
          stylePreference: 'Fusion',
        },
        hasSeenOnboarding: false,
      }),
      saveProfile: (profileData) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...profileData } as UserStyleProfile : null,
        hasSeenOnboarding: true,
      })),
      addWardrobeItem: (item) => set((state) => ({
        wardrobeItems: [
          ...state.wardrobeItems,
          {
            ...item,
            id: 'item_' + Math.random().toString(36).substr(2, 9),
            userId: state.profile?.id || 'user_1',
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      signOut: () => set({
        isAuthenticated: false,
        profile: null,
        hasSeenOnboarding: false,
        wardrobeItems: DEFAULT_WARDROBE_ITEMS, // Reset items on logout
      }),
    }),
    {
      name: 'kloset-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


