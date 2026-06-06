# KLOSET - Navigation Flow

## Overview

KLOSET uses **Expo Router** for file-based routing with a hierarchical navigation structure. This document explains the entire navigation flow, including route structure, deep linking, and navigation guards.

---

## Navigation Architecture

```
Root Layout Animation
    ↓
    ├─ Not Authenticated
    │   └─ /auth/login ← ENTRY POINT
    │       ├─ User clicks "Sign Up"
    │       └─ /auth/signup
    │           └─ User submits
    │               ↓
    │   ├─ Authenticated + No Profile
    │   │   └─ /onboarding
    │   │       └─ User completes
    │   │           ↓
    │   ├─ Authenticated + Profile Complete
    │   │   └─ /(tabs) ← MAIN APP
    │   │       ├─ /index (Wardrobe)
    │   │       │   └─ [Upload button]
    │   │       │       └─ /upload (modal)
    │   │       ├─ /discover (Swipe interface)
    │   │       ├─ /outfits (Occasions)
    │   │       └─ /profile (Settings)
    │   └─ Logout
    │       └─ /auth/login
    │
    └─ Error
        └─ /+not-found
```

---

## Route Structure

### File-Based Routing

**Location**: `app/` directory

**Convention**: Filename = Route path

```
app/
├── _layout.tsx           → Root layout (wrapper)
├── +html.tsx            → Web HTML entry
├── +not-found.tsx       → 404 handler
├── modal.tsx            → /modal
├── upload.tsx           → /upload (modal presentation)
│
├── (tabs)/
│   ├── _layout.tsx      → /(tabs) (tab navigation shell)
│   ├── index.tsx        → /(tabs) or /(tabs)/index
│   ├── discover.tsx     → /(tabs)/discover
│   ├── outfits.tsx      → /(tabs)/outfits
│   └── profile.tsx      → /(tabs)/profile
│
├── auth/
│   ├── login.tsx        → /auth/login
│   └── signup.tsx       → /auth/signup
│
└── onboarding/
    └── index.tsx        → /onboarding
```

---

## Detailed Route Flows

### Flow 1: Fresh App Launch (Not Authenticated)

```
App Starts
    ↓
RootLayout
├─ Loads fonts
├─ Shows splash screen
└─ RootLayoutNav
    ├─ Check isAuthenticated = false
    ├─ Check hasSeenOnboarding = false
    └─ Route: /auth/login
        ↓
    LoginScreen
    ├─ Option 1: Login
    │   ├─ Calls useAppStore.login(email, name)
    │   ├─ Updates isAuthenticated = true
    │   ├─ Sets hasSeenOnboarding = false
    │   └─ Navigation guard triggers
    │       └─ Redirects to /onboarding
    │
    ├─ Option 2: Sign Up
    │   └─ Router.push('/auth/signup')
    │       └─ SignupScreen
    │           └─ Calls signup()
    │               └─ Same flow as login
    │
    └─ Option 3: Guest Login
        └─ login('guest@kloset.com')
            └─ Access app in guest mode
```

### Flow 2: After Login → Onboarding

```
/auth/login
    ↓ (user logs in)
    ↓ isAuthenticated = true
    ↓ hasSeenOnboarding = false
    ↓
RootLayoutNav re-evaluates
    ↓
Redirect to /onboarding
    ↓
OnboardingScreen
├─ Step 1: Select Body Type
│   └─ setBodyType()
├─ Step 2: Select Skin Tone
│   └─ setSkinTone()
├─ Step 3: Select Style Preference
│   ├─ setStylePref()
│   └─ User clicks "Complete"
│       └─ saveProfile({
│           bodyType,
│           skinTone,
│           stylePreference
│         })
│           ↓
│           ├─ Updates profile in Zustand
│           ├─ Sets hasSeenOnboarding = true
│           └─ Persists to Async Storage
│
Navigation guard re-evaluates
    ↓
Redirect to /(tabs)
    ↓
Main App Home (Wardrobe Tab)
```

### Flow 3: Entering Main App

```
/(tabs) Main Navigation
    ↓
Tab Layout with 4 tabs:
├─ [1] Wardrobe (index.tsx)
│   ├─ Display wardrobe items
│   ├─ Filter by category
│   └─ [+] Add button
│       └─ iOS: Modal presentation of /upload
│           └─ UploadScreen
│               └─ User selects image
│               ├─ Fills metadata
│               └─ Clicks Submit
│                   ├─ addWardrobeItem() called
│                   ├─ Item added to state
│                   └─ router.back()
│                       └─ Returns to Wardrobe tab
│
├─ [2] Discover (discover.tsx)
│   ├─ Swipe card interface
│   ├─ Like/Dislike buttons
│   └─ Refresh carousel
│
├─ [3] Occasions (outfits.tsx)
│   ├─ Occasion buttons
│   ├─ Filtered outfit matches
│   └─ Confidence scores
│
└─ [4] Profile (profile.tsx)
    ├─ Display user info
    ├─ Edit style preferences
    └─ Logout button
        └─ signOut()
            ├─ Clear all state
            └─ Redirect to /auth/login
```

### Flow 4: Image Upload Modal

```
Wardrobe Tab [+] Button
    ↓
{
  presentation: 'modal',
  handler: 'native modal presentation'
}
    ↓
/upload Modal
├─ Image Picker
│   ├─ Camera option
│   └─ Gallery option
├─ Select category, color, style
├─ Add custom tags
└─ Submit button
    ├─ Validates image exists
    ├─ Creates WardrobeItem
    ├─ addWardrobeItem() updates store
    └─ router.back()
        └─ Dismisses modal
            └─ Returns to Wardrobe
```

---

## Navigation Imperative APIs

### useRouter Hook

Used in all screens for programmatic navigation:

```typescript
import { useRouter } from 'expo-router';

export default function MyScreen() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/auth/login')}>
      <Text>Navigate to Login</Text>
    </TouchableOpacity>
  );
}
```

### Common Navigation Methods

#### `router.push(path)`

Adds to history stack (can go back)

```typescript
// Navigate to discover
router.push("/(tabs)/discover");

// Navigate to upload with modal
router.push("/upload");
```

#### `router.replace(path)`

Replaces current route (no back button)

```typescript
// After login, don't allow back to login
router.replace("/onboarding");

// Complete onboarding, can't go back
router.replace("/(tabs)");
```

#### `router.back()`

Go to previous route

```typescript
// After uploading, return to wardrobe
router.back();
```

#### `router.pop(n)`

Pop n routes from stack

```typescript
// Go back 2 screens
router.pop(2);
```

---

## Navigation Guards (Authentication)

### Location

**File**: `app/_layout.tsx`
**Component**: `RootLayoutNav()`

### Implementation

```typescript
function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      // Force login screen
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
    } else if (!hasSeenOnboarding) {
      // Force onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // Full auth, redirect away from auth/onboarding
      if (inAuthGroup || inOnboarding) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, hasSeenOnboarding, segments]);

  // Render navigation stack
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
```

### How It Works

1. **Initial Load**:
   - Check `isAuthenticated` and `hasSeenOnboarding`
   - Route to appropriate screen

2. **State Changes**:
   - Zustand state updates
   - Effect dependency triggers
   - Navigation guard re-evaluates
   - Automatic redirect

3. **Prevents Back**:
   - Uses `router.replace()` not `router.push()`
   - Ensures proper flow through onboarding
   - Can't navigate back to auth if authenticated

---

## Deep Linking

### URL Scheme

**Defined in**: `app.json`

```json
{
  "scheme": "kloset",
  "platforms": ["ios", "android", "web"]
}
```

### Supported Deep Links

```
kloset://                    → Home screen
kloset://(tabs)             → Wardrobe tab
kloset://(tabs)/discover    → Discover tab
kloset://(tabs)/outfits     → Occasions tab
kloset://(tabs)/profile     → Profile tab
kloset://auth/login         → Login screen
kloset://auth/signup        → Signup screen
kloset://onboarding         → Onboarding
kloset://upload             → Upload modal
```

### Testing Deep Links

**iOS:**

```bash
xcrun simctl openurl booted "kloset:///(tabs)/discover"
```

**Android:**

```bash
adb shell am start -a android.intent.action.VIEW -d "kloset:///(tabs)/discover" com.kloset
```

**Web:**

```
http://localhost:8081?url=kloset:///(tabs)/discover
```

---

## Tab Navigation Details

### Tab Configuration

**File**: `app/(tabs)/_layout.tsx`

```typescript
<Tabs
  screenOptions={{
    tabBarActiveTintColor: theme.tint,
    tabBarInactiveTintColor: theme.tabIconDefault,
    tabBarStyle: { ... },
    headerStyle: { ... },
  }}>
  <Tabs.Screen
    name="index"
    options={{
      title: 'Wardrobe',
      tabBarIcon: ({ color, size }) => <Shirt {...} />,
    }}
  />
  {/* ... more tabs ... */}
</Tabs>
```

### Tab Switching Behavior

- **Independent Stacks**: Each tab maintains its own navigation stack
- **State Preservation**: Tab state preserved when switching away
- **Independent Navigation**: Navigation in one tab doesn't affect others
- **Back Button**: Works within tab stack

---

## Modal Presentations

### Upload Modal

**Type**: `presentation: 'modal'`
**Location**: `app/upload.tsx`

```typescript
<Stack.Screen
  name="upload"
  options={{
    presentation: 'modal',
    headerShown: false,
  }}
/>
```

**Behavior**:

- Slides up from screen bottom
- Can swipe down to dismiss
- Back button (Android) dismisses
- `router.back()` dismisses

### Generic Modal (Planned)

**File**: `app/modal.tsx`
**Usage**: Reusable modal for alerts, confirmations

---

## Navigation State Management

### useSegments Hook

Get current route segments:

```typescript
import { useSegments } from "expo-router";

const segments = useSegments();
// ['(tabs)', 'discover'] when on discover tab

// Check if in auth group
const inAuthGroup = segments[0] === "auth";
```

### useRootNavigationState Hook

Get full navigation state:

```typescript
import { useRootNavigationState } from 'expo-router';

const navigationState = useRootNavigationState();
const isReady = navigationState?.key != null;

if (!isReady) return <Splash />;
```

---

## Blocked Navigation Scenarios

### Can't Go Back to Login When Authenticated

```typescript
// Won't work
router.push("/auth/login");

// Navigation guard will redirect
// because isAuthenticated = true
```

### Can't Skip Onboarding

```typescript
// Won't work
router.push("/(tabs)");

// Navigation guard will redirect
// because hasSeenOnboarding = false
```

### Can't Access Tabs When Not Authenticated

```typescript
// Won't work
router.push("/(tabs)");

// Navigation guard will redirect
// because isAuthenticated = false
```

---

## Header Styling

### Hidden Headers

```typescript
<Stack.Screen
  name="auth/login"
  options={{ headerShown: false }}
/>
```

### Custom Headers (Planned)

```typescript
<Stack.Screen
  name="example"
  options={{
    headerTitle: 'My Screen',
    headerTintColor: theme.tint,
    headerBackTitle: 'Back',
  }}
/>
```

---

## Navigation Best Practices

### 1. Use `replace()` for Auth Flows

```typescript
// ✅ Good - prevents back to login
router.replace("/onboarding");

// ❌ Bad - allows back to login
router.push("/onboarding");
```

### 2. Use Route Params for Screen Data (Planned)

```typescript
// Navigate with params
router.push({
  pathname: "/(tabs)/details",
  params: { itemId: "123" },
});

// Receive params
const { itemId } = useLocalSearchParams();
```

### 3. Guard Sensitive Routes

```typescript
// Check auth in useEffect
useEffect(() => {
  if (!isAuthenticated) {
    router.replace("/auth/login");
  }
}, [isAuthenticated]);
```

### 4. Provide Feedback During Navigation

```typescript
const [loading, setLoading] = useState(false);

const navigate = async () => {
  setLoading(true);
  // Do async work
  router.push("/next-screen");
  setLoading(false);
};
```

---

## Debugging Navigation

### Log Navigation Events

```typescript
useEffect(() => {
  const unsubscribe = useNavigationContainerRef().addEventListener?.(
    "state",
    (e) => {
      console.log("Navigation state:", e.data.state);
    },
  );
  return unsubscribe;
}, []);
```

### Use Expo Router DevTools

```typescript
// In development
import { ExpoRouter } from 'expo-router';

export default function RootLayout() {
  return (
    <ExpoRouter.Stack>
      {/* ... */}
    </ExpoRouter.Stack>
  );
}
```

---

## Performance Optimization

### Code Splitting

- Expo Router automatically splits code by route
- Each screen bundle loaded on demand
- Reduces initial app size

### Lazy Loading

```typescript
// Automatic lazy load
const Screen = lazy(() => import("./Screen"));
```

### Preload Screens (Future)

```typescript
// Preload before navigation
useEffect(() => {
  router.prefetch("/(tabs)/discover");
}, []);
```

---

## Future Navigation Features

- [ ] Bottom sheet navigation
- [ ] Nested modals
- [ ] Route parameter validation
- [ ] Shared element transitions
- [ ] Navigation history persistence
- [ ] Animated transitions
- [ ] Gesture-based navigation

---

## Navigation Checklist for Developers

- [ ] Understand Root Layout guards (flow control)
- [ ] Know all route paths by heart
- [ ] Use `replace()` for auth flows
- [ ] Test deep linking in all platforms
- [ ] Verify back button behavior
- [ ] Check tab state persistence
- [ ] Test modal dismiss/cancel flows

---

## Conclusion

KLOSET's navigation is designed to:

- **Enforce Auth Flow**: Users cannot bypass login/onboarding
- **Optimize Performance**: Code splitting via file-based routing
- **Provide UX**: Smooth transitions with modals and tabs
- **Support Platforms**: Works on iOS, Android, web
- **Enable Deep Linking**: URL scheme support for external navigation

The combination of Expo Router's file-based routing and Zustand's auth guards creates a robust, user-friendly navigation system.

---

**Last Updated**: June 2026  
**Router Version**: Expo Router v6  
**Guard Status**: Fully Implemented  
**Deep Linking**: Basic support (Advanced planned)
