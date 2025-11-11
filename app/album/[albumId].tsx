import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../../src/contexts/PlayerContext';
import { findAlbumById, Album, Track } from '../../src/mocks/albums';

const { width, height } = Dimensions.get('window');

export default function AlbumPlayerScreen() {
  const router = useRouter();
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
  } = usePlayer();

  useEffect(() => {
    loadAlbum();
  }, [albumId]);

  const loadAlbum = async () => {
    try {
      if (!albumId) {
        setLoading(false);
        return;
      }

      // Load from centralized mock data using findAlbumById
      const foundAlbum = findAlbumById(albumId);
      if (foundAlbum) {
        setAlbum(foundAlbum);
      } else {
        console.warn('Album not found:', albumId);
      }
    } catch (error) {
      console.error('Error loading album:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (track: Track, index: number) => {
    if (album) {
      await playTrack(track, album.tracks, index, album.coverUrl, album.title);
    }
  };

  const handlePlayAll = () => {
    if (album && album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks, 0, album.coverUrl, album.title);
    }
  };

  const handleShuffle = () => {
    if (album && album.tracks.length > 0) {
      const shuffled = [...album.tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, 0, album.coverUrl, album.title);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScroll = (event: any) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  const headerOpacity = Math.min(scrollY / 200, 1);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B5C" />
        <Text style={styles.loadingText}>Loading Album...</Text>
      </SafeAreaView>
    );
  }

  if (!album) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Album not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalDuration = album.tracks.reduce((sum, track) => sum + track.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <View style={styles.container}>
      {/* Fixed Header with Fade-in */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0)']}
        style={[styles.fixedHeader, { opacity: headerOpacity }]}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {album.title}
            </Text>
            <TouchableOpacity style={styles.headerMenuButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: album.coverUrl }} style={styles.artwork} />
        </View>

        {/* Album Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.albumTitle}>{album.title}</Text>
          <TouchableOpacity onPress={() => router.push(`/artist/${album.artistId}` as any)}>
            <Text style={styles.artistName}>{album.artist}</Text>
          </TouchableOpacity>
          <Text style={styles.albumMetadata}>
            {album.genre} · {album.year} · Lossless
          </Text>
          <Text style={styles.albumSubtext}>
            {album.tracks.length} songs, {totalMinutes} min
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
            <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 4 }} />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <Ionicons name="shuffle" size={20} color="#FFFFFF" />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>

        {/* Icon Row */}
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#FF3B5C' : '#FFFFFF'}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Track List */}
        <View style={styles.trackList}>
          {album.tracks.map((track, index) => (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackItem,
                currentTrack?.id === track.id && styles.trackItemActive,
              ]}
              onPress={() => handlePlayTrack(track, index)}
              activeOpacity={0.7}
            >
              <View style={styles.trackNumber}>
                {currentTrack?.id === track.id && isPlaying ? (
                  <Ionicons name="volume-medium" size={16} color="#FF3B5C" />
                ) : (
                  <Text
                    style={[
                      styles.trackNumberText,
                      currentTrack?.id === track.id && styles.trackNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <View style={styles.trackInfo}>
                <Text
                  style={[
                    styles.trackTitle,
                    currentTrack?.id === track.id && styles.trackTitleActive,
                  ]}
                  numberOfLines={1}
                >
                  {track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {album.artist}
                </Text>
              </View>

              <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>

              <TouchableOpacity style={styles.trackMenuButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Album Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionDate}>
            {album.postedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • {album.tracks.length} songs, {totalMinutes} min
          </Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={showDescription ? undefined : 3}
          >
            A journey through nocturnal soundscapes and ethereal beats. This album explores the liminal space between waking and dreaming.
          </Text>
          <TouchableOpacity onPress={() => setShowDescription(!showDescription)}>
            <Text style={styles.descriptionMore}>
              {showDescription ? 'less' : 'more'} <Ionicons name="chevron-forward" size={12} />
            </Text>
          </TouchableOpacity>
          <Text style={styles.descriptionLabel}>℗ Independent</Text>
        </View>

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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  backButtonText: {
    color: '#FF3B5C',
    fontSize: 16,
    marginTop: 16,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  headerMenuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  artwork: {
    width: width - 64,
    height: width - 64,
    borderRadius: 8,
  },
  infoContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#FF3B5C',
    fontWeight: '600',
    marginBottom: 8,
  },
  albumMetadata: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  albumSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B5C',
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shuffleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  shuffleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 32,
  },
  trackList: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  trackItemActive: {
    backgroundColor: 'rgba(255, 59, 92, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  trackNumber: {
    width: 24,
    alignItems: 'center',
  },
  trackNumberText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  trackNumberActive: {
    color: '#FF3B5C',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: 2,
  },
  trackTitleActive: {
    color: '#FF3B5C',
  },
  trackArtist: {
    fontSize: 14,
    color: '#8E8E93',
  },
  trackDuration: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  trackMenuButton: {
    padding: 4,
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  descriptionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
  },
  descriptionMore: {
    fontSize: 14,
    color: '#FF3B5C',
    fontWeight: '600',
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bottomSpacer: {
    height: 100,
  },
});
