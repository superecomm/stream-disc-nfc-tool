# Stream Disc Assets

## Required Image

### nfc-tap.png
**Location:** `assets/images/nfc-tap.png`

**Description:** 
The NFC tap illustration showing a hand holding a phone near a Stream Disc with NFC waves. This image is displayed when a blank Stream Disc is detected.

**Specifications:**
- Format: PNG (with transparency)
- Recommended size: 300x300px or larger
- Should show: 
  - Stream Disc logo/branding
  - Phone with NFC icon/waves
  - Hand holding phone
  - Professional, clean design

**Usage:**
Used in `src/components/NfcScanModal.tsx` when `showBlankDiscImage` is true.

**Note:** 
Please place the actual NFC tap image (the one you provided) as `nfc-tap.png` in this directory.

## How to Add the Image

1. Save your NFC tap image as `nfc-tap.png`
2. Place it in `assets/images/` directory
3. The app will automatically load it

The image will be displayed at 300x300px with a success checkmark overlay when a blank disc is detected.

