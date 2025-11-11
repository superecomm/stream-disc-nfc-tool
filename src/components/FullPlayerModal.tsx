import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../contexts/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface FullPlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullPlayerModal({ visible, onClose }: FullPlayerModalProps) {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    albumArtwork,
    albumName,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    queue,
    currentIndex,
  } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1a1a1a', '#000000']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Now Playing</Text>
              {queue.length > 0 && (
                <Text style={styles.headerSubtitle}>
                  {currentIndex + 1} of {queue.length}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Album Artwork */}
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: albumArtwork || 'https://via.placeholder.com/400/1C1C1E/999999?text=♫' }}
              style={styles.artwork}
            />
          </View>

          {/* Track Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
            {albumName && (
              <Text style={styles.albumName} numberOfLines={1}>
                {albumName}
              </Text>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              value={position}
              minimumValue={0}
              maximumValue={duration || 1}
              minimumTrackTintColor="#FF3B5C"
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor="#FFFFFF"
              onSlidingComplete={(value) => seekTo(value)}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Playback Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="shuffle" size={24} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity onPress={previousTrack} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#000000"
                style={isPlaying ? {} : { marginLeft: 3 }}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={nextTrack} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="repeat" size={24} color="#999999" />
            </TouchableOpacity>
          </View>

          {/* Bottom Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="list-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 32,
    marginBottom: 32,
  },
  artwork: {
    width: width - 64,
    height: width - 64,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 4,
    textAlign: 'center',
  },
  albumName: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
    gap: 24,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 64,
    marginBottom: 16,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

