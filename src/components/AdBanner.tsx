import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth';

export function AdBanner() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(true); // Default to true to hide until loaded
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange(() => {
      checkPremiumStatus();
    });

    return () => unsubscribe();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const premium = await authService.isPremium();
      setIsPremium(premium);
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show banner for premium users or while loading
  if (isPremium || isLoading) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/subscription')}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="diamond-outline" size={20} color="#06FFA5" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Enjoying Stream Disc?</Text>
          <Text style={styles.subtitle}>Upgrade to Pro to remove ads</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(6, 255, 165, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
    marginVertical: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9A9A9A',
  },
});

