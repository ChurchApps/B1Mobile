# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Start web development server

### Code Quality
- `npm run lint` - Run ESLint with TypeScript, React, and React Native rules
- `npm test` - Run Jest tests with watch mode

### Building
- `npm run build:android` - Build Android app with EAS
- `npm run build:ios` - Build iOS app with EAS

### Environment Setup
1. Copy `dotenv.sample.txt` to `.env`
2. Ensure `google-services.json` and `ios/GoogleService-Info.plist` exist for Firebase

### Configuration
- **Single source of truth**: `app.config.js` (not `app.json`)
- Dynamic configuration with environment variables for API endpoints
- Build numbers and version info managed in `app.config.js`

## Architecture Overview

### Navigation Structure
This app uses **Expo Router** with file-based routing:
- `app/_layout.tsx` - Root layout with Firebase initialization and theme provider
- `app/index.tsx` - Splash screen with app initialization
- `app/auth/` - Authentication flows (login, register, privacy)
- `app/(drawer)/` - Main app with drawer navigation
- Dynamic routes: `app/(drawer)/groupDetails/[id]/index.tsx`, `app/(drawer)/planDetails/[id]/index.tsx`

### Key Directories
- **`src/components/`** - Feature-organized components with barrel exports (`exports.ts`)
  - Core UI: headers, buttons, inputs, modals
  - Feature-specific: `donations/`, `Plans/`, `checkin/`, `Notes/`
- **`src/helpers/`** - Business logic and utility classes
- **`src/interfaces/`** - TypeScript interfaces for data models
- **`src/theme/`** - Theme provider with light/dark mode support

### State Management
- **No centralized state management** (Redux/Context)
- **Helper classes as singletons** for global state
- **AsyncStorage** via `CacheHelper.ts` for persistence
- **Local component state** with React hooks

### API Communication
- Uses `@churchapps/helpers` package and local `src/mobilehelper` for API abstraction
- JWT-based authentication with permission-based access control
- Multiple API endpoints: MembershipApi, MessagingApi, AttendanceApi, ContentApi, GivingApi
- Helper classes: `UserHelper.ts`, `ApiHelper` (from mobilehelper package)

### Important Helper Classes
- **`UserHelper.ts`** - User authentication, church management, analytics
- **`CacheHelper.ts`** - AsyncStorage management for user data and tokens
- **`PushNotificationHelper.ts`** - Push notification management
- **`StripeHelper.ts`** - Payment processing with Stripe
- **`CheckinHelper.ts`** - Church check-in functionality
- **`Constants.tsx`** - App colors, fonts, and image constants

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- JSX mode: `react-jsx`
- Extends `expo/tsconfig.base`

### Code Style
- ESLint with TypeScript, React, and React Native plugins
- Prettier with specific formatting rules (printWidth: 999, no trailing commas)
- 2-space indentation
- Double quotes for JSX attributes
- Unused imports automatically removed

### Firebase Integration
- Analytics tracking throughout the app
- Push notifications
- Firebase config in `src/config/firebase.ts`

### Payment Integration
- Stripe integration via `@stripe/stripe-react-native`
- Payment methods: credit card and bank transfer
- Recurring donations supported

### Multi-Church Architecture
This is a **church management platform** where:
- Users can belong to multiple churches
- Church selection happens before authentication
- Anonymous API calls available for public church data
- Permission-based feature access per church

### Component Patterns
- Feature-based organization over type-based
- Consistent use of `exports.ts` files for clean imports
- Wrapper components for headers and loading states
- Responsive design with `DimensionHelper.ts`
- Theme-aware components supporting light/dark modes

### Testing
- Jest with `jest-expo` preset
- Tests should be placed alongside components or in `__tests__` directories

### Release Build Process

#### Android Release
1. Hardcode `stage="prod"` in `src/helpers/EnvironmentHelper.ts`
2. Ensure Firebase config files exist
3. Increment version in `android/app/build.gradle` and `package.json`
4. Build: `cd android && gradlew bundleRelease`
5. Generate APK: `react-native run-android --variant=release`
6. Sign bundle in Android Studio
7. If compilation fails: `SET NODE_OPTIONS=--openssl-legacy-provider`

#### iOS Release
1. Run `yarn` and `cd ios && pod install`
2. Update version in XCode Info
3. Build → Archive → Validate → Distribute in XCode

#### CodePush Release
1. Hardcode `stage="prod"` in `src/helpers/EnvironmentHelper.ts`
2. Update version in `package.json`
3. Android: `appcenter codepush release-react -a Live-Church-Solutions/B1Mobile -d Production`
4. iOS: `appcenter codepush release-react -a Live-Church-Solutions/B1Mobile_iOS -d Production`

### Development Tips
- **Debug Server**: Configure debug server host as `YourIP:8081` via developer menu
- **React Native CLI**: Alternative to Expo commands - `react-native run-android` combines start and install

### Known Issues & Fixes

#### Android Build: expo-json-utils Autolinking Issue
**Problem**: After `expo prebuild`, Android builds fail with "Project with path ':expo-json-utils' could not be found" error.

**Root Cause**: `expo-json-utils` is nested in `node_modules/expo-manifests/node_modules/expo-json-utils/` instead of root level, causing autolinking to fail.

**Fix**: Add this to `android/settings.gradle` after every `expo prebuild`:
```gradle
// Manually include expo-json-utils since it's required by expo-manifests
include ':expo-json-utils'
project(':expo-json-utils').projectDir = new File(rootProject.projectDir, '../node_modules/expo-manifests/node_modules/expo-json-utils/android')
```

**Permanent Solution**: Create a postbuild script to automatically apply this fix after prebuild operations.