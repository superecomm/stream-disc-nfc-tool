import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../src/services/auth';
import { firestoreService } from '../src/services/firestore';
import AlbumCard from '../src/components/AlbumCard';
import MiniPlayer from '../src/components/MiniPlayer';
import { usePlayer } from '../src/contexts/PlayerContext';

export default function LibraryScreen() {
  const router = useRouter();
  const { currentTrack } = usePlayer();
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'albums' | 'playlists' | 'artists'>('albums');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      // Load user's albums
      const userAlbums = await firestoreService.getUserAlbums(userId);
      setAlbums(userAlbums);
    } catch (error) {
      console.error('Error loading library:', error);
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
        <Text style={styles.headerTitle}>Library</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'albums' && styles.tabActive]}
          onPress={() => setSelectedTab('albums')}
        >
          <Text style={[styles.tabText, selectedTab === 'albums' && styles.tabTextActive]}>
            Albums
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'playlists' && styles.tabActive]}
          onPress={() => setSelectedTab('playlists')}
        >
          <Text style={[styles.tabText, selectedTab === 'playlists' && styles.tabTextActive]}>
            Playlists
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'artists' && styles.tabActive]}
          onPress={() => setSelectedTab('artists')}
        >
          <Text style={[styles.tabText, selectedTab === 'artists' && styles.tabTextActive]}>
            Artists
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B5C" />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {albums.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={64} color="#666666" />
              <Text style={styles.emptyStateTitle}>Your Library is Empty</Text>
              <Text style={styles.emptyStateText}>
                Create albums or add music to your library to see them here.
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/create-album')}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Album</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={{
                    id: album.id,
                    title: album.title,
                    artist: album.artist,
                    artistId: album.userId,
                    coverUrl: album.coverUrl,
                    year: album.year,
                    genre: album.genre || 'Music',
                    price: album.price || 0,
                    tracks: [],
                  }}
                  onPress={() => handleAlbumPress(album.id)}
                  size="medium"
                />
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* Mini Player */}
      {currentTrack && <MiniPlayer />}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/player-home')}
          activeOpacity={0.6}
        >
          <Ionicons name="home-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
          <Ionicons name="library" size={24} color="#FF3B5C" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButtonNav}
          onPress={() => router.push('/create-album')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#000000" />
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: '#FF3B5C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999999',
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF3B5C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
    borderTopColor: '#1a1a1a',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  navLabelActive: {
    color: '#FF3B5C',
  },
  createButtonNav: {
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
});

