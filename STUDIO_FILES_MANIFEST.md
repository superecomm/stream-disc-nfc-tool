# Studio Files Manifest

This document lists all files in the Studio app that need to be copied to your main Player app.

## 📂 Directory Structure

```
stream-disc-nfc-tool/
├── app/
│   ├── index.tsx                    # Studio home screen with content cards
│   ├── create-album.tsx             # Album creation screen
│   ├── write-nfc.tsx                # NFC writing screen
│   ├── subscription.tsx             # Subscription management
│   ├── dashboard.tsx                # User dashboard
│   ├── store.tsx                    # Stream Disc store
│   ├── admin.tsx                    # Admin/testing tools
│   ├── blank-disc.tsx               # Blank disc welcome screen
│   ├── _layout.tsx                  # Root navigation layout
│   ├── auth/
│   │   ├── sign-in.tsx              # Sign in screen
│   │   ├── sign-up.tsx              # Sign up screen
│   │   └── forgot-password.tsx      # Password reset
│   └── store/
│       ├── [discId].tsx             # Store disc detail page
│       └── blank-discs.tsx          # Blank discs purchase page
│
├── src/
│   ├── components/
│   │   ├── NfcScanModal.tsx         # Animated NFC scan modal
│   │   ├── BottomNav.tsx            # Bottom navigation with flame button
│   │   └── AdBanner.tsx             # Ad banner for free users
│   ├── services/
│   │   ├── auth.ts                  # Authentication service
│   │   ├── firestore.ts             # Database service
│   │   ├── nfc.ts                   # NFC operations
│   │   ├── nfcVerification.ts       # NFC verification service
│   │   ├── storage.ts               # File storage service
│   │   └── payment.ts               # Subscription/payment service
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── config/
│       └── firebase.ts              # Firebase configuration
│
├── web-redirect/
│   ├── index.html                   # Landing page
│   └── redirect.html                # Deep link redirect page
│
├── assets/
│   ├── icon.png                     # App icon
│   ├── splash-icon.png              # Splash screen icon
│   ├── adaptive-icon.png            # Android adaptive icon
│   └── favicon.png                  # Web favicon
│
├── app.json                         # Expo configuration
├── app.config.js                    # Dynamic Expo config
├── firebase.json                    # Firebase hosting config
├── package.json                     # Dependencies
├── MIGRATION.md                     # This migration guide
├── DEVELOPMENT_GUIDE.md             # Development documentation
└── LOGO_ASSETS.md                   # Branding guidelines
```

---

## 🎯 Priority Files (Copy First)

### Essential Components
1. `src/components/NfcScanModal.tsx` - Core NFC UI
2. `src/components/BottomNav.tsx` - Navigation component
3. `src/services/nfc.ts` - NFC operations
4. `src/services/nfcVerification.ts` - NFC authentication

### Core Screens
5. `app/index.tsx` - Studio home (content cards)
6. `app/create-album.tsx` - Album creation
7. `app/write-nfc.tsx` - NFC writing

### Configuration
8. `app.json` - App configuration (merge)
9. `web-redirect/` - Deep linking pages
10. `firebase.json` - Hosting config

---

## 📋 File Details

### **app/index.tsx**
**Purpose:** Studio home screen with content type cards  
**Key Features:**
- Gradient content cards (Album, Mixtape, Digital Art, etc.)
- Premium lock badges
- Scrollable layout
- Dynamic CTA based on auth status
- Integrates NfcScanModal
- Integrates BottomNav

**Dependencies:**
- `SafeAreaView`, `ScrollView`, `TouchableOpacity` from React Native
- `LinearGradient` from `expo-linear-gradient`
- `Ionicons` from `@expo/vector-icons`
- `NfcScanModal`, `BottomNav` components
- `authService` from services

**Copy to:** `app/studio/index.tsx`

---

### **app/create-album.tsx**
**Purpose:** Album creation screen with media uploads  
**Key Features:**
- Title, artist, description inputs
- Cover art upload (image picker)
- Track management (audio picker)
- Action buttons (Video, Photo, Text)
- Premium feature gating (Video locked)
- Publish to Store option
- Storage limit checks
- Integrates NfcScanModal for burning
- Integrates BottomNav

**Dependencies:**
- `expo-image-picker`
- `expo-document-picker`
- `storageService` for file uploads
- `firestoreService` for disc creation
- `authService` for premium checks

**Copy to:** `app/studio/create-album.tsx`

---

### **app/write-nfc.tsx**
**Purpose:** NFC writing screen  
**Key Features:**
- NFC tag writing
- NFC verification (checks manufacturing registry)
- URL generation with disc UID and nonce
- Dev mode simulation
- Success/error handling

**Dependencies:**
- `react-native-nfc-manager`
- `nfcService` for NFC operations
- `nfcVerificationService` for authentication
- `firestoreService` for logging

**Copy to:** `app/studio/write-nfc.tsx`

---

### **src/components/NfcScanModal.tsx**
**Purpose:** Animated NFC scan modal  
**Key Features:**
- Slide-up from bottom animation
- Pulsing blue orb
- Phone tapping animation
- Swipe-down gesture to dismiss
- Backdrop overlay
- Supports 'read' and 'write' modes

**Dependencies:**
- `Animated` API from React Native
- `PanResponder` for gestures
- `Ionicons` for icons

**Copy to:** `src/components/NfcScanModal.tsx`

---

### **src/components/BottomNav.tsx**
**Purpose:** Bottom navigation bar  
**Key Features:**
- Home, Burn (flame), Profile tabs
- Elevated flame button with animation
- Active state indicators
- Route detection with Expo Router
- Flame animation when scanning

**Dependencies:**
- `Animated` API from React Native
- `Ionicons` for icons
- `expo-router` for navigation

**Copy to:** `src/components/BottomNav.tsx`

---

### **src/components/AdBanner.tsx**
**Purpose:** Ad placeholder for free users  
**Key Features:**
- Shows "Upgrade to Pro" message
- Only visible to non-premium users
- Links to subscription screen

**Dependencies:**
- `authService` for premium check

**Copy to:** `src/components/AdBanner.tsx`

---

### **src/services/nfc.ts**
**Purpose:** NFC operations (read, write)  
**Key Features:**
- Initialize NFC manager
- Read NFC tags
- Write NDEF URL records
- Generate secure nonces
- Cleanup on unmount

**Dependencies:**
- `react-native-nfc-manager`

**Copy to:** `src/services/nfc.ts`

---

### **src/services/nfcVerification.ts**
**Purpose:** NFC tag authentication  
**Key Features:**
- Scan and collect tag metadata
- Verify against manufacturing registry
- Log all scan attempts
- Extract UID, manufacturer, tech info
- Development mode simulation

**Dependencies:**
- `react-native-nfc-manager`
- `firestoreService` for registry checks

**Copy to:** `src/services/nfcVerification.ts`

---

### **src/services/storage.ts**
**Purpose:** File upload and storage management  
**Key Features:**
- Upload images to Firebase Storage
- Upload audio files
- Generate unique file paths
- File size validation

**Dependencies:**
- Firebase Storage SDK
- `expo-file-system`

**Copy to:** `src/services/storage.ts`

---

### **src/services/payment.ts**
**Purpose:** Subscription management (simulated)  
**Key Features:**
- Subscription tier definitions
- Purchase simulation
- Cancel/restore subscriptions
- Check active subscription status

**Dependencies:**
- `firestoreService` for user updates

**Copy to:** `src/services/payment.ts`

---

### **src/services/firestore.ts**
**Purpose:** Database operations  
**Key Features:**
- User profile management
- Disc creation/retrieval
- Storage usage tracking
- NFC registry operations
- Disc scan logging
- Store publishing

**Collections:**
- `users` - User profiles
- `discs` - Created content
- `registeredDiscs` - Manufacturing registry
- `discScans` - Scan logs

**Copy to:** `src/services/firestore.ts` (merge with existing)

---

### **src/services/auth.ts**
**Purpose:** Authentication  
**Key Features:**
- Email/password sign in/up
- Anonymous auth
- Social auth placeholders (Google, Apple)
- Password reset
- Auth state listener
- Premium status check

**Copy to:** `src/services/auth.ts` (merge with existing)

---

### **app/subscription.tsx**
**Purpose:** Subscription management screen  
**Key Features:**
- Displays tier cards (Free, Pro, Business, Enterprise)
- Feature comparison
- Upgrade buttons
- Current plan indicator

**Copy to:** `app/studio/subscription.tsx`

---

### **app/dashboard.tsx**
**Purpose:** User dashboard  
**Key Features:**
- User profile display
- Subscription info
- Storage usage bar
- List of user's discs
- Sign out button

**Copy to:** `app/studio/dashboard.tsx` (or merge with existing)

---

### **app/store.tsx**
**Purpose:** Stream Disc store  
**Key Features:**
- Browse published albums
- Category filters
- "Buy Blank Discs" banner
- Album grid with cover art
- Cart icon

**Copy to:** `app/studio/store.tsx`

---

### **app/store/[discId].tsx**
**Purpose:** Store disc detail page  
**Key Features:**
- Album cover, title, artist
- Description
- Track list
- Quantity selector
- Purchase buttons

**Copy to:** `app/studio/store/[discId].tsx`

---

### **app/store/blank-discs.tsx**
**Purpose:** Blank discs purchase page  
**Key Features:**
- Package options (1, 5, 10, 25 discs)
- Pricing
- Discount badges
- Specifications

**Copy to:** `app/studio/store/blank-discs.tsx`

---

### **app/admin.tsx**
**Purpose:** Admin/testing tools  
**Key Features:**
- Seed test discs to registry
- Test NFC verification
- View Firebase project info
- Display scan data collection details

**Copy to:** `app/studio/admin.tsx`

---

### **app/blank-disc.tsx**
**Purpose:** Blank disc welcome screen  
**Key Features:**
- Deep link detection
- Animated disc icon
- Features list
- Download app CTA

**Copy to:** `app/studio/blank-disc.tsx`

---

### **app/auth/sign-in.tsx**
**Purpose:** Sign in screen  
**Key Features:**
- Email/password inputs
- "Forgot Password" link
- Social auth placeholders
- "Stream Disc Store" button

**Copy to:** `app/auth/sign-in.tsx` (or merge)

---

### **app/auth/sign-up.tsx**
**Purpose:** Sign up screen  
**Key Features:**
- Email/password/name inputs
- Social auth placeholders
- "Stream Disc Store" button

**Copy to:** `app/auth/sign-up.tsx` (or merge)

---

### **app/auth/forgot-password.tsx**
**Purpose:** Password reset screen  
**Key Features:**
- Email input
- Send reset email

**Copy to:** `app/auth/forgot-password.tsx` (or merge)

---

### **web-redirect/index.html**
**Purpose:** Landing page for https://stream-disc.web.app  
**Key Features:**
- Branding (Stream Disc logo)
- Description
- "Learn More" CTA

**Copy to:** `web-redirect/index.html`

---

### **web-redirect/redirect.html**
**Purpose:** Deep link redirect page  
**Key Features:**
- JavaScript deep link handler
- Attempts to open app
- Fallback to app store
- Platform detection (iOS/Android)
- Loading animation

**Copy to:** `web-redirect/redirect.html`

---

### **src/types/index.ts**
**Purpose:** TypeScript type definitions  
**Key Types:**
- `User` - User profile
- `Disc` - Album/content
- `Track` - Audio track
- `SubscriptionTier` - Free/Pro/Business/Enterprise

**Copy to:** `src/types/index.ts` (merge)

---

### **src/config/firebase.ts**
**Purpose:** Firebase initialization  
**Key Features:**
- Firebase config from env vars
- Fallback values
- Initialize Auth, Firestore, Storage

**Copy to:** `src/config/firebase.ts` (merge)

---

### **app.json**
**Purpose:** Expo configuration  
**Key Configurations:**
- App name: "Stream Disc Studio"
- NFC permissions (iOS/Android)
- Deep linking schemes
- Associated domains
- Intent filters

**Merge into:** Your main app's `app.json`

---

### **app.config.js**
**Purpose:** Dynamic Expo configuration  
**Key Configurations:**
- Web metadata
- SEO tags
- Social sharing

**Merge into:** Your main app's `app.config.js`

---

### **firebase.json**
**Purpose:** Firebase hosting configuration  
**Key Configurations:**
- Public directory: `web-redirect`
- Rewrites for `/a/**` paths

**Merge into:** Your main app's `firebase.json`

---

## 📦 Dependencies to Install

Add these to your main app's `package.json`:

```json
{
  "dependencies": {
    "react-native-nfc-manager": "^3.x",
    "expo-image-picker": "~14.x",
    "expo-document-picker": "~11.x",
    "expo-linear-gradient": "~12.x",
    "expo-dev-client": "~3.x"
  }
}
```

Then run:
```bash
npm install
```

---

## 🎨 Style Consistency

All Studio files follow these design principles:

### Colors:
- Background: `#000000` (black)
- Text: `#FFFFFF` (white)
- Subtle text: `#9A9A9A` (gray)
- Active: `#06FFA5` (mint) or `#FF3B30` (red for burn)
- Gradients: Various for content cards

### Typography:
- Headers: 24-28px, bold
- Body: 14-16px, regular
- Labels: 11-12px, medium

### Spacing:
- Container padding: 20-24px
- Element spacing: 12-16px
- Tight spacing: 8px

### Borders:
- Radius: 10-12px
- Width: 1-1.5px (when used)

### Icons:
- Size: 20-24px (nav), 18px (buttons), 14px (badges)
- Library: Ionicons
- Stroke: Outlined style

### Animations:
- Duration: 200-300ms
- Easing: Spring or ease-out
- Opacity changes: 0.5 for active states

---

## ✅ Verification Checklist

After copying files, verify:

- [ ] All files copied to correct locations
- [ ] Import paths updated
- [ ] Dependencies installed
- [ ] No TypeScript errors
- [ ] App compiles successfully
- [ ] NfcScanModal displays correctly
- [ ] BottomNav shows up
- [ ] Can navigate to Studio screens
- [ ] Styles look consistent
- [ ] Firebase services connect
- [ ] NFC permissions granted (device)

---

## 🔗 Quick Links

- **GitHub Branch**: https://github.com/superecomm/stream-disc-nfc-tool/tree/studio-migration
- **Migration Guide**: MIGRATION.md
- **Development Guide**: DEVELOPMENT_GUIDE.md
- **Branding**: LOGO_ASSETS.md

---

**Last Updated:** November 10, 2025

