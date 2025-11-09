# EAS Build Guide

## Prerequisites

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure your project:**
   ```bash
   eas build:configure
   ```

## Important Files

✅ **google-services.json** - Added to project root and tracked by git
✅ **eas.json** - Build configuration created
✅ **app.json** - Updated with:
   - Package name: `com.streamdisc.app` (matches google-services.json)
   - Google services file path configured
   - Deep linking and universal links configured

## Build Commands

### Development Build (for testing)
```bash
eas build --profile development --platform android
```

### Preview Build (APK for distribution)
```bash
eas build --profile preview --platform android
```

### Production Build (for Play Store)
```bash
eas build --profile production --platform android
```

## Build Process

1. **First Time Setup:**
   ```bash
   # Login
   eas login
   
   # Initialize project (if needed)
   eas build:configure
   ```

2. **Build APK:**
   ```bash
   eas build --profile preview --platform android
   ```

3. **Download & Install:**
   - Wait for build to complete (~10-20 minutes)
   - Download APK from Expo dashboard or provided link
   - Install on Android device with NFC support

## Key Configuration Details

### Package Name
- **Android Package:** `com.streamdisc.app`
- **iOS Bundle ID:** `com.streamdisc.nfctool` (if iOS is added later)

### Firebase Integration
- google-services.json is now tracked by git (required for EAS Build)
- Environment variables are loaded from .env file
- Firebase services configured: Auth, Firestore, Storage

### Deep Linking
- App Scheme: `streamdisc://`
- Universal Links: `https://app.streamdisc.com`
- Intent filters configured for Android

## Troubleshooting

### Build Fails with "google-services.json missing"
✅ **Fixed!** - File is now tracked by git and referenced in app.json

### Build Fails with Package Name Mismatch
✅ **Fixed!** - Package name updated to match google-services.json

### Need to Update google-services.json
If you need to update the Firebase configuration:
1. Download new google-services.json from Firebase Console
2. Replace the existing file in project root
3. Commit the changes: `git add google-services.json && git commit -m "Update google-services.json"`
4. Rebuild: `eas build --profile preview --platform android`

## Testing NFC Functionality

After installing the APK:
1. Enable NFC on your Android device
2. Open Stream Disc app
3. Create an album with test content
4. Hold a blank NFC tag near your phone
5. Verify the tag was written successfully
6. Test tapping the tag to open the album

## Submission to Play Store

When ready for production:
1. **Build AAB:**
   ```bash
   eas build --profile production --platform android
   ```

2. **Update Build Configuration:**
   - Change `buildType` to `"aab"` in eas.json for production profile
   
3. **Submit:**
   ```bash
   eas submit --platform android
   ```

## Links & Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Firebase Console](https://console.firebase.google.com)
- [Expo Dashboard](https://expo.dev)

## Notes

- Build artifacts are stored for 30 days on Expo's servers
- Free tier includes limited builds per month
- For frequent builds, consider upgrading to Expo's paid plan
- Always test APK on real device with NFC before production release

