import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { firestoreService } from '../src/services/firestore';

export default function DropPreviewScreen() {
  const router = useRouter();
  const { dropId, albumId } = useLocalSearchParams<{ dropId: string; albumId: string }>();
  const [drop, setDrop] = useState<any>(null);
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadDropData();
  }, []);

  const loadDropData = async () => {
    try {
      const [dropData, albumData] = await Promise.all([
        firestoreService.getDropById(dropId),
        firestoreService.getAlbum(albumId),
      ]);

      setDrop(dropData);
      setAlbum(albumData);
    } catch (error) {
      console.error('Error loading drop:', error);
      Alert.alert('Error', 'Failed to load drop preview');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Drop is already created and active, just navigate to write NFC
      router.push({
        pathname: '/write-nfc',
        params: { 
          contentId: albumId,
          dropId: dropId,
          albumCoverUrl: drop.coverImage,
        },
      });
    } catch (error) {
      console.error('Error publishing drop:', error);
      Alert.alert('Error', 'Failed to publish drop');
      setPublishing(false);
    }
  };

  const handleEdit = () => {
    // Go back to album creation with pre-filled data
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading preview...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drop Preview</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Preview Label */}
        <View style={styles.previewBanner}>
          <Ionicons name="eye-outline" size={20} color="#3A86FF" />
          <Text style={styles.previewBannerText}>
            This is how your drop will appear in the marketplace
          </Text>
        </View>

        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: drop.coverImage }} style={styles.artwork} />
          {drop.isExclusive && (
            <View style={styles.exclusiveBadge}>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
              <Text style={styles.exclusiveBadgeText}>EXCLUSIVE</Text>
            </View>
          )}
        </View>

        {/* Drop Info */}
        <View style={styles.infoSection}>
          <Text style={styles.albumTitle}>{drop.title}</Text>
          <Text style={styles.artistName}>{drop.artistName}</Text>

          {/* Price */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Ionicons name="pricetag" size={20} color="#06FFA5" />
              <Text style={styles.priceLabel}>Pre-Order Price</Text>
            </View>
            <Text style={styles.priceAmount}>${drop.price.toFixed(2)}</Text>
          </View>

          {/* Description */}
          {drop.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{drop.description}</Text>
            </View>
          )}

          {/* Track Count */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="musical-notes" size={20} color="#9A9A9A" />
              <Text style={styles.statText}>{album.trackCount || 0} Tracks</Text>
            </View>
            {drop.totalEditions && (
              <View style={styles.statItem}>
                <Ionicons name="layers" size={20} color="#9A9A9A" />
                <Text style={styles.statText}>
                  Limited to {drop.totalEditions} {drop.totalEditions === 1 ? 'Edition' : 'Editions'}
                </Text>
              </View>
            )}
            {!drop.totalEditions && (
              <View style={styles.statItem}>
                <Ionicons name="infinite" size={20} color="#9A9A9A" />
                <Text style={styles.statText}>Unlimited Editions</Text>
              </View>
            )}
          </View>

          {/* Exclusivity Info */}
          <View style={styles.exclusivitySection}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {drop.isExclusive ? (
              <View style={styles.infoCard}>
                <Ionicons name="disc" size={24} color="#FF3B5C" />
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Album Exclusive to Disc</Text>
                  <Text style={styles.infoCardDescription}>
                    Full album playback requires owning the physical Stream Disc
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Ionicons name="play-circle" size={24} color="#06FFA5" />
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Singles Available</Text>
                  <Text style={styles.infoCardDescription}>
                    {drop.singlesAvailable.length} {drop.singlesAvailable.length === 1 ? 'track' : 'tracks'} available for streaming
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
                Fans will receive tracking information once their batch enters production.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionFooter}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.publishButton, publishing && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={publishing}
          activeOpacity={0.8}
        >
          {publishing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Ionicons name="rocket" size={20} color="#000000" />
              <Text style={styles.publishButtonText}>Publish & Burn to Disc</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.2)',
  },
  previewBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#3A86FF',
    fontWeight: '500',
    lineHeight: 18,
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    position: 'relative',
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  exclusiveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9A9A9A',
    marginBottom: 24,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#9A9A9A',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
    flex: 1,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 13,
    color: '#9A9A9A',
    lineHeight: 18,
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
    marginBottom: 4,
  },
  manufacturingText: {
    fontSize: 12,
    color: '#3A86FF',
    lineHeight: 16,
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    borderRadius: 12,
    flex: 2,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

