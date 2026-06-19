# KLOSET - Database Schema & Structure

## Overview

KLOSET uses a hybrid data persistence model:

- **Local Storage**: React Native Async Storage for immediate data
- **Backend**: Supabase (PostgreSQL + Vector DB) for cloud sync and AI features

This document describes the logical data model and implementation details.

---

## Current Data Storage Architecture

```
┌─────────────────────────────┐
│   React Native App          │
│                             │
│  ┌──────────────────────┐   │
│  │  Zustand Store       │   │
│  │  (in-memory state)   │   │
│  └──────────────────────┘   │
│           ↕                 │
│  ┌──────────────────────┐   │
│  │  Async Storage       │   │
│  │  (JSON persistence)  │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
          ↓ (future)
   ┌──────────────────┐
   │  Supabase        │
   │  (Cloud DB)      │
   └──────────────────┘
```

---

## Current Data Model (In-Memory & Local Storage)

### Service Status

- **Phase**: MVP (Mock/Demo mode)
- **Persistence**: Async Storage only
- **Backend**: Initialized but not connected
- **Sync**: None (local only)

### Async Storage Format

**Storage Key**: `'kloset-app-storage'`

**Stored Value** (JSON):

```json
{
  "isAuthenticated": boolean,
  "profile": UserStyleProfile | null,
  "hasSeenOnboarding": boolean,
  "wardrobeItems": WardrobeItem[]
}
```

---

## Core Data Types

### 1. User Authentication

```typescript
// Not persisted; only in-memory during session
interface AuthSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// In Zustand
{
  isAuthenticated: boolean; // true if logged in
  profile: UserStyleProfile; // null if not authenticated
  hasSeenOnboarding: boolean; // true if profile complete
}
```

**Storage**:

- `isAuthenticated`: Persisted to Async Storage
- Tokens: Not persisted (session only)
- Supabase handles refresh automatically

---

### 2. User Profile (`UserStyleProfile`)

```typescript
interface UserStyleProfile {
  id: string; // Unique user identifier
  name: string; // User's display name
  email: string; // Registered email
  height: Height; // 'Petite' | 'Average' | 'Tall'
  bodyShape: BodyShape; // 'Hourglass' | 'Pear' | 'Apple' | ...
  skinTone: SkinTone; // 'Fair' | 'Wheatish' | ...
  undertone: Undertone; // 'Warm' | 'Cool' | 'Neutral'
  stylePreference: StylePreference; // 'Minimal' | 'Ethnic' | ...
  coveragePreference: CoveragePreference; // 'Modest' | 'Moderate' | 'Open'
  occasionFrequency: OccasionFrequency; // 'Mostly Casual' | ...
  colorComfort: ColorComfort; // 'Neutrals Only' | ...
}
```

**Data Types:**

```typescript
type Height = 'Petite' | 'Average' | 'Tall';
type BodyShape = 'Hourglass' | 'Pear' | 'Apple' | 'Rectangle' | 'Inverted Triangle';
type SkinTone = 'Fair' | 'Wheatish' | 'Dusky' | 'Deep';
type Undertone = 'Warm' | 'Cool' | 'Neutral';
type StylePreference = 'Minimal' | 'Ethnic' | 'Western' | 'Fusion' | 'Streetwear';
type CoveragePreference = 'Modest' | 'Moderate' | 'Open';
type OccasionFrequency = 'Mostly Casual' | 'Mix of Everything' | 'Lots of Functions and Events' | 'Professional Environment Daily';
type ColorComfort = 'Neutrals Only' | 'Some Color' | 'Bold and Colorful';
```

**Storage**:

- Persisted to Async Storage
- Updated via `saveProfile()` action
- One profile per user

**Example**:

```json
{
  "id": "user_a1b2c3d4",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "height": "Average",
  "bodyShape": "Hourglass",
  "skinTone": "Wheatish",
  "undertone": "Neutral",
  "stylePreference": "Fusion",
  "coveragePreference": "Moderate",
  "occasionFrequency": "Mix of Everything",
  "colorComfort": "Some Color"
}
```

---

### 3. Wardrobe Item (`WardrobeItem`)

```typescript
interface WardrobeItem {
  id: string; // Unique item identifier
  userId: string; // Owner of the item
  imageUrl: string; // File URI or cloud URL
  category: Category; // Type of clothing
  color: Color; // Selected from 28-color list
  style: StylePreference; // Style classification
  tags: string[]; // Custom keywords
  createdAt: string; // ISO timestamp
  fit: Fit;
  fabric: Fabric;
  length: Length;
  pattern: Pattern;
  neckline: Neckline;
  sleeve: Sleeve;
  season: Season;
  occasions: string[]; // List of suitable Indian-specific occasions
}

type Category = "Tops" | "Bottoms" | "Dresses" | "Ethnic" | "Outers" | "Shoes";
```

**Storage**:

- Persisted to Async Storage
- Array stored in `wardrobeItems`
- Automatically synced to Supabase (future)
- Image stored as local file URI (MVP) or cloud URL (future)

**Example**:

```json
{
  "id": "item_x9y8z7w6",
  "userId": "user_a1b2c3d4",
  "imageUrl": "file:///cache/IMG_1234.jpg",
  "category": "Tops",
  "color": "White",
  "style": "Western",
  "tags": ["summer", "linen", "office"],
  "createdAt": "2026-06-06T10:30:00Z",
  "fit": "Regular",
  "fabric": "Linen",
  "length": "Short",
  "pattern": "Solid",
  "neckline": "Collar",
  "sleeve": "Half",
  "season": "Summer",
  "occasions": ["Casual Outing", "Brunch / Cafe"]
}
```

**Constraints**:

- One image per item
- Single color classification from 28 expanded colors
- Multiple tags allowed
- At least one tag required

---

### 4. Outfit Recommendation (`Outfit`)

```typescript
interface Outfit {
  id: string; // Unique outfit ID
  title: string; // Outfit name
  imageUrl: string; // URL to composite/styled image
  occasions: string[]; // Indian-specific occasions
  style: string; // Style category
  heights: Height[]; // Recommended heights
  bodyShapes: BodyShape[]; // Recommended body shapes
  skinTones: SkinTone[]; // Recommended skin tones
  undertones?: Undertone[]; // Recommended skin undertones
  description: string; // Short description
  explanation?: string; // Why it matches user
  formality: Formality; // 'Casual' | 'Smart Casual' | ...
  coverage: Coverage; // 'Minimal' | 'Moderate' | ...
  season: Season; // 'Summer' | 'Winter' | ...
  colorPalette: string[]; // Dominant colors in the outfit
}
```

**Storage**:

- Not persisted (server-side generation)
- Generated by ML model (future)
- Currently hardcoded mock data

**Example**:

```json
{
  "id": "outfit_m1",
  "title": "Contemporary Indigo Fusion",
  "imageUrl": "https://images.unsplash.com/...",
  "occasions": ["Diwali Party (Friends)", "Casual Outing"],
  "style": "Fusion",
  "heights": ["Average", "Tall"],
  "bodyShapes": ["Hourglass", "Pear"],
  "skinTones": ["Wheatish", "Dusky"],
  "description": "Blend of traditional and modern styling",
  "explanation": "Perfect for curves and medium skin tones",
  "formality": "Smart Casual",
  "coverage": "Moderate",
  "season": "All-season",
  "colorPalette": ["Indigo", "Blue", "White"]
}
```

---

### 5. User Interaction (`Swipe`)

```typescript
interface Swipe {
  id: string; // Unique event ID
  userId: string; // User who swiped
  outfitId: string; // Outfit being rated
  direction: "like" | "dislike"; // User preference
  createdAt: string; // ISO timestamp
}
```

**Storage**:

- Not currently persisted
- Future: Store in Supabase for ML training
- Sent to backend for recommendation refinement

**Example**:

```json
{
  "id": "swipe_s1",
  "userId": "user_a1b2c3d4",
  "outfitId": "outfit_m1",
  "direction": "like",
  "createdAt": "2026-06-06T11:15:00Z"
}
```

---

## Future Supabase Schema

### When Backend is Implemented

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  authenticated_at TIMESTAMP
);
```

#### User Profiles Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  height TEXT CHECK (height IN ('Petite', 'Average', 'Tall')),
  body_shape TEXT CHECK (body_shape IN ('Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle')),
  skin_tone TEXT CHECK (skin_tone IN ('Fair', 'Wheatish', 'Dusky', 'Deep')),
  undertone TEXT CHECK (undertone IN ('Warm', 'Cool', 'Neutral')),
  style_preference TEXT CHECK (style_preference IN ('Minimal', 'Ethnic', 'Western', 'Fusion', 'Streetwear')),
  coverage_preference TEXT CHECK (coverage_preference IN ('Modest', 'Moderate', 'Open')),
  occasion_frequency TEXT CHECK (occasion_frequency IN ('Mostly Casual', 'Mix of Everything', 'Lots of Functions and Events', 'Professional Environment Daily')),
  color_comfort TEXT CHECK (color_comfort IN ('Neutrals Only', 'Some Color', 'Bold and Colorful')),
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

#### Wardrobe Items Table

```sql
CREATE TABLE wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tops', 'Bottoms', 'Dresses', 'Ethnic', 'Outers', 'Shoes')),
  color TEXT NOT NULL,
  style TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  fit TEXT CHECK (fit IN ('Oversized', 'Relaxed', 'Regular', 'Slim', 'Fitted', 'Boxy')),
  fabric TEXT CHECK (fabric IN ('Cotton', 'Silk', 'Chiffon', 'Denim', 'Linen', 'Georgette', 'Velvet', 'Polyester', 'Knit', 'Other')),
  length TEXT CHECK (length IN ('Crop', 'Short', 'Knee-length', 'Midi', 'Maxi', 'Full', 'Not Applicable')),
  pattern TEXT CHECK (pattern IN ('Solid', 'Stripes', 'Floral', 'Geometric', 'Checks', 'Embroidered', 'Printed', 'Abstract')),
  neckline TEXT CHECK (neckline IN ('Round', 'V-neck', 'Boat', 'Collar', 'Off-shoulder', 'Halter', 'High-neck', 'Not Applicable')),
  sleeve TEXT CHECK (sleeve IN ('Sleeveless', 'Half', '3/4', 'Full', 'Not Applicable')),
  season TEXT CHECK (season IN ('Summer', 'Winter', 'Monsoon', 'All-season')),
  occasions TEXT[] NOT NULL,
  wear_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_wardrobe_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_category ON wardrobe_items(category);
```

#### Outfits Table

```sql
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  occasions TEXT[] NOT NULL,
  style TEXT NOT NULL,
  heights TEXT[] NOT NULL,
  body_shapes TEXT[] NOT NULL,
  skin_tones TEXT[] NOT NULL,
  undertones TEXT[],
  formality TEXT CHECK (formality IN ('Casual', 'Smart Casual', 'Semi-formal', 'Formal', 'Festive', 'Party')),
  coverage TEXT CHECK (coverage IN ('Minimal', 'Moderate', 'Conservative')),
  season TEXT CHECK (season IN ('Summer', 'Winter', 'Monsoon', 'All-season')),
  color_palette TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outfits_occasions ON outfits(occasions);
```

#### User Interactions Table

```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  outfit_id UUID NOT NULL REFERENCES outfits(id),
  direction TEXT NOT NULL CHECK (direction IN ('like', 'dislike')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_swipes_user_outfit ON swipes(user_id, outfit_id);
```

#### Outfit Embeddings (for AI)

```sql
CREATE TABLE outfit_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES outfits(id),
  embedding VECTOR(384),  -- pgvector extension
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outfit_embedding ON outfit_embeddings USING ivfflat (embedding vector_cosine_ops);
```

---

## Current Default Data

### Initial App State

```typescript
const DEFAULT_WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: "1",
    userId: "user_1",
    category: "Tops",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c...",
    color: "White",
    style: "Western",
    tags: ["shirt", "summer", "linen"],
    createdAt: new Date().toISOString(),
  },
  // ... (5 more default items)
];
```

**Used For:**

- Demo data for guests
- Default wardrobe for testing
- Visually represents app functionality

---

## Data Access & Mutations

### Zustand Store Actions

#### Authentication

```typescript
login(email: string, name?: string) → void
signup(email: string, name: string) → void
signOut() → void
```

#### Profile Management

```typescript
saveProfile(profileData: ProfileUpdate) → void
```

#### Wardrobe Management

```typescript
addWardrobeItem(item: ItemInput) → void
removeWardrobeItem(itemId: string) → void (planned)
updateWardrobeItem(itemId: string, update: ItemUpdate) → void (planned)
```

#### Persistence

```typescript
// Automatic via middleware
// No manual calls needed
```

---

## Data Flow Visualization

### Adding a Wardrobe Item

```
User selects image
    ↓
Image Picker captures/selects
    ↓
User fills category, color, tags
    ↓
addWardrobeItem() called
    ↓
Create WardrobeItem object
    ↓
Zustand updates wardrobeItems array
    ↓
Middleware serializes to JSON
    ↓
Async Storage persists
    ↓
UI re-renders with new item
```

### Saving User Profile

```
User selects body type, skin tone, style
    ↓
saveProfile() called with new values
    ↓
Zustand updates profile object
    ↓
Set hasSeenOnboarding = true
    ↓
Middleware persists to Async Storage
    ↓
Navigation guard re-evaluates
    ↓
Redirect to home screen
```

---

## Data Privacy & Security

### Current Privacy Measures

- ✅ All data stored locally (no cloud)
- ✅ No API calls expose user data
- ⚠️ No encryption (local storage is unencrypted)

### Future Security

- [ ] Supabase Row-Level Security (RLS)
- [ ] End-to-end encryption for sensitive data
- [ ] Image encryption before cloud storage
- [ ] API rate limiting
- [ ] User consent for data collection

### Compliance

- GDPR ready (future with cloud backend)
- User data deletion on account deletion
- No third-party data sharing
- Transparent data handling

---

## Data Migration & Versioning

### Current Version

- **Version**: 1.0
- **Format**: JSON (Async Storage)
- **Encoding**: UTF-8

### Future Migrations

When moving from local to cloud:

1. Backup local Async Storage
2. Export JSON
3. Validate data integrity
4. Upload to Supabase
5. Verify sync completeness
6. Clear local storage

**Versioning Strategy:**

- Semantic versioning (1.0.0)
- Migration scripts for schema changes
- Backward compatibility maintained

---

## Performance Considerations

### Data Limits (Current)

- **Max wardrobe items**: 10,000 (limited by device storage)
- **Max profile size**: ~1KB
- **Estimated storage**: ~100MB for 1000 items with images

### Optimization Strategies

- Lazy load images
- Paginate wardrobe display
- Compress images on upload
- Archive old items (planned)

### Query Performance (Future)

```sql
-- Index strategy for fast queries
CREATE INDEX idx_user_items ON wardrobe_items(user_id, category);
CREATE INDEX idx_outfit_match ON outfits(body_types, skin_tones);
```

---

## Backup & Recovery

### Current Backup

- Automatic via Async Storage
- Backed up with app state
- User can export data (planned)

### Future Backup

- Daily Supabase backups
- User-initiated backups
- Point-in-time recovery
- Data export to CSV/JSON

---

## Data Retention Policy

### Current App

- Persists indefinitely until user logs out
- No automatic cleanup
- User can delete items manually

### Future Policy

- Keep all data (unless user deletes)
- Archive old outfits after 1 year
- Delete swipe data after 6 months
- Retain profile indefinitely

---

## Debugging & Inspection

### Inspect Local Data

```javascript
// In app console
import AsyncStorage from "@react-native-async-storage/async-storage";
const data = await AsyncStorage.getItem("kloset-app-storage");
console.log(JSON.parse(data));
```

### Export Data (Future)

```bash
# Via API endpoint
GET /api/user/export
# Returns JSON file for download
```

---

## Conclusion

KLOSET's current data model is optimized for MVP development:

- Simple, flat structures
- Local-first approach
- Easy to test and debug
- Ready to migrate to cloud backend

As the app scales, Supabase integration will provide:

- Cloud persistence
- Real-time sync
- AI/ML capabilities
- Advanced analytics

---

**Last Updated**: June 2026  
**Schema Version**: 1.0  
**Backend Status**: Ready for integration
