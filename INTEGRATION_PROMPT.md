# 🚀 Quick Start: Integrate Studio into Main App

## Step 1: Open Your Main Stream Disc Player App in Cursor

## Step 2: Use This Exact Prompt

Copy and paste this into Cursor Agent:

---

**PROMPT:**

```
I want to integrate the sophisticated Studio features from this repository branch:
https://github.com/superecomm/stream-disc-nfc-tool/tree/studio-migration

⚠️ CRITICAL: First read MAIN_APP_INTEGRATION.md for main app-specific requirements!
Then follow the comprehensive MIGRATION.md guide.

The Studio app provides:
- Album/Mixtape creation with NFC burning
- Professional minimal UI with ChatGPT-inspired design
- NFC scan modal with slide-up animation and pulsing orb
- Bottom navigation with animated flame button
- Subscription management (Free, Pro, Business, Enterprise)
- Stream Disc store for published content
- Storage management with tier limits
- Admin/testing tools

Integration requirements:
1. ⚠️ DO NOT COPY BottomNav.tsx - Main app has its own navigation
2. Studio accessed via Plus (+) button, NOT a separate tab
3. Replace TAP icon with FIRE LOGO in NfcScanModal
4. Update Firebase collection names in firestore.ts to match main app
5. Remove Studio home button - use main app's Home for player
6. Copy Studio content cards to trigger from Plus (+) button
7. Replace old NFC flow completely with Studio's flow
8. Install dependencies (react-native-nfc-manager, expo-image-picker, expo-document-picker)
9. Update app.json with NFC permissions only
10. Connect Studio's album creation to main Player app's library
11. Maintain all minimal UI styles (thin icons, no shadows, subtle animations)
12. Keep subscription gating (premium features locked)
13. Map Studio schema to main app schema if field names differ

Key files to prioritize:
- ⚠️ MAIN_APP_INTEGRATION.md (READ THIS FIRST - critical navigation/Firebase details)
- MIGRATION.md (complete instructions)
- STUDIO_FILES_MANIFEST.md (detailed file descriptions)
- src/components/NfcScanModal.tsx (modify with fire logo)
- app/index.tsx (Studio content cards - trigger from Plus button)
- app/create-album.tsx
- src/services/nfc.ts
- src/services/nfcVerification.ts

⚠️ DO NOT COPY:
- src/components/BottomNav.tsx (main app has its own navigation)

After integration, the flow should be:
Plus (+) button → Studio cards → Create album → Burn button → NFC modal (fire logo) → Write → Album in Player library

Start by:
1. Reading MAIN_APP_INTEGRATION.md (CRITICAL navigation and Firebase details)
2. Reading MIGRATION.md (complete guide)
3. Analyzing both codebases (this app and the Studio branch)
4. Creating a detailed integration plan
5. Executing the migration step-by-step
6. Testing that everything works

Please begin by fetching and reading the MAIN_APP_INTEGRATION.md file first, then MIGRATION.md from the studio-migration branch.
```

---

## Step 3: Let Cursor Agent Work

The agent will:
1. ✅ Fetch files from the GitHub branch
2. ✅ Read MIGRATION.md and STUDIO_FILES_MANIFEST.md
3. ✅ Analyze your main app structure
4. ✅ Copy all Studio files to appropriate locations
5. ✅ Update imports and paths
6. ✅ Merge configuration files
7. ✅ Install dependencies
8. ✅ Connect Studio to Player functionality
9. ✅ Test the integration

## Step 4: Verify Integration

After Cursor completes, check:
- [ ] Studio tab appears in navigation
- [ ] Can create albums
- [ ] NFC scan modal works
- [ ] Bottom nav shows flame button
- [ ] All styles look consistent
- [ ] App compiles without errors

## Step 5: Build and Test

```bash
# Build preview APK for testing
npx eas-cli build --profile preview --platform android

# Test the full flow:
# 1. Create album in Studio
# 2. Burn to NFC
# 3. Tap NFC tag
# 4. Album opens in Player
```

---

## 🔗 Resources

- **Branch URL**: https://github.com/superecomm/stream-disc-nfc-tool/tree/studio-migration
- **Migration Guide**: MIGRATION.md in the branch
- **File Manifest**: STUDIO_FILES_MANIFEST.md in the branch
- **Development Guide**: DEVELOPMENT_GUIDE.md in the branch

---

## 💡 Tips

- Let the agent read the documentation first
- It will create a plan before executing
- Review the plan and approve if it looks good
- The agent will preserve your existing code
- Studio will be added as a new section, not replace everything

---

## 🆘 If Issues Arise

If Cursor has trouble accessing the GitHub branch:

**Fallback Option:**
```
Clone the Studio repo locally, then tell Cursor:
"I have the Studio app at ../stream-disc-nfc-tool on branch studio-migration. 
Please integrate it following the MIGRATION.md guide in that directory."
```

---

**Ready to integrate! 🎉**

