// Marketplace Type Definitions for Production-Grade MVP

export interface Drop {
  id: string;
  artistId: string;
  artistName: string;
  albumId: string; // Reference to album in albums collection
  title: string;
  coverImage: string; // Firebase Storage URL
  price: number; // USD
  isExclusive: boolean; // True = album locked to physical disc
  singlesAvailable: string[]; // Track IDs available for streaming
  totalEditions: number | null; // null = unlimited
  soldCount: number;
  status: 'active' | 'paused' | 'sold-out' | 'in-production' | 'shipped';
  batchId: string | null;
  createdAt: Date;
  releaseDate: Date | null; // Optional future release
  genre?: string;
  description?: string;
}

export interface PreOrder {
  id: string;
  dropId: string;
  fanId: string;
  fanEmail: string;
  fanName: string;
  artistId: string;
  artistName: string;
  albumTitle: string;
  albumCoverUrl: string;
  amount: number; // Total paid by fan
  platformFee: number; // 30% platform fee
  artistRevenue: number; // 70% artist revenue
  status: 'pending' | 'in-production' | 'shipped' | 'completed' | 'cancelled';
  escrowStatus: 'held' | 'released' | 'refunded';
  batchId: string | null;
  discUID: string | null; // Assigned when disc is burned
  trackingNumber: string | null;
  shippingCarrier: string | null; // e.g., 'USPS', 'FedEx'
  orderedAt: Date;
  shippedAt: Date | null;
  completedAt: Date | null;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentIntentId?: string; // Stripe payment intent ID
  chargeId?: string; // Stripe charge ID
}

export interface ManufacturingBatch {
  id: string;
  batchNumber: string; // e.g., "BATCH-2025-001"
  dropIds: string[];
  totalOrders: number;
  totalRevenue: number;
  platformRevenue: number; // 30%
  artistRevenue: number; // 70%
  status: 'pending' | 'in-production' | 'shipped' | 'completed';
  productionStartDate: Date | null;
  estimatedShipDate: Date | null;
  actualShipDate: Date | null;
  createdAt: Date;
  createdBy: string; // Admin user ID
  notes?: string;
}

export interface AnalyticsEvent {
  id: string;
  type: 
    | 'drop_created' 
    | 'pre_order_placed' 
    | 'album_played' 
    | 'track_liked' 
    | 'nfc_scanned' 
    | 'drop_viewed' 
    | 'checkout_started'
    | 'marketplace_viewed'
    | 'batch_created'
    | 'payment_failed'
    | 'nfc_scan_failed';
  userId: string;
  userEmail?: string;
  dropId?: string;
  albumId?: string;
  trackId?: string;
  batchId?: string;
  amount?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
  sessionId?: string;
  deviceInfo?: {
    platform: string;
    os: string;
    version: string;
  };
}

// Aggregate metrics for admin dashboard
export interface BusinessMetrics {
  totalRevenue: number;
  progressTo10M: number; // Percentage
  activeDrops: number;
  totalArtists: number;
  totalFans: number;
  todayRevenue: number;
  weekRevenue: number;
}

export interface EngagementMetrics {
  totalPlays: number;
  totalLikes: number;
  totalNfcScans: number;
  topDrops: DropStats[];
  topArtists: ArtistStats[];
  funnel: FunnelMetrics;
}

export interface DropStats {
  id: string;
  title: string;
  artistName: string;
  coverImage: string;
  soldCount: number;
  revenue: number;
}

export interface ArtistStats {
  id: string;
  name: string;
  totalRevenue: number;
  totalDrops: number;
  totalOrders: number;
}

export interface FunnelMetrics {
  marketplaceViews: number;
  dropViews: number;
  checkoutStarted: number;
  preOrdersCompleted: number;
  conversionRate: number; // Percentage
}

export interface FinancialMetrics {
  escrowBalance: number;
  totalPlatformRevenue: number;
  totalArtistPayouts: number;
  pendingPayouts: PendingPayout[];
  recentPayouts: Payout[];
}

export interface PendingPayout {
  artistId: string;
  artistName: string;
  amount: number;
  batchId: string;
  batchNumber: string;
  orderCount: number;
}

export interface Payout {
  id: string;
  artistId: string;
  artistName: string;
  amount: number;
  batchId: string;
  batchNumber: string;
  paidAt: Date;
  payoutMethod: string; // e.g., 'stripe', 'bank_transfer'
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SystemHealth {
  firestoreReads: number;
  firestoreWrites: number;
  storageUsageGB: number;
  failedPayments: number;
  failedNfcScans: number;
  stuckOrders: number;
  apiErrors: number;
  status: 'healthy' | 'warning' | 'critical';
}

