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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { firestoreService } from '../../src/services/firestore';
import { Disc } from '../../src/types';

export default function StoreDetailScreen() {
  const router = useRouter();
  const { discId } = useLocalSearchParams<{ discId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [disc, setDisc] = useState<Disc | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (discId) {
      loadDiscDetails();
    }
  }, [discId]);

  const loadDiscDetails = async () => {
    try {
      const discData = await firestoreService.getDisc(discId!);
      setDisc(discData);
    } catch (error) {
      console.error('Error loading disc details:', error);
      Alert.alert('Error', 'Failed to load disc details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const handlePurchase = () => {
    if (!disc) return;

    const totalPrice = (disc.storePrice || 0) * quantity;
    
    Alert.alert(
      'Purchase Stream Disc',
      `You are about to purchase ${quantity} physical Stream Disc${quantity > 1 ? 's' : ''} for ${formatPrice(totalPrice)}.\n\nThis will be integrated with Stripe or another payment provider.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Purchase simulation complete! Physical disc will be shipped.');
            router.back();
          },
        },
      ]
    );
  };

  const handleDigitalAccess = () => {
    if (!disc) return;
    // Navigate to the disc content viewer
    router.push(`/${disc.id}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!disc) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Disc not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Cover Image */}
        {disc.coverImage ? (
          <Image source={{ uri: disc.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="disc-outline" size={80} color="#666666" />
          </View>
        )}

        {/* Disc Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{disc.title}</Text>
          <Text style={styles.artist}>{disc.artist}</Text>
          
          {disc.description && (
            <Text style={styles.description}>{disc.description}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="musical-notes-outline" size={20} color="#9A9A9A" />
              <Text style={styles.statText}>{disc.tracks?.length || 0} tracks</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#9A9A9A" />
              <Text style={styles.statText}>
                {disc.createdAt?.toLocaleDateString() || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Physical Disc</Text>
              <Text style={styles.priceAmount}>{formatPrice(disc.storePrice)}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          {disc.physicalDiscAvailable && (
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
              activeOpacity={0.5}
            >
              <Ionicons name="cart" size={20} color="#000000" />
              <Text style={styles.purchaseButtonText}>
                Buy Physical Disc - {formatPrice((disc.storePrice || 0) * quantity)}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.digitalButton}
            onPress={handleDigitalAccess}
            activeOpacity={0.5}
          >
            <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.digitalButtonText}>Access Digital Content</Text>
          </TouchableOpacity>

          {/* Track List */}
          {disc.tracks && disc.tracks.length > 0 && (
            <View style={styles.tracksSection}>
              <Text style={styles.sectionTitle}>Tracks</Text>
              {disc.tracks.map((track, index) => (
                <View key={index} style={styles.trackItem}>
                  <Text style={styles.trackNumber}>{index + 1}</Text>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Ionicons name="play-circle-outline" size={20} color="#9A9A9A" />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 24,
    backgroundColor: '#06FFA5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
  },
  coverPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  artist: {
    fontSize: 18,
    color: '#9A9A9A',
    marginBottom: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#9A9A9A',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9A9A9A',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 30,
    textAlign: 'center',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  digitalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  digitalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  tracksSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  trackNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9A9A9A',
    width: 24,
  },
  trackTitle: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

