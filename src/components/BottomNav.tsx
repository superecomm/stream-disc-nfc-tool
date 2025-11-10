import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface BottomNavProps {
  onBurnPress: () => void;
  isScanning?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onBurnPress, isScanning = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;

  // Animate flame when scanning
  useEffect(() => {
    if (isScanning) {
      // Pulsing scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Subtle rotate animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameRotate, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(flameRotate, {
            toValue: -1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(flameRotate, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      flameScale.stopAnimation();
      flameRotate.stopAnimation();
      Animated.parallel([
        Animated.timing(flameScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(flameRotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isScanning]);

  const rotation = flameRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const isHome = pathname === '/' || pathname === '/index';
  const isDashboard = pathname === '/dashboard';

  return (
    <View style={styles.container}>
      {/* Left: Home */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/')}
        activeOpacity={0.6}
      >
        <Ionicons
          name={isHome ? 'home' : 'home-outline'}
          size={26}
          color={isHome ? '#FFFFFF' : '#9A9A9A'}
        />
      </TouchableOpacity>

      {/* Center: Burn Button (Elevated) */}
      <View style={styles.burnButtonContainer}>
        <TouchableOpacity
          style={styles.burnButton}
          onPress={onBurnPress}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [{ scale: flameScale }, { rotate: rotation }],
            }}
          >
            <Ionicons name="flame" size={32} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Right: Profile/Dashboard */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/dashboard')}
        activeOpacity={0.6}
      >
        <Ionicons
          name={isDashboard ? 'person-circle' : 'person-circle-outline'}
          size={26}
          color={isDashboard ? '#FFFFFF' : '#9A9A9A'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  burnButtonContainer: {
    alignItems: 'center',
    marginTop: -28,
  },
  burnButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#000000',
  },
});

