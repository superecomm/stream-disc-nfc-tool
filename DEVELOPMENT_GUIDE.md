# Stream Disc Studio - Development Guide

## Firebase Project Information

### Project Details
- **Project ID**: `stream-disc`
- **Project Name**: Stream Disc
- **Console URL**: https://console.firebase.google.com/project/stream-disc

### Firestore Collections

1. **`users`** - User profiles and account data
   - Stores: subscriptionTier, storageUsed, storageLimit, isPremium, etc.

2. **`discs`** - Created Stream Disc content
   - Stores: albums, mixtapes, and all user-created content
   - Fields: title, artist, description, coverImage, tracks, nfcInfo, etc.

3. **`registeredDiscs`** - Manufacturing Registry
   - Stores: All authentic Stream Discs manufactured
   - Fields: uid (NFC chip ID), serialNumber, manufacturedDate, isProgrammed, etc.
   - **Purpose**: Verify if an NFC tag is a genuine Stream Disc

4. **`discScans`** - NFC Scan Logs
   - Stores: Every NFC scan event with full metadata
   - Fields: discUid, scannedAt, metadata (technology, manufacturer, ATQA, SAK, etc.)
   - **Purpose**: Track usage, analytics, and troubleshooting

### What Data is Collected from NFC Scans?

When an NFC tag is scanned, the app collects:
- **UID** (Unique Identifier): The NFC chip's unique ID
- **Manufacturer**: NFC chip manufacturer information
- **Technology**: NFC technology type (e.g., NfcA, Ndef)
- **Max Size**: Maximum storage capacity of the tag
- **ATQA**: Answer to Request Type A (NFC protocol data)
- **SAK**: Select Acknowledge (NFC protocol data)
- **Type**: Chip type (e.g., NTAG216, NTAG213)
- **Scan Timestamp**: When the scan occurred
- **NDEF Records**: Any data written to the tag

All this data is logged to the `discScans` collection in Firestore.

---

## How to Update the App on Your Phone

### Option 1: Build with EAS (Recommended for NFC Testing)

1. **Build the app**:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

2. **Wait for build to complete** (usually 10-15 minutes)
   - EAS will provide a URL to track build progress
   - You'll get a download link when ready

3. **Download and install the APK**:
   - Open the download link on your phone
   - Install the new APK
   - Grant permissions when prompted

### Option 2: Local Development (Faster, but NFC won't work)

1. **Start Metro bundler**:
   ```bash
   npx expo start
   ```

2. **Scan QR code with Expo Go app**
   - Changes will hot-reload automatically
   - **Note**: NFC features won't work in Expo Go

---

## Testing NFC Verification

### Step 1: Seed Test Stream Discs

1. Open the app
2. Tap the profile icon in the top right
3. Go to "Admin / Test Tools"
4. Tap "Seed Test Stream Discs"
5. This adds 3 test discs to the manufacturing registry:
   - `SD-TEST-12345` (blank, valid)
   - `SD-TEST-67890` (blank, valid)
   - `SD-DEMO-PROGRAMMED` (programmed, valid)

### Step 2: Test Verification

#### Test a Valid Disc:
- In Admin Tools, tap "Test Valid Disc"
- This simulates scanning a registered Stream Disc
- Should show: "Valid Stream Disc detected. Ready to program!"

#### Test an Invalid Disc:
- In Admin Tools, tap "Test Invalid Disc"
- This simulates scanning an unregistered NFC tag
- Should show: "Not a Stream Disc. This NFC tag is not registered in our system."

### Step 3: Scan Real NFC Tags

1. Create an album in the app
2. Tap "Burn to Stream Disc"
3. Hold your phone near an NFC tag
4. The app will:
   - Scan the tag
   - Collect all metadata
   - Check against the `registeredDiscs` collection
   - Log the scan to `discScans`
   - If valid: proceed to write
   - If invalid: show "Not a Stream Disc" message

---

## How to Add a Stream Disc to the Manufacturing Registry

### Manually Add a Disc (for testing):

You can add discs directly in Firebase Console:

1. Go to https://console.firebase.google.com/project/stream-disc/firestore
2. Navigate to `registeredDiscs` collection
3. Click "Add document"
4. Set fields:
   - **Document ID**: (auto-generate)
   - **uid**: The NFC chip's UID (e.g., "04:1A:2B:3C:4D:5E:6F")
   - **serialNumber**: A unique serial (e.g., "SD-2024-00001")
   - **manufacturedDate**: Timestamp of manufacture
   - **isProgrammed**: `false` (for blank discs)
   - **batchNumber**: Optional batch identifier
   - **registeredAt**: Current timestamp

### Programmatically (in production):

When Stream Discs are manufactured, they should be registered in bulk:

```typescript
await firestoreService.registerStreamDisc({
  uid: nfcChipUid,
  serialNumber: `SD-${year}-${sequentialNumber}`,
  manufacturedDate: new Date(),
  batchNumber: 'BATCH-001',
});
```

---

## UI Design Guidelines

The app follows a **minimal, professional, ChatGPT-inspired design**:

### Design Specs:
- **Icon Library**: Ionicons (thin, outlined icons)
- **Icon Size**: 18-24px (smaller for compact areas)
- **Padding**: 6-12px (minimal touch targets)
- **Stroke Weight**: Thin, crisp lines
- **Colors**: 
  - Text: `#FFFFFF` (white)
  - Secondary: `#9A9A9A` (gray)
  - Accent: `#06FFA5` (green)
  - Error: `#FF3B30` (red)
- **Container Radius**: 10-12px
- **Active Feedback**: Opacity 0.5 on press
- **Shadow/Glow**: None (pure flat design)
- **Bottom Padding**: 100px to prevent phone UI overlap

---

## Common Issues

### App crashes on startup
- Check Firebase config in `src/config/firebase.ts`
- Ensure all environment variables are set

### NFC not working
- Make sure you're using an EAS build (not Expo Go)
- Check `app.json` for NFC permissions
- Android only: Requires Android 5.0+ with NFC hardware

### "Not a Stream Disc" error
- The NFC tag must be in the `registeredDiscs` collection
- Use Admin Tools to seed test discs first
- Check Firestore console to verify registration

### Storage limit errors
- Free tier: 2GB limit
- Pro: 5GB, Business: 30GB, Enterprise: 30GB+
- Check user's storage in dashboard

---

## Next Steps

1. **Test the UI improvements** - Check button sizes and spacing
2. **Scan real NFC tags** - Test the verification system
3. **Refine scanning UI** - Improve the NFC scanning experience
4. **Add more content types** - Implement Film, Podcast, etc.
5. **Payment integration** - Connect subscription flow to Stripe/RevenueCat
6. **Polish onboarding** - Add welcome screens and tutorials

