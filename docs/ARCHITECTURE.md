# KLOSET - Architecture Documentation

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React Native)              │
│   ┌──────────────┬──────────────┬───────────┬──────┐   │
│   │  Wardrobe    │  Discover    │ Occasions │ Profile │   │
│   └──────────────┴──────────────┴───────────┴──────┘   │
│   ┌──────────────┬──────────────┬───────────────────┐  │
│   │   Login      │   Signup     │   Onboarding      │  │
│   └──────────────┴──────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              State Management Layer                      │
│   ┌─────────────────────────────────────────────────┐  │
│   │  Zustand Store (useAppStore)                   │  │
│   │  - Authentication state                        │  │
│   │  - User profile                                │  │
│   │  - Wardrobe items                              │  │
│   │  - Onboarding status                           │  │
│   └─────────────────────────────────────────────────┘  │
│   ┌─────────────────────────────────────────────────┐  │
│   │  Async Storage (Persistence)                   │  │
│   │  - Survives app restart                        │  │
│   │  - JSON serialized                             │  │
│   └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Services & Integration Layer               │
│   ┌─────────────────────┐    ┌──────────────────────┐  │
│   │  Supabase Client    │    │  Image Picker        │  │
│   │  - Auth             │    │  - Camera            │  │
│   │  - Database         │    │  - Gallery           │  │
│   │  - Storage          │    │  - Image compression │  │
│   └─────────────────────┘    └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend Services                       │
│   ┌──────────────────────────────────────────────────┐ │
│   │  Supabase (PostgreSQL + Vector DB)              │ │
│   │  - User profiles                                 │ │
│   │  - Wardrobe items                                │ │
│   │  - Outfit recommendations (ML)                   │ │
│   │  - User feedback (likes/dislikes)                │ │
│   └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
KLOSET/
├── app/                                    # Main app screens
│   ├── _layout.tsx                        # Root layout + auth guard
│   ├── +html.tsx                          # Web HTML entry
│   ├── +not-found.tsx                     # 404 handler
│   ├── modal.tsx                          # Generic modal
│   ├── upload.tsx                         # Wardrobe item upload (modal)
│   │
│   ├── (tabs)/                            # Bottom tab navigation
│   │   ├── _layout.tsx                    # Tab configuration
│   │   ├── index.tsx                      # Wardrobe screen
│   │   ├── discover.tsx                   # Swipe card interface
│   │   ├── outfits.tsx                    # Occasion-based outfits
│   │   └── profile.tsx                    # User profile
│   │
│   ├── auth/                              # Authentication screens
│   │   ├── login.tsx                      # Login screen
│   │   └── signup.tsx                     # Signup screen
│   │
│   └── onboarding/                        # Onboarding flow
│       └── index.tsx                      # Profile setup screen
│
├── components/                             # Reusable UI components
│   ├── Themed.tsx                         # Theme-aware View/Text
│   ├── StyledText.tsx                     # Styled typography
│   ├── ExternalLink.tsx                   # Link component
│   ├── EditScreenInfo.tsx                 # Info component
│   ├── useColorScheme.ts                  # Color scheme hook
│   ├── useColorScheme.web.ts              # Web version
│   ├── useClientOnlyValue.ts              # Client-only hook
│   └── useClientOnlyValue.web.ts          # Web version
│
├── constants/                              # App constants
│   └── Colors.ts                          # Theme colors (light/dark)
│
├── lib/                                    # Services & utilities
│   ├── index.ts                           # Export supabase client
│   └── supabase.ts                        # Supabase initialization
│
├── store/                                  # State management
│   └── index.ts                           # Zustand app store
│
├── types/                                  # TypeScript definitions
│   └── index.ts                           # All app types
│
├── assets/                                 # Static resources
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/
│       ├── icon.png
│       ├── splash-icon.png
│       ├── android-icon-*.png
│       └── favicon.png
│
├── app.json                                # Expo configuration
├── package.json                            # Dependencies & scripts
├── tsconfig.json                           # TypeScript config
├── expo-env.d.ts                          # Expo type defs
└── docs/                                   # Documentation (this folder)
```

---

## Core Components & Modules

### 1. Root Layout (`app/_layout.tsx`)

**Responsibilities:**
- Font loading before rendering
- Splash screen management
- Authentication guard routing
- Error boundary setup

**Flow:**
```
RootLayout
├── Load fonts (SpaceMono)
├── Show splash screen
├── Hide splash when ready
└── RootLayoutNav
    ├── Check isAuthenticated
    ├── Check hasSeenOnboarding
    └── Route accordingly:
        ├── Not authenticated → /auth/login
        ├── Authenticated, no profile → /onboarding
        └── Fully authenticated → /(tabs)
```

### 2. Tab Navigation (`app/(tabs)/_layout.tsx`)

**Tabs:**
1. **Wardrobe** (`index.tsx`) - Browse and manage wardrobe
2. **Discover** (`discover.tsx`) - Swipe through outfit recommendations
3. **Occasions** (`outfits.tsx`) - Browse occasion-based outfits
4. **Profile** (`profile.tsx`) - View and edit user profile

**Features:**
- Bottom tab bar with icons
- Consistent header styling
- Active/inactive tint colors
- Platform-specific styling (iOS/Android)

### 3. Authentication Flow

**Files Involved:**
- `app/auth/login.tsx`
- `app/auth/signup.tsx`
- `store/index.ts` (login/signup actions)
- `app/_layout.tsx` (auth guard)

**Process:**
```
User Input (Email + Password)
     ↓
Validate Input
     ↓
Call Zustand login() or signup()
     ↓
Update isAuthenticated flag
     ↓
Navigation guard detects change
     ↓
Redirect to onboarding or (tabs)
```

**Current Implementation:** Mock/demo mode (no real Supabase auth yet)

### 4. Onboarding (`app/onboarding/index.tsx`)

**Step 1:** Select Body Type
- Options: Petite, Athletic, Curvy, Plus, Tall

**Step 2:** Select Skin Tone
- Options: Fair, Wheatish, Dusky, Deep

**Step 3:** Select Style Preference
- Options: Minimal, Ethnic, Western, Fusion, Streetwear

**Action:** Save profile and set `hasSeenOnboarding = true`

### 5. Wardrobe Management

**Files:**
- `app/(tabs)/index.tsx` - Display wardrobe
- `app/upload.tsx` - Add new item (modal)

**Features:**
```
Wardrobe Screen
├── Statistics card (total items, categories, fit %)
├── Category filter (All, Tops, Bottoms, etc.)
├── Grid view of items (2 columns)
├── Add button (routes to /upload modal)
└── View/sort controls

Upload Modal
├── Image picker (camera or gallery)
├── Category dropdown
├── Color picker
├── Style dropdown
├── Tag input (comma-separated)
└── Submit button (adds to store)
```

**Image Storage:**
- Local: URI stored in Zustand (not uploaded to server yet)
- Future: Upload to Supabase Storage

### 6. Outfit Discovery (`app/(tabs)/discover.tsx`)

**UI Pattern:**
- Swipe card interface (Tinder-like)
- Outfit image, title, style type
- Like/Dislike buttons
- Confidence score display
- Explanation text

**Data Structure:**
```typescript
interface Outfit {
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
```

**Currently:** Mock data (3 outfits)

### 7. Occasion-Based Outfits (`app/(tabs)/outfits.tsx`)

**UI Pattern:**
- Occasion buttons (Interview, Wedding, Office Party, etc.)
- Matching outfits for selected occasion
- Confidence matching percentage
- Item breakdown

**Future:** AI will filter recommendations based on:
- User's body type
- User's skin tone
- User's style preference
- Occasion match
- Available wardrobe items

### 8. User Profile (`app/(tabs)/profile.tsx`)

**Displays:**
- User name and email (from store)
- Avatar placeholder
- Body type selector
- Skin tone selector
- Style preference selector
- Logout button

**Updates:** Changes immediately save to store and Async Storage

---

## State Management (Zustand Store)

**File:** `store/index.ts`

**Store Structure:**
```typescript
interface AppState {
  // Auth state
  isAuthenticated: boolean;
  profile: UserStyleProfile | null;
  hasSeenOnboarding: boolean;
  
  // Data state
  wardrobeItems: WardrobeItem[];
  
  // Actions
  login: (email, name?) => void;
  signup: (email, name) => void;
  saveProfile: (profileData) => void;
  addWardrobeItem: (item) => void;
  signOut: () => void;
}
```

**Persistence:**
- Middleware: `persist` + `createJSONStorage`
- Storage backend: Async Storage
- Key: `'kloset-app-storage'`
- Auto-hydrates on app startup

**State Updates:**
```typescript
// Reading state
const isAuth = useAppStore((state) => state.isAuthenticated);

// Updating state
const login = useAppStore((state) => state.login);
login('user@example.com', 'John Doe');
```

---

## Type System (`types/index.ts`)

**Core Types:**
```typescript
// Profile attributes
type BodyType = 'Petite' | 'Athletic' | 'Curvy' | 'Plus' | 'Tall';
type SkinTone = 'Fair' | 'Wheatish' | 'Dusky' | 'Deep';
type StylePreference = 'Minimal' | 'Ethnic' | 'Western' | 'Fusion' | 'Streetwear';
type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Ethnic' | 'Outers' | 'Shoes';

// Domain entities
interface UserStyleProfile { /* user profile */ }
interface WardrobeItem { /* clothing item */ }
interface Outfit { /* outfit suggestion */ }
interface Swipe { /* user interaction */ }
```

**Why This Matters:**
- Type safety across component props
- IDE autocomplete and error checking
- Self-documenting code
- Prevents runtime errors

---

## Theme System (`constants/Colors.ts`)

**Architecture:**
```typescript
export default {
  light: { ... },  // Light theme colors
  dark: { ... },   // Dark theme colors
};
```

**Usage:**
```typescript
const colorScheme = useColorScheme();  // 'light' or 'dark'
const theme = Colors[colorScheme];
<View style={{ backgroundColor: theme.background }} />
```

**Themed Components:**
- `components/Themed.tsx` exports `<View>` and `<Text>`
- Automatically uses theme colors
- Components never need to import Colors directly

---

## Services Layer (`lib/`)

### Supabase Client (`lib/supabase.ts`)

**Initialization:**
```typescript
const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

**Features (Ready for):
- User authentication
- PostgreSQL database
- Vector embeddings (for AI recommendations)
- File storage (for wardrobe images)
- Real-time subscriptions

**Current Status:** Initialized but not actively used in MVP

---

## Routing System (Expo Router)

**File-Based Routing:**
```
app/
├── (tabs)/
│   ├── index.tsx        → /(tabs) (home)
│   ├── discover.tsx     → /(tabs)/discover
│   ├── outfits.tsx      → /(tabs)/outfits
│   └── profile.tsx      → /(tabs)/profile
├── auth/
│   ├── login.tsx        → /auth/login
│   └── signup.tsx       → /auth/signup
├── onboarding/
│   └── index.tsx        → /onboarding
└── upload.tsx           → /upload (modal)
```

**Navigation Guards:**
- Located in `app/_layout.tsx` `RootLayoutNav()` function
- Redirects based on `isAuthenticated` and `hasSeenOnboarding`
- Prevents back button to auth screens when authenticated

**API Usage:**
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/auth/login');      // Navigate
router.replace('/onboarding');   // Replace history
router.back();                   // Go back
```

---

## Component Architecture

### Component Types

**1. Screen Components** (in `app/`)
- Full-screen containers
- Connect to Zustand store
- Handle navigation
- Examples: `index.tsx`, `discover.tsx`

**2. Feature Components** (in `components/`)
- Reusable UI components
- Simple props interface
- No store dependencies
- Examples: `Themed.tsx`, `ExternalLink.tsx`

**3. Utility Hooks** (in `components/`)
- Custom React hooks
- Platform-specific implementations (.ts vs .web.ts)
- Examples: `useColorScheme`, `useClientOnlyValue`

### Props Drilling vs Store

**Use Store When:**
- Data needed by multiple unrelated components
- Global app state (auth, profile)
- Persisted data

**Use Props When:**
- Data specific to component tree
- Passing behavior callbacks
- Temporary UI state

---

## Data Flow Patterns

### Pattern 1: Add Wardrobe Item

```
User selects image → UploadScreen
  ↓ (picks category, color, tags)
  ↓ calls addWardrobeItem()
  ↓ Zustand updates wardrobeItems array
  ↓ Async Storage persists
  ↓ Router.back() returns to wardrobe
  ↓ Wardrobe screen re-renders with new item
```

### Pattern 2: Update Profile

```
User selects body type, skin tone, style → OnboardingScreen
  ↓ calls saveProfile(profileData)
  ↓ Zustand updates profile + hasSeenOnboarding
  ↓ Async Storage persists
  ↓ RootLayoutNav re-evaluates
  ↓ Navigation guard redirects to /(tabs)
```

### Pattern 3: Authentication

```
User enters email + password → LoginScreen
  ↓ calls login(email, name)
  ↓ Zustand sets isAuthenticated = true
  ↓ Async Storage persists
  ↓ RootLayoutNav re-evaluates
  ↓ Redirect to onboarding (if first time)
```

---

## Performance Optimizations

### 1. Lazy Loading
- Expo Router handles screen code splitting automatically
- Only loaded screens' code is bundled

### 2. Memoization
- React.memo for expensive components
- useMemo for derived data
- useCallback for handler stability

### 3. Image Optimization
- expo-image-picker compresses on client
- Consider implementing image resizing

### 4. Store Subscriptions
- Zustand selects only needed slice of state
- Components only re-render on relevant state changes

---

## Error Handling

### Current Implementation
- Try-catch in image picker
- Error state in components
- Error messages displayed to user

### Future Improvements
- Centralized error boundary
- Error logging to Sentry
- Retry mechanisms
- Timeout handling

---

## Security Architecture

### Authentication
- Supabase handles password hashing
- JWT tokens for session management
- Auto-refresh tokens on expiry
- No passwords stored locally

### Data Storage
- User data in Async Storage (local, not synced)
- No sensitive data in app state
- Environment variables for API keys

### API Security
- Supabase Row-Level Security (RLS)
- Backend validation of all requests
- HTTPS only

---

## Future Extensions

### 1. Real AI Recommendations
- Vector embeddings for outfit similarity
- ML model for personalization
- User feedback loop (likes/dislikes)

### 2. Backend Integration
- Move from mock data to Supabase
- Real user authentication
- Cloud image storage

### 3. Social Features
- Share outfits with friends
- Follow other users' styles
- Community recommendations

### 4. Advanced Analytics
- User style insights
- Wardrobe optimization tips
- Trend analysis

---

## Deployment Architecture

### Development
```
Local Machine → Metro Bundler → Expo Go App
```

### Production
```
GitHub → EAS Build → Signed Binary
  ↓
App Store / Play Store / Web Hosting
```

### Environment Variables
- `.env.local` for development
- EAS Secrets for production builds
- Different API endpoints per environment

---

## Maintenance & Monitoring

### Code Quality
- TypeScript for type safety
- ESLint for code style (to be configured)
- 80%+ test coverage target

### Logging
- Console logs in development
- Sentry for production errors
- Analytics on user interactions

### Performance Monitoring
- Startup time tracking
- Screen transition smoothness
- API response times
- Memory usage

---

## Conclusion

The KLOSET architecture prioritizes:
1. **Simplicity** - Easy to understand and modify
2. **Scalability** - Can grow without major rewrites
3. **Maintainability** - TypeScript and clear organization
4. **Performance** - Optimized for mobile devices
5. **Type Safety** - Comprehensive TypeScript types

The modular structure allows new developers to quickly understand sections independently while seeing how components fit together.

---

**Last Updated**: June 2026  
**Architecture Version**: 1.0  
**Apps using this pattern**: Wardrobe, Discover, Occasions, Profile
