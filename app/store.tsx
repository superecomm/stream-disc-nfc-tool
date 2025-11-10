import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { firestoreService } from '../src/services/firestore';
import { Disc } from '../src/types';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function StoreScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [publishedDiscs, setPublishedDiscs] = useState<Disc[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'music' | 'film' | 'art'>('all');

  useEffect(() => {
    loadPublishedDiscs();
  }, []);

  const loadPublishedDiscs = async () => {
    try {
      const discs = await firestoreService.getPublishedDiscs();
      setPublishedDiscs(discs);
    } catch (error) {
      console.error('Error loading published discs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDiscs = publishedDiscs.filter((disc) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'music') return disc.type === 'album' || disc.type === 'mixtape';
    if (selectedCategory === 'film') return disc.type === 'film';
    if (selectedCategory === 'art') return disc.type === 'digitalart';
    return true;
  });

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stream Disc Store</Text>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#9A9A9A" />
          </TouchableOpacity>
        </View>

        {/* Buy Blank Discs Banner */}
        <TouchableOpacity
          style={styles.blankDiscBanner}
          onPress={() => router.push('/store/blank-discs')}
          activeOpacity={0.7}
        >
          <View style={styles.bannerIcon}>
            <Ionicons name="disc-outline" size={24} color="#06FFA5" />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Buy Blank Stream Discs</Text>
            <Text style={styles.bannerSubtitle}>Official NFC-enabled discs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
        </TouchableOpacity>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'music', 'film', 'art'] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === category && styles.filterButtonTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Store Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06FFA5" />
            <Text style={styles.loadingText}>Loading store...</Text>
          </View>
        ) : filteredDiscs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color="#666666" />
            <Text style={styles.emptyStateTitle}>No Discs Available</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'all'
                ? 'No Stream Discs have been published to the store yet.'
                : `No ${selectedCategory} discs available at this time.`}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.discGrid}>
              {filteredDiscs.map((disc) => (
                <TouchableOpacity
                  key={disc.id}
                  style={styles.discCard}
                  onPress={() => router.push(`/store/${disc.id}`)}
                  activeOpacity={0.7}
                >
                  {disc.coverImage ? (
                    <Image source={{ uri: disc.coverImage }} style={styles.discCover} />
                  ) : (
                    <View style={styles.discCoverPlaceholder}>
                      <Ionicons name="disc-outline" size={48} color="#666666" />
                    </View>
                  )}
                  
                  <View style={styles.discInfo}>
                    <Text style={styles.discTitle} numberOfLines={1}>
                      {disc.title}
                    </Text>
                    <Text style={styles.discArtist} numberOfLines={1}>
                      {disc.artist}
                    </Text>
                    
                    <View style={styles.discFooter}>
                      <View style={styles.priceTag}>
                        <Text style={styles.priceText}>{formatPrice(disc.storePrice)}</Text>
                      </View>
                      {disc.physicalDiscAvailable && (
                        <View style={styles.physicalBadge}>
                          <Ionicons name="disc" size={12} color="#06FFA5" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankDiscBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.3)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#06FFA5',
    borderColor: '#06FFA5',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  filterButtonTextActive: {
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9A9A9A',
    fontSize: 14,
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9A9A9A',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  discGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  discCard: {
    width: cardWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  discCover: {
    width: '100%',
    aspectRatio: 1,
  },
  discCoverPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discInfo: {
    padding: 12,
  },
  discTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  discArtist: {
    fontSize: 12,
    color: '#9A9A9A',
    marginBottom: 12,
  },
  discFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06FFA5',
  },
  physicalBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

