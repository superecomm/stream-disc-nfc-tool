export default {
  name: 'Stream Disc Studio',
  slug: 'stream-disc-nfc-tool',
  owner: 'superecomm',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'streamdisc',
  newArchEnabled: false,
  
  // Splash screen configuration
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  
  // Asset bundling
  assetBundlePatterns: ['**/*'],
  
  // iOS configuration
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.streamdisc.nfctool',
    associatedDomains: ['applinks:app.streamdisc.com'],
    infoPlist: {
      NFCReaderUsageDescription: 'This app uses NFC to program Stream Discs with your content',
      NSPhotoLibraryUsageDescription: 'This app needs access to your photos to add cover art to your Stream Discs',
      NSMicrophoneUsageDescription: 'This app needs access to your microphone to record audio content',
    },
    buildNumber: '1',
  },
  
  // Android configuration
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    package: 'com.streamdisc.app',
    googleServicesFile: './google-services.json',
    permissions: [
      'android.permission.NFC',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_AUDIO',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'app.streamdisc.com',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
      {
        action: 'NDEF_DISCOVERED',
        data: [
          {
            scheme: 'https',
            host: 'app.streamdisc.com',
          },
        ],
        category: ['DEFAULT'],
      },
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    versionCode: 1,
  },
  
  // Web configuration
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'static',
    meta: {
      name: 'Stream Disc Studio - Create & Share NFC-enabled Discs',
      description: 'Create music albums, videos, photos and more on NFC-enabled Stream Discs.',
      themeColor: '#000000',
    },
  },
  
  // Plugins
  plugins: ['expo-router', 'expo-font'],
  
  // Extra configuration
  extra: {
    router: {
      origin: 'https://app.streamdisc.com',
    },
    eas: {
      projectId: 'd889fbc1-0d02-4251-b2e9-d9aebd9ac247',
    },
  },
};

