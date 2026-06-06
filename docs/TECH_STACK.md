# KLOSET - Technology Stack

## Overview

KLOSET uses a modern, full-stack TypeScript development approach leveraging React Native via Expo for cross-platform compatibility. This document details all technologies, libraries, and tools used in the project.

---

## Core Framework & Runtime

| Technology | Version | Purpose |
|---|---|---|
| **Expo** | ~54.0.35 | Cross-platform mobile/web framework for React Native |
| **React Native** | 0.81.5 | JavaScript framework for building native apps |
| **React** | 19.1.0 | UI library for component-based development |
| **TypeScript** | ~5.9.2 | Typed JavaScript superset for better code quality |
| **Node.js** | 18+ | JavaScript runtime environment |

---

## Frontend & UI Libraries

### Core UI Components
| Package | Version | Purpose |
|---|---|---|
| **react-native** | 0.81.5 | Native UI components |
| **react-native-web** | ~0.21.0 | React Native components for web |
| **react-dom** | 19.1.0 | React rendering for web |

### Navigation & Routing
| Package | Version | Purpose |
|---|---|---|
| **expo-router** | ~6.0.24 | File-based routing for Expo (like Next.js for mobile) |
| **react-native-screens** | ~4.16.0 | Native screen handling |
| **react-native-safe-area-context** | ~5.6.0 | Safe area handling for notches |

### Animation & Graphics
| Package | Version | Purpose |
|---|---|---|
| **react-native-reanimated** | ~4.1.1 | High-performance animations |
| **react-native-worklets** | 0.5.1 | GPU-accelerated worklets |
| **react-native-svg** | 15.12.1 | SVG rendering components |
| **lucide-react-native** | ^1.17.0 | Icon library with 300+ icons |

### Image & Media Handling
| Package | Version | Purpose |
|---|---|---|
| **expo-image-picker** | ~17.0.11 | Camera and gallery access |

---

## State Management

| Package | Version | Purpose |
|---|---|---|
| **zustand** | ^5.0.14 | Lightweight state management |
| **@react-native-async-storage/async-storage** | 2.2.0 | Persistent local storage |

**Why Zustand?**
- Minimal boilerplate
- TypeScript support
- Middleware support (persistence)
- No provider hell
- Easy debugging

---

## Backend & APIs

| Package | Version | Purpose |
|---|---|---|
| **@supabase/supabase-js** | ^2.107.0 | Supabase client (Firebase alternative) |
| **react-native-url-polyfill** | ^3.0.0 | URL polyfill for React Native |

**Supabase Features Used:**
- Authentication (email/password)
- Real-time database (PostgreSQL)
- Vector embeddings for AI recommendations
- File storage for wardrobe images

---

## Build & Development Tools

### Bundler & Compiler
| Package | Version | Purpose |
|---|---|---|
| **expo** | ~54.0.35 | Metro bundler (built-in with Expo) |
| **TypeScript** | ~5.9.2 | Type checking during build |

### Code Quality
| Package | Version | Purpose |
|---|---|---|
| **ESLint** | (optional) | Code linting and style checking |
| **Prettier** | (optional) | Code formatting |

---

## Platform-Specific Assets

| Package | Version | Purpose |
|---|---|---|
| **expo-font** | ~14.0.12 | Custom font loading |
| **expo-splash-screen** | ~31.0.13 | Splash screen management |
| **expo-status-bar** | ~3.0.9 | Status bar styling |
| **expo-symbols** | ~1.0.8 | Native symbol rendering |
| **expo-constants** | ~18.0.13 | Device/app constants |
| **expo-linking** | ~8.0.12 | Deep linking support |
| **expo-web-browser** | ~15.0.11 | In-app browser |

---

## Configuration & Environment

### Expo Configuration Files
- **app.json** - Expo app configuration (name, version, icons, etc.)
- **expo-env.d.ts** - Expo environment type definitions
- **.env.local** - Environment variables

### TypeScript Configuration
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Path Alias**: `@/` refers to project root for clean imports

---

## Styling System

### Color Theme System
- **Light Theme**: Slate-based colors with Indigo tint
- **Dark Theme**: Dark slate with pastel indigo
- **Implementation**: `constants/Colors.ts` with theme context

### Color Palette
```typescript
Light Theme:
- Primary Text: #0F172A (Slate 900)
- Background: #F8FAFC (Slate 50)
- Tint: #6366F1 (Indigo)
- Accent: #EC4899 (Pink)

Dark Theme:
- Primary Text: #F8FAFC (Slate 50)
- Background: #0F172A (Slate 900)
- Tint: #818CF8 (Pastel Indigo)
- Accent: #F472B6 (Pastel Pink)
```

### Styling Approach
- React Native StyleSheet
- Inline theme-aware styles
- No CSS-in-JS libraries (not needed for React Native)
- Platform-specific styles via `Platform` module

---

## Development Workflow

### Package Manager
- **npm** (included with Node.js)
- **npm workspaces** ready (nested my-project/ structure)

### Scripts Available
```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

### Hot Reloading
- Fast Refresh enabled by default
- Changes reflect immediately in app
- Preserves state when possible

---

## Testing Frameworks (Ready to Implement)

| Package | Purpose | Status |
|---|---|---|
| **Jest** | Unit testing | Not yet configured |
| **React Testing Library** | Component testing | Not yet configured |
| **Detox** | E2E testing | Not yet configured |

---

## Deployment & Distribution

### Mobile Distribution
- **iOS**: TestFlight or App Store (requires Apple Developer account)
- **Android**: Google Play Store or APK direct distribution
- **Expo EAS**: Managed build service via Expo

### Web Distribution
- **Static export**: `expo export:web` generates static HTML/CSS/JS
- **Hosting**: Vercel, Netlify, AWS S3, etc.

### Monitoring & Analytics (To be configured)
- Sentry for error tracking
- LogRocket for session replay
- Amplitude for analytics

---

## Type Definitions

All types are centralized in `types/index.ts`:

```typescript
export type BodyType = 'Petite' | 'Athletic' | 'Curvy' | 'Plus' | 'Tall';
export type SkinTone = 'Fair' | 'Wheatish' | 'Dusky' | 'Deep';
export type StylePreference = 'Minimal' | 'Ethnic' | 'Western' | 'Fusion' | 'Streetwear';
export type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Ethnic' | 'Outers' | 'Shoes';

export interface UserStyleProfile { ... }
export interface WardrobeItem { ... }
export interface Outfit { ... }
export interface Swipe { ... }
```

---

## Browser Compatibility

### Web Platform Support
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Mobile Platform Support
- **iOS**: iOS 12.4+
- **Android**: Android 8.1+

---

## Performance Considerations

### Optimization Strategies
1. **Code Splitting**: Expo Router handles automatic code splitting
2. **Image Optimization**: `expo-image-picker` handles compression
3. **State Management**: Zustand is minimal and performant
4. **Async Storage**: Used for fast local persistence
5. **Lazy Loading**: Components loaded as needed via router

### Performance Targets
- App startup: < 3 seconds
- Screen transitions: 60 FPS
- Image load: < 1 second
- Database queries: < 500ms

---

## Security Considerations

### Built-in Security Features
1. **TypeScript**: Catches many common bugs
2. **Supabase**: Row-level security (RLS)
3. **Environment Variables**: Sensitive data never hardcoded
4. **URL Polyfill**: Safe URL parsing

### Security Best Practices
- Never commit `.env.local` files
- Use environment-specific keys
- Implement proper error handling
- Validate user input on frontend & backend
- Use HTTPS in production

---

## Version Management

### Current Versions (June 2026)
- React: 19.1.0 (Latest stable)
- React Native: 0.81.5 (Expo compatible)
- Expo: ~54.0.35 (Latest)
- TypeScript: ~5.9.2 (Latest)

### Upgrade Strategy
- Monthly dependency updates
- Quarterly major version upgrades
- Test coverage before upgrades
- Use `npm audit` for security updates

---

## Development Environment Setup

### Required Tools
```bash
# Node.js 18+
node --version

# Expo CLI (global)
npm install -g expo-cli

# Generate Expo development certificate
eas credentials

# For iOS development (macOS only)
# Xcode Command Line Tools required

# For Android development
# Android Studio & Android SDK required
```

---

## Alternative Technologies Considered

| Alternative | Why Not Used |
|---|---|
| Redux | Overkill for app scale; Zustand is simpler |
| MobX | Less TypeScript support; Zustand preferred |
| Next.js | Not suitable for mobile-first app |
| Flutter | Project already in React ecosystem |
| React Navigation | Expo Router is newer and better integrated |

---

## Dependency Management

### Regular Maintenance
```bash
# Check for outdated packages
npm outdated

# Security audit
npm audit

# Update all packages
npm update

# Update to latest (breaking changes)
npm install package@latest
```

### Important Security Notes
- Supabase credentials rotated quarterly
- Dependencies scanned for vulnerabilities
- No external fonts or heavy assets embedded

---

## Conclusion

The KLOSET tech stack is carefully selected to provide:
- **Speed**: Fast development and runtime performance
- **Scalability**: Can handle thousands of concurrent users
- **Maintainability**: TypeScript and Zustand make code easy to understand
- **Cross-Platform**: Single codebase for iOS, Android, Web
- **Modern**: Latest stable versions of key libraries

The stack prioritizes simplicity without sacrificing functionality, making onboarding of new developers straightforward.

---

**Last Updated**: June 2026  
**Next Review**: September 2026
