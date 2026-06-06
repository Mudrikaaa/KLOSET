# KLOSET - Features & Functionality

## Overview

KLOSET is a feature-rich personal styling application. This document details all current features, their functionality, and planned enhancements.

---

## Feature Categories

---

## 1. User Authentication & Authorization

### Current Implementation

#### Login Screen

**Location:** `app/auth/login.tsx`

**Features:**

- Email input field
- Password input field
- Remember me option
- Forgot password link (UI only)
- Guest login button
- Social login buttons (planned)

**Current Behavior:**

- Form validation (email + password required)
- Mock authentication (no Supabase integration yet)
- Demo credentials accepted
- Successful login redirects to onboarding (if new user) or home (if returning)

**Error Handling:**

- Empty field validation
- Error message display
- Try again mechanism

#### Signup Screen

**Location:** `app/auth/signup.tsx`

**Features:**

- Full name input
- Email input
- Password input
- Confirm password field
- Terms & conditions agreement checkbox
- Sign up button
- Link to login screen

**Current Behavior:**

- Validates all required fields
- Password strength indicator (planned)
- Creates new profile in Zustand
- Auto-redirects to onboarding after signup

#### Guest Login Feature

- Quick access without credentials
- Limited functionality
- Can browse discover and outfits
- Cannot save wardrobe items

---

## 2. User Onboarding

### Onboarding Flow

**Location:** `app/onboarding/index.tsx`

**Three-Step Process:**

#### Step 1: Body Type Selection

- 5 options: Petite, Athletic, Curvy, Plus, Tall
- Custom illustrations for each type
- Selected state with checkmark
- Stores choice but not final until completion

#### Step 2: Skin Tone Selection

- 4 options: Fair, Wheatish, Dusky, Deep
- Visual color swatches
- Selected checkmark indicator
- Medium validation only

#### Step 3: Style Preference Selection

- 5 options: Minimal, Ethnic, Western, Fusion, Streetwear
- Visual style descriptions
- Multiple selection possible (planned)
- Required before completion

**Completion Action:**

- Calls `saveProfile()` in Zustand
- Sets `hasSeenOnboarding = true`
- Persists to Async Storage
- Navigation guard redirects to main app

**Skip/Back:**

- Can go back within flow
- Cannot skip without completing
- Saves progress in local form state

---

## 3. Wardrobe Management

### Wardrobe Screen

**Location:** `app/(tabs)/index.tsx`

#### Statistics Dashboard

Displays:

- **Total Items**: Count of all wardrobe pieces
- **Categories**: Number of distinct categories
- **Wardrobe Fit**: Percentage rating (currently hardcoded at 85%)

#### Category Filtering

- **All** - Shows all items
- **Tops** - T-shirts, shirts, blouses
- **Bottoms** - Pants, skirts, leggings
- **Dresses** - All dress types
- **Ethnic** - Traditional/ethnic wear
- **Outers** - Jackets, blazers, cardigans
- **Shoes** - All footwear

**UI:** Horizontal scroll chip buttons

#### Grid Display

- 2-column responsive grid
- Item images with rounded corners
- Item metadata on hover (planned)
- Tap to view details (planned)
- Long-press to delete (planned)

#### Controls

- **Grid View Toggle** - Switch between grid/list (planned)
- **Sort/Filter Options** - By date, color, category (planned)
- **Add Item Button** - Floating action button to upload

### Upload Modal

**Location:** `app/upload.tsx`

#### Image Selection

- **Camera Option** - Take photo with device camera
- **Gallery Option** - Pick from device photo library
- **Image Editor** - Crop to square 1:1 ratio
- **Compression** - Automatic JPEG compression (quality 0.8)

**Permissions:**

- Requests camera permission if using camera
- Requests photo library permission
- Error handling if permission denied

#### Item Classification

- **Category Dropdown** - Tops, Bottoms, Dresses, Ethnic, Outers, Shoes
- **Color Picker** - 10 predefined colors
- **Style Selection** - Minimal, Ethnic, Western, Fusion, Streetwear
- **Custom Tags** - Comma-separated keywords (e.g., "summer, casual, linen")

#### Submission

- Validates image is selected
- Creates WardrobeItem object
- Saves to Zustand store
- Persists to Async Storage
- Returns to wardrobe screen

**Data Stored:**

```typescript
{
  id: "item_abc123",
  userId: "user_xyz",
  imageUrl: "file:///app/cache/image.jpg",
  category: "Tops",
  color: "White",
  style: "Western",
  tags: ["summer", "linen", "casual"],
  createdAt: "2026-06-06T10:30:00Z"
}
```

---

## 4. Outfit Discovery & Recommendations

### Discover Screen

**Location:** `app/(tabs)/discover.tsx`

#### Swipe Card Interface

- **Card Design**: Full-screen outfit image card
- **Gesture Support**: Swipe left (dislike) / right (like)
- **Buttons**:
  - ❌ Dislike button
  - ❤️ Like button
  - 🔄 Refresh button
  - ℹ️ Info button (shows explanation)

#### Outfit Information Displayed

- Outfit title
- Style classification
- Occasion tags
- Recommended for body types
- Recommended for skin tones
- Explanation text

#### Like/Dislike Tracking

- Counts displayed at top
- Updates Zustand state
- Moves to next outfit
- Triggers AI recommendation refinement (planned)

#### Mock Outfit Data

Currently includes 3 outfits:

1. **Contemporary Indigo Fusion**
   - Type: Fusion Wear
   - Image: Block print kurta + denim
   - Occasions: Office Party, Casual

2. **Sleek Corporate Power Suit**
   - Type: Western Formal
   - Image: Grey blazer + trousers
   - Occasions: Interview, Office

3. **Royal Ivory Sherwani Set**
   - Type: Indian Traditional
   - Image: Silk sherwani with gold accents
   - Occasions: Wedding, Family Function

#### Future Intelligence

- ML model analyzes user likes/dislikes
- Adapts recommendations based on:
  - User body type
  - User skin tone
  - Style preferences
  - Weather/season
  - Occasion context
- Vector embeddings for outfit similarity

---

## 5. Occasion-Based Outfit Suggestions

### Occasions Screen

**Location:** `app/(tabs)/outfits.tsx`

#### Pre-configured Occasions

1. **Interview** 🎯
   - Avatar: Briefcase icon
   - Color: Indigo (#6366F1)
   - Example: Formal navy shirt + chinos

2. **Wedding** ⭐
   - Avatar: Stars icon
   - Color: Amber (#F59E0B)
   - Example: Handloom sherwani

3. **Office Party** ✨
   - Avatar: Sparkles icon
   - Color: Pink (#EC4899)
   - Example: Smart-casual blazer + shirt

4. **Family Function** 💕
   - Avatar: Heart icon
   - Color: Emerald (#10B981)
   - Example: Traditional ethnic wear

5. **Casual** ☕
   - Avatar: Coffee icon
   - Color: Blue (#3B82F6)
   - Example: Jeans + casual top

#### UI Layout

- Horizontal occasion button grid (scrollable)
- Selected occasion highlighted
- Below: Matching outfits carousel
- Each outfit shows:
  - Title
  - Confidence score (e.g., "95% Match")
  - Brief description
  - Item breakdown (clickable)

#### Matching Algorithm (Future)

```
For each occasion:
├── Filter outfits by occasion tag
├── Score based on body type match
├── Score based on skin tone match
├── Score based on style preference
├── Sort by total score
└── Display top matches
```

#### Current Implementation

- Mock data for each occasion
- Static hardcoded matches
- Confidence scores predetermined

---

## 6. User Profile Management

### Profile Screen

**Location:** `app/(tabs)/profile.tsx`

#### Profile Header

- **Avatar**: Circular placeholder with user icon
- **Name**: Display user's name (from Zustand)
- **Email**: Display registered email

#### Style Personalization Section

**Body Type Editor:**

- Displays current selection
- List of 5 body types
- Tap to change selection
- Immediately saves to store
- Checkmark indicates selection

**Skin Tone Editor:**

- Similar interface to body type
- 4 color swatches for each tone
- Tap to change
- Auto-saves

**Style Preference Editor:**

- 5 style options
- Tap to change
- Auto-saves to store

#### Settings & Actions

- **Update Profile** (planned)
- **Settings** (planned)
- **Help & Support** (planned)
- **Logout Button** - Red danger button
  - Clears all user data
  - Resets store to initial state
  - Redirects to login screen
  - Keeps app data for guest mode

---

## 7. Dark Mode / Theme System

### Implementation

- **System Detection**: Automatically detects device theme preference
- **Manual Override**: Toggle in settings (planned)
- **Persistence**: Saves preference to Async Storage

### Light Theme

```
Background: #F8FAFC (Slate 50) - Soft white
Text: #0F172A (Slate 900) - Dark text
Card: #FFFFFF - Pure white
Border: #E2E8F0 (Slate 200) - Light gray
Tint: #6366F1 (Indigo) - Primary color
Accent: #EC4899 (Pink) - Secondary
TabIcon Default: #94A3B8 (Slate 400)
TabIcon Selected: #6366F1 (Indigo)
```

### Dark Theme

```
Background: #0F172A (Slate 900) - Dark background
Text: #F8FAFC (Slate 50) - Light text
Card: #1E293B (Slate 800) - Dark card
Border: #334155 (Slate 700) - Dark border
Tint: #818CF8 (Pastel Indigo) - Lighter tint
Accent: #F472B6 (Pastel Pink) - Lighter accent
TabIcon Default: #64748B (Slate 600)
TabIcon Selected: #818CF8 (Pastel Indigo)
```

### Component-Level Theming

- All screens use `useColorScheme()` hook
- Theme colors from `constants/Colors.ts`
- Themed View and Text components
- Automatic re-render on theme change

---

## 8. Navigation & Tab System

### Main Tab Navigation

**Location:** `app/(tabs)/_layout.tsx`

#### Tab Bars

- **iOS**: 5 point safe area + tab bar
- **Android**: No safe area, standard tab bar
- Platform-specific styling

#### Four Main Tabs

1. **Wardrobe** 👕 - Browse items
2. **Discover** ✨ - Swipe outfits
3. **Occasions** 📁 - Situation-based outfits
4. **Profile** 👤 - User settings

#### Tab Customization

- Active tint color: Theme primary
- Inactive tint color: Muted gray
- Label font weight: 600 (bold)
- Header styling with border

---

## 9. Image Handling & Caching

### Image Sources

- **Device Camera**: Real-time capture
- **Photo Gallery**: Existing photos from device
- **URLs**: Unsplash images for mock outfits
- **Local Storage**: Cached wardrobe images

### Image Processing

- **Format**: Automatic JPEG conversion
- **Quality**: 80% compression
- **Aspect Ratio**: 1:1 square for wardrobe items
- **Size**: Mobile-optimized dimensions

### Caching Strategy

- React Native Image handles local caching
- Unsplash images cached by default
- No manual cache management needed

---

## 10. Persistence & Local Storage

### Async Storage Usage

- **Key**: `'kloset-app-storage'`
- **Data Persisted**:
  - `isAuthenticated` - Boolean
  - `profile` - UserStyleProfile object
  - `hasSeenOnboarding` - Boolean
  - `wardrobeItems` - Array of WardrobeItems

**Serialization**: JSON stringify/parse

**Auto-Restore**: On app startup via Zustand middleware

### Data Lifetime

- **Survives**: App restart, phone lock/unlock
- **Clears**:
  - User logout (manual signOut action)
  - Manual app data clear
  - User uninstalls app

---

## Planned Features (Next Phases)

### Phase 2: Backend Integration

- [ ] Real Supabase authentication
- [ ] Cloud image storage
- [ ] Persistent user preferences
- [ ] Multi-device sync

### Phase 3: AI Enhancement

- [ ] Real ML outfit recommendations
- [ ] Outfit generation from wardrobe
- [ ] Color coordination intelligence
- [ ] Seasonal recommendations

### Phase 4: Social Features

- [ ] Share outfits with friends
- [ ] Follow other users
- [ ] Community outfit library
- [ ] Social feedback on outfits

### Phase 5: Analytics & Insights

- [ ] Wardrobe analytics dashboard
- [ ] Most-worn items tracking
- [ ] Style evolution tracking
- [ ] Clothing cost analysis

### Phase 6: Advanced Features

- [ ] AR try-on (Snapchat/Instagram style)
- [ ] Shopping integration
- [ ] Brand recommendations
- [ ] Fabric care guide

---

## Feature Dependencies

```
Authentication
├── Onboarding
├── Wardrobe Management
│   └── Discover (uses wardrobe items)
├── Profile Management
└── All Tabs
    ├── Wardrobe Tab
    ├── Discover Tab
    ├── Occasions Tab
    └── Profile Tab

Backend (Future)
├── Real Authentication
├── Cloud Sync
├── AI Recommendations
└── Social Features
```

---

## Performance Metrics

### Current Performance Targets

- **App Launch**: < 3 seconds
- **Tab Switch**: 60 FPS animations
- **Image Load**: < 1 second per image
- **Store Updates**: < 100ms
- **Async Storage Save**: < 500ms

### Monitoring (To Implement)

- Launch time tracking
- Screen render times
- API response times
- Image load times
- Store update latency

---

## Accessibility Features (Planned)

- [ ] VoiceOver/TalkBack support
- [ ] High contrast mode
- [ ] Larger text option
- [ ] Touch target sizing (48x48pt minimum)
- [ ] Color-blind friendly palette
- [ ] Haptic feedback

---

## Internationalization (i18n) - Planned

**Languages to support:**

- English (en)
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)

**Implementation:**

- i18n-js or native Expo i18n
- Translated strings in `/locales`
- Dynamic language switching

---

## Feature Flags (For Testing)

```typescript
// Would allow toggling features in development
const FEATURES = {
  showMockData: true,
  enableAI: false,
  enableSocial: false,
  enableAnalytics: false,
  debugMode: false,
};
```

---

## Conclusion

KLOSET currently focuses on core wardrobe and outfit discovery features. The MVP provides a solid foundation with:

- ✅ User authentication (demo)
- ✅ Profile personalization
- ✅ Wardrobe management
- ✅ Basic recommendations
- ✅ Cross-platform support

Future phases will add AI intelligence, social features, and advanced analytics to create a comprehensive personal styling platform.

---

**Last Updated**: June 2026  
**MVP Status**: Feature Complete  
**Next Review**: August 2026
