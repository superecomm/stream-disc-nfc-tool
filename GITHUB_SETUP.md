# GitHub Repository Setup Instructions

## Create GitHub Repository

1. Go to https://github.com/new
2. Set repository name: `stream-disc-nfc-tool`
3. Add description: "Mobile app for programming NFC Stream Discs with music and creative content"
4. Choose visibility: Public or Private
5. **Do NOT initialize with README, .gitignore, or license** (we already have these)
6. Click "Create repository"

## Push to GitHub

After creating the repository, run these commands:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/stream-disc-nfc-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create stream-disc-nfc-tool --public --source=. --remote=origin --push
```

## Verify

After pushing, your repository should be live at:
`https://github.com/YOUR_USERNAME/stream-disc-nfc-tool`

## Next Steps

1. Set up branch protection rules (optional)
2. Add collaborators (optional)
3. Configure GitHub Actions for CI/CD (optional)
4. Set repository topics: `nfc`, `react-native`, `expo`, `firebase`, `music`, `android`

