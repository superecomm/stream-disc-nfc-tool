import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../contexts/PlayerContext';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    albumArtwork,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
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
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Image
            source={{ uri: albumArtwork || 'https://via.placeholder.com/48/1C1C1E/999999?text=♫' }}
            style={styles.artwork}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={previousTrack} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#FFFFFF"
              style={isPlaying ? {} : { marginLeft: 2 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextTrack} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Scrubber */}
      <View style={styles.scrubberContainer}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3B5C',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#2C2C2E',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#8E8E93',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  controlButton: {
    padding: 4,
  },
  playButton: {
    padding: 4,
  },
  timeSection: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#8E8E93',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  scrubberContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  slider: {
    width: '100%',
    height: 20,
  },
});

