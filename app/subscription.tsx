import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../src/services/payment';
import { authService } from '../src/services/auth';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    storage: '2GB',
    features: [
      '2GB storage',
      'Album & Mixtape creation',
      'Basic features',
      'Ad-supported',
    ],
    color: '#9A9A9A',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 10,
    storage: '5GB',
    features: [
      'No ads',
      '5GB storage',
      'Publish to Stream Disc Store',
      'All content types',
      'Priority support',
    ],
    color: '#06FFA5',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 20,
    storage: '30GB',
    features: [
      'Everything in Pro',
      '30GB storage',
      'Analytics dashboard',
      'Custom branding',
      'Team collaboration',
    ],
    color: '#8338EC',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    storage: 'Unlimited',
    features: [
      'Everything in Business',
      'Unlimited storage',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    color: '#FF006E',
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentTier();
  }, []);

  const loadCurrentTier = async () => {
    try {
      const tier = await paymentService.getCurrentTier();
      setCurrentTier(tier);
    } catch (error) {
      console.error('Error loading current tier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      // Can't downgrade to free from this screen
      return;
    }

    if (planId === 'enterprise') {
      // Contact sales
      Linking.openURL('mailto:sales@streamdisc.com?subject=Enterprise Plan Inquiry');
      return;
    }

    setIsLoading(true);
    try {
      await paymentService.initiatePurchase(planId as 'pro' | 'business');
      // Reload tier after purchase
      await loadCurrentTier();
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.headerTitle}>Subscription Plans</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Upgrade anytime to unlock more features and storage
          </Text>
        </View>

        {/* Plans */}
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const canUpgrade = plan.id !== 'free' && !isCurrent;

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                isCurrent && styles.planCardCurrent,
                plan.popular && styles.planCardPopular,
              ]}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}

              {/* Current Badge */}
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#06FFA5" />
                  <Text style={styles.currentText}>Current Plan</Text>
                </View>
              )}

              {/* Plan Header */}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  {plan.price !== null ? (
                    <>
                      <Text style={styles.priceSymbol}>$</Text>
                      <Text style={styles.price}>{plan.price}</Text>
                      <Text style={styles.pricePeriod}>/month</Text>
                    </>
                  ) : (
                    <Text style={styles.priceCustom}>Contact Sales</Text>
                  )}
                </View>
                <Text style={styles.storage}>{plan.storage} storage</Text>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={18} color={plan.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              {canUpgrade && (
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { backgroundColor: plan.color },
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  activeOpacity={0.5}
                >
                  <Text style={styles.selectButtonText}>
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              )}

              {isCurrent && plan.id !== 'free' && (
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => paymentService.cancelSubscription()}
                  activeOpacity={0.5}
                >
                  <Text style={styles.manageButtonText}>Manage Subscription</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All plans include unlimited disc creation and NFC programming.
          </Text>
          <Text style={styles.footerText}>
            Cancel anytime. No long-term contracts.
          </Text>
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
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  titleContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#9A9A9A',
    fontWeight: '400',
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  planCardCurrent: {
    borderColor: '#06FFA5',
    borderWidth: 2,
  },
  planCardPopular: {
    borderColor: '#06FFA5',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#06FFA5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  currentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06FFA5',
  },
  planHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9A9A9A',
    marginLeft: 4,
  },
  priceCustom: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    flex: 1,
  },
  selectButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  manageButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
});

