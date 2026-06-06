# KLOSET - Deployment Guide

## Overview

This guide covers building, releasing, and deploying KLOSET to iOS App Store, Google Play Store, and web platforms.

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All TypeScript errors resolved
- [ ] No console warnings
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated

### Functionality

- [ ] All features tested on device
- [ ] No known bugs blocking release
- [ ] Performance acceptable (< 3s startup)
- [ ] Dark mode works
- [ ] All platforms tested (iOS, Android, web)

### Content

- [ ] App icons finalized
- [ ] Splash screen ready
- [ ] App name and description finalized
- [ ] Privacy policy generated
- [ ] Terms of service prepared

### Accounts & Credentials

- [ ] Apple Developer account active
- [ ] Google Play Developer account active
- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Certificates and keys ready

---

## Version Management

### Semantic Versioning

**Format**: `MAJOR.MINOR.PATCH`

```
1.0.0
├─ MAJOR: Breaking changes
├─ MINOR: New features (backwards compatible)
└─ PATCH: Bug fixes

Examples:
0.1.0 → 0.1.1  (Bug fix)
0.1.1 → 0.2.0  (New feature)
0.2.0 → 1.0.0  (Public release)
```

### Update Version

**File**: `app.json`

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

**Also update**: `package.json`

```json
{
  "version": "1.0.0"
}
```

---

## Building with EAS (Expo Application Services)

### Setup EAS CLI

```bash
# Install
npm install -g eas-cli

# Authenticate
eas login

# Verify connection
eas whoami
```

### Create EAS Project

In project directory:

```bash
eas init
# Generates: eas.json
```

### Build Configuration

**File**: `eas.json`

```json
{
  "cli": {
    "version": ">= 6.0.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": true,
      "android": true
    }
  }
}
```

---

## Building for iOS

### Requirements

- Apple Developer account ($99/year)
- macOS (for local development)
- Xcode (download from App Store)

### Build Process

**Step 1**: Create build

```bash
eas build --platform ios --profile production
```

**Step 2**: Wait for build

- 10-30 minutes depending on resources
- Check status: `eas build:list`
- View logs: `eas build:view [build-id]`

**Step 3**: Download IPA

```bash
# Or download from EAS dashboard
eas build:download [build-id]
```

**Step 4**: Prepare for App Store

Get yourself:

- iOS bundle identifier (e.g., `com.kloset.app`)
- App description (300 chars)
- Screenshots (5-20 for each screen type)
- Privacy policy URL
- Support email
- Category (Lifestyle, Productivity, etc)

---

## Submitting to Apple App Store (iOS)

### Register App on App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps"
3. Click "+"
4. Select "New App"
5. Fill in:
   - Platform: iOS
   - Name: KLOSET
   - Bundle ID: Create new (e.g., com.kloset.app)
   - SKU: com.kloset
   - User Access: Full Access

### Create Bundle Identifier

In App Store Connect:

1. Certificates, IDs & Profiles
2. Identifiers
3. -
4. App IDs
5. Create ID
6. Register identifier

### Automatic Submission

```bash
# Submit directly from EAS
eas submit --platform ios

# Choose App Store Connect
# Enter:
# - App Store Connect email
# - App-specific password
```

**Note**: Generate app-specific password:

1. [appleid.apple.com](https://appleid.apple.com)
2. Security → App Passwords
3. Generate password for "App Store Connect"

### Manual Submission (If needed)

1. Download IPA from EAS build
2. Open with Xcode
3. Validate app
4. Upload via Xcode organizer
5. Submit for review

### Review Process

- Apple review: 24-48 hours typically
- May request changes
- Once approved: Available on App Store
- Can schedule release date

---

## Building for Android

### Requirements

- Google Play account ($25 one-time)
- Java Development Kit (JDK 11+)
- Android SDK

### Build Process

**Step 1**: Create production build

```bash
eas build --platform android --profile production
```

**Step 2**: Wait for build

- 15-45 minutes
- Monitor: `eas build:list`

**Step 3**: Download AAB (Android App Bundle)

```bash
eas build:download [build-id]
# Creates .aab file
```

---

## Submitting to Google Play Store (Android)

### Setup Google Play Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Create merchant account if needed
3. Accept terms and pay $25
4. Create new app
5. Fill in:
   - App name: KLOSET
   - Default language: English
   - App category: Lifestyle/Shopping
   - App type: Free

### Create Signing Key

**Important**: Keep signing key safe!

```bash
# Generate key (if not auto-generated by EAS)
keytool -genkey -v -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-app-alias
```

**Store in safe location** (not in git)

### Store Configuration

In `eas.json` Android section:

```json
{
  "android": {
    "buildType": "aab",
    "track": "production"
  }
}
```

### Automatic Submission

```bash
# Submit from EAS
eas submit --platform android

# Enter Google Play credentials
# Upload AAB automatically
```

### Manual Submission

1. Google Play Console
2. Create new release
3. Upload AAB file
4. Add release notes:
   - Describe features/fixes
   - Highlight improvements
5. Staged rollout (optional):
   - Start at 5% → 10% → 50% → 100%
6. Review and publish

### Play Store Review

- Usually: 1-4 hours
- Rare rejections
- Can submit updates without reapproval

---

## Web Deployment

### Build for Web

```bash
expo export:web
# Creates: ./web-build/
```

### Deploy Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Subsequent deployments
vercel --prod
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=web-build
```

#### Option 3: AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 sync web-build/ s3://kloset-bucket/

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

#### Option 4: GitHub Pages

```bash
# Update package.json
{
  "homepage": "https://username.github.io/kloset"
}

# Deploy
npm run build
npm run deploy
```

---

## Release Checklist

### Pre-Release (1 week before)

- [ ] Set version number
- [ ] Update `CHANGELOG.md`
- [ ] Test on real devices (iOS & Android)
- [ ] Test on web browsers
- [ ] Performance audit
- [ ] Dark mode verification
- [ ] Update screenshots if needed

### Release Day

- [ ] Final code review
- [ ] Merge to main branch
- [ ] Tag release: `git tag v1.0.0`
- [ ] Create release notes
- [ ] Build for iOS
- [ ] Build for Android
- [ ] Build for web
- [ ] Submit all platforms
- [ ] Notify stakeholders

### Post-Release (1 week after)

- [ ] Monitor crash logs
- [ ] Monitor user feedback
- [ ] Prepare next release
- [ ] Update documentation

---

## Managing Releases

### Creating Release Notes

**Format**:

```markdown
## Version 1.0.0 (Release Date)

### New Features

- Add wardrobe item upload
- Swipe-based outfit discovery
- Occasion-based recommendations

### Improvements

- Faster app startup
- Better dark mode support
- Improved image compression

### Bug Fixes

- Fixed crash on low memory devices
- Fixed navigation guard issues
- Fixed theme switching

### Known Issues

- List any known issues
```

### Rollback Procedure

If critical bug found after release:

1. **Immediate**: Notify all platforms
2. **iOS**: Remove from sale temporarily (wait for next build)
3. **Android**: Staged rollout to 0% (stops distribution)
4. **Web**: Revert to previous deployment
5. **Fix**: Build hotfix patch
6. **Rerelease**: Push fixed version

---

## Performance & Monitoring

### Pre-Release Performance

```bash
# Check app size
eas build:view [build-id]
# Shows download size and installed size

# Targets:
# - Download: < 50MB
# - Installed: < 150MB
```

### Monitoring After Release

### Set up Error Tracking

**Sentry** (recommended):

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics

```typescript
// Track user actions (planned)
analytics.track("app_opened");
analytics.track("wardrobe_item_added");
analytics.track("outfit_liked");
```

---

## Environment Management

### Development

```
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
```

### Staging

```
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
```

### Production

```
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

Set in EAS secrets:

```bash
eas secret:create
# Set different values per environment
```

---

## Update Strategy

### Over-the-Air Updates (OTA)

Using Expo Updates (planned):

```bash
# Publish update without App Store review
eas update

# Users get update automatically
```

### Version Requirements

```json
{
  "expo": {
    "sdkVersion": "54.0.0",
    "runtimeVersion": "54.0.0"
  }
}
```

---

## Troubleshooting Deployments

### iOS Build Fails

```bash
# Check certificate
eas credentials

# Re-create certificate
eas credentials --platform ios --clear

# Rebuild
eas build --platform ios
```

### Android Build Fails

```bash
# Check signing key
eas credentials --platform android

# Test locally
./gradlew build

# Check for SDK version issues
```

### App Store Rejection

Common reasons:

- Missing privacy policy
- Unsafe data handling
- Crash on startup
- Performance issues
- UI not adapted for screen size

**Solution**: Address issue and resubmit

### Play Store Rejection

Common reasons:

- Missing privacy policy
- Tracking without consent
- Misleading app description
- App stability issues

**Solution**: Fix and resubmit (usually approved quickly)

---

## Maintenance

### Regular Updates

**Monthly**:

- Update dependencies: `npm update`
- Security audit: `npm audit`
- Release minor updates

**Quarterly**:

- Major dependency upgrades
- Performance optimization
- Feature releases

### Support

- Monitor app store reviews
- Respond to user feedback
- Fix reported bugs
- Track crash reports

---

## Continuous Deployment (CD)

Setup automatic deploys:

**GitHub Actions** (example):

```yaml
name: Deploy to EAS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: eas build --platform ios --profile production
      - run: eas submit --platform ios
      - run: eas build --platform android --profile production
      - run: eas submit --platform android
```

---

## Security Considerations

### Secrets Management

- Never commit secrets to git
- Use environment variables
- Rotate keys regularly
- Store keys securely

### Code Signing

- Keep signing keys secure
- Rotate certificates yearly
- Use strong passwords
- Back up keys safely

### API Keys

- Rotate API keys regularly
- Use separate keys per environment
- Monitor key usage
- Revoke compromised keys

---

## Success Metrics

### Track After Release

- Downloads/installs
- Daily active users (DAU)
- Monthly active users (MAU)
- Crash rate
- User retention
- Average session length
- Star rating

---

## Rollback Strategy

If major issues discovered:

1. **iOS**: Can't instant rollback; submit new version
2. **Android**: Can pause rollout immediately
3. **Web**: Instant rollback (previous deployment)

**Prevention**: Test extensively before release!

---

## Conclusion

Deployment involves:

1. Version management
2. Building for multiple platforms
3. Submitting to app stores
4. Web hosting
5. Monitoring and updates

This process is designed for safety and quality. Taking time for thorough testing prevents issues in production.

---

**Last Updated**: June 2026  
**EAS Status**: Fully configured  
**Release Cadence**: Monthly (planned)  
**Support Level**: 24/7 monitoring (planned)
