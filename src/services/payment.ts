import { Alert } from 'react-native';
import { firestoreService } from './firestore';
import { authService } from './auth';

/**
 * Payment Service
 * Placeholder for future Stripe or RevenueCat integration
 */

type SubscriptionTier = 'pro' | 'business' | 'enterprise';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  price: number;
  storage: string;
  features: string[];
}

const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionInfo> = {
  pro: {
    tier: 'pro',
    price: 10,
    storage: '5GB',
    features: [
      'No ads',
      '5GB storage',
      'Publish to Stream Disc Store',
      'Unlimited disc creation',
      'Priority support',
    ],
  },
  business: {
    tier: 'business',
    price: 20,
    storage: '30GB',
    features: [
      'No ads',
      '30GB storage',
      'Publish to Stream Disc Store',
      'Unlimited disc creation',
      'Priority support',
      'Analytics dashboard',
      'Custom branding',
    ],
  },
  enterprise: {
    tier: 'enterprise',
    price: 0, // Contact for pricing
    storage: 'Unlimited',
    features: [
      'Everything in Business',
      'Unlimited storage',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
};

class PaymentService {
  /**
   * Get subscription plan information
   */
  getSubscriptionPlans(): Record<SubscriptionTier, SubscriptionInfo> {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Get specific plan information
   */
  getPlanInfo(tier: SubscriptionTier): SubscriptionInfo {
    return SUBSCRIPTION_PLANS[tier];
  }

  /**
   * Initiate purchase for a subscription tier
   * TODO: Integrate with Stripe or RevenueCat
   */
  async initiatePurchase(tier: SubscriptionTier): Promise<boolean> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'Please sign in to upgrade your subscription');
        return false;
      }

      if (tier === 'enterprise') {
        Alert.alert(
          'Contact Sales',
          'For Enterprise plans, please contact our sales team at sales@streamdisc.com',
          [{ text: 'OK' }]
        );
        return false;
      }

      // TODO: Integrate with Stripe or RevenueCat
      // For now, show placeholder alert
      Alert.alert(
        'Payment Integration Coming Soon',
        `You selected the ${tier.toUpperCase()} plan ($${SUBSCRIPTION_PLANS[tier].price}/month).\n\nPayment processing will be integrated with Stripe or RevenueCat.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Simulate Purchase (Dev)',
            onPress: async () => {
              await this.simulatePurchaseSuccess(userId, tier);
            },
          },
        ]
      );

      return false;
    } catch (error) {
      console.error('Error initiating purchase:', error);
      Alert.alert('Error', 'Failed to initiate purchase');
      return false;
    }
  }

  /**
   * Simulate successful purchase (for development/testing)
   * TODO: Remove this in production
   */
  private async simulatePurchaseSuccess(
    userId: string,
    tier: SubscriptionTier
  ): Promise<void> {
    try {
      await firestoreService.updateSubscriptionTier(userId, tier);
      Alert.alert(
        'Success!',
        `Your subscription has been upgraded to ${tier.toUpperCase()}!\n\n(This is a simulated purchase for development)`
      );
    } catch (error) {
      console.error('Error simulating purchase:', error);
      Alert.alert('Error', 'Failed to update subscription');
    }
  }

  /**
   * Cancel subscription
   * TODO: Integrate with Stripe or RevenueCat
   */
  async cancelSubscription(): Promise<boolean> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) {
        Alert.alert('Error', 'Please sign in to manage your subscription');
        return false;
      }

      // TODO: Integrate with Stripe or RevenueCat
      Alert.alert(
        'Cancel Subscription',
        'Subscription cancellation will be integrated with Stripe or RevenueCat.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Downgrade to Free (Dev)',
            onPress: async () => {
              await firestoreService.updateSubscriptionTier(userId, 'free');
              Alert.alert('Downgraded', 'Your subscription has been downgraded to Free tier.');
            },
          },
        ]
      );

      return false;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription');
      return false;
    }
  }

  /**
   * Restore purchases (for mobile app stores)
   * TODO: Integrate with App Store / Google Play via RevenueCat
   */
  async restorePurchases(): Promise<boolean> {
    try {
      // TODO: Integrate with RevenueCat to restore purchases
      Alert.alert(
        'Restore Purchases',
        'Purchase restoration will be integrated with RevenueCat for App Store and Google Play subscriptions.'
      );
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases');
      return false;
    }
  }

  /**
   * Check if user has active subscription
   * TODO: Verify with payment provider
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      return await authService.isPremium();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get user's current subscription tier
   */
  async getCurrentTier(): Promise<string> {
    try {
      const userId = authService.getCurrentUserId();
      if (!userId) return 'free';

      const profile = await firestoreService.getUserProfile(userId);
      return profile?.subscriptionTier || 'free';
    } catch (error) {
      console.error('Error getting current tier:', error);
      return 'free';
    }
  }
}

export const paymentService = new PaymentService();

