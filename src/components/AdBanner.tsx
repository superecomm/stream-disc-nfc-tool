import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type AdPosition = 'top' | 'inline' | 'bottom';

interface AdBannerProps {
  position: AdPosition;
}

export function AdBanner({ position }: AdBannerProps) {
  const handleUpgradePress = () => {
    console.log('Navigate to subscription page');
    // TODO: Navigate to subscription
  };

  return (
    <TouchableOpacity
      style={[styles.container, position === 'inline' && styles.inlineContainer]}
      onPress={handleUpgradePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ad-Free Listening</Text>
          <Text style={styles.subtitle}>Upgrade to Premium</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inlineContainer: {
    marginVertical: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
});
