import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Track } from '../mocks/albums';

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // in seconds
  duration: number; // in seconds
  queue: Track[];
  currentIndex: number;
};

type PlayerContextType = PlayerState & {
  playTrack: (track: Track, queue?: Track[], startIndex?: number) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlayPause: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    queue: [],
    currentIndex: -1,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
      }
    };
  }, []);

  const updatePosition = async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setState(prev => ({
            ...prev,
            position: status.positionMillis / 1000,
            duration: (status.durationMillis || 0) / 1000,
          }));
        }
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }
  };

  const startPositionTracking = () => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current);
    }
    positionInterval.current = setInterval(updatePosition, 1000);
  };

  const stopPositionTracking = () => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current);
      positionInterval.current = null;
    }
  };

  const playTrack = async (track: Track, queue: Track[] = [], startIndex: number = 0) => {
    try {
      // Unload previous track
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        stopPositionTracking();
      }

      if (!track.audioUrl) {
        console.error('Track has no audio URL');
        return;
      }

      // Load and play new track
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;

      setState({
        currentTrack: track,
        isPlaying: true,
        position: 0,
        duration: track.duration,
        queue: queue.length > 0 ? queue : [track],
        currentIndex: startIndex,
      });

      startPositionTracking();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.didJustFinish) {
      // Auto-play next track
      nextTrack();
    }
  };

  const pauseTrack = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setState(prev => ({ ...prev, isPlaying: false }));
      stopPositionTracking();
    }
  };

  const resumeTrack = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setState(prev => ({ ...prev, isPlaying: true }));
      startPositionTracking();
    }
  };

  const togglePlayPause = async () => {
    if (state.isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  };

  const nextTrack = async () => {
    const { queue, currentIndex } = state;
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      await playTrack(queue[nextIndex], queue, nextIndex);
    } else {
      // End of queue
      setState(prev => ({ ...prev, isPlaying: false }));
      stopPositionTracking();
    }
  };

  const previousTrack = async () => {
    const { queue, currentIndex, position } = state;
    
    // If more than 3 seconds into the song, restart it
    if (position > 3) {
      await seekTo(0);
      return;
    }

    // Otherwise, go to previous track
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      await playTrack(queue[prevIndex], queue, prevIndex);
    } else {
      // At beginning of queue, restart current track
      await seekTo(0);
    }
  };

  const seekTo = async (positionSeconds: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionSeconds * 1000);
      setState(prev => ({ ...prev, position: positionSeconds }));
    }
  };

  const setQueue = (tracks: Track[], startIndex: number = 0) => {
    setState(prev => ({
      ...prev,
      queue: tracks,
      currentIndex: startIndex,
    }));
  };

  const value: PlayerContextType = {
    ...state,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    seekTo,
    setQueue,
    togglePlayPause,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

