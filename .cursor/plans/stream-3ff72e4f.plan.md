<!-- 3ff72e4f-1bcd-45c8-9084-7f9eb25918f9 2a62ee93-f971-4135-83b6-ad2ef082cff2 -->
# Pre-Order Marketplace MVP - Stream Disc

## Goal

Build a flexible marketplace architecture that launches in pre-order mode using scheduled manufacturing batches, but can easily transition to a full marketplace with instant fulfillment later. Artists create drops, fans pre-order exclusive albums on Stream Discs, funds held in escrow until batch ships. Target: $10M in 30 days.

## Architecture Philosophy

Design for the future marketplace while implementing pre-order for MVP:

- **Now**: All drops are pre-orders with batch manufacturing
- **Later**: Artists choose "Pre-Order" or "In Stock" when creating drops
- **Data model**: Supports both fulfillment types from day one
- **UI**: Toggle between modes via feature flag (no major refactor needed)

## Current State Analysis

### What We Have (Working)

- `app/create-album.tsx` - Album creation with cover art and tracks
- `app/write-nfc.tsx` - NFC writing functionality
- `src/services/firestore.ts` - Database operations
- `src/services/storage.ts` - File uploads to Firebase Storage
- `src/services/auth.ts` - User authentication
- `app/player-home.tsx` - Home feed with charts
- `src/components/MiniPlayer.tsx` - Music player
- `app/album/[albumId].tsx` - Album detail screen

### What Needs to Change

1. Album creation flow → Add "Create Drop" options (exclusive album, singles availability, pricing)
2. Home feed → Show available drops instead of just albums
3. Album detail → Add "Pre-Order" button instead of immediate playback
4. Add escrow payment system
5. Add artist dashboard with pending revenue
6. Add fan dashboard with pre-orders
7. Add admin dashboard for batch management
8. Lock album playback until NFC scan of physical disc

## Implementation Plan

### Phase 1: Data Model & Core Services (Foundation)

#### 1.1 Update Firestore Schema

**File**: `src/services/firestore.ts`

Add new collections and update existing:

```typescript
// New collection: drops
interface Drop {
  id: string;
  artistId: string;
  artistName: string;
  albumId: string; // Reference to album
  title: string;
  coverImage: string;
  price: number; // Artist sets price
  isExclusive: boolean; // True = album locked to disc
  singlesAvailable: string[]; // Track IDs available for streaming
  totalEditions: number | null; // null = unlimited
  soldCount: number;
  status: 'active' | 'paused' | 'sold-out' | 'in-production' | 'shipped';
  batchId: string | null;
  createdAt: Date;
  releaseDate: Date | null; // Optional future release
}

// New collection: preOrders
interface PreOrder {
  id: string;
  dropId: string;
  fanId: string;
  fanEmail: string;
  artistId: string;
  amount: number; // Total paid
  platformFee: number; // 30%
  artistRevenue: number; // 70%
  status: 'pending' | 'in-production' | 'shipped' | 'completed';
  escrowStatus: 'held' | 'released' | 'refunded';
  batchId: string | null;
  discUID: string | null; // Assigned when disc is burned
  trackingNumber: string | null;
  orderedAt: Date;
  shippedAt: Date | null;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// New collection: batches
interface ManufacturingBatch {
  id: string;
  batchNumber: string; // e.g., "BATCH-2025-001"
  dropIds: string[];
  totalOrders: number;
  totalRevenue: number;
  status: 'pending' | 'in-production' | 'completed';
  productionStartDate: Date | null;
  estimatedShipDate: Date | null;
  actualShipDate: Date | null;
  createdAt: Date;
}
```

Add methods:

- `createDrop(dropData)` - Artist creates a drop
- `getActiveDrops()` - Get all active drops for marketplace
- `getDropById(id)` - Get drop details
- `createPreOrder(orderData)` - Fan places pre-order
- `getUserPreOrders(userId)` - Get fan's orders
- `getArtistDrops(artistId)` - Get artist's drops
- `getArtistPendingRevenue(artistId)` - Calculate held escrow
- `createBatch(batchData)` - Admin creates manufacturing batch
- `releaseBatchPayments(batchId)` - Release escrow to artists

#### 1.2 Create Payment Service

**New File**: `src/services/payment.ts`

```typescript
class PaymentService {
  // Stripe integration placeholder
  async processPreOrder(amount: number, fanId: string): Promise<{ success: boolean; chargeId: string }>;
  
  // Escrow management
  async holdInEscrow(orderId: string, amount: number): Promise<void>;
  async releaseFromEscrow(orderId: string): Promise<void>;
  async refundOrder(orderId: string): Promise<void>;
  
  // Calculate splits
  calculateSplit(amount: number): { platformFee: number; artistRevenue: number };
}
```

For MVP, use simulated payments with test mode flag.

### Phase 2: Artist Drop Creation Flow

#### 2.1 Update Album Creation Screen

**File**: `app/create-album.tsx`

After album upload, show "Create Drop" options:

**Add new UI section** (after track upload, before "Burn to Disc"):

```typescript
// New state
const [createDrop, setCreateDrop] = useState(false);
const [dropPrice, setDropPrice] = useState('20');
const [isExclusive, setIsExclusive] = useState(true);
const [selectedSingles, setSelectedSingles] = useState<string[]>([]);
const [totalEditions, setTotalEditions] = useState<string>(''); // Empty = unlimited

// New section in render
{createDrop && (
  <View style={styles.dropSection}>
    <Text style={styles.sectionTitle}>Stream Disc Drop</Text>
    
    {/* Price Input */}
    <TextInput
      style={styles.input}
      placeholder="Price per disc (USD)"
      value={dropPrice}
      onChangeText={setDropPrice}
      keyboardType="decimal-pad"
    />
    
    {/* Exclusive Toggle */}
    <View style={styles.toggleRow}>
      <Text>Album Exclusive to Stream Disc</Text>
      <Switch value={isExclusive} onValueChange={setIsExclusive} />
    </View>
    
    {/* Singles Selection (if not exclusive) */}
    {!isExclusive && (
      <View>
        <Text>Select singles available for streaming:</Text>
        {audioFiles.map((track, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleSingle(track.name)}
          >
            <Text>{selectedSingles.includes(track.name) ? '✓' : '○'} {track.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
    
    {/* Edition Limit */}
    <TextInput
      style={styles.input}
      placeholder="Total editions (leave blank for unlimited)"
      value={totalEditions}
      onChangeText={setTotalEditions}
      keyboardType="number-pad"
    />
  </View>
)}
```

**Update submit handler**:

```typescript
const handleCreateDrop = async () => {
  // 1. Upload album to Firebase (existing logic)
  const albumId = await createAlbum();
  
  // 2. Create drop document
  const dropData = {
    artistId: currentUser.uid,
    artistName: currentUser.displayName,
    albumId,
    title: albumTitle,
    coverImage: coverImageUrl,
    price: parseFloat(dropPrice),
    isExclusive,
    singlesAvailable: isExclusive ? [] : selectedSingles,
    totalEditions: totalEditions ? parseInt(totalEditions) : null,
    soldCount: 0,
    status: 'active',
    createdAt: new Date(),
  };
  
  const dropId = await firestoreService.createDrop(dropData);
  
  // 3. Navigate to drop preview
  router.push({
    pathname: '/drop-preview',
    params: { dropId },
  });
};
```

#### 2.2 Create Drop Preview Screen

**New File**: `app/drop-preview.tsx`

Show artist what their drop looks like before publishing:

- Album cover and title
- Price and edition info
- "Publish Drop" button
- "Edit" button to go back

### Phase 3: Marketplace & Discovery

#### 3.1 Transform Home Feed into Marketplace

**File**: `app/player-home.tsx`

Update the home tab to show active drops instead of albums:

```typescript
const [drops, setDrops] = useState<Drop[]>([]);

useEffect(() => {
  loadActiveDrops();
}, []);

const loadActiveDrops = async () => {
  const activeDrops = await firestoreService.getActiveDrops();
  setDrops(activeDrops);
};

// Update render to show drops instead of albums
const renderMarketplaceTab = () => (
  <ScrollView>
    <Text style={styles.header}>Active Drops</Text>
    {drops.map(drop => (
      <DropCard
        key={drop.id}
        drop={drop}
        onPress={() => router.push(`/drop/${drop.id}`)}
      />
    ))}
  </ScrollView>
);
```

#### 3.2 Create Drop Card Component

**New File**: `src/components/DropCard.tsx`

Visual card showing:

- Album artwork
- Artist name + album title
- Price
- "Limited Edition" badge if applicable
- Sold count / total
- "Pre-Order Now" button

#### 3.3 Create Drop Detail Screen

**New File**: `app/drop/[dropId].tsx`

Full drop page with:

- Large album artwork
- Artist info
- Price
- Track list (show all tracks, but note which are available as singles)
- "Pre-Order Now" button (prominent)
- Manufacturing batch info: "Stream Discs are produced and shipped in scheduled manufacturing batches."
- Expected timeline

### Phase 4: Pre-Order Flow

#### 4.1 Create Pre-Order Checkout Screen

**New File**: `app/checkout.tsx`

Accept route params: `dropId`

Form fields:

- Shipping address (name, street, city, state, zip, country)
- Order summary (album, price, platform fee breakdown)
- Payment method (Stripe integration or test mode)
- Terms: "You will receive your Stream Disc when the manufacturing batch begins production."
```typescript
const handlePlaceOrder = async () => {
  // 1. Process payment
  const paymentResult = await paymentService.processPreOrder(
    drop.price,
    currentUser.uid
  );
  
  // 2. Create pre-order record
  const orderData = {
    dropId,
    fanId: currentUser.uid,
    fanEmail: currentUser.email,
    artistId: drop.artistId,
    amount: drop.price,
    platformFee: drop.price * 0.30,
    artistRevenue: drop.price * 0.70,
    status: 'pending',
    escrowStatus: 'held',
    shippingAddress,
    orderedAt: new Date(),
  };
  
  await firestoreService.createPreOrder(orderData);
  
  // 3. Update drop sold count
  await firestoreService.incrementDropSoldCount(dropId);
  
  // 4. Navigate to confirmation
  router.replace({
    pathname: '/order-confirmation',
    params: { orderId: orderData.id },
  });
};
```


#### 4.2 Create Order Confirmation Screen

**New File**: `app/order-confirmation.tsx`

Success message:

- "Pre-Order Confirmed!"
- Order number
- Album artwork
- "Your Stream Disc will ship when the manufacturing batch begins production."
- "Track your order in your dashboard."

### Phase 5: Artist Dashboard

#### 5.1 Create Artist Dashboard Screen

**New File**: `app/artist-dashboard.tsx`

Sections:

1. **Pending Revenue** (held in escrow)
2. **Active Drops** (with edit/pause controls)
3. **Pre-Orders by Drop** (list of orders)
4. **Completed Payouts**
```typescript
const ArtistDashboard = () => {
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  
  useEffect(() => {
    loadArtistData();
  }, []);
  
  const loadArtistData = async () => {
    const revenue = await firestoreService.getArtistPendingRevenue(currentUser.uid);
    const artistDrops = await firestoreService.getArtistDrops(currentUser.uid);
    const orders = await firestoreService.getArtistPreOrders(currentUser.uid);
    
    setPendingRevenue(revenue);
    setDrops(artistDrops);
    setPreOrders(orders);
  };
  
  return (
    <ScrollView>
      <View style={styles.revenueCard}>
        <Text style={styles.label}>Pending Revenue (Escrow)</Text>
        <Text style={styles.amount}>${pendingRevenue.toFixed(2)}</Text>
        <Text style={styles.note}>
          Funds will be released when your orders enter production
        </Text>
      </View>
      
      {/* Active Drops */}
      {drops.map(drop => (
        <View key={drop.id} style={styles.dropCard}>
          <Text>{drop.title}</Text>
          <Text>{drop.soldCount} pre-orders</Text>
          <Text>${(drop.soldCount * drop.price * 0.70).toFixed(2)} pending</Text>
        </View>
      ))}
    </ScrollView>
  );
};
```


### Phase 6: Fan Dashboard

#### 6.1 Update Profile/Dashboard Screen

**File**: `app/profile.tsx` or create `app/fan-dashboard.tsx`

Add "My Pre-Orders" section:

```typescript
const [preOrders, setPreOrders] = useState<PreOrder[]>([]);

useEffect(() => {
  loadPreOrders();
}, []);

const loadPreOrders = async () => {
  const orders = await firestoreService.getUserPreOrders(currentUser.uid);
  setPreOrders(orders);
};

// Render
<View style={styles.ordersSection}>
  <Text style={styles.sectionTitle}>My Pre-Orders</Text>
  {preOrders.map(order => (
    <View key={order.id} style={styles.orderCard}>
      <Image source={{ uri: order.albumCoverUrl }} style={styles.orderArtwork} />
      <View>
        <Text style={styles.orderTitle}>{order.albumTitle}</Text>
        <Text style={styles.orderStatus}>
          {order.status === 'pending' && 'Awaiting Manufacturing Batch'}
          {order.status === 'in-production' && 'In Production'}
          {order.status === 'shipped' && `Shipped - ${order.trackingNumber}`}
        </Text>
      </View>
    </View>
  ))}
</View>
```

### Phase 7: Admin Batch Management

#### 7.1 Create Admin Dashboard

**New File**: `app/admin-dashboard.tsx`

Only accessible to admin users (check `currentUser.role === 'admin'`).

Features:

1. **Create Manufacturing Batch**

   - Select drops to include
   - Set production start date
   - Generate batch ID

2. **View All Batches**

   - Status tracking
   - Revenue summary

3. **Release Payments**

   - Button to release escrow for completed batches

4. **Analytics**

   - Total pre-order volume
   - Platform revenue
   - Artist payouts
```typescript
const createBatch = async () => {
  const batchData = {
    batchNumber: `BATCH-${new Date().getFullYear()}-${batchCount + 1}`,
    dropIds: selectedDropIds,
    totalOrders: calculateTotalOrders(selectedDropIds),
    totalRevenue: calculateTotalRevenue(selectedDropIds),
    status: 'pending',
    productionStartDate: selectedDate,
    estimatedShipDate: addDays(selectedDate, 14),
    createdAt: new Date(),
  };
  
  const batchId = await firestoreService.createBatch(batchData);
  
  // Update all pre-orders to reference this batch
  await firestoreService.assignOrdersToBatch(selectedDropIds, batchId);
  
  // Update drops status
  await firestoreService.updateDropsStatus(selectedDropIds, 'in-production');
};

const releaseBatchPayments = async (batchId: string) => {
  await firestoreService.releaseBatchPayments(batchId);
  // This updates all orders to 'released' escrow status
  // Triggers actual payouts to artists (Stripe Connect or similar)
};
```


### Phase 8: Album Playback Lockdown

#### 8.1 Update Album Detail Screen

**File**: `app/album/[albumId].tsx`

Check if album is exclusive and user owns the disc:

```typescript
const [canPlay, setCanPlay] = useState(false);
const [preOrderStatus, setPreOrderStatus] = useState<PreOrder | null>(null);

useEffect(() => {
  checkPlaybackAccess();
}, [albumId]);

const checkPlaybackAccess = async () => {
  const drop = await firestoreService.getDropByAlbumId(albumId);
  
  if (!drop || !drop.isExclusive) {
    // Album is not exclusive or not part of a drop
    setCanPlay(true);
    return;
  }
  
  // Check if user has a pre-order
  const order = await firestoreService.getUserOrderForDrop(currentUser.uid, drop.id);
  
  if (!order) {
    // No order, cannot play
    setCanPlay(false);
    return;
  }
  
  if (order.status !== 'completed' || !order.discUID) {
    // Order exists but disc not received yet
    setCanPlay(false);
    setPreOrderStatus(order);
    return;
  }
  
  // Order completed, disc received
  setCanPlay(true);
};

// Update render
{!canPlay && preOrderStatus && (
  <View style={styles.lockedBanner}>
    <Ionicons name="lock-closed" size={48} color="#FF3B5C" />
    <Text style={styles.lockedText}>
      This album is exclusive to the Stream Disc
    </Text>
    <Text style={styles.lockedSubtext}>
      Your disc will ship when the manufacturing batch begins production
    </Text>
    <Text style={styles.orderStatus}>
      Order Status: {preOrderStatus.status}
    </Text>
  </View>
)}

{!canPlay && !preOrderStatus && (
  <TouchableOpacity
    style={styles.preOrderButton}
    onPress={() => router.push(`/drop/${drop.id}`)}
  >
    <Text style={styles.preOrderButtonText}>Pre-Order Stream Disc</Text>
  </TouchableOpacity>
)}
```

#### 8.2 Update NFC Scan to Unlock Album

**File**: `src/services/nfc.ts` and scan handlers

When user scans a disc:

1. Read disc UID
2. Look up pre-order by `discUID`
3. Mark order as `completed` if not already
4. Unlock album playback
5. Navigate to album screen
```typescript
const handleDiscScan = async (discData: NfcData) => {
  // Existing scan logic
  const albumId = extractAlbumId(discData.url);
  
  // NEW: Check if this disc is tied to a pre-order
  const order = await firestoreService.getOrderByDiscUID(discData.uid);
  
  if (order && order.status === 'shipped') {
    // Mark as completed (user received and scanned disc)
    await firestoreService.updateOrderStatus(order.id, 'completed');
  }
  
  // Navigate to album
  router.push(`/album/${albumId}`);
};
```


### Phase 9: Analytics Integration

#### 9.1 Add Analytics Service

**New File**: `src/services/analytics.ts`

```typescript
class AnalyticsService {
  // Track key events
  trackDropCreated(dropId: string, artistId: string): void;
  trackPreOrderPlaced(orderId: string, amount: number): void;
  trackBatchCreated(batchId: string, totalRevenue: number): void;
  trackAlbumPlayed(albumId: string, userId: string): void;
  
  // Get metrics
  async getTotalRevenue(): Promise<number>;
  async getActiveUsers(): Promise<number>;
  async getConversionRate(): Promise<number>; // Visitors → Pre-orders
}
```

Integrate Firebase Analytics or Mixpanel.

#### 9.2 Add Analytics Dashboard

**File**: `app/admin-dashboard.tsx` (add section)

Display:

- Total pre-order revenue (real-time)
- Progress to $10M goal
- Daily/weekly growth
- Top-selling drops
- Artist leaderboard
- Geographic distribution

### Phase 10: Polish & UX Improvements

#### 10.1 Update Navigation

**File**: `app/player-home.tsx` bottom nav

Update tab labels:

- "Discover" (marketplace)
- "My Orders" (fan dashboard)
- "Create Drop" (artist flow)
- "Dashboard" (artist/admin)

#### 10.2 Add Onboarding

**New File**: `app/onboarding.tsx`

First-time user flow:

1. Welcome screen: "Pre-order exclusive albums on Stream Discs"
2. How it works (3 slides)
3. Choose role: "I'm a Fan" / "I'm an Artist"

#### 10.3 Marketing Copy Updates

Replace all instances of:

- "Write to NFC" → "Create Drop"
- "Burn to Disc" → "Publish Drop"
- "Album created" → "Drop published"
- Add: "Stream Discs are produced and shipped in scheduled manufacturing batches"

### Phase 11: Testing & Validation

#### 11.1 Test User Flows

1. **Artist Flow**: Create album → Set drop details → Publish → View pending revenue
2. **Fan Flow**: Browse drops → Pre-order → Track order status → Receive disc → Scan → Play
3. **Admin Flow**: View pre-orders → Create batch → Release payments

#### 11.2 Payment Testing

- Use Stripe test mode
- Simulate pre-orders
- Verify escrow holds
- Test batch payment releases

#### 11.3 NFC Testing

- Burn test discs with drop IDs
- Scan to unlock albums
- Verify playback restrictions work

## Key Files to Create/Modify

### New Files

- `app/drop-preview.tsx` - Drop preview before publishing
- `app/drop/[dropId].tsx` - Drop detail and pre-order page
- `app/checkout.tsx` - Pre-order checkout flow
- `app/order-confirmation.tsx` - Order success screen
- `app/artist-dashboard.tsx` - Artist revenue and drops management
- `app/fan-dashboard.tsx` - Fan's pre-orders (or integrate into profile)
- `app/admin-dashboard.tsx` - Admin batch and analytics dashboard
- `src/components/DropCard.tsx` - Marketplace drop card
- `src/services/payment.ts` - Payment and escrow service
- `src/services/analytics.ts` - Analytics tracking

### Modified Files

- `src/services/firestore.ts` - Add drop, pre-order, batch collections and methods
- `app/create-album.tsx` - Add drop creation options
- `app/player-home.tsx` - Transform into marketplace
- `app/album/[albumId].tsx` - Add playback restrictions
- `src/services/nfc.ts` - Add disc unlock logic
- `app.json` - Update app name/description for marketplace focus

## Success Metrics for $10M in 30 Days

### Target Breakdown

- Average disc price: $20
- Total discs needed: 500,000
- Required daily sales: 16,667 pre-orders/day
- Or: 1,000 artists × 500 fans each
- Or: 10 major artists × 50,000 fans each

### Key Metrics to Track

1. Pre-order conversion rate
2. Average order value
3. Artist acquisition rate
4. Fan acquisition rate
5. Daily/weekly revenue growth
6. Viral coefficient (shares per user)

### Growth Levers

1. Launch with 10-20 established artists
2. Social sharing (fans share drops)
3. Artist referral program
4. Press coverage (music blogs, tech media)
5. Influencer partnerships

## Timeline Estimate

- **Phase 1-2** (Data model + Artist flow): 3-4 days
- **Phase 3-4** (Marketplace + Pre-orders): 3-4 days
- **Phase 5-6** (Dashboards): 2-3 days
- **Phase 7-8** (Admin + Lockdown): 2-3 days
- **Phase 9-10** (Analytics + Polish): 2-3 days
- **Phase 11** (Testing): 2 days

**Total: ~14-18 days to production-ready MVP**

## Next Steps After Plan Approval

1. Start with Phase 1 (data model foundation)
2. Build and test each phase incrementally
3. Deploy to staging for testing
4. Production build for app store submission
5. Launch with seed artists and marketing push

### To-dos

- [ ] Initialize Expo project with TypeScript and integrate Firebase SDK
- [ ] Set up Firebase anonymous authentication and user service
- [ ] Set up expo-router with file-based navigation for all screens
- [ ] Create home screen with content type cards (Album, Mixtape, etc.)
- [ ] Implement album creation form with title, artist, cover art, and audio file inputs
- [ ] Create Firebase Storage service with upload progress tracking for images and audio
- [ ] Create Firestore service for CRUD operations on disc documents
- [ ] Implement NFC writing service with NDEF URL record format
- [ ] Create NFC writing UI with ready-to-scan interface
- [ ] Configure deep linking and universal links for app.streamdisc.com
- [ ] Create album viewer screen with audio player for deep link destinations
- [ ] Create blank disc welcome page and detection logic
- [ ] Build Next.js web fallback app for non-app users
- [ ] Initialize git, create GitHub repository, and push initial code