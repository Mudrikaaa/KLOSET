# KLOSET - State Management

## Overview

KLOSET uses **Zustand** for global state management with persistence via React Native Async Storage. This document explains the store structure, patterns, and usage.

---

## Why Zustand?

**Selected over alternatives:**

- Redux: Too verbose for app scale
- MobX: Less TypeScript support
- Context API: Performance issues at scale
- Recoil: Overkill complexity

**Zustand advantages:**

- Minimal boilerplate
- Excellent TypeScript support
- Built-in middleware (persist)
- Small bundle size (~2KB)
- Easy debugging
- No provider hell

---

## Store Architecture

### File Location

`store/index.ts`

### Basic Structure

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      profile: null,
      hasSeenOnboarding: false,
      wardrobeItems: DEFAULT_WARDROBE_ITEMS,

      // Actions
      login: (email, name) =>
        set({
          /* ... */
        }),
      signup: (email, name) =>
        set({
          /* ... */
        }),
      // ... more actions
    }),
    {
      name: "kloset-app-storage", // Async Storage key
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

---

## Store State Interface

```typescript
interface AppState {
  // ============ AUTH STATE ============
  isAuthenticated: boolean;
  profile: UserStyleProfile | null;
  hasSeenOnboarding: boolean;

  // ============ DATA STATE ============
  wardrobeItems: WardrobeItem[];

  // ============ ACTIONS ============
  /** Authenticate user */
  login: (email: string, name?: string) => void;
  signup: (email: string, name: string) => void;

  /** Update user profile */
  saveProfile: (profileData: ProfileUpdate) => void;

  /** Manage wardrobe */
  addWardrobeItem: (
    item: Omit<WardrobeItem, "id" | "userId" | "createdAt">,
  ) => void;

  /** Logout */
  signOut: () => void;
}
```

---

## State Properties

### Authentication State

#### `isAuthenticated: boolean`

- **Type**: Boolean
- **Default**: `false`
- **Set by**: `login()`, `signup()`, `signOut()`
- **Purpose**: Guards navigation routes
- **Persisted**: Yes

```typescript
// Usage
const isAuth = useAppStore((state) => state.isAuthenticated);
```

#### `profile: UserStyleProfile | null`

- **Type**: UserStyleProfile or null
- **Default**: `null`
- **Set by**: `login()`, `signup()`, `saveProfile()`
- **Contains**: name, email, bodyType, skinTone, stylePreference
- **Persisted**: Yes

```typescript
interface UserStyleProfile {
  id: string;
  name: string;
  email: string;
  bodyType: BodyType;
  skinTone: SkinTone;
  stylePreference: StylePreference;
}
```

#### `hasSeenOnboarding: boolean`

- **Type**: Boolean
- **Default**: `false`
- **Set by**: `saveProfile()`
- **Purpose**: Determines if user needs onboarding
- **Persisted**: Yes

```typescript
// Usage - Navigation guard
if (!hasSeenOnboarding) {
  router.replace("/onboarding");
}
```

### Data State

#### `wardrobeItems: WardrobeItem[]`

- **Type**: Array of WardrobeItem
- **Default**: DEFAULT_WARDROBE_ITEMS (demo data)
- **Set by**: `addWardrobeItem()`, `removeWardrobeItem()` (planned)
- **Operations**: Add, view, filter, delete
- **Persisted**: Yes

```typescript
interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  category: Category;
  color: string;
  style: StylePreference;
  tags: string[];
  createdAt: string;
}
```

---

## Store Actions

### Authentication Actions

#### `login(email: string, name?: string): void`

**Purpose**: Authenticate user login

**Implementation**:

```typescript
login: (email, name = "Style Lover") =>
  set({
    isAuthenticated: true,
    profile: {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      bodyType: "Curvy",
      skinTone: "Wheatish",
      stylePreference: "Fusion",
    },
    hasSeenOnboarding: false, // Will onboard
  });
```

**Usage**:

```typescript
const login = useAppStore((state) => state.login);
login("priya@example.com", "Priya Sharma");
```

**Side Effects**:

- Sets `isAuthenticated = true`
- Creates default profile
- Navigation guard redirects to onboarding
- Persists to Async Storage

#### `signup(email: string, name: string): void`

**Purpose**: Create new user account

**Implementation**:

```typescript
signup: (email, name) =>
  set({
    isAuthenticated: true,
    profile: {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      bodyType: "Curvy",
      skinTone: "Wheatish",
      stylePreference: "Fusion",
    },
    hasSeenOnboarding: false,
  });
```

**Differences from login**:

- Name is required (not optional)
- Same flow as login (for MVP)

#### `signOut(): void`

**Purpose**: Logout user and clear state

**Implementation**:

```typescript
signOut: () =>
  set({
    isAuthenticated: false,
    profile: null,
    hasSeenOnboarding: false,
    wardrobeItems: DEFAULT_WARDROBE_ITEMS, // Reset items
  });
```

**Side Effects**:

- Clears auth state
- Resets to demo data
- Navigation guard redirects to login
- Keeps app for guest browsing

### Profile Actions

#### `saveProfile(profileData: ProfileUpdate): void`

**Purpose**: Update user's style profile

**Parameters**:

```typescript
interface ProfileUpdate {
  bodyType: BodyType;
  skinTone: SkinTone;
  stylePreference: StylePreference;
}
```

**Implementation**:

```typescript
saveProfile: (profileData) =>
  set((state) => ({
    profile: state.profile ? { ...state.profile, ...profileData } : null,
    hasSeenOnboarding: true,
  }));
```

**Usage**:

```typescript
const saveProfile = useAppStore((state) => state.saveProfile);
saveProfile({
  bodyType: "Athletic",
  skinTone: "Fair",
  stylePreference: "Minimal",
});
```

**Side Effects**:

- Updates profile object
- Sets `hasSeenOnboarding = true`
- Navigation guard redirects to home
- Persists immediately

### Wardrobe Actions

#### `addWardrobeItem(item: ItemInput): void`

**Purpose**: Add new clothing item to wardrobe

**Parameters**:

```typescript
interface ItemInput {
  imageUrl: string;
  category: Category;
  color: string;
  style: StylePreference;
  tags: string[];
}
```

**Implementation**:

```typescript
addWardrobeItem: (item) =>
  set((state) => ({
    wardrobeItems: [
      ...state.wardrobeItems,
      {
        ...item,
        id: "item_" + Math.random().toString(36).substr(2, 9),
        userId: state.profile?.id || "user_1",
        createdAt: new Date().toISOString(),
      },
    ],
  }));
```

**Usage**:

```typescript
const addWardrobeItem = useAppStore((state) => state.addWardrobeItem);
addWardrobeItem({
  imageUrl: "file:///path/to/image.jpg",
  category: "Tops",
  color: "Blue",
  style: "Western",
  tags: ["summer", "casual"],
});
```

**Side Effects**:

- Generates unique item ID
- Adds current timestamp
- Appends to wardrobeItems array
- Persists to Async Storage
- UI re-renders with new item

---

## Using the Store

### Reading State

#### Simple Property Read

```typescript
import { useAppStore } from '@/store';

export default function Component() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return <Text>{isAuthenticated ? 'Logged in' : 'Not logged in'}</Text>;
}
```

#### Multiple State Slices

```typescript
const { profile, wardrobeItems } = useAppStore((state) => ({
  profile: state.profile,
  wardrobeItems: state.wardrobeItems,
}));
```

#### All State

```typescript
const allState = useAppStore(); // Entire store
```

### Calling Actions

```typescript
const { login, addWardrobeItem, signOut } = useAppStore();

// Login
login("user@example.com", "John Doe");

// Add item
addWardrobeItem({
  imageUrl: "file://...",
  category: "Tops",
  color: "Red",
  style: "Western",
  tags: ["casual"],
});

// Logout
signOut();
```

### Performance Optimization

Zustand automatically optimizes re-renders by tracking dependencies:

```typescript
// ✅ GOOD - Component only re-renders if profile changes
const profile = useAppStore((state) => state.profile);

// ✅ GOOD - Component only re-renders if wardrobeItems changes
const items = useAppStore((state) => state.wardrobeItems);

// ⚠️ LESS EFFICIENT - Component may re-render even when unused values change
const { profile, wardrobeItems, isAuthenticated } = useAppStore();
```

---

## Persistence

### How It Works

1. **Store Creation**:
   - Zustand creates in-memory state
   - `persist` middleware wraps store

2. **Initial Hydration**:
   - On app startup
   - Zustand checks Async Storage
   - Loads saved state (if exists)
   - Updates in-memory store

3. **State Changes**:
   - Action updates state
   - Middleware serializes to JSON
   - Async Storage saves automatically
   - No explicit save calls needed

4. **App Restart**:
   - State automatically restored
   - User remains logged in
   - Wardrobe items persist
   - Profile settings preserved

### Async Storage Details

**Storage Key**: `'kloset-app-storage'`

**Stored Structure**:

```json
{
  "isAuthenticated": true,
  "profile": {
    "id": "user_abc123",
    "name": "Priya",
    "email": "priya@example.com",
    "bodyType": "Curvy",
    "skinTone": "Wheatish",
    "stylePreference": "Fusion"
  },
  "hasSeenOnboarding": true,
  "wardrobeItems": [
    {
      "id": "item_1",
      "userId": "user_abc123",
      "imageUrl": "file:///...",
      "category": "Tops",
      "color": "White",
      "style": "Western",
      "tags": ["summer"],
      "createdAt": "2026-06-06T10:30:00Z"
    }
  ]
}
```

### Manual Persistence Control (Advanced)

```typescript
// Get current state
const state = useAppStore.getState();

// Manually trigger persistence (usually automatic)
// Zustand handles this automatically via middleware

// Clear Async Storage
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.removeItem("kloset-app-storage");

// Export state
const json = JSON.stringify(state);

// Import state
useAppStore.setState(JSON.parse(json));
```

---

## Security Considerations

### Current Implementation

- ⚠️ No encryption of stored data
- ✅ No sensitive passwords stored (login only)
- ✅ No API tokens persisted
- ⚠️ Local storage readable if device compromised

### Future Security

```typescript
// Encrypt sensitive data
import * as SecureStore from "expo-secure-store";

const persist = {
  name: "kloset-app-storage",
  storage: {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
  },
};
```

---

## Debugging

### Log State Changes

```typescript
// Add logging middleware
const store = create((set) => {
  return {
    // ... store
  };
});

// Subscribe to all changes
useAppStore.subscribe((state) => console.log("State changed:", state));
```

### Inspect Current State

```typescript
// In React DevTools console
useAppStore.getState();

// Log specific slice
console.log(useAppStore.getState().profile);

// Check Async Storage
import AsyncStorage from "@react-native-async-storage/async-storage";
const data = await AsyncStorage.getItem("kloset-app-storage");
console.log(JSON.parse(data));
```

### Reset Store to Defaults

```typescript
useAppStore.setState({
  isAuthenticated: false,
  profile: null,
  hasSeenOnboarding: false,
  wardrobeItems: DEFAULT_WARDROBE_ITEMS,
});
```

---

## Testing State

### Mocking Store for Tests

```typescript
// Mock store
export const createMockStore = (initialState = {}) => {
  return {
    getState: () => ({ ...initialState }),
    subscribe: jest.fn(),
    setState: jest.fn(),
  };
};

// Usage in tests
const mockStore = createMockStore({
  isAuthenticated: true,
  profile: {
    /* ... */
  },
});
```

### Testing State Changes

```typescript
test("login should set isAuthenticated to true", () => {
  const store = useAppStore;
  store.getState().login("test@example.com");

  expect(store.getState().isAuthenticated).toBe(true);
  expect(store.getState().profile?.email).toBe("test@example.com");
});
```

---

## Performance Optimization Tips

1. **Select Only Needed State**

   ```typescript
   // ✅ Good
   const profile = useAppStore((s) => s.profile);

   // ❌ Bad - re-renders on any state change
   const { profile } = useAppStore();
   ```

2. **Use Shallow Comparison**

   ```typescript
   import { shallow } from "zustand/react/shallow";

   // Only re-render if profile or items change
   const { profile, wardrobeItems } = useAppStore(
     (state) => ({
       profile: state.profile,
       wardrobeItems: state.wardrobeItems,
     }),
     shallow,
   );
   ```

3. **Memoize Derived State**
   ```typescript
   const wardrobeCount = useMemo(() => wardrobeItems.length, [wardrobeItems]);
   ```

---

## Migration Path (to Supabase)

When moving to backend:

1. **Dual Write**: Write to both Zustand and Supabase
2. **Sync Check**: Compare local and remote on startup
3. **Conflict Resolution**: Handle merge conflicts
4. **Gradual Migration**: Migrate users progressively
5. **Fallback**: Keep local as fallback to backend

```typescript
// Future pattern
const syncWithBackend = async () => {
  const local = useAppStore.getState();

  // Upload local state
  await supabase.from("users").upsert(local.profile);

  // Download server state
  const { data: serverState } = await supabase
    .from("users")
    .select("*")
    .eq("id", local.profile.id);

  // Merge and update
  updateLocalState(mergeStates(local, serverState));
};
```

---

## Conclusion

Zustand provides KLOSET with:

- **Simplicity**: Easy to understand state management
- **Performance**: Automatic optimization
- **Persistence**: Automatic Async Storage sync
- **Type Safety**: Full TypeScript support
- **Scalability**: Ready for backend integration

The store is the single source of truth for app state, ensuring consistent user experience and data flow throughout the application.

---

**Last Updated**: June 2026  
**Store Version**: 1.0  
**Persistence**: Zustand + Async Storage  
**Path to Supabase**: Documented for Phase 2
