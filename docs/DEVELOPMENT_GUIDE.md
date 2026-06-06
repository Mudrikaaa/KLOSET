# KLOSET - Development Guide

## Getting Started

This guide covers everything needed to set up, develop, and contribute to KLOSET.

---

## Prerequisites

### System Requirements

- **OS**: macOS 12+, Linux, or Windows (WSL2)
- **Node.js**: 18.0.0 or newer
- **npm**: 9.0.0 or newer (comes with Node.js)
- **Git**: Latest version
- **Terminal**: Any shell (bash, zsh, fish, etc.)

### Verify Installation

```bash
node --version      # Should be v18+
npm --version       # Should be v9+
git --version       # Should show installed
```

---

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/kloset.git
cd kloset
```

### 2. Install Dependencies

```bash
npm install
```

**What this does:**

- Installs all packages from package.json
- Creates node_modules directory (~500MB)
- Generates package-lock.json

### 3. Environment Setup

Create `.env.local` file:

```bash
cp .env.example .env.local  # If example exists
# OR manually create
touch .env.local
```

**Add to `.env.local`:**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get credentials from:

1. Go to https://supabase.com
2. Create project (or use existing)
3. Settings → API
4. Copy URL and `anon` key

### 4. Start Development Server

```bash
npm start
```

**Options:**

```bash
npm run ios     # Start iOS simulator
npm run android # Start Android emulator
npm run web     # Start web browser
```

---

## Development Workflow

### Directory Structure for Development

```
KLOSET/
├── app/                    # Create/edit screens here
│   ├── (tabs)/index.tsx
│   └── auth/login.tsx
├── components/             # Create/edit components here
├── store/                  # Edit state here
├── types/                  # Add/edit TypeScript types
└── lib/                    # Services (Supabase, etc)
```

### Quick IDE Setup

#### VS Code (Recommended)

```bash
# Install essential extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin
- Prettier - Code formatter
- ESLint
```

**Recommended settings.json:**

```json
{
  "typescript.enablePromptUseWorkspaceTypesForJsFiles": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "files.exclude": {
    "**/.expo": true,
    "**/node_modules": true
  }
}
```

#### Other Editors

- Vim/Neovim: LSP configuration
- Sublime: TypeScript plugin
- WebStorm: Built-in React Native support

---

## Making Changes

### Adding a New Screen

**Step 1**: Create file in `app/` directory

```bash
touch app/new-feature/index.tsx
```

**Step 2**: Write screen component

```typescript
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function NewFeatureScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        New Feature
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

**Step 3**: Auto-routing

- File-based routing automatically creates route
- Route: `/new-feature`

**Step 4**: Add navigation if needed

```typescript
// In another screen
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/new-feature");
```

### Adding a New Component

**Step 1**: Create in `components/`

```bash
touch components/MyComponent.tsx
```

**Step 2**: Write component

```typescript
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export default function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

**Step 3**: Use in screens

```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent title="Click me" onPress={() => console.log('Clicked')} />
```

### Adding State to Zustand

**Edit**: `store/index.ts`

```typescript
// 1. Add to interface
interface AppState {
  // ... existing
  newFeature: string;
  setNewFeature: (value: string) => void;
}

// 2. Add to store
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... existing state
      newFeature: "initial",
      setNewFeature: (value) => set({ newFeature: value }),
    }),
    // ... persist config
  ),
);

// 3. Use in component
const newFeature = useAppStore((state) => state.newFeature);
const setNewFeature = useAppStore((state) => state.setNewFeature);
```

### Adding TypeScript Types

**Edit**: `types/index.ts`

```typescript
export interface NewType {
  id: string;
  name: string;
  // ... fields
}

export type NewEnum = "option1" | "option2";
```

**Use in components:**

```typescript
import { NewType, NewEnum } from "@/types";

const item: NewType = { id: "1", name: "test" };
```

---

## Hot Reloading

### Fast Refresh

- Automatic on file save
- Preserves component state when possible
- Shows error messages in app

### Full Rebuild

```bash
# If Fast Refresh doesn't work
# In Expo Go: Shake device → Select "Reload"

# Or press 'r' in terminal
```

### Clear Cache

```bash
npm start -- --clear
```

---

## Testing During Development

### Manual Testing Checklist

- [ ] Test on actual device/emulator
- [ ] Test all user flows
- [ ] Test error handling
- [ ] Test with slow network
- [ ] Test with different device sizes
- [ ] Test light and dark themes

### Using Expo Go (Quickest)

**iOS:**

1. Install Expo Go from App Store
2. Scan QR code from terminal
3. App loads instantly

**Android:**

1. Install Expo Go from Play Store
2. Scan QR code
3. App loads instantly

### Using Simulators/Emulators

**iOS Simulator:**

```bash
npm run ios
# Installs and runs in iOS simulator automatically
```

**Android Emulator:**

```bash
npm run android
# Installs and runs in emulator
```

**Web:**

```bash
npm run web
# Opens in browser
```

---

## Code Quality

### TypeScript Checking

```bash
# Check for type errors
npx tsc --noEmit
```

### Formatting

```bash
# Format code with Prettier
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Linting (When Configured)

```bash
npx eslint .
npx eslint --fix .
```

---

## Debugging

### Console Logging

```typescript
console.log("Value:", data);
console.warn("Warning message");
console.error("Error message");
```

### React DevTools

- Works with React Native debugging
- Inspect component tree
- Watch state changes

### Network Debugging

```typescript
// Log API calls
fetch(url)
  .then((r) => r.json())
  .then((data) => console.log("API response:", data))
  .catch((err) => console.error("API error:", err));
```

### Common Issues

**App won't start:**

```bash
# Clean and restart
npm start -- --clear
```

**Module not found:**

```bash
# Check import paths match exact filename/casing
# TypeScript will error if incorrect
```

**Async Storage empty after restart:**

```bash
# Clear app data (device/emulator)
# Reinstall app
```

---

## Version Control

### Git Workflow

**1. Create branch for feature:**

```bash
git checkout -b feature/wardrobe-filter
```

**2. Make changes and commit:**

```bash
git add .
git commit -m "Add wardrobe category filter"
```

**Good commit messages:**

```
✅ Good:
- "Add category filter to wardrobe screen"
- "Fix navigation guard for onboarding"
- "Refactor color theme system"

❌ Avoid:
- "fix stuff"
- "updates"
- "work in progress"
```

**3. Push to GitHub:**

```bash
git push origin feature/wardrobe-filter
```

**4. Create Pull Request:**

- Describe changes
- Reference any issues
- Wait for review

**5. Merge to main:**

```bash
git checkout main
git pull origin main
git merge feature/wardrobe-filter
git push origin main
```

### Branch Naming

```
main              # Production ready
develop           # Development branch
feature/*         # New features
bugfix/*          # Bug fixes
hotfix/*          # Emergency fixes
```

---

## Performance Optimization Tips

### Image Optimization

```typescript
// Don't load huge images
// Compress before upload
// Use appropriate sizes

// ✅ Good
<Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} />

// ❌ Bad
<Image source={{ uri: largeImageUrl }} style={{ width: 200, height: 200 }} />
```

### Memoization

```typescript
import React, { memo } from 'react';

// Prevent re-render if props unchanged
const Item = memo(({ data }) => (
  <View>{data.title}</View>
));
```

### List Performance

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <Item {...item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>
```

---

## Building for Production

### Prepare Release Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for web
npm run web -- --export
```

### Generate APK/IPA

```bash
# iOS (requires Apple Developer account)
eas build --platform ios --build-type release

# Android
eas build --platform android --build-type release
```

---

## Documentation

### Updating Docs

- Located in `/docs` folder
- Markdown format
- Update when adding features
- Keep synchronized with code

### Code Comments

```typescript
/**
 * Saves user profile to store and local storage
 * @param profileData - Body type, skin tone, style preference
 * @returns void
 */
function saveProfile(profileData: ProfileUpdate): void {
  // Implementation
}
```

---

## Common Tasks

### Add New Dependency

```bash
npm install package-name
# or
npm install --save-dev package-name  # for dev-only

# Update package.json (automatic)
# Restart app if needed
npm start -- --clear
```

### Remove Dependency

```bash
npm uninstall package-name
npm start -- --clear
```

### Update All Dependencies

```bash
npm update
```

### Check Outdated Packages

```bash
npm outdated
```

---

## Useful Commands Reference

```bash
# Development
npm start             # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run on web browser

# Build & Deploy
npm run build        # Create production build
eas build            # Create EAS build

# Code Quality
npx tsc --noEmit     # Type check
npx prettier --write . # Format code
npx eslint .         # Lint code

# Git
git status           # Check status
git log              # View commits
git diff             # View changes
git stash            # Temporarily save changes

# npm
npm list             # List all packages
npm outdated         # Check outdated packages
npm audit            # Security audit
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8081 (Linux/Mac)
lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or specify different port
npx expo start --port 8082
```

### Module Resolution Issues

```bash
# Verify import paths
# Check file names match exactly (case-sensitive)
# Use @ alias properly: @/components/Themed
```

### Weird Cache Issues

```bash
npm start -- --clear
npm cache clean --force
rm -rf .expo
npm install
npm start
```

---

## Contributing

### Code Standards

- Use TypeScript (no `any`)
- Follow naming conventions (camelCase, PascalCase)
- Write meaningful commit messages
- Comment complex logic
- Keep functions small and focused

### Pull Request Checklist

- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] Follows code style
- [ ] Changes documented
- [ ] Tested on device/emulator
- [ ] Updated relevant docs

---

## Learning Resources

### Official Docs

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Video Tutorials

- Expo routing patterns
- React Native best practices
- TypeScript for React

---

## Getting Help

### Resources

1. Check existing docs (`/docs` folder)
2. Search GitHub issues
3. Ask on Discord/Slack community
4. Create new GitHub issue with details
5. Contact project maintainer

### Issue Template

```
**Describe the bug**
[Clear description]

**To Reproduce**
1. [Steps]
2. [Steps]

**Expected behavior**
[What should happen]

**Screenshots/Logs**
[If applicable]

**Environment**
- OS: [macOS/Linux/Windows]
- Node: [version]
- npm: [version]
```

---

## Next Steps

1. **Setup**: Follow the "Getting Started" section
2. **Explore**: Browse the `/app` directory
3. **Read Architecture**: Check [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Make Changes**: Pick a small feature to implement
5. **Test Locally**: Run on ios/android/web
6. **Commit & Push**: Make first contribution

---

**Last Updated**: June 2026  
**Setup Time**: ~15 minutes  
**Difficulty**: Beginner (with Node.js knowledge)  
**Next Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
