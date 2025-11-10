# Stream Disc Studio - Migration Guide

This guide will help you integrate the sophisticated Studio features from this repository into your main Stream Disc Player app.

## 🎯 Overview

The Studio app provides:
- **Album/Mixtape Creation** with cover art, tracks, and descriptions
- **NFC Burning** with verification and authentication
- **Professional UI** with minimal, ChatGPT-inspired design
- **Bottom Navigation** with animated flame button
- **NFC Scan Modal** with slide-up animation
- **Subscription Management** (Free, Pro, Business, Enterprise)
- **Stream Disc Store** for published content
- **Admin Tools** for testing and seeding

---

## 📦 Files to Copy

### 1. **App Screens** (Route Handlers)
Copy these files to your main app's `app/studio/` directory:

```
app/create-album.tsx          → app/studio/create-album.tsx
app/write-nfc.tsx             → app/studio/write-nfc.tsx
app/subscription.tsx          → app/studio/subscription.tsx
app/store.tsx                 → app/studio/store.tsx
app/store/[discId].tsx        → app/studio/store/[discId].tsx
app/store/blank-discs.tsx     → app/studio/store/blank-discs.tsx
app/admin.tsx                 → app/studio/admin.tsx
app/blank-disc.tsx            → app/studio/blank-disc.tsx
app/dashboard.tsx             → app/studio/dashboard.tsx (or merge with existing)
app/auth/sign-in.tsx          → app/auth/sign-in.tsx (or merge with existing)
app/auth/sign-up.tsx          → app/auth/sign-up.tsx (or merge with existing)
app/auth/forgot-password.tsx  → app/auth/forgot-password.tsx (or merge with existing)
```

### 2. **Components**
Copy these to your main app's `src/components/` directory:

```
src/components/NfcScanModal.tsx  → src/components/NfcScanModal.tsx
src/components/BottomNav.tsx     → src/components/BottomNav.tsx
src/components/AdBanner.tsx      → src/components/AdBanner.tsx
```

### 3. **Services** (Business Logic)
Copy these to your main app's `src/services/` directory:

```
src/services/nfc.ts              → src/services/nfc.ts
src/services/nfcVerification.ts  → src/services/nfcVerification.ts
src/services/storage.ts          → src/services/storage.ts
src/services/payment.ts          → src/services/payment.ts
```

**Note:** If your main app already has `firestore.ts` and `auth.ts`, merge the methods from this repo's versions rather than overwriting.

### 4. **Configuration Files**
Merge these configurations:

```
app.json                 → Merge NFC permissions and deep linking config
app.config.js           → Merge metadata and branding
firebase.json           → Merge hosting configuration
web-redirect/           → Copy entire directory for deep linking
```

### 5. **Types**
```
src/types/index.ts      → Merge TypeScript types
```

### 6. **Documentation**
```
DEVELOPMENT_GUIDE.md    → Reference for development practices
LOGO_ASSETS.md         → Branding guidelines
```

---

## 🔧 Integration Steps

### Step 1: Install Dependencies

Add these packages to your main app:

```bash
npm install react-native-nfc-manager expo-image-picker expo-document-picker
```

### Step 2: Update app.json

Add NFC permissions and deep linking configuration:

```json
{
  "expo": {
    "scheme": "streamdiscplayer",
    "android": {
      "permissions": [
        "android.permission.NFC",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "stream-disc.web.app"
            },
            {
              "scheme": "https",
              "host": "app.streamdiscplayer.com"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": [
        "applinks:stream-disc.web.app",
        "applinks:app.streamdiscplayer.com"
      ],
      "infoPlist": {
        "NFCReaderUsageDescription": "This app uses NFC to program Stream Discs with your content"
      }
    }
  }
}
```

### Step 3: Create Studio Home Screen

Create a new file `app/studio/index.tsx` in your main app (copy from `app/index.tsx` of this repo):

This will serve as the entry point to the Studio section, showing all content type cards (Album, Mixtape, Digital Art, etc.).

### Step 4: Add Studio Tab to Navigation

Update your main app's tab navigation to include Studio:

```typescript
// In your main navigation file (e.g., app/(tabs)/_layout.tsx)
<Tabs.Screen
  name="studio"
  options={{
    title: 'Studio',
    tabBarIcon: ({ color, focused }) => (
      <Ionicons 
        name={focused ? 'flame' : 'flame-outline'} 
        size={24} 
        color={color} 
      />
    ),
  }}
/>
```

### Step 5: Update Import Paths

After copying files, update all relative imports to match your main app's structure:

```typescript
// Change from:
import { authService } from '../services/auth';

// To (if needed):
import { authService } from '@/services/auth';
```

### Step 6: Merge Firebase Services

If your main app already has Firestore and Auth services:

1. **Open both `firestore.ts` files** (main app and studio)
2. **Copy new methods** from studio version (like `registerStreamDisc`, `logDiscScan`, etc.)
3. **Merge collection constants** (add `REGISTERED_DISCS_COLLECTION`, `DISC_SCANS_COLLECTION`)
4. **Update `createDisc` method** to include new fields (`publishedToStore`, `storePrice`, etc.)

### Step 7: Set Up Deep Linking

1. **Copy `web-redirect/` directory** to your main app root
2. **Set up Firebase Hosting**:
```bash
firebase init hosting
# Select your project
# Set public directory to: web-redirect
# Configure as single-page app: No
```
3. **Deploy**:
```bash
firebase deploy --only hosting
```

### Step 8: Update NFC Write URLs

In `app/studio/write-nfc.tsx`, ensure the NFC URLs point to your Firebase hosting:

```typescript
const url = `https://stream-disc.web.app/a/${contentId}`;
```

And in `web-redirect/redirect.html`, ensure the deep link scheme matches your main app:

```javascript
const deepLink = `streamdiscplayer://album/${contentId}${params}`;
```

### Step 9: Test the Integration

1. **Build the app**:
```bash
npx eas-cli build --profile preview --platform android
```

2. **Test flow**:
   - Open Studio tab
   - Create an album (e.g., "Midnight Dreams")
   - Tap the Burn button
   - Scan NFC modal appears
   - Write to NFC tag
   - Tap the tag → Firebase redirect → Opens in Player

---

## 🎨 UI Design Guidelines

This Studio app follows a **minimal, professional, ChatGPT-inspired design**:

### Design Specs:
| Attribute | Value | Description |
|-----------|-------|-------------|
| Icon Library | Ionicons (MaterialCommunityIcons compatible) | Outlined icons |
| Icon Size | 20-24px | Compact and consistent |
| Padding | 4-6px | Minimal touch target |
| Stroke Weight | 1.5px | Light, crisp lines |
| Color | #9A9A9A → #FFF | Neutral → active states |
| Container Radius | 10-12px | Slight rounding |
| Active Feedback | Opacity 0.5 on press | Subtle touch animation |
| Shadow/Glow | None | Pure flat design |

### Key Components:

1. **NfcScanModal** - Slide-up modal with pulsing blue orb and phone tap animation
2. **BottomNav** - Elevated flame button with Home/Profile navigation
3. **Content Cards** - Gradient cards with lock badges for premium features
4. **Minimal Buttons** - Thin borders, subtle animations, no shadows

---

## 🔥 Key Features to Connect

### 1. Album Creation → Player
When an album is created and burned to NFC:
```typescript
// In write-nfc.tsx, after successful write:
const albumData = await firestoreService.getDisc(contentId);
// This data should be accessible to your Player app via deep link
```

### 2. NFC Tap → Open in Player
The flow:
```
NFC Tag (URL: https://stream-disc.web.app/a/abc123)
  ↓
Firebase Hosting redirect.html
  ↓
Deep Link: streamdiscplayer://album/abc123
  ↓
Your Player app opens to album screen
```

Ensure your Player app handles this deep link:
```typescript
// In your Player app's deep link handler
Linking.addEventListener('url', ({ url }) => {
  if (url.includes('album/')) {
    const albumId = url.split('album/')[1];
    // Navigate to album screen with albumId
    router.push(`/album/${albumId}`);
  }
});
```

### 3. Storage Management
Studio tracks user storage:
```typescript
// Free: 2GB
// Pro: 5GB  
// Business: 30GB
// Enterprise: 30GB+

// Check before uploads:
await firestoreService.hasAvailableStorage(userId, fileSize);

// Update after uploads:
await firestoreService.updateStorageUsage(userId, fileSize);
```

### 4. Subscription Gating
Premium features are locked:
```typescript
// Locked features:
- Video content
- Mixtape
- Digital Art
- Publishing to Store
- Most content types

// Check in components:
const isPremium = await authService.isPremium();
if (!isPremium && contentType.locked) {
  router.push('/subscription');
}
```

---

## 🗄️ Database Schema

The Studio app uses these Firestore collections:

### Collections:
1. **`users`** - User profiles with subscription info
2. **`discs`** - Created albums/content
3. **`registeredDiscs`** - Manufacturing registry for NFC verification
4. **`discScans`** - NFC scan logs

### Key Fields in `discs`:
```typescript
{
  id: string;
  userId: string;
  type: 'album' | 'mixtape' | 'video' | ...;
  title: string;
  artist: string;
  description?: string;
  coverArt?: string;
  tracks?: Track[];
  nfcInfo?: {
    uid: string;
    url: string;
    nonce: string;
    programmingDate: Timestamp;
  };
  publishedToStore: boolean;
  storePrice?: number;
  createdAt: Timestamp;
  lastProgrammedAt?: Timestamp;
}
```

---

## 🧪 Testing

### Admin Tools
The Studio includes an admin screen (`app/admin.tsx`) for:
- Seeding test Stream Discs into the registry
- Testing NFC verification
- Viewing Firebase project info
- Checking scan logs

Access at: `/studio/admin`

### Test Flow:
1. Seed test discs: Tap "Seed Test Stream Discs"
2. Create an album: Navigate to `/studio/create-album`
3. Burn to NFC: Use the flame button in bottom nav
4. Verify: Check if disc is recognized as legitimate
5. Tap disc: Should open in Player app (preview build only)

---

## 🚀 Build Configuration

### For Development (with hot reload):
```bash
npx expo start --dev-client
```
Requires: `expo-dev-client` installed and development build on device

### For Demo/Preview (standalone, deep linking works):
```bash
npx eas-cli build --profile preview --platform android
```
Best for: Demos, testing, reviewers

### For Production (optimized):
```bash
npx eas-cli build --profile production --platform android
```
Best for: App store submission, final release

---

## 📝 Cursor Agent Prompt

Use this prompt in your main app's Cursor:

```
I want to integrate the sophisticated Studio features from this repository:
https://github.com/superecomm/stream-disc-nfc-tool/tree/studio-migration

Please follow the MIGRATION.md guide to:

1. Copy all Studio screens from app/ to app/studio/
2. Copy all components from src/components/
3. Copy all services from src/services/ (merge with existing auth/firestore)
4. Add Studio tab to main navigation with flame icon
5. Update app.json with NFC permissions and deep linking
6. Ensure all imports resolve correctly
7. Connect Studio's album creation to Player's playback system
8. Test that NFC burning → Firebase → Deep link → Player works

Key requirements:
- Maintain all minimal UI styles (no shadows, thin icons, subtle animations)
- Keep subscription gating (video, mixtape, publishing locked to premium)
- Preserve storage management (2GB free, 5GB Pro, 30GB Business)
- Connect NFC tap flow to open albums in Player app
- Replace existing basic studio flow with this sophisticated version

Start by analyzing MIGRATION.md and creating a step-by-step integration plan.
```

---

## 🎯 Success Checklist

After integration, verify:

- [ ] Studio tab appears in main navigation
- [ ] Can create albums with cover art and tracks
- [ ] NFC scan modal slides up with animations
- [ ] Bottom nav shows flame button (animated when scanning)
- [ ] Can write NFC tags with album URLs
- [ ] Tapping NFC opens Firebase redirect page
- [ ] Deep link launches Player app (preview build)
- [ ] Album opens in Player with correct data
- [ ] Subscription features are properly gated
- [ ] Storage limits are enforced
- [ ] Admin tools work for testing
- [ ] All UI matches minimal design specs

---

## 🔗 Resources

- **Firebase Console**: https://console.firebase.google.com/project/stream-disc
- **GitHub Repo**: https://github.com/superecomm/stream-disc-nfc-tool
- **Deep Link Test**: https://stream-disc.web.app
- **EAS Builds**: https://expo.dev/accounts/superecomm/projects/stream-disc-nfc-tool

---

## 💡 Tips

1. **Test deep linking** only works in preview/production builds, not development builds
2. **NFC writing** requires physical device with NFC, won't work in simulator
3. **Storage management** is simulated but functional for demo purposes
4. **Subscription payments** are simulated; integrate real payment provider later
5. **Firebase hosting** is required for deep link redirect pages
6. **Bottom nav** should replace or integrate with existing navigation
7. **NFC verification** checks against `registeredDiscs` collection

---

## 🆘 Troubleshooting

### Deep linking not working?
- Ensure preview/production build (not development)
- Check `app.json` has correct scheme and intent filters
- Verify Firebase hosting is deployed
- Test URL manually in browser first

### NFC writing fails?
- Check NFC permissions in `app.json`
- Ensure device has NFC enabled
- Try with a blank NTAG215/216 tag
- Check admin screen for scan logs

### Storage uploads fail?
- Check Firebase Storage rules
- Verify user is authenticated
- Check storage limit hasn't been exceeded
- Review `firestoreService.hasAvailableStorage()`

### Styles look different?
- Ensure all StyleSheet imports are preserved
- Check that icon libraries (Ionicons) are installed
- Verify no conflicting global styles
- Review component-level styles in copied files

---

## 📞 Support

For questions about this integration, refer to:
- **DEVELOPMENT_GUIDE.md** - Development practices
- **LOGO_ASSETS.md** - Branding guidelines
- **app/admin.tsx** - Testing and debugging tools

---

**Happy Integrating! 🚀🔥**

