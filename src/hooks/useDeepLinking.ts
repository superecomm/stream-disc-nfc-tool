import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';

/**
 * Deep Link Handler Component
 * 
 * Handles incoming deep links from NFC tags:
 * - streamdiscplayer://album/{albumId}
 * - https://stream-disc.web.app/a/{albumId}
 * - https://app.streamdiscplayer.com/a/{albumId}
 */
export function useDeepLinking() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Handle initial URL (app opened from deep link)
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Handle URL while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      console.log('Deep link received:', url);

      const parsed = Linking.parse(url);
      console.log('Parsed URL:', parsed);

      // Handle album routes
      // Format: /a/{albumId} or /album/{albumId}
      if (parsed.path) {
        const pathParts = parsed.path.split('/').filter(Boolean);
        
        // Handle /a/{albumId} format (from NFC tags)
        if (pathParts[0] === 'a' && pathParts[1]) {
          const albumId = pathParts[1];
          console.log('Navigating to album:', albumId);
          router.push(`/album/${albumId}` as any);
          return;
        }

        // Handle /album/{albumId} format (direct)
        if (pathParts[0] === 'album' && pathParts[1]) {
          const albumId = pathParts[1];
          console.log('Navigating to album:', albumId);
          router.push(`/album/${albumId}` as any);
          return;
        }
      }

      // Handle query parameters (e.g., ?albumId=xxx)
      if (parsed.queryParams?.albumId) {
        const albumId = parsed.queryParams.albumId as string;
        console.log('Navigating to album from query:', albumId);
        router.push(`/album/${albumId}` as any);
        return;
      }

      console.log('No album route found in deep link');
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };
}

