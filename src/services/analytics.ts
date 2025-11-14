/**
 * Analytics Service for Production-Grade MVP
 * 
 * Tracks all user actions and business events for:
 * - Admin Command Center dashboards
 * - Business metrics and KPIs
 * - Conversion funnels
 * - System health monitoring
 */

import { firestoreService } from './firestore';

interface EventMetadata {
  [key: string]: any;
}

class AnalyticsService {
  // ============ EVENT TRACKING ============

  /**
   * Track drop created by artist
   */
  async trackDropCreated(dropId: string, artistId: string, price: number): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'drop_created',
        userId: artistId,
        dropId,
        amount: price,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Drop created: ${dropId}`);
    } catch (error) {
      console.error('Error tracking drop creation:', error);
    }
  }

  /**
   * Track pre-order placed by fan
   */
  async trackPreOrderPlaced(orderId: string, fanId: string, dropId: string, amount: number): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'pre_order_placed',
        userId: fanId,
        dropId,
        amount,
        metadata: {
          orderId,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Pre-order placed: ${orderId}`);
    } catch (error) {
      console.error('Error tracking pre-order:', error);
    }
  }

  /**
   * Track batch created by admin
   */
  async trackBatchCreated(batchId: string, totalRevenue: number, adminId: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'batch_created',
        userId: adminId,
        batchId,
        amount: totalRevenue,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Batch created: ${batchId}`);
    } catch (error) {
      console.error('Error tracking batch creation:', error);
    }
  }

  /**
   * Track album played by user
   */
  async trackAlbumPlayed(albumId: string, userId: string, dropId?: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'album_played',
        userId,
        albumId,
        dropId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Album played: ${albumId}`);
    } catch (error) {
      console.error('Error tracking album play:', error);
    }
  }

  /**
   * Track track liked by user
   */
  async trackTrackLiked(trackId: string, albumId: string, userId: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'track_liked',
        userId,
        albumId,
        trackId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Track liked: ${trackId}`);
    } catch (error) {
      console.error('Error tracking track like:', error);
    }
  }

  /**
   * Track NFC disc scanned
   */
  async trackNfcScanned(discUID: string, albumId: string, userId: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'nfc_scanned',
        userId,
        albumId,
        metadata: {
          discUID,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] NFC scanned: ${discUID}`);
    } catch (error) {
      console.error('Error tracking NFC scan:', error);
    }
  }

  /**
   * Track drop viewed by user
   */
  async trackDropViewed(dropId: string, userId: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'drop_viewed',
        userId,
        dropId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Drop viewed: ${dropId}`);
    } catch (error) {
      console.error('Error tracking drop view:', error);
    }
  }

  /**
   * Track checkout started by user
   */
  async trackCheckoutStarted(dropId: string, userId: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'checkout_started',
        userId,
        dropId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Checkout started: ${dropId}`);
    } catch (error) {
      console.error('Error tracking checkout start:', error);
    }
  }

  /**
   * Track marketplace viewed
   */
  async trackMarketplaceView(userId: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'marketplace_viewed',
        userId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error tracking marketplace view:', error);
    }
  }

  /**
   * Track payment failed
   */
  async trackPaymentFailed(dropId: string, userId: string, error: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'payment_failed',
        userId,
        dropId,
        metadata: {
          error,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] Payment failed: ${error}`);
    } catch (err) {
      console.error('Error tracking payment failure:', err);
    }
  }

  /**
   * Track NFC scan failed
   */
  async trackNfcScanFailed(userId: string, error: string): Promise<void> {
    try {
      await firestoreService.trackEvent({
        type: 'nfc_scan_failed',
        userId,
        metadata: {
          error,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[Analytics] NFC scan failed: ${error}`);
    } catch (err) {
      console.error('Error tracking NFC scan failure:', err);
    }
  }

  // ============ AGGREGATES FOR ADMIN DASHBOARD ============

  /**
   * Get total revenue
   */
  async getTotalRevenue(): Promise<number> {
    try {
      return await firestoreService.getTotalRevenue();
    } catch (error) {
      console.error('Error getting total revenue:', error);
      return 0;
    }
  }

  /**
   * Get revenue by period (last N days)
   */
  async getRevenueByPeriod(days: number): Promise<number> {
    try {
      return await firestoreService.getRevenueByPeriod(days);
    } catch (error) {
      console.error('Error getting revenue by period:', error);
      return 0;
    }
  }

  /**
   * Get active drops count
   */
  async getActiveDropsCount(): Promise<number> {
    try {
      return await firestoreService.getActiveDropsCount();
    } catch (error) {
      console.error('Error getting active drops count:', error);
      return 0;
    }
  }

  /**
   * Get total artists
   */
  async getTotalArtists(): Promise<number> {
    try {
      return await firestoreService.getTotalArtistsCount();
    } catch (error) {
      console.error('Error getting total artists:', error);
      return 0;
    }
  }

  /**
   * Get total fans
   */
  async getTotalFans(): Promise<number> {
    try {
      return await firestoreService.getTotalFansCount();
    } catch (error) {
      console.error('Error getting total fans:', error);
      return 0;
    }
  }

  /**
   * Get total plays (all-time)
   */
  async getTotalPlays(): Promise<number> {
    try {
      // This would aggregate from analyticsEvents collection
      // For MVP, returning mock data
      // Production: COUNT events WHERE type = 'album_played'
      return 0;
    } catch (error) {
      console.error('Error getting total plays:', error);
      return 0;
    }
  }

  /**
   * Get total likes (all-time)
   */
  async getTotalLikes(): Promise<number> {
    try {
      // This would aggregate from analyticsEvents collection
      // For MVP, returning mock data
      // Production: COUNT events WHERE type = 'track_liked'
      return 0;
    } catch (error) {
      console.error('Error getting total likes:', error);
      return 0;
    }
  }

  /**
   * Get total NFC scans
   */
  async getTotalScans(): Promise<number> {
    try {
      // This would aggregate from analyticsEvents collection
      // For MVP, returning mock data
      // Production: COUNT events WHERE type = 'nfc_scanned'
      return 0;
    } catch (error) {
      console.error('Error getting total scans:', error);
      return 0;
    }
  }

  /**
   * Get top drops (by pre-orders)
   */
  async getTopDrops(limit: number = 10): Promise<any[]> {
    try {
      const drops = await firestoreService.getActiveDrops();
      // Sort by soldCount descending
      return drops
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top drops:', error);
      return [];
    }
  }

  /**
   * Get top artists (by revenue)
   */
  async getTopArtists(limit: number = 10): Promise<any[]> {
    try {
      // This would aggregate revenue by artist
      // For MVP, returning empty array
      // Production: GROUP BY artistId, SUM(artistRevenue)
      return [];
    } catch (error) {
      console.error('Error getting top artists:', error);
      return [];
    }
  }

  /**
   * Get conversion funnel metrics
   */
  async getFunnelMetrics(): Promise<any> {
    try {
      // This would aggregate from analyticsEvents
      // For MVP, returning mock data
      // Production: COUNT each event type and calculate conversion rates
      return {
        marketplaceViews: 0,
        dropViews: 0,
        checkoutStarted: 0,
        preOrdersCompleted: 0,
        conversionRate: 0,
      };
    } catch (error) {
      console.error('Error getting funnel metrics:', error);
      return {
        marketplaceViews: 0,
        dropViews: 0,
        checkoutStarted: 0,
        preOrdersCompleted: 0,
        conversionRate: 0,
      };
    }
  }

  /**
   * Get escrow balance
   */
  async getEscrowBalance(): Promise<number> {
    try {
      return await firestoreService.getEscrowBalance();
    } catch (error) {
      console.error('Error getting escrow balance:', error);
      return 0;
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<any> {
    try {
      // This would check various system health indicators
      // For MVP, returning mock data
      // Production: Aggregate Firestore usage, storage, error logs
      return {
        firestoreReads: 0,
        firestoreWrites: 0,
        storageUsageGB: 0,
        failedPayments: 0,
        failedNfcScans: 0,
        stuckOrders: 0,
        apiErrors: 0,
        status: 'healthy',
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        firestoreReads: 0,
        firestoreWrites: 0,
        storageUsageGB: 0,
        failedPayments: 0,
        failedNfcScans: 0,
        stuckOrders: 0,
        apiErrors: 0,
        status: 'unknown',
      };
    }
  }

  /**
   * Get business overview metrics
   */
  async getBusinessMetrics(): Promise<any> {
    try {
      const totalRevenue = await this.getTotalRevenue();
      const todayRevenue = await this.getRevenueByPeriod(1);
      const weekRevenue = await this.getRevenueByPeriod(7);
      const activeDrops = await this.getActiveDropsCount();
      const totalArtists = await this.getTotalArtists();
      const totalFans = await this.getTotalFans();

      return {
        totalRevenue,
        progressTo10M: (totalRevenue / 10000000) * 100, // Percentage to $10M goal
        activeDrops,
        totalArtists,
        totalFans,
        todayRevenue,
        weekRevenue,
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      return {
        totalRevenue: 0,
        progressTo10M: 0,
        activeDrops: 0,
        totalArtists: 0,
        totalFans: 0,
        todayRevenue: 0,
        weekRevenue: 0,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

