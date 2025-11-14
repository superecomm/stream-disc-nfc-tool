import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firestoreService } from '../src/services/firestore';
import { paymentService } from '../src/services/payment';
import { authService } from '../src/services/auth';

const { width } = Dimensions.get('window');

interface Drop {
  id: string;
  artistId: string;
  artistName: string;
  albumId: string;
  title: string;
  coverImage: string;
  price: number;
  isExclusive: boolean;
  singlesAvailable: string[];
  totalEditions: number | null;
  soldCount: number;
  status: string;
  genre?: string;
  description?: string;
  batchId?: string | null;
  createdAt: any;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  trackCount: number;
  year: number;
  genre: string;
}

export default function DropDetailScreen() {
  const router = useRouter();
  const { dropId } = useLocalSearchParams<{ dropId: string }>();
  const [drop, setDrop] = useState<Drop | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadDropDetails();
  }, []);

  const loadDropDetails = async () => {
    try {
      // In production, fetch from Firestore
      // For testing, use mock data
      const mockDrop: Drop = {
        id: dropId,
        artistId: 'artist-1',
        artistName: 'Luna Rey',
        albumId: 'album-1',
        title: 'Midnight Dreams',
        coverImage: 'https://picsum.photos/seed/album1/800/800',
        price: 24.99,
        isExclusive: true,
        singlesAvailable: ['Track 1', 'Track 5'],
        totalEditions: 1000,
        soldCount: 847,
        status: 'active',
        genre: 'R&B',
        description: 'A soulful journey through midnight melodies and dreamy soundscapes. This exclusive Stream Disc features 12 tracks of pure artistry.',
        batchId: null,
        createdAt: new Date(),
      };

      const mockAlbum: Album = {
        id: 'album-1',
        title: 'Midnight Dreams',
        artist: 'Luna Rey',
        trackCount: 12,
        year: 2025,
        genre: 'R&B',
      };

      setDrop(mockDrop);
      setAlbum(mockAlbum);
    } catch (error) {
      console.error('Error loading drop details:', error);
      Alert.alert('Error', 'Failed to load drop details');
    } finally {
      setLoading(false);
    }
  };

  const handlePreOrder = async () => {
    if (!drop) return;

    const user = authService.getCurrentUser();
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to pre-order Stream Discs',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => router.push('/auth/sign-in'),
          },
        ]
      );
      return;
    }

    // Check if sold out
    const remainingEditions = drop.totalEditions
      ? drop.totalEditions - drop.soldCount
      : 999999;
    
    if (remainingEditions <= 0) {
      Alert.alert('Sold Out', 'This drop is no longer available');
      return;
    }

    // Navigate to checkout
    router.push({
      pathname: '/checkout',
      params: { dropId: drop.id },
    });
  };

  const handleArtistPress = () => {
    if (drop?.artistId) {
      router.push({
        pathname: '/artist-profile',
        params: { artistId: drop.artistId },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading drop...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!drop || !album) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B5C" />
          <Text style={styles.errorText}>Drop not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const remainingEditions = drop.totalEditions
    ? drop.totalEditions - drop.soldCount
    : null;
  const isSoldOut = remainingEditions !== null && remainingEditions <= 0;
  const isLowStock = remainingEditions !== null && remainingEditions < 50;
  const soldPercentage = drop.totalEditions
    ? (drop.soldCount / drop.totalEditions) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: drop.coverImage }} style={styles.heroImage} />
          {drop.isExclusive && (
            <View style={styles.heroExclusiveBadge}>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
              <Text style={styles.heroExclusiveBadgeText}>ALBUM EXCLUSIVE</Text>
            </View>
          )}
          {isSoldOut && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        {/* Drop Info */}
        <View style={styles.infoSection}>
          <Text style={styles.dropTitle}>{drop.title}</Text>
          
          <TouchableOpacity
            style={styles.artistRow}
            onPress={handleArtistPress}
            activeOpacity={0.7}
          >
            <Text style={styles.artistName}>{drop.artistName}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
          </TouchableOpacity>

          {/* Price Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceLabel}>Pre-Order Price</Text>
              <Text style={styles.priceAmount}>${drop.price.toFixed(2)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRight}>
              <View style={styles.statRow}>
                <Ionicons name="people" size={16} color="#9A9A9A" />
                <Text style={styles.statText}>{drop.soldCount} pre-orders</Text>
              </View>
              {drop.totalEditions && (
                <View style={styles.statRow}>
                  <Ionicons name="layers" size={16} color="#9A9A9A" />
                  <Text style={styles.statText}>
                    {remainingEditions} of {drop.totalEditions} left
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress Bar (if limited edition) */}
          {drop.totalEditions && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${soldPercentage}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {soldPercentage.toFixed(0)}% pre-ordered
              </Text>
            </View>
          )}

          {/* Low Stock Warning */}
          {!isSoldOut && isLowStock && (
            <View style={styles.warningBanner}>
              <Ionicons name="flash" size={20} color="#FF9500" />
              <Text style={styles.warningText}>
                Only {remainingEditions} editions left!
              </Text>
            </View>
          )}

          {/* Description */}
          {drop.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{drop.description}</Text>
            </View>
          )}

          {/* Album Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Album Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="musical-notes" size={20} color="#06FFA5" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Tracks</Text>
                  <Text style={styles.detailValue}>{album.trackCount}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar" size={20} color="#06FFA5" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Year</Text>
                  <Text style={styles.detailValue}>{album.year}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="radio" size={20} color="#06FFA5" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Genre</Text>
                  <Text style={styles.detailValue}>{drop.genre || 'Unknown'}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="disc" size={20} color="#06FFA5" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Format</Text>
                  <Text style={styles.detailValue}>NFC Disc</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Exclusivity Info */}
          <View style={styles.exclusivitySection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            {drop.isExclusive ? (
              <View style={styles.infoCard}>
                <Ionicons name="lock-closed" size={24} color="#FF3B5C" />
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Exclusive to Disc</Text>
                  <Text style={styles.infoCardDescription}>
                    Full album playback requires owning and scanning the physical Stream Disc. No digital access provided.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Ionicons name="play-circle" size={24} color="#06FFA5" />
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Singles Available</Text>
                  <Text style={styles.infoCardDescription}>
                    {drop.singlesAvailable.length} {drop.singlesAvailable.length === 1 ? 'track' : 'tracks'} available for streaming in-app. Full album requires the disc.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Manufacturing Info */}
          <View style={styles.manufacturingCard}>
            <Ionicons name="information-circle" size={20} color="#3A86FF" />
            <View style={styles.manufacturingTextContainer}>
              <Text style={styles.manufacturingTitle}>Production & Shipping</Text>
              <Text style={styles.manufacturingText}>
                Stream Discs are produced and shipped in scheduled manufacturing batches. 
                You'll receive tracking information once your batch enters production. 
                Funds are held in escrow until production begins.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.ctaFooter}>
        <View style={styles.ctaLeft}>
          <Text style={styles.ctaPrice}>${drop.price.toFixed(2)}</Text>
          {drop.totalEditions && (
            <Text style={styles.ctaStock}>
              {remainingEditions} of {drop.totalEditions} left
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.ctaButton, (isSoldOut || purchasing) && styles.ctaButtonDisabled]}
          onPress={handlePreOrder}
          disabled={isSoldOut || purchasing}
          activeOpacity={0.8}
        >
          {purchasing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Ionicons
                name={isSoldOut ? 'close-circle' : 'rocket'}
                size={20}
                color="#000000"
              />
              <Text style={styles.ctaButtonText}>
                {isSoldOut ? 'Sold Out' : 'Pre-Order Now'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B5C',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#06FFA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  heroContainer: {
    width: '100%',
    height: width,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroExclusiveBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  heroExclusiveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF3B5C',
    letterSpacing: 2,
  },
  infoSection: {
    padding: 16,
  },
  dropTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  priceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
    marginBottom: 16,
  },
  priceLeft: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06FFA5',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  priceDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  priceRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06FFA5',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06FFA5',
    textAlign: 'right',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  descriptionText: {
    fontSize: 15,
    color: '#9A9A9A',
    lineHeight: 22,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '48%',
  },
  detailItemText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A9A9A',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exclusivitySection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  infoCardDescription: {
    fontSize: 14,
    color: '#9A9A9A',
    lineHeight: 20,
  },
  manufacturingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.2)',
  },
  manufacturingTextContainer: {
    flex: 1,
  },
  manufacturingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A86FF',
    marginBottom: 6,
  },
  manufacturingText: {
    fontSize: 13,
    color: '#3A86FF',
    lineHeight: 18,
  },
  ctaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  ctaLeft: {
    flex: 1,
  },
  ctaPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  ctaStock: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonDisabled: {
    backgroundColor: '#9A9A9A',
    shadowOpacity: 0,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

