import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { preOrderId, dropTitle, artistName, amount } = useLocalSearchParams<{
    preOrderId: string;
    dropTitle: string;
    artistName: string;
    amount: string;
  }>();

  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate confirmation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Success Animation */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#06FFA5', '#00D987']}
              style={styles.successGradient}
            >
              <Ionicons name="checkmark" size={64} color="#000000" />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.successTitle}>Pre-Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your Stream Disc is on its way
            </Text>
          </Animated.View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="disc" size={20} color="#06FFA5" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Album</Text>
              <Text style={styles.detailValue}>{dropTitle}</Text>
              <Text style={styles.detailArtist}>by {artistName}</Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Ionicons name="card" size={20} color="#06FFA5" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>${amount}</Text>
              <Text style={styles.detailSubtext}>Held in secure escrow</Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Ionicons name="receipt" size={20} color="#06FFA5" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValueSmall}>{preOrderId}</Text>
            </View>
          </View>
        </View>

        {/* What Happens Next */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happens Next</Text>

          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={styles.timelineIconActive}>
                  <Ionicons name="checkmark" size={16} color="#000000" />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Confirmed</Text>
                <Text style={styles.timelineSubtitle}>Right now</Text>
                <Text style={styles.timelineDescription}>
                  Your pre-order is confirmed and funds are securely held in escrow.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="construct" size={16} color="#9A9A9A" />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Batch Enters Production</Text>
                <Text style={styles.timelineSubtitle}>Coming soon</Text>
                <Text style={styles.timelineDescription}>
                  Your disc will be manufactured in the next scheduled batch. You'll receive an email notification.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="airplane" size={16} color="#9A9A9A" />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Disc Ships</Text>
                <Text style={styles.timelineSubtitle}>After production</Text>
                <Text style={styles.timelineDescription}>
                  You'll receive tracking information once your Stream Disc ships.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="musical-notes" size={16} color="#9A9A9A" />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Enjoy Your Music</Text>
                <Text style={styles.timelineSubtitle}>Upon delivery</Text>
                <Text style={styles.timelineDescription}>
                  Scan your Stream Disc with NFC to unlock and play the exclusive album!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Artist Payout Info */}
        <View style={styles.payoutCard}>
          <Ionicons name="heart" size={20} color="#FF3B5C" />
          <View style={styles.payoutText}>
            <Text style={styles.payoutTitle}>Supporting the Artist</Text>
            <Text style={styles.payoutDescription}>
              The artist will receive 70% of your payment once production begins. 
              Thank you for supporting independent music!
            </Text>
          </View>
        </View>

        {/* Email Confirmation Notice */}
        <View style={styles.emailNotice}>
          <Ionicons name="mail" size={20} color="#3A86FF" />
          <Text style={styles.emailNoticeText}>
            A confirmation email has been sent to your inbox with all order details.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionFooter}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/orders')}
          activeOpacity={0.7}
        >
          <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/marketplace')}
          activeOpacity={0.8}
        >
          <Ionicons name="storefront" size={20} color="#000000" />
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
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
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  successGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9A9A9A',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: 'rgba(6, 255, 165, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9A9A',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  detailValueSmall: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  detailArtist: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  detailSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: '#06FFA5',
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
  },
  timelineIconActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#06FFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#06FFA5',
    marginBottom: 8,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#9A9A9A',
    lineHeight: 20,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255, 59, 92, 0.1)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 92, 0.2)',
  },
  payoutText: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B5C',
    marginBottom: 6,
  },
  payoutDescription: {
    fontSize: 13,
    color: '#FF3B5C',
    lineHeight: 18,
  },
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.2)',
  },
  emailNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#3A86FF',
    fontWeight: '500',
    lineHeight: 18,
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  secondaryButton: {
    flex: 1,
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
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});

