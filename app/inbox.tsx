import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MiniPlayer from '../src/components/MiniPlayer';
import { usePlayer } from '../src/contexts/PlayerContext';

// Mock notifications data
const NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: 'SarahM',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    message: 'liked your album "Midnight Dreams"',
    time: '2h ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    user: 'MusicLover88',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    message: 'commented: "This is amazing! 🔥"',
    time: '5h ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    user: 'JazzFan',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    message: 'started following you',
    time: '1d ago',
    read: true,
  },
  {
    id: '4',
    type: 'purchase',
    user: 'AlexK',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    message: 'purchased your album "Golden Hour"',
    time: '2d ago',
    read: true,
  },
];

export default function InboxScreen() {
  const router = useRouter();
  const { currentTrack } = usePlayer();
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  const getIconName = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'purchase':
        return 'cart';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'like':
        return '#FF3B5C';
      case 'comment':
        return '#06FFA5';
      case 'follow':
        return '#3A86FF';
      case 'purchase':
        return '#FFD60A';
      default:
        return '#999999';
    }
  };

  const filteredNotifications =
    selectedTab === 'unread'
      ? NOTIFICATIONS.filter((n) => !n.read)
      : NOTIFICATIONS;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="checkmark-done-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unread' && styles.tabActive]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text style={[styles.tabText, selectedTab === 'unread' && styles.tabTextActive]}>
            Unread
          </Text>
          {NOTIFICATIONS.filter((n) => !n.read).length > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {NOTIFICATIONS.filter((n) => !n.read).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mail-open-outline" size={64} color="#666666" />
            <Text style={styles.emptyStateTitle}>No New Messages</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! Check back later for new notifications.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationCardUnread,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.notificationLeft}>
                <Image
                  source={{ uri: notification.userAvatar }}
                  style={styles.userAvatar}
                />
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: getIconColor(notification.type) },
                  ]}
                >
                  <Ionicons
                    name={getIconName(notification.type) as any}
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>
                  <Text style={styles.notificationUser}>{notification.user}</Text>{' '}
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>

              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

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

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/library')}
          activeOpacity={0.6}
        >
          <Ionicons name="library-outline" size={24} color="#999999" />
          <Text style={styles.navLabel}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButtonNav}
          onPress={() => router.push('/create-album')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
          <Ionicons name="mail" size={24} color="#FF3B5C" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Inbox</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
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
  unreadBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B5C',
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
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationCardUnread: {
    backgroundColor: '#2C2C2E',
  },
  notificationLeft: {
    position: 'relative',
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  notificationIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationUser: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B5C',
    marginLeft: 12,
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

