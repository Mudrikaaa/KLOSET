# KLOSET - API & Services Integration

## Overview

KLOSET integrates with external services and APIs for authentication, data persistence, image handling, and future AI capabilities. This document outlines current and planned integrations.

---

## Service Architecture

```
┌──────────────────┐
│  KLOSET App      │
└────────┬─────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ↓                                 ↓
┌─────────────────┐      ┌────────────────────┐
│ Supabase        │      │ Expo Services      │
│ - Auth          │      │ - Deep Linking     │
│ - Database      │      │ - Image Picker     │
│ - Storage       │      │ - Splash Screen    │
│ - Vectors       │      │ - Font Loading     │
└─────────────────┘      └────────────────────┘
```

---

## 1. Supabase Integration

### Overview

**Status**: Initialized but not actively used in MVP
**Purpose**: Cloud authentication, database, and file storage
**Provider**: Supabase (Firebase alternative built on PostgreSQL)

### Configuration

**File**: `lib/supabase.ts`

```typescript
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Persist auth tokens
    autoRefreshToken: true, // Auto-refresh expired tokens
    persistSession: true, // Remember login session
    detectSessionInUrl: false, // Deep linking support
  },
});
```

### Environment Variables

Create `.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Current Features (Initialized)

#### Authentication Service

```typescript
// Not implemented yet, but ready to use:

// Sign up
await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// Get current user
const { data } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Session:", session);
});
```

#### Database Operations

```typescript
// Create (Insert)
const { data, error } = await supabase
  .from("wardrobe_items")
  .insert([{ userId, category, color, style, tags }]);

// Read (Query)
const { data, error } = await supabase
  .from("wardrobe_items")
  .select("*")
  .eq("user_id", userId);

// Update
const { data, error } = await supabase
  .from("wardrobe_items")
  .update({ color: "Blue" })
  .eq("id", itemId);

// Delete
const { error } = await supabase
  .from("wardrobe_items")
  .delete()
  .eq("id", itemId);
```

#### File Storage

```typescript
// Upload image
const { data, error } = await supabase.storage
  .from("wardrobe-images")
  .upload(`${userId}/${itemId}.jpg`, imageBlob);

// Get public URL
const { data } = supabase.storage
  .from("wardrobe-images")
  .getPublicUrl(`${userId}/${itemId}.jpg`);

// Delete image
const { error } = await supabase.storage
  .from("wardrobe-images")
  .remove([`${userId}/${itemId}.jpg`]);
```

### Vector Embeddings (For AI)

```typescript
// Query by similarity
const { data } = await supabase.rpc("match_outfits", {
  query_embedding: vectorEmbedding,
  match_threshold: 0.7,
  match_count: 10,
});
```

### Row-Level Security (RLS)

Future implementation with policies:

```sql
-- Users can only read their own data
CREATE POLICY user_read_own ON wardrobe_items
  AS SELECT USING (user_id = current_user_id());

-- Users can only insert their own data
CREATE POLICY user_insert_own ON wardrobe_items
  AS INSERT WITH CHECK (user_id = current_user_id());
```

### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase.from("wardrobe_items").select("*");

  if (error) {
    console.error("Database error:", error.message);
    // Handle error user-facing
    setError("Failed to load wardrobe items");
  } else {
    // Process data
    setItems(data);
  }
} catch (err) {
  console.error("Unexpected error:", err);
  setError("An unexpected error occurred");
}
```

---

## 2. Expo Services

### Image Picker Service

**Library**: `expo-image-picker`
**Current Usage**: Wardrobe item upload (`app/upload.tsx`)

#### API

```typescript
import * as ImagePicker from 'expo-image-picker';

// Request permissions
const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
const cameraResult = await ImagePicker.requestCameraPermissionsAsync();

// Launch camera
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

// Launch gallery
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

// Result structure
{
  cancelled: boolean;
  assets: [{
    uri: string;        // file:///path/to/image
    width: number;
    height: number;
    type: 'image';
  }];
}
```

#### Error Handling

```typescript
if (!permissionResult.granted) {
  Alert.alert("Permission Required", "Camera access is required");
  return;
}

if (!result.canceled && result.assets?.length > 0) {
  const { uri } = result.assets[0];
  // Process image
} else if (result.canceled) {
  // User cancelled
}
```

### Font Loading (`expo-font`)

**Purpose**: Load custom fonts
**Current Usage**: SpaceMono in root layout

```typescript
import { useFonts } from 'expo-font';

export default function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return <RootLayout />;
}
```

### Splash Screen (`expo-splash-screen`)

**Purpose**: Control splash screen timing
**Current Usage**: Hide after font loading

```typescript
import * as SplashScreen from "expo-splash-screen";

// Prevent auto-hide
SplashScreen.preventAutoHideAsync();

// Hide when ready
useEffect(() => {
  if (loaded) {
    SplashScreen.hideAsync();
  }
}, [loaded]);
```

### Deep Linking (`expo-linking`)

**Purpose**: Handle URL routing
**Current Status**: Configured in app.json

```json
{
  "scheme": "kloset",
  "platforms": ["ios", "android", "web"]
}
```

**Usage**:

```typescript
import * as Linking from "expo-linking";

const prefix = Linking.createURL("/");

// Handle URL
const url = await Linking.getInitialURL();
if (url != null) {
  Linking.parse(url); // Generate routing info
}
```

### Status Bar (`expo-status-bar`)

**Purpose**: Style status bar on mobile
**Current Usage**: Automatic via components

```typescript
import { StatusBar } from 'expo-status-bar';

<StatusBar style="auto" />  // Adaptive to theme
```

---

## 3. External Image APIs (Mock Data)

### Unsplash Images

**Status**: Used for mock outfit data
**Purpose**: Free, high-quality fashion images

**URLs Format**:

```
https://images.unsplash.com/photo-[ID]?w=600&auto=format&fit=crop&q=80
```

**Current Images**:

- Wardrobe items (shirts, pants, dresses, etc.)
- Outfit combinations
- Professional styling examples

### Future Integration

- [ ] Search API for outfit suggestions
- [ ] Trending images
- [ ] Attribution handling

---

## 4. Analytics & Monitoring (To Implement)

### Sentry (Error Tracking)

**Purpose**: Capture and track runtime errors
**When to implement**: Before beta release

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Automatic error capture
// Manual capture:
try {
  // code
} catch (error) {
  Sentry.captureException(error);
}
```

### LogRocket (Session Replay)

**Purpose**: Replay user sessions for bug reproduction
**Status**: Planned for beta

### Amplitude (Analytics)

**Purpose**: Track user behavior
**Status**: Planned after MVP

---

## 5. Authentication Providers (Planned)

### Social Authentication

Will implement after Supabase integration:

#### Google Sign-In

```typescript
import * as Google from "expo-auth-session/providers/google";

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

const handleGoogleLogin = async () => {
  const result = await promptAsync();
  if (result?.type === "success") {
    // Exchange token with backend
  }
};
```

#### Apple Sign-In

```typescript
import * as AppleAuthentication from "expo-apple-authentication";

const handleAppleLogin = async () => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
};
```

---

## 6. Payment Services (Future)

### Stripe Integration

**Purpose**: In-app purchases, subscriptions
**Status**: Planned for premium features

```typescript
import { useStripe } from "@stripe/stripe-react-native";

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// Initialize payment sheet
await initPaymentSheet({
  merchantDisplayName: "KLOSET",
  customerId: userId,
  customerEphemeralKeySecret: ephemeralKey,
  paymentIntentClientSecret: clientSecret,
});

// Present sheet
const { error } = await presentPaymentSheet();
```

---

## 7. AI/ML Services (Future)

### Vision API (Google Cloud)

**Purpose**: Image analysis, fashion classification
**Planned for**: Phase 2

```typescript
// Analyze wardrobe item
const response = await visionAPI.analyzeImage({
  image: imageBlob,
  features: ["OBJECT_DETECTION", "COLOR_DETECTION"],
});

// Returns: dominant colors, clothing type, etc.
```

### Custom ML Model

**Purpose**: Outfit recommendations
**Approach**: Supabase + pgvector

```typescript
// Generate embedding
const embedding = await generateEmbedding(outfitImage);

// Find similar outfits
const matches = await supabase.rpc("match_outfits", {
  query_embedding: embedding,
});
```

---

## 8. Notification Services (Future)

### Expo Notifications

**Purpose**: Push notifications
**Status**: Ready for implementation

```typescript
import * as Notifications from "expo-notifications";

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Listen for notifications
Notifications.addNotificationResponseReceivedListener((response) => {
  // Handle notification tap
});

// Send local notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "New Outfit Match Found!",
    body: "Check out your personalized recommendations",
  },
  trigger: { seconds: 60 },
});
```

---

## 9. API Rate Limiting & Quotas

### Supabase Limits

- Free tier: 50,000 monthly active users
- Database: 500MB storage
- File storage: 1GB
- Auth: Unlimited signups

### Image Picker

- Camera: Device dependent
- Gallery: Device dependent
- Compression: 80% quality default

### External APIs

- Unsplash: 50 requests/hour (public)
- Google Vision: 1000 requests/month (paid)

---

## 10. API Response Patterns

### Success Response

```typescript
{
  success: true,
  data: { /* response data */ },
  message: "Operation successful"
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: "AUTH_INVALID_CREDENTIALS",
    message: "Invalid email or password",
    details: { /* additional info */ }
  }
}
```

### Loading State

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await api.getData();
    // Process data
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 11. API Security

### Current Implementation

- Environment variables for secrets
- No API keys in source code
- Supabase handles OAuth flows

### Future Security

- [ ] API rate limiting
- [ ] Request signing
- [ ] Token expiration
- [ ] SSL/TLS only
- [ ] CORS configuration
- [ ] Request validation
- [ ] Response sanitization

---

## 12. Testing APIs

### Mock Data

```typescript
// For testing without real APIs
const MOCK_OUTFITS = [
  { id: "o1", title: "Contemporary Indigo" },
  // ... more mock data
];

export const mockSupabase = {
  from: () => ({
    select: () => ({ data: MOCK_OUTFITS }),
  }),
};
```

### API Mocking

```typescript
// Using MSW or similar
import { http, HttpResponse } from "msw";

const handlers = [
  http.post("/api/wardrobe/items", () => {
    return HttpResponse.json({ success: true });
  }),
];
```

---

## Integration Checklist

### MVP (Current)

- ✅ Image Picker initialized
- ✅ Font loading implemented
- ✅ Splash screen configured
- ⚠️ Supabase initialized (not used)

### Phase 2 (Next)

- [ ] Supabase authentication
- [ ] Database sync
- [ ] File storage
- [ ] Session persistence
- [ ] Error logging (Sentry)

### Phase 3 (Future)

- [ ] Social authentication
- [ ] Payment processing
- [ ] Push notifications
- [ ] Analytics
- [ ] AI/ML features

---

## Debugging APIs

### Log Supabase Calls

```typescript
const { data, error } = await supabase.from("wardrobe_items").select("*");

console.log("Supabase response:", { data, error });
```

### Network Debugging

```typescript
// In development
import { LogBox } from "react-native";

// Monitor API calls
fetch(`${supabaseUrl}/rest/v1/wardrobe_items`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((d) => console.log("API response:", d));
```

---

## Conclusion

KLOSET's service architecture provides:

- **Current**: Basic image handling and app services
- **Ready**: Supabase for login/database/storage
- **Planned**: Social auth, payments, analytics, AI
- **Designed**: For easy integration of additional services

The modular service design allows incremental addition of features without disrupting existing functionality.

---

**Last Updated**: June 2026  
**Service Status**: MVP (Limited integrations)  
**Next Integration**: Supabase backend sync
