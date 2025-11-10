# Stream Disc Studio Assets

This folder contains all visual assets for the Stream Disc Studio app.

## Branding

- **Company**: Stream Disc
- **App Name**: Stream Disc Studio
- **Internal Project**: stream-disc-nfc-tool (code reference only)

## How to Add the Logo Files

You've provided 4 logo variants. Here's how to integrate them:

### 1. **Full Horizontal Logo** (First image)
- Save as: `splash-icon.png`
- Recommended size: 2048x2732px (or original aspect ratio)
- Usage: Splash screen when app launches

### 2. **Square Icon Logo** (Second image)
- Save as: `icon.png`
- Required size: 1024x1024px
- Usage: App icon on home screen

### 3. **Wide Banner Logo** (Third image)
- Save as: `social-banner.png`
- Recommended size: 1200x630px (OG image standard)
- Usage: Social media sharing, web previews

### 4. **Compact Logo** (Fourth image)
- Save as: `favicon.png`
- Recommended size: 64x64px (will be resized for 16x16, 32x32)
- Usage: Browser favicon, small UI elements

### 5. **Android Adaptive Icon**
- Save as: `adaptive-icon.png`
- Required size: 1024x1024px (same as icon.png but with padding)
- Usage: Android launcher icon with safe zone

## Quick Setup Instructions

```bash
# Navigate to assets folder
cd assets

# Replace existing placeholder files with your logo files:
# 1. Copy your square logo → icon.png (1024x1024)
# 2. Copy your square logo → adaptive-icon.png (1024x1024 with padding)
# 3. Copy your horizontal logo → splash-icon.png (high resolution)
# 4. Copy your compact logo → favicon.png (64x64 or smaller)
# 5. Copy your banner logo → social-banner.png (1200x630)
```

## Asset Specifications

| File | Dimensions | Format | Purpose |
|------|-----------|---------|---------|
| `icon.png` | 1024x1024 | PNG | iOS/Android app icon |
| `adaptive-icon.png` | 1024x1024 | PNG | Android adaptive icon |
| `splash-icon.png` | 2048x2732 | PNG | Splash screen |
| `favicon.png` | 64x64 | PNG | Web favicon |
| `social-banner.png` | 1200x630 | PNG/JPG | Social sharing |

## Color Requirements

- **Background**: Transparent for icons, black (#000000) for splash
- **Logo Color**: White (#FFFFFF) works best on black background
- **Format**: PNG with transparency (except splash which can have black bg)

## Automated Asset Generation

If you have a high-resolution logo, you can generate all sizes automatically:

```bash
# Install sharp-cli globally
npm install -g sharp-cli

# Generate from a master logo file
sharp -i master-logo.png -o icon.png resize 1024 1024
sharp -i master-logo.png -o adaptive-icon.png resize 1024 1024
sharp -i master-logo-horizontal.png -o splash-icon.png resize 2048 2732
sharp -i master-logo-compact.png -o favicon.png resize 64 64
sharp -i master-logo-banner.png -o social-banner.png resize 1200 630
```

## Validation Checklist

After adding your logos, verify:

- [ ] All files are in PNG format
- [ ] Icon and adaptive-icon are exactly 1024x1024px
- [ ] Logo is centered with adequate padding
- [ ] Logo is visible on black background
- [ ] No transparency issues on icons
- [ ] File sizes are reasonable (<1MB each)

## Testing

1. **iOS**: Check icon in Simulator home screen
2. **Android**: Check adaptive icon shape (circle, squircle, rounded square)
3. **Splash**: Verify logo appears centered on black background
4. **Web**: Check favicon in browser tab

## Troubleshooting

### Icon not showing up?
- Clear Expo cache: `npx expo start -c`
- Rebuild the app: `npx expo run:android` or `npx expo run:ios`

### Icon looks pixelated?
- Ensure source file is at least 1024x1024px
- Use PNG format, not JPG
- Check DPI is at least 72

### Splash screen looks wrong?
- Verify image is high resolution (at least 2048px on longest side)
- Check backgroundColor is set to "#000000" in app.json
- Ensure resizeMode is "contain"

### Adaptive icon cutoff on Android?
- Add 20% padding around the logo
- Keep important elements in the center 66% of the canvas
- Use `npx expo prebuild` to preview

## Current Files

The following files should be in this folder:

```
assets/
├── icon.png                 # 1024x1024 - App icon
├── adaptive-icon.png        # 1024x1024 - Android adaptive
├── splash-icon.png          # 2048x2732 - Splash screen
├── favicon.png              # 64x64 - Web favicon
├── social-banner.png        # 1200x630 - Social sharing (to be added)
└── README.md               # This file
```

## Need Help?

- [Expo Assets Documentation](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [Open Graph Image Guidelines](https://ogp.me/)

---

**Remember**: After replacing assets, restart Expo dev server with `npx expo start -c` to see changes!

