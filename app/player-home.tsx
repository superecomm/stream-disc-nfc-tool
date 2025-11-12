import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALBUMS, Album, findAlbumById } from '../src/mocks/albums';
import { PLAYLISTS } from '../src/mocks/playlists';
import { MUSIC_CATEGORIES, PROMOTIONAL_ADS } from '../src/mocks/categories';
import PromotionalBanner from '../src/components/PromotionalBanner';
import { AdBanner } from '../src/components/AdBanner';
import AlbumCard from '../src/components/AlbumCard';
import MiniPlayer from '../src/components/MiniPlayer';
import CreateModal from '../src/components/CreateModal';
import ModeCarousel from '../src/components/ModeCarousel';
import { usePlayer } from '../src/contexts/PlayerContext';

const { width } = Dimensions.get('window');

type MediaTab = 'charts' | 'music' | 'live' | 'podcast' | 'audiobooks';
type CreateMode = 'studio' | 'post' | 'live';

export default function PlayerHomeScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<MediaTab>('music');
  const [isFreeUser] = useState(true); // For demo, show ads
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('studio');
  const { currentTrack } = usePlayer();

  const handleAlbumPress = (albumId: string) => {
    router.push(`/album/${albumId}` as any);
  };

  const handleArtistPress = (artistId: string) => {
    router.push(`/artist/${artistId}` as any);
  };

  const handleBuyPress = (album: Album) => {
    console.log('Buy album:', album.title);
  };

  // Render different content based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'charts':
        return renderChartsTab();
      case 'music':
        return renderMusicTab();
      case 'live':
        return renderLiveTab();
      case 'podcast':
        return renderPodcastTab();
      case 'audiobooks':
        return renderAudiobooksTab();
      default:
        return renderMusicTab();
    }
  };

  const renderChartsTab = () => (
    <>
      {/* Show ads for free users */}
      {isFreeUser && <AdBanner position="top" />}

      {/* Top Charts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Charts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {ALBUMS.slice(0, 5).map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onPress={() => handleAlbumPress(album.id)}
              size="medium"
              showBuyButton={true}
            />
          ))}
        </ScrollView>
      </View>

      {/* Promotional Banner */}
      <PromotionalBanner ad={PROMOTIONAL_ADS[0]} />
    </>
  );

  const renderMusicTab = () => (
    <>
      {/* Show ads for free users */}
      {isFreeUser && <AdBanner position="top" />}

      {/* Top Picks for You */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Picks for You</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {PLAYLISTS.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={styles.playlistCard}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={playlist.coverGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playlistGradient}
              >
                <View style={styles.playlistContent}>
                  <View style={styles.playlistBadge}>
                    <Text style={styles.playlistBadgeText}>STREAM DISC</Text>
                  </View>
                  <Text style={styles.playlistTitle}>{playlist.name}</Text>
                </View>
              </LinearGradient>
              <Text style={styles.playlistDescription}>{playlist.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recently Played */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {ALBUMS.slice(0, 4).map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onPress={() => handleAlbumPress(album.id)}
              size="medium"
            />
          ))}
        </ScrollView>
      </View>

      {/* Promotional Banner - Super Bowl */}
      <PromotionalBanner ad={PROMOTIONAL_ADS[0]} />

      {/* All Music Categories */}
      {MUSIC_CATEGORIES.map((category, index) => {
        const categoryAlbums = category.albums
          .map(id => findAlbumById(id))
          .filter(Boolean) as Album[];

        return (
          <React.Fragment key={category.id}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{category.title}</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {categoryAlbums.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onPress={() => handleAlbumPress(album.id)}
                    size="medium"
                    showBuyButton={true}
                  />
                ))}
              </ScrollView>
            </View>
            
            {/* Show ads every 3 categories for free users */}
            {isFreeUser && (index + 1) % 3 === 0 && <AdBanner position="inline" />}
          </React.Fragment>
        );
      })}

      {/* Year-End Sale Promo */}
      <PromotionalBanner ad={PROMOTIONAL_ADS[1]} />
    </>
  );

  const renderLiveTab = () => (
    <View style={styles.emptyState}>
      <Ionicons name="radio-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>Live Content</Text>
      <Text style={styles.emptyStateSubtitle}>Coming soon</Text>
    </View>
  );

  const renderPodcastTab = () => (
    <View style={styles.emptyState}>
      <Ionicons name="mic-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>Podcasts</Text>
      <Text style={styles.emptyStateSubtitle}>Coming soon</Text>
    </View>
  );

  const renderAudiobooksTab = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>Audiobooks</Text>
      <Text style={styles.emptyStateSubtitle}>Coming soon</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="search-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'charts' && styles.tabActive]}
              onPress={() => setSelectedTab('charts')}
            >
              <Ionicons
                name="compass-outline"
                size={18}
                color={selectedTab === 'charts' ? '#FFFFFF' : '#999999'}
              />
              <Text style={[styles.tabText, selectedTab === 'charts' && styles.tabTextActive]}>
                Charts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'music' && styles.tabActive]}
              onPress={() => setSelectedTab('music')}
            >
              <Text style={[styles.tabText, selectedTab === 'music' && styles.tabTextActive]}>
                Music
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'live' && styles.tabActive]}
              onPress={() => setSelectedTab('live')}
            >
              <Text style={[styles.tabText, selectedTab === 'live' && styles.tabTextActive]}>
                Live
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'podcast' && styles.tabActive]}
              onPress={() => setSelectedTab('podcast')}
            >
              <Text style={[styles.tabText, selectedTab === 'podcast' && styles.tabTextActive]}>
                Podcast
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'audiobooks' && styles.tabActive]}
              onPress={() => setSelectedTab('audiobooks')}
            >
              <Text style={[styles.tabText, selectedTab === 'audiobooks' && styles.tabTextActive]}>
                Audio Books
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Mini Player */}
      {currentTrack && <MiniPlayer />}

      {/* Mode Carousel - Only show when modal is active */}
      {showCreateModal && (
        <ModeCarousel activeMode={createMode} onModeChange={setCreateMode} />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/player-home')}
          activeOpacity={0.6}
        >
          <Ionicons name="home" size={24} color="#FF3B5C" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/library')}
          activeOpacity={0.6}
        >
          <Ionicons name="library-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            showCreateModal && createMode === 'studio' && styles.createButtonStudio,
          ]}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          {showCreateModal && createMode === 'studio' ? (
            <Ionicons name="flame" size={32} color="#FFFFFF" />
          ) : showCreateModal && createMode === 'post' ? (
            <Ionicons name="add-circle" size={32} color="#FFFFFF" />
          ) : showCreateModal && createMode === 'live' ? (
            <Ionicons name="radio" size={32} color="#FFFFFF" />
          ) : (
            <Ionicons name="add" size={32} color="#000000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/inbox')}
          activeOpacity={0.6}
        >
          <Ionicons name="mail-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.6}
        >
          <Ionicons name="person-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Create Modal */}
      <CreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        mode={createMode}
        onModeChange={setCreateMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabsScroll: {
    paddingRight: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#FF3B5C',
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  // Playlist Cards (Top Picks)
  playlistCard: {
    width: width * 0.7,
    marginRight: 12,
  },
  playlistGradient: {
    height: width * 0.4,
    borderRadius: 8,
    justifyContent: 'flex-end',
    padding: 16,
    marginBottom: 8,
  },
  playlistContent: {
    gap: 8,
  },
  playlistBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  playlistBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  playlistDescription: {
    color: '#8E8E93',
    fontSize: 13,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 160,
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
  },
  navLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#FF3B5C',
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#000000',
  },
  createButtonStudio: {
    backgroundColor: '#FF3B5C',
    borderColor: '#FF3B5C',
  },
});
