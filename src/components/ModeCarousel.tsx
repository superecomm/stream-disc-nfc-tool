import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type CreateMode = 'studio' | 'post' | 'live';

interface ModeCarouselProps {
  activeMode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
}

export default function ModeCarousel({ activeMode, onModeChange }: ModeCarouselProps) {
  const modes = [
    {
      id: 'studio' as CreateMode,
      icon: 'flame',
      label: 'Studio',
      color: '#FF3B5C',
      gradient: ['#FF3B5C', '#FF6B9D'],
    },
    {
      id: 'post' as CreateMode,
      icon: 'add-circle',
      label: 'Post',
      color: '#06FFA5',
      gradient: ['#06FFA5', '#3A86FF'],
    },
    {
      id: 'live' as CreateMode,
      icon: 'radio',
      label: 'Go Live',
      color: '#FFD60A',
      gradient: ['#FFD60A', '#FF9F0A'],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width * 0.3}
        decelerationRate="fast"
      >
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          
          return (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, isActive && styles.modeCardActive]}
              onPress={() => onModeChange(mode.id)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={mode.gradient as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeGradient}
                >
                  <Ionicons name={mode.icon as any} size={24} color="#FFFFFF" />
                  <Text style={styles.activeLabel}>{mode.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveCard}>
                  <Ionicons name={mode.icon as any} size={20} color="#666666" />
                  <Text style={styles.inactiveLabel}>{mode.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  modeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeCardActive: {
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  inactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    gap: 6,
  },
  inactiveLabel: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
});

