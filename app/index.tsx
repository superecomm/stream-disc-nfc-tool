import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { authService } from '../src/services/auth';

export default function IndexScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth and redirect after splash
    const initializeApp = async () => {
      try {
        // Wait for splash animation (2 seconds minimum)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user is signed in
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
          // No user, show sign-in screen
          router.replace('/auth/sign-in');
        } else {
          // User exists, go to home feed
          router.replace('/player-home');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // On error, go to sign-in to be safe
        router.replace('/auth/sign-in');
      }
    };

    initializeApp();
  }, []);

  // Show splash screen with animation
  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/stream-disc-logo-white.png')}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

