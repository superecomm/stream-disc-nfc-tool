# Stream Disc Logo Assets

This document explains the logo assets and their usage throughout the project.

## Logo Files

### 1. **Full Logo with Text** (`streamdisc-logo-full.png`)
- **Dimensions**: Horizontal/wide format
- **Usage**: 
  - Splash screen background
  - Marketing materials
  - Website header
  - Email signatures
  - Print materials

### 2. **App Icon** (`icon.png`)
- **Dimensions**: Square (1024x1024 recommended)
- **Usage**:
  - iOS app icon
  - Android app icon (launcher)
  - App Store/Play Store listings
  - Notifications icon
  - Tab bar icons

### 3. **Banner Logo** (`streamdisc-banner.png`)
- **Dimensions**: Wide banner format (approximately 1200x400)
- **Usage**:
  - Social media sharing (Open Graph, Twitter Cards)
  - LinkedIn posts
  - Facebook/Instagram sharing
  - YouTube banners
  - Website OG images

### 4. **Compact Logo** (`streamdisc-compact.png`)
- **Dimensions**: Small square format
- **Usage**:
  - Favicon (16x16, 32x32, 64x64)
  - Browser tabs
  - Bookmarks
  - PWA icon
  - Small UI elements

## Asset Locations in Project

```
stream-disc-nfc-tool/
├── assets/
│   ├── icon.png                    # Main app icon (square logo)
│   ├── adaptive-icon.png           # Android adaptive icon
│   ├── splash-icon.png             # Splash screen logo
│   ├── favicon.png                 # Browser favicon
│   └── social-banner.png           # Social media sharing image
```

## Metadata Configuration

### App Configuration (app.json)

```json
{
  "expo": {
    "name": "Stream Disc",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#000000"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### Web Metadata (for Next.js fallback)

```typescript
export const metadata = {
  title: 'Stream Disc - NFC Music Sharing',
  description: 'Program NFC discs with music, videos, and photos. Share your content with a tap.',
  icons: {
    icon: '/favicon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Stream Disc',
    description: 'Program NFC discs with music, videos, and photos',
    images: ['/social-banner.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stream Disc',
    description: 'Program NFC discs with music, videos, and photos',
    images: ['/social-banner.png'],
  },
}
```

## Color Guidelines

### Primary Brand Colors
- **Background**: `#000000` (Pure Black)
- **Primary Accent**: `#FFFFFF` (White for logo)
- **Secondary Accent**: `#06FFA5` (Cyan/Green for interactive elements)

### Logo Usage Rules
1. ✅ Use logo on black background for best contrast
2. ✅ Maintain minimum clear space around logo (equal to height of "S")
3. ✅ Use white version on dark backgrounds
4. ✅ Use black version on light backgrounds (if needed)
5. ❌ Don't stretch or distort logo
6. ❌ Don't add drop shadows or effects
7. ❌ Don't change logo colors (except white/black inversion)
8. ❌ Don't place on busy backgrounds

## Platform-Specific Requirements

### iOS
- **App Icon**: 1024x1024px (PNG, no transparency)
- **Splash Screen**: 2048x2732px (supports all devices)
- **Share Extension**: 60x60px, 76x76px, 120x120px

### Android
- **Launcher Icon**: 512x512px (PNG with transparency)
- **Adaptive Icon**: 
  - Foreground: 108x108dp (432x432px)
  - Background: Solid color `#000000`
- **Notification Icon**: 24x24dp (monochrome)

### Web
- **Favicon**: 16x16px, 32x32px, 64x64px (ICO or PNG)
- **Apple Touch Icon**: 180x180px
- **OG Image**: 1200x630px (for social sharing)
- **Twitter Card**: 1200x675px

## Export Specifications

When exporting logo assets:

1. **App Icons**: PNG, sRGB color space, no transparency
2. **Splash Screens**: PNG, transparent background (logo centered)
3. **Social Images**: PNG or JPG, 72 DPI minimum
4. **Web Icons**: PNG with transparency where appropriate

## Asset Generation Commands

To generate all required asset sizes, you can use:

```bash
# Install sharp-cli for image processing
npm install -g sharp-cli

# Generate iOS icons
sharp -i icon.png -o icon-60.png resize 60 60
sharp -i icon.png -o icon-76.png resize 76 76
sharp -i icon.png -o icon-120.png resize 120 120
sharp -i icon.png -o icon-152.png resize 152 152
sharp -i icon.png -o icon-180.png resize 180 180

# Generate favicons
sharp -i favicon.png -o favicon-16.png resize 16 16
sharp -i favicon.png -o favicon-32.png resize 32 32
sharp -i favicon.png -o favicon-64.png resize 64 64

# Generate Android icons
sharp -i adaptive-icon.png -o adaptive-icon-432.png resize 432 432
```

## HTML Meta Tags (for Web Fallback)

```html
<!-- Basic Meta Tags -->
<meta name="application-name" content="Stream Disc">
<meta name="description" content="Program NFC discs with music, videos, and photos. Share your content with a tap.">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/icon.png">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://app.streamdisc.com">
<meta property="og:title" content="Stream Disc - NFC Music Sharing">
<meta property="og:description" content="Program NFC discs with music, videos, and photos">
<meta property="og:image" content="https://app.streamdisc.com/social-banner.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://app.streamdisc.com">
<meta property="twitter:title" content="Stream Disc - NFC Music Sharing">
<meta property="twitter:description" content="Program NFC discs with music, videos, and photos">
<meta property="twitter:image" content="https://app.streamdisc.com/social-banner.png">

<!-- PWA -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#000000">
```

## Brand Guidelines

### Typography
- **Primary Font**: System default (SF Pro on iOS, Roboto on Android)
- **Font Weights**: 400 (Regular), 600 (Semi-Bold), 700 (Bold)
- **Letter Spacing**: -0.3 to -0.5 for headings

### Spacing
- Use multiples of 8px (8, 16, 24, 32, etc.)
- Minimum logo padding: 16px on mobile, 24px on desktop

### Voice & Tone
- Professional yet approachable
- Clear and concise
- Focus on creativity and sharing

---

**Logo Version**: 1.0  
**Last Updated**: November 10, 2024  
**Brand Manager**: Stream Disc Team

