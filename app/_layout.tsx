import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDeepLinking } from '../src/hooks/useDeepLinking';

// Lazy import services to prevent initialization errors
let authService: any = null;

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize deep linking
  useDeepLinking();

  useEffect(() => {
    async function initializeApp() {
      try {
        // Import services dynamically
        const { authService: auth } = await import('../src/services/auth');
        authService = auth;
        
        // Initialize authentication
        await authService.initialize();
        
        setIsReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
        // Continue anyway to show the app
        setIsReady(true);
      }
    }

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06FFA5" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    console.warn('App started with error:', error);
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create-album" />
        <Stack.Screen name="write-nfc" />
        <Stack.Screen name="success" />
        <Stack.Screen name="blank-disc" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="store" />
        <Stack.Screen name="stream-disc-app" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="album/[albumId]" />
        <Stack.Screen name="[contentId]" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
});

