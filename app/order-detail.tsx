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
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OrderDetail {
  id: string;
  dropTitle: string;
  artistName: string;
  coverImage: string;
  amount: number;
  status: 'pending' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  batchId: string | null;
  batchName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  orderedAt: Date;
  productionStartedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: {
    last4: string;
    brand: string;
  };
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, []);

  const loadOrderDetail = async () => {
    try {
      // In production, fetch from Firestore
      // Mock data for testing
      const mockOrder: OrderDetail = {
        id: orderId,
        dropTitle: 'Midnight Dreams',
        artistName: 'Luna Rey',
        coverImage: 'https://picsum.photos/seed/album1/800/800',
        amount: 24.99,
        status: 'in_production',
        batchId: 'batch-001',
        batchName: 'January 2025 Batch',
        trackingNumber: null,
        trackingUrl: null,
        orderedAt: new Date('2025-01-10T14:30:00'),
        productionStartedAt: new Date('2025-01-15T09:00:00'),
        shippedAt: null,
        deliveredAt: null,
        shippingAddress: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'United States',
        },
        paymentMethod: {
          last4: '4242',
          brand: 'Visa',
        },
      };

      setOrder(mockOrder);
    } catch (error) {
      console.error('Error loading order detail:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPackage = () => {
    if (order?.trackingUrl) {
      Linking.openURL(order.trackingUrl);
    } else if (order?.trackingNumber) {
      // Default to UPS tracking
      Linking.openURL(`https://www.ups.com/track?tracknum=${order.trackingNumber}`);
    }
  };

  const getStatusColor = (status: OrderDetail['status']) => {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B5C" />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(order.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Album Info */}
        <View style={styles.albumSection}>
          <Image source={{ uri: order.coverImage }} style={styles.albumCover} />
          <Text style={styles.albumTitle}>{order.dropTitle}</Text>
          <Text style={styles.albumArtist}>{order.artistName}</Text>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}40` }]}>
          <View style={styles.statusLeft}>
            <Ionicons name="information-circle" size={24} color={statusColor} />
            <View style={styles.statusText}>
              <Text style={[styles.statusTitle, { color: statusColor }]}>
                {order.status === 'pending' && 'Awaiting Production'}
                {order.status === 'in_production' && 'Manufacturing in Progress'}
                {order.status === 'shipped' && 'Shipped'}
                {order.status === 'delivered' && 'Delivered'}
                {order.status === 'cancelled' && 'Cancelled'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: statusColor }]}>
                {order.status === 'pending' && 'Your order will be included in the next batch'}
                {order.status === 'in_production' && `Batch: ${order.batchName}`}
                {order.status === 'shipped' && `Tracking: ${order.trackingNumber}`}
                {order.status === 'delivered' && 'Enjoy your Stream Disc!'}
                {order.status === 'cancelled' && 'Order was cancelled'}
              </Text>
            </View>
          </View>
          {order.status === 'shipped' && order.trackingNumber && (
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackPackage}>
              <Text style={styles.trackButtonText}>Track</Text>
              <Ionicons name="open-outline" size={16} color="#06FFA5" />
            </TouchableOpacity>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timelineCard}>
            {/* Ordered */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconActive}>
                <Ionicons name="checkmark" size={16} color="#000000" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Placed</Text>
                <Text style={styles.timelineDate}>
                  {order.orderedAt.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {/* Production */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, order.productionStartedAt && styles.timelineIconActive]}>
                <Ionicons
                  name={order.productionStartedAt ? 'checkmark' : 'construct'}
                  size={16}
                  color={order.productionStartedAt ? '#000000' : '#9A9A9A'}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Production Started</Text>
                {order.productionStartedAt ? (
                  <Text style={styles.timelineDate}>
                    {order.productionStartedAt.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                ) : (
                  <Text style={styles.timelinePending}>Waiting for batch</Text>
                )}
              </View>
            </View>

            {/* Shipped */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, order.shippedAt && styles.timelineIconActive]}>
                <Ionicons
                  name={order.shippedAt ? 'checkmark' : 'airplane'}
                  size={16}
                  color={order.shippedAt ? '#000000' : '#9A9A9A'}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Shipped</Text>
                {order.shippedAt ? (
                  <Text style={styles.timelineDate}>
                    {order.shippedAt.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                ) : (
                  <Text style={styles.timelinePending}>Not yet shipped</Text>
                )}
              </View>
            </View>

            {/* Delivered */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, order.deliveredAt && styles.timelineIconActive]}>
                <Ionicons
                  name={order.deliveredAt ? 'checkmark' : 'home'}
                  size={16}
                  color={order.deliveredAt ? '#000000' : '#9A9A9A'}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Delivered</Text>
                {order.deliveredAt ? (
                  <Text style={styles.timelineDate}>
                    {order.deliveredAt.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                ) : (
                  <Text style={styles.timelinePending}>Not yet delivered</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color="#06FFA5" />
            <View style={styles.infoText}>
              <Text style={styles.infoValue}>{order.shippingAddress.name}</Text>
              <Text style={styles.infoValue}>{order.shippingAddress.address}</Text>
              <Text style={styles.infoValue}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </Text>
              <Text style={styles.infoValue}>{order.shippingAddress.country}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.infoCard}>
            <Ionicons name="card" size={20} color="#06FFA5" />
            <View style={styles.infoText}>
              <Text style={styles.infoValue}>
                {order.paymentMethod.brand} ending in {order.paymentMethod.last4}
              </Text>
              <Text style={styles.infoSubtext}>Amount: ${order.amount.toFixed(2)}</Text>
              <Text style={styles.infoSubtext}>Held in secure escrow</Text>
            </View>
          </View>
        </View>

        {/* Order ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Reference</Text>
          <View style={styles.infoCard}>
            <Ionicons name="receipt" size={20} color="#06FFA5" />
            <View style={styles.infoText}>
              <Text style={styles.infoValueSmall}>{order.id}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Help Button */}
      <View style={styles.helpFooter}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => router.push('/inbox')}
          activeOpacity={0.8}
        >
          <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.helpButtonText}>Need Help?</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B5C',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#06FFA5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
  albumSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  albumCover: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    borderWidth: 1,
    borderColor: '#06FFA5',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#06FFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#06FFA5',
  },
  timelinePending: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoValueSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  infoSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  helpFooter: {
    padding: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

