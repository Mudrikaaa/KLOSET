# KLOSET - AI Context & Mental Model

## Purpose of This Document

This document provides AI agents (including future versions of Claude, GPT, and other LLMs) with a complete mental model of the KLOSET project. Use this document when you need to understand, modify, or reason about the project without reading the entire codebase.

---

## Quick Mental Model

### What is KLOSET?

Personal AI styling assistant that helps users organize wardrobes and discover outfits based on their body type, skin tone, and style preferences.

### Technology Stack

- **Frontend**: Expo (React Native) with TypeScript
- **State**: Zustand with Async Storage persistence
- **Backend**: Supabase (not integrated yet)
- **Routing**: Expo Router (file-based)
- **UI**: Theme system with light/dark modes

### Core Users

1. **Authenticated Users**: Make accounts, save wardrobes
2. **Guest Users**: Browse discover/occasions without account
3. **Future Users**: May have premium/social features

### Key Metrics

- App launch: ~3 seconds
- Wardrobe: 5-10K+ items possible
- Occasions: 5 pre-configured
- Mock data: 3 default wardrobe items

---

## Project Context

### Project Stage

**MVP (Minimum Viable Product)**

- Core features: Auth, wardrobe, discover, occasions, profile
- Backend: Initialized but not connected
- Production Status: Pre-release (beta)

### Problem Solved

Users struggle to:

1. Organize their existing clothes
2. Mix and match outfits
3. Get styling advice personalized to their appearance
4. Maintain a "personal stylist" in their pocket

### Solution Provided

KLOSET offers:

1. Digital wardrobe management
2. AI-powered outfit recommendations
3. Occasion-based styling
4. Personalized to body type, skin tone, style preference

---

## File Organization Mental Model

```
KLOSET/
├── app/                          # Screens & navigation
│   ├── (tabs)/                   # Main app screens
│   │   ├── index.tsx             # Wardrobe (grid view)
│   │   ├── discover.tsx          # Swipe outfits
│   │   ├── outfits.tsx           # Occasion-based
│   │   └── profile.tsx           # User settings
│   ├── auth/                     # Login/signup
│   ├── onboarding/               # Profile setup
│   ├── upload.tsx                # Add wardrobe item
│   └── _layout.tsx               # Auth routing guard
│
├── store/                        # Zustand state = Source of Truth
│   └── index.ts                  # Single global store
│
├── types/                        # TypeScript interfaces
│   └── index.ts                  # All types in one file
│
├── components/                   # Reusable React components
│   ├── Themed.tsx                # Theme-aware View/Text
│   └── useColorScheme.ts         # Theme detection
│
├── constants/                    # App constants
│   └── Colors.ts                 # Theme colors
│
├── lib/                          # Services
│   └── supabase.ts               # Cloud DB client
│
└── docs/                         # Documentation (this folder)
```

---

## Data Flow Pattern

### Universal Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Zustand Action Called (setState)
    ↓
In-Memory State Updated
    ↓
Middleware Persists to Async Storage
    ↓
Component Re-renders
    ↓
UI Updated
```

### Example: Adding Wardrobe Item

```javascript
User Taps "+" → UploadScreen opens
  ↓
User selects image, category, color, tags
  ↓
User taps "Save"
  ↓
Component calls: useAppStore.getState().addWardrobeItem({...})
  ↓
Zustand action:
  - Generates unique item ID
  - Adds timestamp
  - Appends to wardrobeItems array
  - Returns new state
  ↓
Middleware:
  - Serializes state to JSON
  - Saves to Async Storage (persistent)
  ↓
Components subscribed to wardrobeItems:
  - Detect state change
  - Re-render with new item
  ↓
User sees item in grid
```

---

## State Structure

### Zustand Store (Single Source of Truth)

```typescript
{
  // Authentication (persisted)
  isAuthenticated: boolean,
  profile: UserStyleProfile | null,
  hasSeenOnboarding: boolean,

  // Data (persisted)
  wardrobeItems: WardrobeItem[],

  // Actions
  login(),
  signup(),
  saveProfile(),
  addWardrobeItem(),
  signOut()
}
```

### User Profile

```typescript
{
  id: "user_abc",
  name: "Priya",
  email: "priya@example.com",
  height: "Average",               // Petite/Average/Tall
  bodyShape: "Hourglass",          // Hourglass/Pear/Apple/Rectangle/Inverted Triangle
  skinTone: "Wheatish",            // Fair/Wheatish/Dusky/Deep
  undertone: "Neutral",            // Warm/Cool/Neutral
  stylePreference: "Fusion",       // Minimal/Ethnic/Western/Fusion/Streetwear
  coveragePreference: "Moderate",  // Modest/Moderate/Open
  occasionFrequency: "Mix of Everything", // Mostly Casual/Mix of Everything/Lots of Functions and Events/Professional Environment Daily
  colorComfort: "Some Color"       // Neutrals Only/Some Color/Bold and Colorful
}
```

### Wardrobe Item

```typescript
{
  id: "item_xyz",
  userId: "user_abc",
  imageUrl: "file:///path/...",  // Local or cloud
  category: "Tops",              // Tops/Bottoms/Dresses/Ethnic/Outers/Shoes
  color: "Blue",
  style: "Western",
  tags: ["summer", "casual", "linen"],
  createdAt: "2026-06-06T...",
  fit: "Regular",
  fabric: "Linen",
  length: "Short",
  pattern: "Solid",
  neckline: "Collar",
  sleeve: "Half",
  season: "Summer",
  occasions: ["Casual Outing", "Brunch / Cafe"]
}
```

---

## Navigation Mental Model

### Route Hierarchy

```
Not Authenticated
└── /auth/login ← Entry point
    ├─ Login ✓
    └─ /auth/signup

Authenticated + No Profile
└── /onboarding ← Must complete

Authenticated + Profile Complete
└── /(tabs) ← Main app
    ├─ /(tabs)/index (Wardrobe)
    ├─ /(tabs)/discover (Swipe)
    ├─ /(tabs)/outfits (Occasions)
    └─ /(tabs)/profile (Settings)
```

### Navigation Guards (in \_layout.tsx)

```
On every state change:
  if NOT authenticated
    → force /auth/login
  else if NOT onboarded
    → force /onboarding
  else
    → allow /(tabs)
```

---

## Component Architecture Pattern

### Every Screen Follows This Pattern

```typescript
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/store';

export default function ScreenName() {
  // 1. Get theme
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  // 2. Get router
  const router = useRouter();

  // 3. Get state
  const data = useAppStore((state) => state.someData);

  // 4. Get actions
  const action = useAppStore((state) => state.someAction);

  // 5. Local state if needed
  const [localState, setLocalState] = useState(null);

  // 6. Effects if needed
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 7. Render with theme colors
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>
        Content
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 16 },
});
```

---

## Interaction Patterns

### User Authentication Flow

1. User opens app
2. Navigation guard checks `isAuthenticated`
3. If false → forced to `/auth/login`
4. User enters email and password
5. Clicks login
6. Zustand's `login()` called
7. Sets `isAuthenticated = true`
8. State persisted to Async Storage
9. Navigation guard re-evaluates
10. Redirected to `/onboarding` (because `hasSeenOnboarding = false`)
11. User completes profile (body type, skin tone, style)
12. Zustand's `saveProfile()` called
13. Sets `hasSeenOnboarding = true`
14. Redirected to `/(tabs)` (home screen)

### Wardrobe Item Upload Flow

1. User on Wardrobe tab, taps "+" button
2. Routes to `/upload` modal
3. UploadScreen renders
4. User selects image (camera or gallery)
5. Fills: category, color, style, tags
6. Taps "Save"
7. Component calls `addWardrobeItem()`
8. Zustand generates ID, adds item to array
9. Persists to Async Storage
10. Component closes modal with `router.back()`
11. Wardrobe grid re-renders with new item

---

## Key Design Decisions

### Why Zustand?

- Minimal boilerplate (Redux is overkill)
- Perfect TypeScript support
- Auto-persist via middleware
- No provider hell
- Tiny bundle size (~2KB)

### Why Expo Router?

- File-based routing (like Next.js)
- Built for React Native/Expo
- Handled screen animations
- Deep linking out of box
- Type-safe routing

### Why Async Storage?

- Works offline (no internet needed)
- Survives app restart
- No backend latency
- Perfect for MVP

### Why Local-First?

- Fast UX (no network wait)
- Works offline completely
- Ready to sync to Supabase later
- Easier to test

### Why Single Type File?

- Easier to find all types
- No circular dependencies
- Forces thoughtful organization
- Future: Can split if needed

---

## Common Modification Patterns

### Add New Screen

1. Create `app/new-feature/index.tsx`
2. File-based routing auto-creates route
3. If needs tabs: put in `(tabs)` folder
4. If needs auth: put in appropriate folder
5. Navigation guard auto-handles auth

### Add New State

1. Add property to `AppState` interface
2. Add initial value to store
3. Add action function
4. Use with `useAppStore()`
5. Auto-persisted

### Add New Type

1. Define in `types/index.ts`
2. Import where needed
3. TypeScript enforces usage

### Add Theme Color

1. Add to both themes in `constants/Colors.ts`
2. Use in component: `theme.newColor`
3. Automatically updates in light/dark modes

---

## Performance Characteristics

### App Startup

1. Zustand hydrates from Async Storage (~100ms)
2. Fonts load (~200-500ms)
3. Navigation resolved (~100ms)
4. Total: ~3 seconds ✓

### State Updates

- Zustand: <10ms (in-memory)
- Async Storage: <100ms (persistence)
- Re-renders: <200ms (60 FPS)

### Memory Usage

- Zustand store: <1MB
- Async Storage: <10MB capacity
- Can hold 5000+ wardrobe items comfortably

---

## Common Bugs & Fixes

### Bug: State Not Persisting After Restart

**Cause**: Not using Zustand store (using local state)
**Fix**: Move to Zustand store with persist middleware

### Bug: Component Not Updating When Store Changes

**Cause**: Not subscribing to state changes
**Fix**: Use `useAppStore((state) => state.value)`

### Bug: Infinite Navigation Loops

**Cause**: Navigation guard not idempotent
**Fix**: Check current route before redirecting

### Bug: Navigation History Lost

**Cause**: Using `router.replace()` instead of `router.push()`
**Fix**: Use `router.push()` for normal nav, `replace()` only for auth flows

### Bug: Images Not Loading

**Cause**: File URI from device doesn't exist after app restart
**Fix**: Store to Supabase Storage (not local file URI)

---

## Testing Guidelines

### What to Test

- ✅ Auth flows (login, signup, logout)
- ✅ Navigation guards
- ✅ Wardrobe CRUD
- ✅ Theme switching
- ✅ Offline behavior
- ✅ Different screen sizes

### How to Test

- Manual on device/emulator
- Test on actual phones (iOS & Android)
- Test with slow network
- Test with languages changing (i18n)

---

## Future Integration Points

### Planned for Phase 2

- [ ] Supabase authentication integration
- [ ] Cloud image storage
- [ ] Real outfit recommendations (ML)
- [ ] Push notifications
- [ ] Analytics

### How to Integrate

1. Supabase: Replace mock login with real auth
2. Database: Sync Zustand to Supabase tables
3. Images: Upload to Supabase Storage
4. ML: Call recommendation API
5. Notifications: Subscribe to events

---

## Code Examples for AI Agents

### Reading State

```typescript
// Get single value
const isLoggedIn = useAppStore((s) => s.isAuthenticated);

// Get multiple values
const { profile, wardrobeItems } = useAppStore((s) => ({
  profile: s.profile,
  wardrobeItems: s.wardrobeItems,
}));
```

### Updating State

```typescript
// Call action
const login = useAppStore((s) => s.login);
login("user@example.com", "John Doe");

// Direct state update (avoid, use actions instead)
useAppStore.setState({ isAuthenticated: true });
```

### Component with Store

```typescript
export default function MyComponent() {
  const canAccess = useAppStore((s) => s.isAuthenticated);
  const items = useAppStore((s) => s.wardrobeItems);

  if (!canAccess) return <Text>Not authenticated</Text>;

  return <FlatList data={items} renderItem={...} />;
}
```

---

## Critical Knowledge for Modifications

### Must Know

1. **Zustand subscription pattern**: How state updates trigger re-renders
2. **Navigation guards**: Why certain routes redirect
3. **Theme system**: How colors work in light/dark modes
4. **File-based routing**: How folders = routes
5. **Async Storage**: Data persists across restarts

### Should Know

1. **TypeScript strictness**: All files must be strict
2. **Platform differences**: iOS/Android/Web handling
3. **Performance**: Which operations are slow
4. **Testing**: How to verify changes work

### Nice to Know

1. **Expo Router internals**: Deep linking patterns
2. **React Native optimization**: FlatList vs ScrollView
3. **Zustand middleware**: Custom persistence logic
4. **EAS builds**: How app gets on app stores

---

## Decision Log (Why Things Are As They Are)

| Decision          | Rationale            | Consequences                                 |
| ----------------- | -------------------- | -------------------------------------------- |
| Zustand for state | Minimal boilerplate  | Can't use DevTools easily (tradeoff)         |
| Async Storage     | Works offline        | Can't sync easily to backend                 |
| Local-first       | Fast UX              | Need migration plan to Supabase              |
| Single store      | Clear access pattern | Can become large over time                   |
| Files in types/   | Easy to locate       | Must import carefully to avoid circular deps |
| Tab-based nav     | Familiar UX          | Back button complex behavior                 |
| Mock data         | Fast MVP             | Need real data integration                   |
| No GraphQL        | Simplicity           | REST API limitations later                   |

---

## Conclusion

This document provides the mental model needed to:

1. **Understand** how KLOSET works
2. **Modify** features effectively
3. **Debug** issues quickly
4. **Extend** with new features
5. **Communicate** with other developers/AIs

The key principle: **Zustand is the single source of truth**. All state flows through it, all changes happen there, and all persistence is automatic.

---

**Last Updated**: June 2026  
**Mental Model Version**: 1.0  
**Target Audience**: AI Agents, Developers, Architecture Reviewers  
**Refresh Frequency**: On major changes
