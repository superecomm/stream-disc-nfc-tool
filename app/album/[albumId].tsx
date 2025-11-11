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
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { firestoreService } from '../../src/services/firestore';

const { width } = Dimensions.get('window');

interface Track {
  title: string;
  fileUrl: string;
  duration?: number;
}

interface Disc {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  type: string;
  tracks?: Track[];
  description?: string;
}

export default function AlbumPlayerScreen() {
  const router = useRouter();
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const [disc, setDisc] = useState<Disc | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadAlbum();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [albumId]);

  const loadAlbum = async () => {
    try {
      if (!albumId) {
        Alert.alert('Error', 'No album ID provided');
        router.back();
        return;
      }

      const discData = await firestoreService.getDisc(albumId);
      
      if (!discData) {
        Alert.alert('Error', 'Album not found');
        router.push('/blank-disc');
        return;
      }

      setDisc(discData);
    } catch (error) {
      console.error('Error loading album:', error);
      Alert.alert('Error', 'Failed to load album');
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: Track, index: number) => {
    try {
      // If already playing this track, toggle pause
      if (currentTrack === index && sound) {
        await togglePlayPause();
        return;
      }

      // Stop current track if playing
      if (sound) {
        await sound.unloadAsync();
      }

      // Load and play new track
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.fileUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentTrack(index);
      setIsPlaying(true);

      // Handle playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
      Alert.alert('Error', 'Failed to play track');
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading album...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!disc) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{disc.type.toUpperCase()}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {disc.coverImage ? (
            <Image source={{ uri: disc.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Ionicons name="disc-outline" size={80} color="#666666" />
            </View>
          )}
        </View>

        {/* Album Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.albumTitle}>{disc.title}</Text>
          <Text style={styles.artistName}>{disc.artist}</Text>
          {disc.description && (
            <Text style={styles.description}>{disc.description}</Text>
          )}
        </View>

        {/* Tracks List */}
        {disc.tracks && disc.tracks.length > 0 && (
          <View style={styles.tracksContainer}>
            <Text style={styles.tracksHeader}>Tracks</Text>
            {disc.tracks.map((track, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.trackItem,
                  currentTrack === index && styles.trackItemActive,
                ]}
                onPress={() => playTrack(track, index)}
                activeOpacity={0.7}
              >
                <View style={styles.trackNumber}>
                  {currentTrack === index && isPlaying ? (
                    <Ionicons name="pause" size={16} color="#06FFA5" />
                  ) : currentTrack === index ? (
                    <Ionicons name="play" size={16} color="#06FFA5" />
                  ) : (
                    <Text style={styles.trackNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.trackInfo}>
                  <Text
                    style={[
                      styles.trackTitle,
                      currentTrack === index && styles.trackTitleActive,
                    ]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  {track.duration && track.duration > 0 && (
                    <Text style={styles.trackDuration}>
                      {Math.floor(track.duration / 60)}:
                      {String(Math.floor(track.duration % 60)).padStart(2, '0')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Player Controls */}
        {currentTrack !== null && sound && (
          <View style={styles.playerControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999999',
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  coverContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
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
    color: '#999999',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
    lineHeight: 20,
  },
  tracksContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  tracksHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  trackItemActive: {
    backgroundColor: 'rgba(6, 255, 165, 0.05)',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomColor: 'transparent',
  },
  trackNumber: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackNumberText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackTitle: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  trackTitleActive: {
    color: '#06FFA5',
    fontWeight: '500',
  },
  trackDuration: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '400',
  },
  playerControls: {
    paddingHorizontal: 32,
    paddingTop: 16,
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#06FFA5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

