import { useFonts } from 'expo-font';
import { Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useAppStore } from '../store';
import { api } from '../lib';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// why: the [KLOSET-DEBUG] logs across the app include auth/token metadata that
// must never ship in a release build. Silencing log/warn (not error) here in
// one place beats hunting down every call site; dev behaviour is unchanged.
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Crimson redesign type: Sora (display) + Manrope (body)
    Sora_700Bold,
    Sora_800ExtraBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  // Background synchronization effect — only runs once rehydration is complete
  // AND the user is authenticated. hasHydrated ensures the JWT token is available
  // in lib/api.ts before any network requests are attempted.
  useEffect(() => {
    const token = useAppStore.getState().token;
    console.log('[KLOSET-DEBUG] [LayoutNav] Sync useEffect triggered:', {
      hasHydrated,
      isAuthenticated,
      tokenExists: !!token,
    });
    if (!hasHydrated || !isAuthenticated || !token) {
      console.log('[KLOSET-DEBUG] [LayoutNav] Sync effect skipped. hasHydrated:', hasHydrated, 'isAuthenticated:', isAuthenticated, 'tokenExists:', !!token);
      return;
    }

    const profile = useAppStore.getState().profile;
    console.log('[KLOSET-DEBUG] [LayoutNav] Sync starting. profileExists:', !!profile, 'profileId:', profile?.id);
    
    if (profile) {
      // Sync profile
      api.getProfile()
        .then((updatedProfile) => {
          console.log('[KLOSET-DEBUG] [LayoutNav] Profile sync completed successfully.');
          if (updatedProfile) {
            useAppStore.setState({ profile: updatedProfile });
          }
        })
        .catch((err) => console.warn('[KLOSET-DEBUG] Background profile sync failed:', err));

      // Sync wardrobe items
      api.fetchWardrobeItems()
        .then((items) => {
          console.log('[KLOSET-DEBUG] [LayoutNav] Wardrobe sync completed successfully.');
          if (items) {
            useAppStore.setState({ wardrobeItems: items });
          }
        })
        .catch((err) => console.warn('[KLOSET-DEBUG] Background wardrobe sync failed:', err));

      // Sync swipe history
      useAppStore.getState().fetchSwipeHistory()
        .then(() => {
          console.log('[KLOSET-DEBUG] [LayoutNav] Swipe history sync completed successfully.');
        })
        .catch((err) => console.warn('[KLOSET-DEBUG] Background swipe history sync failed:', err));
    } else {
      console.log('[KLOSET-DEBUG] [LayoutNav] Sync skipped: no profile.');
    }
  }, [hasHydrated, isAuthenticated]);


  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      // Force user to login screen if not authenticated
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
    } else if (!hasSeenOnboarding) {
      // Force user to onboarding if profile hasn't been completed
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // If fully authenticated, redirect away from auth/onboarding screens
      if (inAuthGroup || inOnboarding) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, hasSeenOnboarding, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

