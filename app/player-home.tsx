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
import { firestoreService } from '../src/services/firestore';

const { width } = Dimensions.get('window');
const albumCardWidth = (width - 48) / 2;

interface Album {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  type: string;
}

export default function PlayerHomeScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'charts' | 'music' | 'live' | 'podcast' | 'audiobooks'>('music');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Album[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Load published discs from store
      const discs = await firestoreService.getPublishedDiscs();
      
      // Mock recently played for now
      setRecentlyPlayed(discs.slice(0, 3));
      setNewReleases(discs);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumPress = (albumId: string) => {
    router.push(`/album/${albumId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Tabs */}
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
            <Ionicons name="compass-outline" size={18} color={selectedTab === 'charts' ? '#FFFFFF' : '#999999'} />
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Picks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Picks for You</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {/* Top Picks - Mock data */}
              <View style={styles.topPickCard}>
                <View style={[styles.topPickGradient, { backgroundColor: '#FF6B9D' }]}>
                  <Text style={styles.topPickBadge}>STREAM DISC</Text>
                  <Text style={styles.topPickTitle}>New Music Mix</Text>
                </View>
                <Text style={styles.topPickSubtitle}>Your weekly mix of fresh tracks</Text>
              </View>

              <View style={styles.topPickCard}>
                <View style={[styles.topPickGradient, { backgroundColor: '#4FC3F7' }]}>
                  <Text style={styles.topPickBadge}>STREAM DISC</Text>
                  <Text style={styles.topPickTitle}>Chill Vibes</Text>
                </View>
                <Text style={styles.topPickSubtitle}>Relaxing tunes for any time</Text>
              </View>
            </ScrollView>
          </View>

          {/* Recently Played */}
          {recentlyPlayed.length > 0 && (
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
                {recentlyPlayed.map((album) => (
                  <TouchableOpacity
                    key={album.id}
                    style={styles.albumCard}
                    onPress={() => handleAlbumPress(album.id)}
                    activeOpacity={0.7}
                  >
                    {album.coverImage ? (
                      <Image source={{ uri: album.coverImage }} style={styles.albumCover} />
                    ) : (
                      <View style={styles.albumCoverPlaceholder}>
                        <Ionicons name="disc-outline" size={48} color="#666666" />
                      </View>
                    )}
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
          )}

          {/* New Releases */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Releases</Text>
              <TouchableOpacity onPress={() => router.push('/store')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridContainer}>
              {newReleases.slice(0, 4).map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.gridAlbumCard}
                  onPress={() => handleAlbumPress(album.id)}
                  activeOpacity={0.7}
                >
                  {album.coverImage ? (
                    <Image source={{ uri: album.coverImage }} style={styles.gridAlbumCover} />
                  ) : (
                    <View style={styles.gridAlbumCoverPlaceholder}>
                      <Ionicons name="disc-outline" size={40} color="#666666" />
                    </View>
                  )}
                  <Text style={styles.gridAlbumTitle} numberOfLines={1}>
                    {album.title}
                  </Text>
                  <Text style={styles.gridAlbumArtist} numberOfLines={1}>
                    {album.artist}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
          <Ionicons name="home" size={24} color="#E63946" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/store')}
          activeOpacity={0.6}
        >
          <Ionicons name="library-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: '#E63946',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  topPickCard: {
    width: 280,
    marginRight: 12,
  },
  topPickGradient: {
    height: 140,
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 16,
    marginBottom: 8,
  },
  topPickBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  topPickTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topPickSubtitle: {
    fontSize: 13,
    color: '#999999',
  },
  albumCard: {
    width: 160,
    marginRight: 12,
  },
  albumCover: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1a1a1a',
  },
  albumCoverPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 13,
    color: '#999999',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridAlbumCard: {
    width: albumCardWidth,
    marginRight: 12,
    marginBottom: 20,
  },
  gridAlbumCover: {
    width: albumCardWidth,
    height: albumCardWidth,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1a1a1a',
  },
  gridAlbumCoverPlaceholder: {
    width: albumCardWidth,
    height: albumCardWidth,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridAlbumTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  gridAlbumArtist: {
    fontSize: 12,
    color: '#999999',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
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
    color: '#E63946',
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

