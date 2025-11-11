import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PromotionalAd } from '../mocks/categories';

const { width } = Dimensions.get('window');

interface PromotionalBannerProps {
  ad: PromotionalAd;
}

export default function PromotionalBanner({ ad }: PromotionalBannerProps) {
  const router = useRouter();

  const handlePress = () => {
    if (ad.ctaLink.startsWith('/album/')) {
      const albumId = ad.ctaLink.replace('/album/', '');
      router.push(`/album/${albumId}` as any);
    } else {
      console.log('Navigate to:', ad.ctaLink);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: ad.backgroundColor }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: ad.imageUrl }} style={styles.backgroundImage} />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{ad.title}</Text>
          <Text style={styles.subtitle}>{ad.subtitle}</Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>{ad.ctaText}</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  content: {
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
    gap: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

