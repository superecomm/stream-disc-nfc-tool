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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Mock Albums - Exact copy from main app
const MOCK_ALBUMS = [
  {
    id: 'midnight-dreams',
    title: 'Midnight Dreams',
    artist: 'Luna Rey',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
    year: 2024,
    genre: 'Electronic',
    price: 24.99,
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour',
    artist: 'The Sunset Collective',
    coverUrl: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop',
    year: 2023,
    genre: 'Indie Pop',
    price: 19.99,
  },
  {
    id: 'urban-nights',
    title: 'Urban Nights',
    artist: 'Metro Beats',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    year: 2024,
    genre: 'Hip Hop',
    price: 22.99,
  },
];

// Featured Playlists - Exact copy from main app
const FEATURED_PLAYLISTS = [
  {
    id: 'playlist-1',
    name: 'New Music Mix',
    description: 'Your weekly mix of fresh tracks',
    coverGradient: ['#FF6B9D', '#FFA07A', '#FF8E8E'],
  },
  {
    id: 'playlist-2',
    name: 'Chill Vibes',
    description: 'Relaxing tunes for any moment',
    coverGradient: ['#4FACFE', '#00F2FE'],
  },
];

export default function PlayerHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAlbumPress = (albumId: string) => {
    router.push(`/album/${albumId}` as any);
  };

  const handleBuyPress = (album: any) => {
    console.log('Buy album:', album.title);
    // Future: Add to cart logic
  };

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
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="compass-outline" size={18} color="#999999" />
              <Text style={styles.tabText}>Charts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>Music</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Live</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Podcast</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Audio Books</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Top Picks for You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Picks for You</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {FEATURED_PLAYLISTS.map((playlist) => (
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
            {MOCK_ALBUMS.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                onPress={() => handleAlbumPress(album.id)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: album.coverUrl }} style={styles.albumCover} />
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {album.title}
                </Text>
                <Text style={styles.albumArtist} numberOfLines={1}>
                  {album.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* New Releases */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Releases</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {MOCK_ALBUMS.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                onPress={() => handleAlbumPress(album.id)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: album.coverUrl }} style={styles.albumCover} />
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {album.title}
                </Text>
                <Text style={styles.albumArtist} numberOfLines={1}>
                  {album.artist}
                </Text>
                <TouchableOpacity
                  style={styles.buySection}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleBuyPress(album);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.buyRow}>
                    <Ionicons name="cart-outline" size={14} color="#FF3B5C" />
                    <Text style={styles.price}>${album.price.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.buyLabel}>Buy on Stream Disc</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Super Bowl LIX Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>Super Bowl LIX</Text>
          <Text style={styles.promoSubtitle}>Stream the official halftime show album</Text>
          <TouchableOpacity style={styles.promoButton} activeOpacity={0.8}>
            <Text style={styles.promoButtonText}>Listen Now</Text>
            <Ionicons name="chevron-forward" size={18} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Mini Player (Mock) */}
      <View style={styles.miniPlayer}>
        <Image
          source={{ uri: MOCK_ALBUMS[0].coverUrl }}
          style={styles.miniPlayerArt}
        />
        <View style={styles.miniPlayerInfo}>
          <Text style={styles.miniPlayerTitle} numberOfLines={1}>
            Neon Nights
          </Text>
          <Text style={styles.miniPlayerArtist} numberOfLines={1}>
            Luna Rey
          </Text>
        </View>
        <View style={styles.miniPlayerControls}>
          <TouchableOpacity style={styles.miniPlayerButton}>
            <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.miniPlayerButton}>
            <Ionicons name="pause" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.miniPlayerButton}>
            <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.miniPlayerButton}>
            <Ionicons name="chevron-down" size={20} color="#999999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.miniPlayerButton}>
            <Ionicons name="close" size={20} color="#999999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
          <Ionicons name="home" size={24} color="#FF3B5C" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
          <Ionicons name="library-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
          <Ionicons name="mail-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/dashboard')}
          activeOpacity={0.6}
        >
          <Ionicons name="person-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  // Album Cards
  albumCard: {
    width: width * 0.42,
    marginRight: 12,
  },
  albumCover: {
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    marginBottom: 8,
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  albumArtist: {
    color: '#8E8E93',
    fontSize: 13,
  },
  // Buy Section
  buySection: {
    marginTop: 8,
    gap: 2,
  },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buyLabel: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  // Promo Banner
  promoBanner: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  promoSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 16,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  promoButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 160,
  },
  // Mini Player
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  miniPlayerArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniPlayerArtist: {
    color: '#8E8E93',
    fontSize: 12,
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniPlayerButton: {
    padding: 4,
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
  },
});
