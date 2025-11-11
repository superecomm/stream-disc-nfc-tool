import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../src/services/auth';
import { firestoreService } from '../src/services/firestore';

const { width } = Dimensions.get('window');

export default function AlbumPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    artist: string;
    description?: string;
    coverImage: string;
    trackCount: string;
  }>();

  const [scrollY, setScrollY] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const headerOpacity = Math.min(scrollY / 200, 1);

  const handleSaveAlbum = async () => {
    try {
      setIsSaving(true);
      
      const userId = authService.getCurrentUserId();
      
      if (!userId) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to save your album.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/auth/sign-in') },
          ]
        );
        setIsSaving(false);
        return;
      }

      // Create album object
      const albumData = {
        title: params.title,
        artist: params.artist,
        description: params.description || '',
        coverUrl: params.coverImage,
        year: new Date().getFullYear(),
        genre: 'Electronic', // Default, could be customizable
        price: 0, // Default free
        trackCount: parseInt(params.trackCount || '0'),
        createdAt: new Date().toISOString(),
        userId,
      };

      // Save to Firestore
      const albumId = await firestoreService.createAlbum(albumData);

      Alert.alert(
        'Album Saved!',
        'Your album has been saved successfully.',
        [
          { text: 'View Album', onPress: () => router.push(`/album/${albumId}`) },
          { text: 'OK' },
        ]
      );
      
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving album:', error);
      Alert.alert('Error', 'Failed to save album. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header (appears on scroll) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'transparent']}
        style={[styles.fixedHeader, { opacity: headerOpacity }]}
      >
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {params.title}
          </Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: params.coverImage }} style={styles.artwork} />
        </View>

        {/* Album Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.albumTitle}>{params.title}</Text>
          <Text style={styles.artistName}>{params.artist}</Text>
          <Text style={styles.albumMetadata}>
            Electronic · {new Date().getFullYear()} · Lossless
          </Text>
          <Text style={styles.albumSubtext}>
            {params.trackCount} songs
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 4 }} />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shuffleButton}>
            <Ionicons name="shuffle" size={20} color="#FFFFFF" />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>

        {/* Icon Row */}
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsLiked(!isLiked)}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? '#FF3B5C' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add-circle-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="arrow-down-circle-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        {params.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About</Text>
            <Text style={styles.descriptionText}>{params.description}</Text>
          </View>
        )}

        {/* Save Album Button */}
        <TouchableOpacity
          style={styles.saveAlbumButton}
          onPress={handleSaveAlbum}
          disabled={isSaving}
        >
          {isSaving ? (
            <Text style={styles.saveAlbumButtonText}>Saving...</Text>
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#000000" />
              <Text style={styles.saveAlbumButtonText}>Save Album to Library</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  artworkContainer: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    marginBottom: 24,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B5C',
    marginBottom: 8,
  },
  albumMetadata: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  albumSubtext: {
    fontSize: 13,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
  },
  shuffleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  iconButton: {
    padding: 8,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  saveAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#06FFA5',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveAlbumButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  bottomSpacer: {
    height: 40,
  },
});

