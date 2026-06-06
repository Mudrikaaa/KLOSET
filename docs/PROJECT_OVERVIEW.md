# KLOSET - Project Overview

## Executive Summary

**KLOSET** is an AI-powered personal styling application that helps users manage their wardrobe, discover outfit combinations, and receive personalized fashion recommendations based on their unique body type, skin tone, and style preferences.

The application is built as a **cross-platform mobile application** using Expo and React Native, providing seamless experiences on iOS, Android, and Web platforms.

---

## Project Vision

**To democratize personal styling** by providing an intelligent, accessible AI-powered stylist that understands individual body types, skin tones, and style preferences—enabling users to make confident fashion choices and maximize their existing wardrobe.

---

## Key Objectives

1. **Empower Users**: Help users organize, manage, and optimize their existing wardrobe
2. **Personalization**: Deliver outfit recommendations tailored to individual body type, skin tone, and style preference
3. **Cross-Platform**: Provide consistent experience across mobile (iOS/Android) and web platforms
4. **Scalability**: Design architecture to support future features and user growth
5. **User-Centric**: Create intuitive interfaces with smooth navigation and engaging interactions

---

## Core Features

### 1. **User Authentication & Onboarding**
- Email-based login and signup
- Guest login for quick exploration
- Profile personalization during onboarding
- Three key profile attributes:
  - **Body Type**: Petite, Athletic, Curvy, Plus, Tall
  - **Skin Tone**: Fair, Wheatish, Dusky, Deep
  - **Style Preference**: Minimal, Ethnic, Western, Fusion, Streetwear

### 2. **Wardrobe Management**
- Add clothing items via camera or gallery upload
- Organize items by category: Tops, Bottoms, Dresses, Ethnic, Outers, Shoes
- Tag items with custom keywords
- Filter and search by category
- Real-time wardrobe statistics

### 3. **Outfit Discovery & Recommendations**
- Swipe-based card interface for browsing outfit suggestions
- Like/Dislike interaction for personalization
- Occasion-based outfit suggestions
- AI-powered outfit recommendations based on user profile
- Confidence matching scores for suggestions

### 4. **Occasion-Based Styling**
Pre-configured occasions:
- Interview
- Wedding
- Office Party
- Family Function
- Casual Outings

Each occasion provides curated outfit recommendations optimized for the occasion and user profile.

### 5. **User Profile Management**
- View and edit style profile
- Adjust body type, skin tone, and style preferences
- Track wardrobe statistics
- Secure logout

---

## Target Users

- **Primary**: Young professionals (18-45) in urban areas with moderate to high fashion interest
- **Secondary**: Users building wardrobes or seeking style guidance
- **Tertiary**: Fashion-conscious individuals wanting to optimize existing clothing

---

## Key Points for Developers

### Project Structure
```
KLOSET/
├── app/                           # Expo Router pages
│   ├── (tabs)/                   # Tabbed main screens
│   │   ├── index.tsx             # Wardrobe screen
│   │   ├── discover.tsx          # Discover/swipe interface
│   │   ├── outfits.tsx           # Occasion-based outfits
│   │   └── profile.tsx           # User profile
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── onboarding/               # Onboarding flow
│   ├── upload.tsx                # Wardrobe item upload
│   └── _layout.tsx               # Root navigation
├── components/                    # Reusable UI components
├── constants/                     # App constants (Colors, etc.)
├── lib/                          # Services (Supabase)
├── store/                        # Zustand state management
├── types/                        # TypeScript type definitions
├── assets/                       # Images and fonts
└── docs/                         # Documentation

```

### Technology Stack
- **Framework**: Expo v54 (React Native)
- **Language**: TypeScript v5.9
- **State Management**: Zustand v5
- **Backend**: Supabase
- **UI**: React Native components + lucide-react-native icons
- **Routing**: Expo Router v6
- **Storage**: React Native Async Storage
- **Animations**: React Native Reanimated

---

## Development Status

**Current Phase**: MVP (Minimum Viable Product)

**Implemented**:
- ✅ User authentication (demo mode)
- ✅ Onboarding flow
- ✅ Wardrobe management with upload
- ✅ Basic outfit discovery
- ✅ Occasion-based recommendations
- ✅ User profile management
- ✅ Dark/Light theme support

**Planned/In Progress**:
- 🔄 Backend integration with Supabase
- 🔄 Real AI outfit recommendations
- 🔄 Social features (sharing outfits)
- 🔄 Advanced analytics (style insights)
- 🔄 Community features (trends, inspiration)

---

## Architecture Highlights

### Authentication Flow
1. User logs in or signs up
2. Profile data stored in Zustand + Async Storage
3. Navigation guards ensure authenticated state
4. Automatic redirect to onboarding if profile incomplete

### Data Flow
- **State Management**: Zustand with persistence via Async Storage
- **Backend**: Supabase (ready for integration)
- **UI Updates**: React hooks and reactive state

### Navigation Structure
```
Root
├── If Not Authenticated → /auth/login
├── If Authenticated & No Profile → /onboarding
└── If Fully Authenticated
    ├── (tabs)
    │   ├── Wardrobe (index)
    │   ├── Discover
    │   ├── Occasions (outfits)
    │   └── Profile
    ├── /upload (modal)
    ├── /modal (generic modal)
    └── +not-found
```

---

## Constraints & Considerations

### Current Constraints
- **Demo Mode**: Authentication is currently in demo/mock mode
- **Data Persistence**: Uses local Async Storage (not synced with backend)
- **Mock Data**: Outfit recommendations and images are mock data
- **Image Processing**: No server-side image processing yet
- **Offline Mode**: Only works offline with cached data

### Non-Functional Requirements
- **Performance**: Handle 1000+ concurrent users without degradation
- **Scalability**: Architecture supports adding new features and user growth
- **Security**: User data encryption and secure authentication (Supabase)
- **Compatibility**: Works on iOS 12+, Android 8+, and modern web browsers

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase credentials (.env configuration)

### Installation & Running
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on different platforms
npm run ios        # iOS Simulator
npm run android    # Android Emulator
npm run web        # Web browser
```

### Environment Setup
Create `.env.local` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Team & Communication

### Development Workflow
- Feature branches for new features and fixes
- Pull requests for code review
- Meaningful commit messages
- Regular documentation updates
- 80%+ test coverage target

### Key Contact Points
- Documentation is in `/docs`
- Code style guide in `ruleset.md`
- Architecture details in `ARCHITECTURE.md`
- Tech stack specifics in `TECH_STACK.md`

---

## Next Steps for New Developers

1. **Read this overview** ← You are here
2. **Review TECH_STACK.md** - Understand the tools and technologies
3. **Review ARCHITECTURE.md** - Understand the code organization
4. **Review DEVELOPMENT_GUIDE.md** - Setup and development practices
5. **Review UI_UX_GUIDELINES.md** - Design consistency
6. **Explore the codebase** - Start with `app/_layout.tsx` and `store/index.ts`

---

## Document References

- [Tech Stack Documentation](TECH_STACK.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Features & Functionality](FEATURES.md)
- [Database Schema](DATABASE.md)
- [API & Services](API_AND_SERVICES.md)
- [State Management](STATE_MANAGEMENT.md)
- [Navigation Flow](NAVIGATION_FLOW.md)
- [UI/UX Guidelines](UI_UX_GUIDELINES.md)
- [Development Guide](DEVELOPMENT_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [AI Context](AI_CONTEXT.md)

---

**Last Updated**: June 2026  
**Project Status**: MVP - Active Development  
**Version**: 1.0.0
