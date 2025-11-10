import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../src/services/auth';
import { firestoreService } from '../src/services/firestore';
import { paymentService } from '../src/services/payment';
import { Disc } from '../src/types';

export default function DashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 2147483648, percentage: 0 });
  const [myDiscs, setMyDiscs] = useState<Disc[]>([]);
  const [currentTier, setCurrentTier] = useState('free');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        router.replace('/auth/sign-in');
        return;
      }

      // Load user profile
      const profile = await firestoreService.getUserProfile(userId);
      setUserProfile(profile);

      // Load storage info
      const storage = await firestoreService.getUserStorageInfo(userId);
      setStorageInfo(storage);

      // Load user's discs
      const discs = await firestoreService.getUserDiscs(userId);
      setMyDiscs(discs);

      // Load subscription tier
      const tier = await paymentService.getCurrentTier();
      setCurrentTier(tier);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStorageBarColor = () => {
    if (storageInfo.percentage < 75) return '#06FFA5';
    if (storageInfo.percentage < 90) return '#FFBE0B';
    return '#FF3B30';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/admin')} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color="#9A9A9A" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.displayName}>{userProfile?.displayName || 'User'}</Text>
          <Text style={styles.email}>{userProfile?.email || 'Anonymous'}</Text>
        </View>

        {/* Subscription Badge */}
        <View style={styles.subscriptionBadge}>
          <View style={styles.badgeContent}>
            <Ionicons
              name={currentTier === 'free' ? 'pricetag-outline' : 'diamond'}
              size={20}
              color={currentTier === 'free' ? '#9A9A9A' : '#06FFA5'}
            />
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeTitle}>
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
              </Text>
              <Text style={styles.badgeSubtitle}>
                {currentTier === 'free' ? 'Upgrade to unlock more features' : 'All features unlocked'}
              </Text>
            </View>
            {currentTier === 'free' ? (
              <TouchableOpacity onPress={() => router.push('/subscription')}>
                <Text style={styles.upgradeText}>Upgrade</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.push('/subscription')}>
                <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Storage Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Usage</Text>
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <Text style={styles.storageUsed}>
                {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.limit)}
              </Text>
              <Text style={styles.storagePercentage}>
                {Math.round(storageInfo.percentage)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(storageInfo.percentage, 100)}%`,
                    backgroundColor: getStorageBarColor(),
                  },
                ]}
              />
            </View>
            {storageInfo.percentage > 80 && (
              <Text style={styles.storageWarning}>
                ⚠️ Storage almost full. Upgrade for more space.
              </Text>
            )}
          </View>
        </View>

        {/* My Stream Discs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Stream Discs</Text>
            <Text style={styles.discCount}>{myDiscs.length}</Text>
          </View>

          {myDiscs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="disc-outline" size={48} color="#666666" />
              <Text style={styles.emptyStateText}>No discs created yet</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/')}
                activeOpacity={0.5}
              >
                <Text style={styles.createButtonText}>Create Your First Disc</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.discsList}>
              {myDiscs.map((disc) => (
                <TouchableOpacity
                  key={disc.id}
                  style={styles.discCard}
                  onPress={() => router.push(`/${disc.id}`)}
                  activeOpacity={0.7}
                >
                  {disc.coverImage ? (
                    <Image source={{ uri: disc.coverImage }} style={styles.discCover} />
                  ) : (
                    <View style={styles.discCoverPlaceholder}>
                      <Ionicons name="disc-outline" size={32} color="#666666" />
                    </View>
                  )}
                  <Text style={styles.discTitle} numberOfLines={1}>
                    {disc.title}
                  </Text>
                  <Text style={styles.discArtist} numberOfLines={1}>
                    {disc.artist}
                  </Text>
                  <Text style={styles.discDate}>
                    {disc.createdAt.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/subscription')}
            activeOpacity={0.5}
          >
            <Ionicons name="diamond-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Manage Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
            activeOpacity={0.5}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#06FFA5',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#06FFA5',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 14,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  subscriptionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
    overflow: 'hidden',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  badgeSubtitle: {
    fontSize: 12,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  discCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9A9A9A',
  },
  storageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageUsed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storagePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9A9A9A',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  storageWarning: {
    fontSize: 12,
    color: '#FFBE0B',
    marginTop: 8,
  },
  discsList: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  discCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  discCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  discCoverPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  discTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  discArtist: {
    fontSize: 12,
    color: '#9A9A9A',
    marginBottom: 4,
  },
  discDate: {
    fontSize: 11,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9A9A9A',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#06FFA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  signOutText: {
    color: '#FF3B30',
  },
});

