# Stream Disc NFC Tool

A mobile app for programming blank NFC Stream Discs with music, albums, and other creative content.

## Features

- 🎵 Create music albums with cover art and tracks
- 📱 Write content to NFC tags using NDEF format
- 🔗 Deep linking support for seamless app/web experience
- 🔥 Firebase backend for storage and data management
- 🎨 Beautiful, modern UI with dark theme
- 🌐 Web fallback for users without the app

## Tech Stack

- **Mobile**: Expo (React Native) with TypeScript
- **NFC**: react-native-nfc-manager
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deep Linking**: Expo deep linking + Universal Links
- **Web Fallback**: Next.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Android device with NFC support (for testing)
- Firebase project set up

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stream-disc-nfc-tool.git
cd stream-disc-nfc-tool
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Firebase credentials:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

5. Run on Android:
```bash
npm run android
```

## Project Structure

```
stream-disc-nfc-tool/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Home/welcome screen
│   ├── create-album.tsx   # Album creation form
│   ├── write-nfc.tsx      # NFC writing interface
│   ├── success.tsx        # Success confirmation
│   ├── blank-disc.tsx     # Blank disc welcome page
│   ├── [contentId].tsx    # Content viewer
│   └── _layout.tsx        # Root layout
├── src/
│   ├── config/
│   │   └── firebase.ts    # Firebase configuration
│   ├── services/
│   │   ├── auth.ts        # Authentication service
│   │   ├── storage.ts     # Firebase Storage service
│   │   ├── firestore.ts   # Firestore database service
│   │   └── nfc.ts         # NFC reading/writing service
│   ├── components/        # Reusable components
│   └── types/             # TypeScript types
├── web-fallback/          # Next.js web fallback app
└── README.md
```

## NFC URL Format

Stream Discs use NDEF URL records with the following format:

```
https://app.streamdisc.com/a/<contentId>?d=<discUID>&n=<nonce>
```

- **contentId**: Unique identifier for the content in Firestore
- **discUID**: NFC chip unique identifier
- **nonce**: Random string to prevent cloning/tracking

## Data Model

### Firestore Collection: `discs`

```typescript
{
  id: string;
  type: 'album' | 'mixtape' | 'film' | 'podcast' | ...;
  title: string;
  artist: string;
  coverImage: string; // Firebase Storage URL
  tracks: Array<{
    title: string;
    fileUrl: string;
    duration: number;
    order: number;
  }>;
  createdBy: string | null; // userId or null for anonymous
  createdAt: Date;
  nfcUrl?: string;
  discUID?: string;
  nonce?: string;
}
```

## Development

### Testing NFC

To test NFC functionality, you'll need:
1. An Android device with NFC enabled
2. Blank NFC tags (NTAG213, NTAG215, or NTAG216 recommended)
3. The app installed on your device

### Building for Production

```bash
# Android
eas build --platform android

# iOS (requires Mac)
eas build --platform ios
```

## Web Fallback

The web fallback app is located in the `web-fallback` directory. To run it locally:

```bash
cd web-fallback
npm install
npm run dev
```

Deploy to Vercel or Firebase Hosting at `app.streamdisc.com`.

## Roadmap

- [ ] iOS support for NFC writing
- [ ] User account management (upgrade from anonymous)
- [ ] Analytics dashboard (plays, scans)
- [ ] Additional content types (mixtape, film, podcast, audiobook)
- [ ] External streaming links (Spotify, Apple Music, SoundCloud)
- [ ] Disc transfer/ownership management
- [ ] QR code fallback for non-NFC devices
- [ ] Batch disc programming

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For support, email support@streamdisc.com or open an issue on GitHub.

