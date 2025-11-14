/**
 * Payment Service for Production-Grade MVP
 * 
 * Handles:
 * - Pre-order payment processing
 * - Escrow management (hold/release/refund)
 * - 70/30 revenue split (artist/platform)
 * - Stripe integration (test mode for MVP)
 */

// For MVP: Using test mode/simulated payments
// Production: Integrate Stripe Connect for real payments

interface PaymentResult {
  success: boolean;
  chargeId?: string;
  paymentIntentId?: string;
  error?: string;
}

interface RevenueSplit {
  platformFee: number;
  artistRevenue: number;
}

class PaymentService {
  private PLATFORM_FEE_PERCENTAGE = 0.30; // 30%
  private ARTIST_REVENUE_PERCENTAGE = 0.70; // 70%

  /**
   * Process pre-order payment
   * For MVP: Simulated payment (returns success)
   * Production: Use Stripe PaymentIntent API
   */
  async processPreOrder(amount: number, fanId: string): Promise<PaymentResult> {
    try {
      console.log(`Processing payment: $${amount} for fan ${fanId}`);

      // MVP: Simulate payment processing
      // TODO: Replace with actual Stripe integration in production
      const isSimulated = true;

      if (isSimulated) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          chargeId: `ch_test_${Date.now()}`,
          paymentIntentId: `pi_test_${Date.now()}`,
        };
      }

      // Production Stripe integration would look like:
      /*
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: fanId,
        metadata: {
          type: 'stream_disc_preorder',
        },
      });

      return {
        success: true,
        chargeId: paymentIntent.charges.data[0]?.id,
        paymentIntentId: paymentIntent.id,
      };
      */

      return {
        success: false,
        error: 'Stripe not configured',
      };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }
  }

  /**
   * Hold funds in escrow
   * For MVP: Tracked in Firestore (escrowStatus = 'held')
   * Production: Use Stripe Connect with separate charges
   */
  async holdInEscrow(orderId: string, amount: number): Promise<void> {
    try {
      console.log(`Holding $${amount} in escrow for order ${orderId}`);
      
      // MVP: Escrow status is managed in Firestore
      // The createPreOrder method in firestoreService sets escrowStatus to 'held'
      
      // Production: Use Stripe Connect
      // - Create destination charge with on_behalf_of
      // - Hold funds until batch is ready to ship
    } catch (error) {
      console.error('Escrow hold error:', error);
      throw error;
    }
  }

  /**
   * Release funds from escrow (pay artists)
   * For MVP: Update Firestore escrowStatus to 'released'
   * Production: Transfer funds via Stripe Connect
   */
  async releaseFromEscrow(orderId: string): Promise<void> {
    try {
      console.log(`Releasing escrow for order ${orderId}`);
      
      // MVP: This is handled by firestoreService.releaseBatchPayments()
      // which updates escrowStatus to 'released'
      
      // Production: Use Stripe Connect Transfer API
      /*
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      await stripe.transfers.create({
        amount: artistRevenue * 100, // in cents
        currency: 'usd',
        destination: artistStripeAccountId,
        metadata: {
          order_id: orderId,
        },
      });
      */
    } catch (error) {
      console.error('Escrow release error:', error);
      throw error;
    }
  }

  /**
   * Refund order
   * For MVP: Update Firestore escrowStatus to 'refunded'
   * Production: Create Stripe refund
   */
  async refundOrder(orderId: string): Promise<void> {
    try {
      console.log(`Refunding order ${orderId}`);
      
      // MVP: Update Firestore status
      // Production: Use Stripe Refund API
      /*
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      await stripe.refunds.create({
        charge: chargeId,
      });
      */
    } catch (error) {
      console.error('Refund error:', error);
      throw error;
    }
  }

  /**
   * Calculate revenue split (70/30)
   */
  calculateSplit(amount: number): RevenueSplit {
    const platformFee = amount * this.PLATFORM_FEE_PERCENTAGE;
    const artistRevenue = amount * this.ARTIST_REVENUE_PERCENTAGE;

    return {
      platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimals
      artistRevenue: Math.round(artistRevenue * 100) / 100,
    };
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount < 1) {
      return { valid: false, error: 'Amount must be at least $1' };
    }

    if (amount > 10000) {
      return { valid: false, error: 'Amount cannot exceed $10,000' };
    }

    return { valid: true };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Get Stripe publishable key (for frontend)
   * For MVP: Returns test key
   * Production: Returns live key from env
   */
  getPublishableKey(): string {
    // MVP: Test mode
    return 'pk_test_...'; // Replace with actual test key
    
    // Production:
    // return process.env.STRIPE_PUBLISHABLE_KEY || '';
  }
}

export const paymentService = new PaymentService();
export default paymentService;
