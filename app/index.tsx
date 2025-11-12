import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to player home screen (the main music feed)
    router.replace('/player-home');
  }, []);

  // Show splash screen while redirecting
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/stream-disc-logo-white.png')}
        style={styles.logo}
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

