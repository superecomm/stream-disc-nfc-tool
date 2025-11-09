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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { firestoreService } from '../src/services/firestore';
import { Disc, Track } from '../src/types';

export default function ContentViewerScreen() {
  const router = useRouter();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [disc, setDisc] = useState<Disc | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadDisc();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [contentId]);

  const loadDisc = async () => {
    try {
      if (!contentId) {
        Alert.alert('Error', 'No content ID provided');
        return;
      }

      const discData = await firestoreService.getDisc(contentId);
      
      if (!discData) {
        Alert.alert('Error', 'Content not found');
        router.push('/blank-disc');
        return;
      }

      setDisc(discData);
    } catch (error) {
      console.error('Error loading disc:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (track: Track, index: number) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Load and play new track
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.fileUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentTrack(index);
      setIsPlaying(true);

      // Listen for playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentTrack(null);
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
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
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
        </View>
      </SafeAreaView>
    );
  }

  if (!disc) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{disc.type.toUpperCase()}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: disc.coverImage }} style={styles.coverImage} />
        </View>

        {/* Album Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.albumTitle}>{disc.title}</Text>
          <Text style={styles.artistName}>{disc.artist}</Text>
        </View>

        {/* Tracks List */}
        <View style={styles.tracksContainer}>
          <Text style={styles.tracksHeader}>Tracks</Text>
          {disc.tracks?.map((track, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.trackItem,
                currentTrack === index && styles.trackItemActive,
              ]}
              onPress={() => playTrack(track, index)}
            >
              <View style={styles.trackNumber}>
                {currentTrack === index && isPlaying ? (
                  <Text style={styles.trackNumberText}>▶</Text>
                ) : (
                  <Text style={styles.trackNumberText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                {track.duration > 0 && (
                  <Text style={styles.trackDuration}>
                    {Math.floor(track.duration / 60)}:
                    {String(Math.floor(track.duration % 60)).padStart(2, '0')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player Controls */}
        {currentTrack !== null && sound && (
          <View style={styles.playerControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
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
  scrollView: {
    flex: 1,
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
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
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
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#999999',
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
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  trackItemActive: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  trackNumber: {
    width: 32,
    alignItems: 'center',
  },
  trackNumberText: {
    fontSize: 14,
    color: '#999999',
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
  },
  trackDuration: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  playerControls: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#06FFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: '#000000',
  },
});

