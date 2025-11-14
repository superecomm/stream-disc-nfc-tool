import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firestoreService } from '../src/services/firestore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface Drop {
  id: string;
  title: string;
  artistName: string;
  coverImage: string;
  price: number;
  isExclusive: boolean;
  soldCount: number;
  totalEditions: number | null;
  status: string;
  genre?: string;
}

const GENRES = ['All', 'Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Country'];

export default function MarketplaceScreen() {
  const router = useRouter();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([]);
  const [featuredDrops, setFeaturedDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  useEffect(() => {
    filterDrops();
  }, [searchQuery, selectedGenre, drops]);

  const loadMarketplaceData = async () => {
    try {
      // In production, this would call firestoreService.getActiveDrops()
      // For now, we'll use mock data for testing
      const mockDrops: Drop[] = [
        {
          id: 'drop-1',
          title: 'Midnight Dreams',
          artistName: 'Luna Rey',
          coverImage: 'https://picsum.photos/seed/album1/400/400',
          price: 24.99,
          isExclusive: true,
          soldCount: 847,
          totalEditions: 1000,
          status: 'active',
          genre: 'R&B',
        },
        {
          id: 'drop-2',
          title: 'Electric Soul',
          artistName: 'The Vibes Collective',
          coverImage: 'https://picsum.photos/seed/album2/400/400',
          price: 19.99,
          isExclusive: false,
          soldCount: 1243,
          totalEditions: null,
          status: 'active',
          genre: 'Electronic',
        },
        {
          id: 'drop-3',
          title: 'Urban Poetry',
          artistName: 'Marcus Flow',
          coverImage: 'https://picsum.photos/seed/album3/400/400',
          price: 29.99,
          isExclusive: true,
          soldCount: 456,
          totalEditions: 500,
          status: 'active',
          genre: 'Hip-Hop',
        },
        {
          id: 'drop-4',
          title: 'Summer Nights',
          artistName: 'Coastal Dreams',
          coverImage: 'https://picsum.photos/seed/album4/400/400',
          price: 22.99,
          isExclusive: false,
          soldCount: 892,
          totalEditions: null,
          status: 'active',
          genre: 'Pop',
        },
        {
          id: 'drop-5',
          title: 'Jazz at Midnight',
          artistName: 'The Blue Notes',
          coverImage: 'https://picsum.photos/seed/album5/400/400',
          price: 27.99,
          isExclusive: true,
          soldCount: 234,
          totalEditions: 300,
          status: 'active',
          genre: 'Jazz',
        },
        {
          id: 'drop-6',
          title: 'Rock Legends',
          artistName: 'Thunder Road',
          coverImage: 'https://picsum.photos/seed/album6/400/400',
          price: 24.99,
          isExclusive: false,
          soldCount: 1567,
          totalEditions: null,
          status: 'active',
          genre: 'Rock',
        },
      ];

      setDrops(mockDrops);
      setFilteredDrops(mockDrops);
      
      // Featured = top 3 by soldCount
      const featured = [...mockDrops]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 3);
      setFeaturedDrops(featured);
    } catch (error) {
      console.error('Error loading marketplace:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterDrops = () => {
    let filtered = [...drops];

    // Filter by genre
    if (selectedGenre !== 'All') {
      filtered = filtered.filter((drop) => drop.genre === selectedGenre);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (drop) =>
          drop.title.toLowerCase().includes(query) ||
          drop.artistName.toLowerCase().includes(query)
      );
    }

    setFilteredDrops(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMarketplaceData();
  };

  const handleDropPress = (dropId: string) => {
    router.push({
      pathname: '/drop-detail',
      params: { dropId },
    });
  };

  const renderDropCard = (drop: Drop) => {
    const remainingEditions = drop.totalEditions
      ? drop.totalEditions - drop.soldCount
      : null;
    const isLowStock = remainingEditions !== null && remainingEditions < 50;
    const isSoldOut = remainingEditions !== null && remainingEditions <= 0;

    return (
      <TouchableOpacity
        key={drop.id}
        style={styles.dropCard}
        onPress={() => handleDropPress(drop.id)}
        activeOpacity={0.8}
      >
        <View style={styles.dropImageContainer}>
          <Image source={{ uri: drop.coverImage }} style={styles.dropImage} />
          
          {/* Exclusive Badge */}
          {drop.isExclusive && (
            <View style={styles.exclusiveBadge}>
              <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
              <Text style={styles.exclusiveBadgeText}>EXCLUSIVE</Text>
            </View>
          )}

          {/* Stock Status */}
          {isSoldOut && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
          {!isSoldOut && isLowStock && (
            <View style={styles.lowStockBadge}>
              <Ionicons name="flash" size={10} color="#FF9500" />
              <Text style={styles.lowStockText}>{remainingEditions} left</Text>
            </View>
          )}
        </View>

        <View style={styles.dropInfo}>
          <Text style={styles.dropTitle} numberOfLines={1}>
            {drop.title}
          </Text>
          <Text style={styles.dropArtist} numberOfLines={1}>
            {drop.artistName}
          </Text>
          
          <View style={styles.dropFooter}>
            <Text style={styles.dropPrice}>${drop.price.toFixed(2)}</Text>
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>{drop.soldCount} sold</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedCard = (drop: Drop, index: number) => {
    return (
      <TouchableOpacity
        key={drop.id}
        style={styles.featuredCard}
        onPress={() => handleDropPress(drop.id)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: drop.coverImage }} style={styles.featuredImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredRank}>
            <Text style={styles.featuredRankText}>#{index + 1}</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {drop.title}
          </Text>
          <Text style={styles.featuredArtist} numberOfLines={1}>
            {drop.artistName}
          </Text>
          <View style={styles.featuredFooter}>
            <Text style={styles.featuredPrice}>${drop.price.toFixed(2)}</Text>
            <View style={styles.featuredSoldBadge}>
              <Ionicons name="flame" size={14} color="#FF3B5C" />
              <Text style={styles.featuredSoldText}>{drop.soldCount}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#06FFA5"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSubtitle}>
            Pre-order exclusive Stream Disc albums
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9A9A9A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search albums or artists..."
            placeholderTextColor="#9A9A9A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9A9A9A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Genre Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.genreScroll}
          contentContainerStyle={styles.genreScrollContent}
        >
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreChip,
                selectedGenre === genre && styles.genreChipActive,
              ]}
              onPress={() => setSelectedGenre(genre)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.genreChipText,
                  selectedGenre === genre && styles.genreChipTextActive,
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Drops */}
        {!searchQuery && selectedGenre === 'All' && featuredDrops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={24} color="#FF3B5C" />
              <Text style={styles.sectionTitle}>Trending Now</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredDrops.map((drop, index) => renderFeaturedCard(drop, index))}
            </ScrollView>
          </View>
        )}

        {/* All Drops Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="disc" size={24} color="#06FFA5" />
            <Text style={styles.sectionTitle}>
              {searchQuery || selectedGenre !== 'All' ? 'Results' : 'All Drops'}
            </Text>
            <Text style={styles.resultCount}>({filteredDrops.length})</Text>
          </View>

          {filteredDrops.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#9A9A9A" />
              <Text style={styles.emptyStateTitle}>No drops found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <View style={styles.dropsGrid}>
              {filteredDrops.map((drop) => renderDropCard(drop))}
            </View>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Global Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/player-home')}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={24} color="#9A9A9A" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/library')}
          activeOpacity={0.7}
        >
          <Ionicons name="library-outline" size={24} color="#9A9A9A" />
          <Text style={styles.navButtonText}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Ionicons name="storefront" size={24} color="#06FFA5" />
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Store</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/inbox')}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbox-outline" size={24} color="#9A9A9A" />
          <Text style={styles.navButtonText}>Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={24} color="#9A9A9A" />
          <Text style={styles.navButtonText}>Profile</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  genreScroll: {
    marginBottom: 24,
  },
  genreScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  genreChipActive: {
    backgroundColor: '#06FFA5',
    borderColor: '#06FFA5',
  },
  genreChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9A9A9A',
  },
  genreChipTextActive: {
    color: '#000000',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9A9A9A',
    marginLeft: 4,
  },
  featuredScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 280,
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#1C1C1E',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  featuredRank: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B5C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  featuredArtist: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9A9A9A',
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
  },
  featuredSoldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 59, 92, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredSoldText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B5C',
  },
  dropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  dropCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  dropImageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    position: 'relative',
  },
  dropImage: {
    width: '100%',
    height: '100%',
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exclusiveBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B5C',
    letterSpacing: 1,
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dropInfo: {
    padding: 12,
  },
  dropTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dropArtist: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
    marginBottom: 8,
  },
  dropFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
  },
  soldBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soldText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A9A9A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9A9A9A',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  navButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  navButtonTextActive: {
    color: '#06FFA5',
  },
});

