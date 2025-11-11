import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import ModeCarousel from './ModeCarousel';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

type CreateMode = 'studio' | 'post' | 'live';

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
}

const contentTypes = [
  {
    id: 'album',
    title: 'Album',
    gradient: ['#FF006E', '#8338EC'],
    route: '/create-album',
    locked: false,
  },
  {
    id: 'mixtape',
    title: 'Mixtape',
    gradient: ['#FFBE0B', '#06FFA5'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'film',
    title: 'Film',
    gradient: ['#06FFA5', '#3A86FF'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'podcast',
    title: 'Podcast',
    gradient: ['#8338EC', '#FF006E'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'audiobook',
    title: 'Audiobook',
    gradient: ['#FB5607', '#06FFA5'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'digitalart',
    title: 'Digital Art',
    gradient: ['#FF006E', '#FFBA08'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'valentines',
    title: "Valentine's Day",
    gradient: ['#FF006E', '#FF4D6D'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'wedding',
    title: 'Wedding',
    gradient: ['#FFD6E8', '#C77DFF'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'babyreveal',
    title: 'Baby Reveal',
    gradient: ['#FFAFCC', '#A0C4FF'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'memorial',
    title: 'Memorial',
    gradient: ['#6C757D', '#ADB5BD'],
    route: '/create-album',
    locked: true,
  },
];

export default function CreateModal({ visible, onClose, mode, onModeChange }: CreateModalProps) {
  const router = useRouter();

  const handleCardPress = (route: string, type: string, locked: boolean) => {
    if (locked) {
      console.log(`${type} is locked - Premium feature`);
      return;
    }

    // Close modal and navigate
    onClose();
    router.push(route as any);
  };

  const renderStudioContent = () => (
    <View style={styles.cardsGrid}>
      {contentTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={styles.cardContainer}
          onPress={() => handleCardPress(type.route, type.title, type.locked)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={type.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {type.locked && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
              </View>
            )}
            <Text style={styles.cardTitle}>{type.title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPostContent = () => (
    <View style={styles.comingSoonContainer}>
      <Ionicons name="add-circle-outline" size={80} color="#06FFA5" />
      <Text style={styles.comingSoonTitle}>Create Post</Text>
      <Text style={styles.comingSoonDescription}>
        Share your thoughts, music, and moments with your followers. Coming soon!
      </Text>
    </View>
  );

  const renderLiveContent = () => (
    <View style={styles.comingSoonContainer}>
      <Ionicons name="radio-outline" size={80} color="#FFD60A" />
      <Text style={styles.comingSoonTitle}>Go Live</Text>
      <Text style={styles.comingSoonDescription}>
        Stream live performances, DJ sets, and connect with your audience in real-time. Coming
        soon!
      </Text>
    </View>
  );

  const getHeaderTitle = () => {
    switch (mode) {
      case 'studio':
        return { main: 'Stream Disc', sub: 'studio' };
      case 'post':
        return { main: 'Create', sub: 'post' };
      case 'live':
        return { main: 'Go', sub: 'live' };
      default:
        return { main: 'Stream Disc', sub: 'studio' };
    }
  };

  const headerTitle = getHeaderTitle();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{headerTitle.main}</Text>
            <Text style={styles.subtitle}>{headerTitle.sub}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'studio' && renderStudioContent()}
          {mode === 'post' && renderPostContent()}
          {mode === 'live' && renderLiveContent()}
        </ScrollView>

        {/* Bottom Navigation (Always visible) */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="home-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="library-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Library</Text>
          </TouchableOpacity>

          <View style={styles.createButtonPlaceholder}>
            {/* Create button placeholder - actual button is in parent */}
          </View>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="mail-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="person-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Carousel - Positioned above bottom nav */}
        <ModeCarousel activeMode={mode} onModeChange={onModeChange} />

        {/* Floating Create Button */}
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={[
              styles.floatingCreateButton,
              mode === 'studio' && styles.floatingButtonStudio,
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            {mode === 'studio' ? (
              <Ionicons name="flame" size={32} color="#FFFFFF" />
            ) : mode === 'post' ? (
              <Ionicons name="add-circle" size={32} color="#FFFFFF" />
            ) : (
              <Ionicons name="radio" size={32} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 36,
  },
  subtitle: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
    marginTop: -4,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardContainer: {
    width: cardWidth,
  },
  card: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  comingSoonTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  comingSoonDescription: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontWeight: '500',
  },
  createButtonPlaceholder: {
    width: 56,
    height: 56,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  floatingCreateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#000000',
  },
  floatingButtonStudio: {
    backgroundColor: '#FF3B5C',
    borderColor: '#FF3B5C',
  },
});

