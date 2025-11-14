import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../src/services/auth';
import { paymentService } from '../src/services/payment';

interface PreOrder {
  id: string;
  dropTitle: string;
  artistName: string;
  coverImage: string;
  amount: number;
  status: 'pending' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  batchId: string | null;
  trackingNumber: string | null;
  orderedAt: Date;
  shippedAt: Date | null;
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setOrders([]);
        return;
      }

      // In production, fetch from Firestore
      // For now, mock data
      const mockOrders: PreOrder[] = [
        {
          id: 'order-1',
          dropTitle: 'Midnight Dreams',
          artistName: 'Luna Rey',
          coverImage: 'https://picsum.photos/seed/album1/400/400',
          amount: 24.99,
          status: 'in_production',
          batchId: 'batch-001',
          trackingNumber: null,
          orderedAt: new Date('2025-01-10'),
          shippedAt: null,
        },
        {
          id: 'order-2',
          dropTitle: 'Electric Soul',
          artistName: 'The Vibes Collective',
          coverImage: 'https://picsum.photos/seed/album2/400/400',
          amount: 19.99,
          status: 'pending',
          batchId: null,
          trackingNumber: null,
          orderedAt: new Date('2025-01-12'),
          shippedAt: null,
        },
        {
          id: 'order-3',
          dropTitle: 'Urban Poetry',
          artistName: 'Marcus Flow',
          coverImage: 'https://picsum.photos/seed/album3/400/400',
          amount: 29.99,
          status: 'shipped',
          batchId: 'batch-001',
          trackingNumber: '1Z999AA10123456784',
          orderedAt: new Date('2024-12-20'),
          shippedAt: new Date('2025-01-05'),
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: PreOrder['status']) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'in_production':
        return '#3A86FF';
      case 'shipped':
        return '#06FFA5';
      case 'delivered':
        return '#00D987';
      case 'cancelled':
        return '#FF3B5C';
      default:
        return '#9A9A9A';
    }
  };

  const getStatusIcon = (status: PreOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'time';
      case 'in_production':
        return 'construct';
      case 'shipped':
        return 'airplane';
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: PreOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Production';
      case 'in_production':
        return 'In Production';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const renderOrderCard = (order: PreOrder) => {
    const statusColor = getStatusColor(order.status);
    const statusIcon = getStatusIcon(order.status);
    const statusText = getStatusText(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() =>
          router.push({
            pathname: '/order-detail',
            params: { orderId: order.id },
          })
        }
        activeOpacity={0.7}
      >
        <Image source={{ uri: order.coverImage }} style={styles.orderImage} />
        
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle} numberOfLines={1}>
            {order.dropTitle}
          </Text>
          <Text style={styles.orderArtist} numberOfLines={1}>
            {order.artistName}
          </Text>
          
          <View style={styles.orderMeta}>
            <Text style={styles.orderPrice}>${order.amount.toFixed(2)}</Text>
            <Text style={styles.orderDate}>
              {order.orderedAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.orderStatus}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={statusIcon as any} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {orders.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#06FFA5"
            />
          }
        >
          <Ionicons name="receipt-outline" size={64} color="#9A9A9A" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>
            Start exploring the marketplace to pre-order exclusive Stream Discs
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/marketplace')}
            activeOpacity={0.8}
          >
            <Ionicons name="storefront" size={20} color="#000000" />
            <Text style={styles.emptyButtonText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
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
          {/* Order Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {orders.filter((o) => o.status === 'pending' || o.status === 'in_production').length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${orders.reduce((sum, o) => sum + o.amount, 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>

          {/* Orders List */}
          <View style={styles.ordersSection}>
            <Text style={styles.sectionTitle}>All Orders</Text>
            {orders.map((order) => renderOrderCard(order))}
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

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
          onPress={() => router.push('/marketplace')}
          activeOpacity={0.7}
        >
          <Ionicons name="storefront-outline" size={24} color="#9A9A9A" />
          <Text style={styles.navButtonText}>Store</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#9A9A9A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  ordersSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  orderArtist: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  orderStatus: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
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
});

