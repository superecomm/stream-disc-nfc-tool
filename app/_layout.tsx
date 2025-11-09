import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { authService } from '../src/services/auth';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  useEffect(() => {
    // Initialize anonymous authentication
    authService.initialize().catch(console.error);
  }, []);

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
        <Stack.Screen name="[contentId]" />
      </Stack>
    </>
  );
}

