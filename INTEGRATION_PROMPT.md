# 🚀 Quick Start: Integrate Studio into Main App

## Step 1: Open Your Main Stream Disc Player App in Cursor

## Step 2: Use This Exact Prompt

Copy and paste this into Cursor Agent:

---

**PROMPT:**

```
I want to integrate the sophisticated Studio features from this repository branch:
https://github.com/superecomm/stream-disc-nfc-tool/tree/studio-migration

Please read and follow the comprehensive MIGRATION.md guide located in that branch.

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
1. Copy all Studio files from the branch to appropriate locations in this app
2. Copy screens to app/studio/ directory
3. Copy components to src/components/
4. Copy services to src/services/ (merge with existing auth/firestore services)
5. Add Studio tab to main navigation with flame icon
6. Update app.json with NFC permissions and deep linking configuration
7. Install required dependencies (react-native-nfc-manager, expo-image-picker, expo-document-picker)
8. Ensure all imports resolve correctly
9. Connect Studio's album creation to this Player app's playback system
10. Update NFC deep links to launch this Player app (not the Studio app)
11. Replace our existing basic studio flow with this sophisticated version
12. Maintain all minimal UI styles (thin icons, no shadows, subtle animations)
13. Keep subscription gating (premium features locked)
14. Preserve storage management (2GB free, 5GB Pro, 30GB Business)

Key files to prioritize:
- MIGRATION.md (read this first for complete instructions)
- STUDIO_FILES_MANIFEST.md (detailed file descriptions)
- src/components/NfcScanModal.tsx
- src/components/BottomNav.tsx
- app/index.tsx (Studio home)
- app/create-album.tsx
- src/services/nfc.ts
- src/services/nfcVerification.ts

After integration, the flow should be:
User taps NFC → Firebase redirect → Opens in this Player app → Album plays

Start by:
1. Reading MIGRATION.md from the branch
2. Analyzing both codebases (this app and the Studio branch)
3. Creating a detailed integration plan
4. Executing the migration step-by-step
5. Testing that everything works

Please begin by fetching and reading the MIGRATION.md file from the studio-migration branch.
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

