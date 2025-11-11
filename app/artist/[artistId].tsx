import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARTISTS, findArtistById } from '../../src/mocks/artists';
import { ALBUMS } from '../../src/mocks/albums';
import AlbumCard from '../../src/components/AlbumCard';

const { width, height } = Dimensions.get('window');

export default function ArtistProfileScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const artist = artistId ? findArtistById(artistId) : ARTISTS[0]; // Default to Luna Rey

  if (!artist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Artist not found</Text>
      </View>
    );
  }

  const artistAlbums = ALBUMS.filter(album => album.artistId === artist.id);
  const headerOpacity = Math.min(scrollY / 200, 1);

  return (
    <View style={styles.container}>
      {/* Fixed Header (appears on scroll) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.95)', 'transparent']}
        style={[styles.fixedHeader, { opacity: headerOpacity }]}
      >
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {artist.name}
          </Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Cover Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: artist.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', '#000000']}
            style={styles.heroGradient}
          />
          
          {/* Back Button (Floating) */}
          <SafeAreaView edges={['top']} style={styles.floatingNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Artist Profile Image (Overlapping) */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: artist.profileImage }}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* Artist Info */}
        <View style={styles.infoSection}>
          <Text style={styles.artistName}>{artist.name}</Text>
          
          {/* Profile Button + Verified Badge Row */}
          <View style={styles.badgeRow}>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
            
            {artist.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#FF3B5C" />
                <Text style={styles.verifiedText}>Verified Artist</Text>
              </View>
            )}
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(artist.stats.monthlyListeners / 1000).toFixed(1)}K
              </Text>
              <Text style={styles.statLabel}>Monthly Listeners</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(artist.stats.totalStreams / 1000000).toFixed(1)}M
              </Text>
              <Text style={styles.statLabel}>Total Streams</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{artist.stats.totalReleases}</Text>
              <Text style={styles.statLabel}>Releases</Text>
            </View>
          </View>

          {/* Genre Tags */}
          <View style={styles.genreTags}>
            {artist.genre.slice(0, 3).map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{genre}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shuffleButton}>
              <Ionicons name="shuffle" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          {(artist.socials.instagram || artist.socials.twitter || artist.socials.website) && (
            <View style={styles.socialLinks}>
              {artist.socials.instagram && (
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-instagram" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {artist.socials.twitter && (
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-twitter" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {artist.socials.website && (
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="globe-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Latest Release */}
        {artistAlbums.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Release</Text>
            </View>
            <View style={styles.latestReleaseContainer}>
              <AlbumCard
                album={artistAlbums[0]}
                onPress={() => router.push(`/album/${artistAlbums[0].id}` as any)}
                size="large"
                showBuyButton={false}
              />
            </View>
          </View>
        )}

        {/* Popular Releases */}
        {artistAlbums.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Releases</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {artistAlbums.slice(1).map(album => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onPress={() => router.push(`/album/${album.id}` as any)}
                  size="medium"
                  showBuyButton={true}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{artist.bio}</Text>
          
          <View style={styles.followerRow}>
            <Ionicons name="people" size={20} color="#8E8E93" />
            <Text style={styles.followerText}>
              {(artist.stats.followers / 1000).toFixed(1)}K followers
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  heroContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -50,
    left: 24,
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoSection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  artistName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  profileButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#2C2C2E',
  },
  genreTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
  },
  genreTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#FF3B5C',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#8E8E93',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shuffleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF3B5C',
    fontWeight: '600',
  },
  latestReleaseContainer: {
    paddingHorizontal: 24,
  },
  horizontalScroll: {
    paddingHorizontal: 24,
  },
  bioText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  followerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bottomSpacer: {
    height: 100,
  },
});

