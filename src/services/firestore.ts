import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Disc } from '../types';

const USERS_COLLECTION = 'users';
const DISCS_COLLECTION = 'discs';
const ALBUMS_COLLECTION = 'albums'; // New collection for albums
const TEMPLATES_COLLECTION = 'templates';
const REGISTERED_DISCS_COLLECTION = 'registeredDiscs'; // Manufacturing registry
const DISC_SCANS_COLLECTION = 'discScans'; // Scan logs

// ============ MARKETPLACE COLLECTIONS ============
const DROPS_COLLECTION = 'drops'; // Marketplace drops
const PRE_ORDERS_COLLECTION = 'preOrders'; // Fan pre-orders
const BATCHES_COLLECTION = 'batches'; // Manufacturing batches
const ANALYTICS_EVENTS_COLLECTION = 'analyticsEvents'; // Event tracking

class FirestoreService {
  // ============ USER MANAGEMENT ============
  
  /**
   * Create or update user profile
   */
  async createUserProfile(userId: string, data: {
    email?: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user with default subscription tier (Free: 2GB storage)
        await setDoc(userRef, {
          ...data,
          subscriptionTier: 'free',
          storageUsed: 0,
          storageLimit: 2147483648, // 2GB in bytes
          isPremium: false,
          discsCreated: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          registeredAt: serverTimestamp(),
          subscriptionExpiresAt: null,
        });
      } else {
        // Update existing user
        await updateDoc(userRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Upgrade user to premium
   */
  async upgradeUserToPremium(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        isPremium: true,
        premiumSince: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error upgrading user:', error);
      throw error;
    }
  }

  /**
   * Check if user is premium
   */
  async isUserPremium(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.isPremium || false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  /**
   * Update user subscription tier
   */
  async updateSubscriptionTier(
    userId: string,
    tier: 'free' | 'pro' | 'business' | 'enterprise'
  ): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      // Define storage limits for each tier
      const storageLimits = {
        free: 2147483648, // 2GB
        pro: 5368709120, // 5GB
        business: 32212254720, // 30GB
        enterprise: -1, // Unlimited
      };

      const isPremium = tier !== 'free';
      const storageLimit = storageLimits[tier];

      await updateDoc(userRef, {
        subscriptionTier: tier,
        storageLimit: storageLimit,
        isPremium: isPremium,
        updatedAt: serverTimestamp(),
        ...(isPremium && { subscriptionExpiresAt: null }), // Set expiration if needed
      });
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      throw error;
    }
  }

  /**
   * Get user storage info
   */
  async getUserStorageInfo(userId: string): Promise<{
    used: number;
    limit: number;
    percentage: number;
  }> {
    try {
      const profile = await this.getUserProfile(userId);
      const used = profile?.storageUsed || 0;
      const limit = profile?.storageLimit || 2147483648;
      const percentage = limit > 0 ? (used / limit) * 100 : 0;

      return { used, limit, percentage };
    } catch (error) {
      console.error('Error getting user storage info:', error);
      return { used: 0, limit: 2147483648, percentage: 0 };
    }
  }

  /**
   * Update user storage usage
   */
  async updateStorageUsage(userId: string, bytesAdded: number): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentUsage = userSnap.data().storageUsed || 0;
        await updateDoc(userRef, {
          storageUsed: currentUsage + bytesAdded,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating storage usage:', error);
      throw error;
    }
  }

  /**
   * Check if user has available storage
   */
  async hasAvailableStorage(userId: string, requiredBytes: number): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      const storageUsed = profile?.storageUsed || 0;
      const storageLimit = profile?.storageLimit || 2147483648;
      
      // Enterprise tier has unlimited storage
      if (storageLimit === -1) {
        return true;
      }

      return (storageUsed + requiredBytes) <= storageLimit;
    } catch (error) {
      console.error('Error checking available storage:', error);
      return false;
    }
  }

  // ============ DISC MANAGEMENT ============

  /**
   * Create a new disc document
   */
  async createDisc(discData: Omit<Disc, 'id' | 'createdAt'>): Promise<string> {
    try {
      const discRef = doc(collection(db, DISCS_COLLECTION));
      const discId = discRef.id;

      await setDoc(discRef, {
        ...discData,
        createdAt: serverTimestamp(),
      });

      // Update user's disc count
      if (discData.createdBy) {
        await this.incrementUserDiscCount(discData.createdBy);
      }

      return discId;
    } catch (error) {
      console.error('Error creating disc:', error);
      throw error;
    }
  }

  /**
   * Get a disc by ID
   */
  async getDisc(discId: string): Promise<Disc | null> {
    try {
      const discRef = doc(db, DISCS_COLLECTION, discId);
      const discSnap = await getDoc(discRef);

      if (discSnap.exists()) {
        const data = discSnap.data();
        return {
          id: discSnap.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Disc;
      }

      return null;
    } catch (error) {
      console.error('Error getting disc:', error);
      throw error;
    }
  }

  /**
   * Update a disc
   */
  async updateDisc(discId: string, updates: Partial<Disc>): Promise<void> {
    try {
      const discRef = doc(db, DISCS_COLLECTION, discId);
      await updateDoc(discRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating disc:', error);
      throw error;
    }
  }

  /**
   * Delete a disc
   */
  async deleteDisc(discId: string): Promise<void> {
    try {
      const discRef = doc(db, DISCS_COLLECTION, discId);
      await deleteDoc(discRef);
    } catch (error) {
      console.error('Error deleting disc:', error);
      throw error;
    }
  }

  /**
   * Get all discs created by a user
   */
  async getUserDiscs(userId: string): Promise<Disc[]> {
    try {
      const q = query(
        collection(db, DISCS_COLLECTION),
        where('createdBy', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Disc;
      });
    } catch (error) {
      console.error('Error getting user discs:', error);
      throw error;
    }
  }

  /**
   * Get all published discs for the store
   */
  async getPublishedDiscs(): Promise<Disc[]> {
    try {
      const q = query(
        collection(db, DISCS_COLLECTION),
        where('publishedToStore', '==', true)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          publishedAt: (data.publishedAt as Timestamp)?.toDate() || null,
        } as Disc;
      });
    } catch (error) {
      console.error('Error getting published discs:', error);
      throw error;
    }
  }

  /**
   * Publish disc to store
   */
  async publishDiscToStore(
    discId: string,
    storePrice: number | null,
    physicalDiscAvailable: boolean = true
  ): Promise<void> {
    try {
      await this.updateDisc(discId, {
        publishedToStore: true,
        storePrice: storePrice,
        physicalDiscAvailable: physicalDiscAvailable,
        publishedAt: serverTimestamp() as any,
      });
    } catch (error) {
      console.error('Error publishing disc to store:', error);
      throw error;
    }
  }

  /**
   * Unpublish disc from store
   */
  async unpublishDiscFromStore(discId: string): Promise<void> {
    try {
      await this.updateDisc(discId, {
        publishedToStore: false,
        publishedAt: null,
      });
    } catch (error) {
      console.error('Error unpublishing disc from store:', error);
      throw error;
    }
  }

  /**
   * Update NFC information for a disc
   */
  async updateNfcInfo(
    discId: string,
    nfcUrl: string,
    discUID: string,
    nonce: string
  ): Promise<void> {
    try {
      await this.updateDisc(discId, {
        nfcUrl,
        discUID,
        nonce,
      });
    } catch (error) {
      console.error('Error updating NFC info:', error);
      throw error;
    }
  }

  /**
   * Increment user's disc creation count
   */
  private async incrementUserDiscCount(userId: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentCount = userSnap.data().discsCreated || 0;
        await updateDoc(userRef, {
          discsCreated: currentCount + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error incrementing disc count:', error);
    }
  }

  // ============ TEMPLATES ============

  /**
   * Seed database with example templates
   */
  async seedTemplates(): Promise<void> {
    try {
      const templates = [
        {
          id: 'midnight-dreams',
          name: 'Midnight Dreams',
          artist: 'Luna Rey',
          genre: 'Electronic',
          year: 2024,
          type: 'album',
          description: 'A journey through nocturnal soundscapes and ethereal beats.',
          coverImageUrl: 'https://example.com/midnight-dreams.jpg',
          tracks: [
            { title: 'Moonlight Sonata (Reimagined)', duration: 272, order: 1 },
            { title: 'Neon Nights', duration: 225, order: 2 },
            { title: 'Echo Chamber', duration: 312, order: 3 },
            { title: 'Stardust Memories', duration: 258, order: 4 },
            { title: 'Digital Dreams', duration: 236, order: 5 },
            { title: 'Cosmic Lullaby', duration: 383, order: 6 },
          ],
          isTemplate: true,
          createdAt: serverTimestamp(),
        },
      ];

      for (const template of templates) {
        const templateRef = doc(db, TEMPLATES_COLLECTION, template.id);
        await setDoc(templateRef, template);
      }

      console.log('Templates seeded successfully');
    } catch (error) {
      console.error('Error seeding templates:', error);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Get user discs
   */
  async getUserDiscs(userId: string): Promise<Disc[]> {
    try {
      const q = query(
        collection(db, DISCS_COLLECTION),
        where('createdBy', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const discs: Disc[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        discs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Disc);
      });
      
      // Sort by most recent first
      discs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return discs;
    } catch (error) {
      console.error('Error getting user discs:', error);
      return [];
    }
  }

  // ============ MANUFACTURING REGISTRY ============

  /**
   * Register a new Stream Disc in the manufacturing database
   * (This would typically be done during manufacturing)
   */
  async registerStreamDisc(data: {
    uid: string; // NFC chip UID
    serialNumber: string;
    manufacturedDate: Date;
    batchNumber?: string;
    isProgrammed?: boolean;
  }): Promise<void> {
    try {
      const discRef = doc(db, REGISTERED_DISCS_COLLECTION, data.uid);
      await setDoc(discRef, {
        ...data,
        isProgrammed: data.isProgrammed || false,
        registeredAt: serverTimestamp(),
        lastScannedAt: null,
        scanCount: 0,
      });
      console.log('Stream Disc registered:', data.uid);
    } catch (error) {
      console.error('Error registering Stream Disc:', error);
      throw error;
    }
  }

  /**
   * Get registered Stream Disc by UID
   */
  async getRegisteredStreamDisc(uid: string): Promise<any | null> {
    try {
      const discRef = doc(db, REGISTERED_DISCS_COLLECTION, uid);
      const discSnap = await getDoc(discRef);

      if (discSnap.exists()) {
        return {
          uid: discSnap.id,
          ...discSnap.data(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting registered Stream Disc:', error);
      return null;
    }
  }

  /**
   * Update Stream Disc programming status
   */
  async updateDiscProgrammingStatus(uid: string, isProgrammed: boolean): Promise<void> {
    try {
      const discRef = doc(db, REGISTERED_DISCS_COLLECTION, uid);
      await updateDoc(discRef, {
        isProgrammed: isProgrammed,
        lastProgrammedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating disc programming status:', error);
      throw error;
    }
  }

  /**
   * Log disc scan event
   */
  async logDiscScan(data: {
    discUid: string;
    scannedAt: Date;
    metadata?: any;
  }): Promise<void> {
    try {
      const scanRef = doc(collection(db, DISC_SCANS_COLLECTION));
      await setDoc(scanRef, {
        ...data,
        timestamp: serverTimestamp(),
      });

      // Update scan count on registered disc
      const discRef = doc(db, REGISTERED_DISCS_COLLECTION, data.discUid);
      const discSnap = await getDoc(discRef);
      
      if (discSnap.exists()) {
        const currentCount = discSnap.data().scanCount || 0;
        await updateDoc(discRef, {
          lastScannedAt: serverTimestamp(),
          scanCount: currentCount + 1,
        });
      }
    } catch (error) {
      console.error('Error logging disc scan:', error);
      // Don't throw - logging shouldn't block the main flow
    }
  }

  /**
   * Seed manufacturing database with test discs
   */
  async seedTestStreamDiscs(): Promise<void> {
    try {
      const testDiscs = [
        {
          uid: 'SD-TEST-12345',
          serialNumber: 'SD-2024-12345',
          manufacturedDate: new Date('2024-01-15'),
          batchNumber: 'BATCH-001',
          isProgrammed: false,
        },
        {
          uid: 'SD-TEST-67890',
          serialNumber: 'SD-2024-67890',
          manufacturedDate: new Date('2024-01-20'),
          batchNumber: 'BATCH-001',
          isProgrammed: false,
        },
        {
          uid: 'SD-DEMO-PROGRAMMED',
          serialNumber: 'SD-2024-DEMO1',
          manufacturedDate: new Date('2024-02-01'),
          batchNumber: 'BATCH-DEMO',
          isProgrammed: true,
        },
      ];

      for (const disc of testDiscs) {
        await this.registerStreamDisc(disc);
      }

      console.log('Test Stream Discs seeded successfully');
    } catch (error) {
      console.error('Error seeding test Stream Discs:', error);
      throw error;
    }
  }

  // ============ ALBUM MANAGEMENT ============

  /**
   * Create a new album
   */
  async createAlbum(albumData: {
    title: string;
    artist: string;
    description: string;
    coverUrl: string;
    year: number;
    genre: string;
    price: number;
    trackCount: number;
    userId: string;
    createdAt: string;
  }): Promise<string> {
    try {
      const albumRef = await addDoc(collection(db, ALBUMS_COLLECTION), {
        ...albumData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Album created with ID:', albumRef.id);
      return albumRef.id;
    } catch (error) {
      console.error('Error creating album:', error);
      throw error;
    }
  }

  /**
   * Get album by ID
   */
  async getAlbum(albumId: string) {
    try {
      const albumRef = doc(db, ALBUMS_COLLECTION, albumId);
      const albumSnap = await getDoc(albumRef);

      if (albumSnap.exists()) {
        return { id: albumSnap.id, ...albumSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting album:', error);
      throw error;
    }
  }

  /**
   * Get user's albums
   */
  async getUserAlbums(userId: string) {
    try {
      const albumsQuery = query(
        collection(db, ALBUMS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(albumsQuery);

      const albums: any[] = [];
      querySnapshot.forEach((doc) => {
        albums.push({ id: doc.id, ...doc.data() });
      });

      return albums;
    } catch (error) {
      console.error('Error getting user albums:', error);
      throw error;
    }
  }

  /**
   * Update album
   */
  async updateAlbum(albumId: string, updates: Partial<any>): Promise<void> {
    try {
      const albumRef = doc(db, ALBUMS_COLLECTION, albumId);
      await updateDoc(albumRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating album:', error);
      throw error;
    }
  }

  /**
   * Delete album
   */
  async deleteAlbum(albumId: string): Promise<void> {
    try {
      const albumRef = doc(db, ALBUMS_COLLECTION, albumId);
      await deleteDoc(albumRef);
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  }

  // ============ MARKETPLACE: DROPS ============

  /**
   * Create a new drop
   */
  async createDrop(dropData: {
    artistId: string;
    artistName: string;
    albumId: string;
    title: string;
    coverImage: string;
    price: number;
    isExclusive: boolean;
    singlesAvailable: string[];
    totalEditions: number | null;
    genre?: string;
    description?: string;
    releaseDate?: Date | null;
  }): Promise<string> {
    try {
      const dropRef = await addDoc(collection(db, DROPS_COLLECTION), {
        ...dropData,
        soldCount: 0,
        status: 'active',
        batchId: null,
        createdAt: serverTimestamp(),
      });

      console.log('Drop created with ID:', dropRef.id);
      return dropRef.id;
    } catch (error) {
      console.error('Error creating drop:', error);
      throw error;
    }
  }

  /**
   * Get drop by ID
   */
  async getDropById(dropId: string) {
    try {
      const dropRef = doc(db, DROPS_COLLECTION, dropId);
      const dropSnap = await getDoc(dropRef);

      if (dropSnap.exists()) {
        const data = dropSnap.data();
        return {
          id: dropSnap.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          releaseDate: data.releaseDate ? (data.releaseDate as Timestamp).toDate() : null,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting drop:', error);
      throw error;
    }
  }

  /**
   * Get all active drops for marketplace
   */
  async getActiveDrops() {
    try {
      const dropsQuery = query(
        collection(db, DROPS_COLLECTION),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(dropsQuery);

      const drops: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drops.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        });
      });

      return drops;
    } catch (error) {
      console.error('Error getting active drops:', error);
      throw error;
    }
  }

  /**
   * Get artist's drops
   */
  async getArtistDrops(artistId: string) {
    try {
      const dropsQuery = query(
        collection(db, DROPS_COLLECTION),
        where('artistId', '==', artistId)
      );
      const querySnapshot = await getDocs(dropsQuery);

      const drops: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        drops.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        });
      });

      return drops;
    } catch (error) {
      console.error('Error getting artist drops:', error);
      throw error;
    }
  }

  /**
   * Get drop by album ID
   */
  async getDropByAlbumId(albumId: string) {
    try {
      const dropsQuery = query(
        collection(db, DROPS_COLLECTION),
        where('albumId', '==', albumId)
      );
      const querySnapshot = await getDocs(dropsQuery);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting drop by album ID:', error);
      throw error;
    }
  }

  /**
   * Update drop
   */
  async updateDrop(dropId: string, updates: Partial<any>): Promise<void> {
    try {
      const dropRef = doc(db, DROPS_COLLECTION, dropId);
      await updateDoc(dropRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating drop:', error);
      throw error;
    }
  }

  /**
   * Increment drop sold count
   */
  async incrementDropSoldCount(dropId: string): Promise<void> {
    try {
      const dropRef = doc(db, DROPS_COLLECTION, dropId);
      const dropSnap = await getDoc(dropRef);

      if (dropSnap.exists()) {
        const currentCount = dropSnap.data().soldCount || 0;
        await updateDoc(dropRef, {
          soldCount: currentCount + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error incrementing sold count:', error);
      throw error;
    }
  }

  /**
   * Update drops status (for batch processing)
   */
  async updateDropsStatus(dropIds: string[], status: string): Promise<void> {
    try {
      const updatePromises = dropIds.map((dropId) => {
        const dropRef = doc(db, DROPS_COLLECTION, dropId);
        return updateDoc(dropRef, {
          status,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating drops status:', error);
      throw error;
    }
  }

  // ============ MARKETPLACE: PRE-ORDERS ============

  /**
   * Create a pre-order
   */
  async createPreOrder(orderData: {
    dropId: string;
    fanId: string;
    fanEmail: string;
    fanName: string;
    artistId: string;
    artistName: string;
    albumTitle: string;
    albumCoverUrl: string;
    amount: number;
    platformFee: number;
    artistRevenue: number;
    shippingAddress: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    paymentIntentId?: string;
    chargeId?: string;
  }): Promise<string> {
    try {
      const orderRef = await addDoc(collection(db, PRE_ORDERS_COLLECTION), {
        ...orderData,
        status: 'pending',
        escrowStatus: 'held',
        batchId: null,
        discUID: null,
        trackingNumber: null,
        shippingCarrier: null,
        shippedAt: null,
        completedAt: null,
        orderedAt: serverTimestamp(),
      });

      console.log('Pre-order created with ID:', orderRef.id);
      return orderRef.id;
    } catch (error) {
      console.error('Error creating pre-order:', error);
      throw error;
    }
  }

  /**
   * Get user's pre-orders
   */
  async getUserPreOrders(userId: string) {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('fanId', '==', userId)
      );
      const querySnapshot = await getDocs(ordersQuery);

      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          orderedAt: (data.orderedAt as Timestamp)?.toDate() || new Date(),
          shippedAt: data.shippedAt ? (data.shippedAt as Timestamp).toDate() : null,
          completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : null,
        });
      });

      return orders;
    } catch (error) {
      console.error('Error getting user pre-orders:', error);
      throw error;
    }
  }

  /**
   * Get user's order for a specific drop
   */
  async getUserOrderForDrop(userId: string, dropId: string) {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('fanId', '==', userId),
        where('dropId', '==', dropId)
      );
      const querySnapshot = await getDocs(ordersQuery);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderedAt: (data.orderedAt as Timestamp)?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user order for drop:', error);
      throw error;
    }
  }

  /**
   * Get order by disc UID
   */
  async getOrderByDiscUID(discUID: string) {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('discUID', '==', discUID)
      );
      const querySnapshot = await getDocs(ordersQuery);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          orderedAt: (data.orderedAt as Timestamp)?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting order by disc UID:', error);
      throw error;
    }
  }

  /**
   * Get artist's pre-orders
   */
  async getArtistPreOrders(artistId: string) {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('artistId', '==', artistId)
      );
      const querySnapshot = await getDocs(ordersQuery);

      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          orderedAt: (data.orderedAt as Timestamp)?.toDate() || new Date(),
        });
      });

      return orders;
    } catch (error) {
      console.error('Error getting artist pre-orders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const orderRef = doc(db, PRE_ORDERS_COLLECTION, orderId);
      const updates: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'completed') {
        updates.completedAt = serverTimestamp();
      }

      await updateDoc(orderRef, updates);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Assign orders to batch
   */
  async assignOrdersToBatch(dropIds: string[], batchId: string): Promise<void> {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('dropId', 'in', dropIds),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(ordersQuery);

      const updatePromises: Promise<void>[] = [];
      querySnapshot.forEach((doc) => {
        const orderRef = doc.ref;
        updatePromises.push(
          updateDoc(orderRef, {
            batchId,
            status: 'in-production',
            updatedAt: serverTimestamp(),
          })
        );
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error assigning orders to batch:', error);
      throw error;
    }
  }

  /**
   * Calculate artist's pending revenue (escrow)
   */
  async getArtistPendingRevenue(artistId: string): Promise<number> {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('artistId', '==', artistId),
        where('escrowStatus', '==', 'held')
      );
      const querySnapshot = await getDocs(ordersQuery);

      let totalRevenue = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += data.artistRevenue || 0;
      });

      return totalRevenue;
    } catch (error) {
      console.error('Error calculating pending revenue:', error);
      throw error;
    }
  }

  // ============ MARKETPLACE: BATCHES ============

  /**
   * Create manufacturing batch
   */
  async createBatch(batchData: {
    batchNumber: string;
    dropIds: string[];
    totalOrders: number;
    totalRevenue: number;
    platformRevenue: number;
    artistRevenue: number;
    productionStartDate: Date | null;
    estimatedShipDate: Date | null;
    createdBy: string;
    notes?: string;
  }): Promise<string> {
    try {
      const batchRef = await addDoc(collection(db, BATCHES_COLLECTION), {
        ...batchData,
        status: 'pending',
        actualShipDate: null,
        createdAt: serverTimestamp(),
      });

      console.log('Batch created with ID:', batchRef.id);
      return batchRef.id;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  /**
   * Get all batches
   */
  async getAllBatches() {
    try {
      const batchesQuery = query(collection(db, BATCHES_COLLECTION));
      const querySnapshot = await getDocs(batchesQuery);

      const batches: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        batches.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          productionStartDate: data.productionStartDate ? (data.productionStartDate as Timestamp).toDate() : null,
          estimatedShipDate: data.estimatedShipDate ? (data.estimatedShipDate as Timestamp).toDate() : null,
          actualShipDate: data.actualShipDate ? (data.actualShipDate as Timestamp).toDate() : null,
        });
      });

      return batches;
    } catch (error) {
      console.error('Error getting batches:', error);
      throw error;
    }
  }

  /**
   * Update batch status
   */
  async updateBatchStatus(batchId: string, status: string): Promise<void> {
    try {
      const batchRef = doc(db, BATCHES_COLLECTION, batchId);
      await updateDoc(batchRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating batch status:', error);
      throw error;
    }
  }

  /**
   * Release batch payments to artists
   */
  async releaseBatchPayments(batchId: string): Promise<void> {
    try {
      // Update all orders in this batch to 'released' escrow status
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('batchId', '==', batchId),
        where('escrowStatus', '==', 'held')
      );
      const querySnapshot = await getDocs(ordersQuery);

      const updatePromises: Promise<void>[] = [];
      querySnapshot.forEach((doc) => {
        const orderRef = doc.ref;
        updatePromises.push(
          updateDoc(orderRef, {
            escrowStatus: 'released',
            updatedAt: serverTimestamp(),
          })
        );
      });

      await Promise.all(updatePromises);

      // Update batch status
      await this.updateBatchStatus(batchId, 'completed');

      console.log(`Released payments for batch ${batchId}`);
    } catch (error) {
      console.error('Error releasing batch payments:', error);
      throw error;
    }
  }

  // ============ MARKETPLACE: ANALYTICS ============

  /**
   * Track analytics event
   */
  async trackEvent(eventData: {
    type: string;
    userId: string;
    userEmail?: string;
    dropId?: string;
    albumId?: string;
    trackId?: string;
    batchId?: string;
    amount?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await addDoc(collection(db, ANALYTICS_EVENTS_COLLECTION), {
        ...eventData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics failures shouldn't break user flow
    }
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(): Promise<number> {
    try {
      const ordersQuery = query(collection(db, PRE_ORDERS_COLLECTION));
      const querySnapshot = await getDocs(ordersQuery);

      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
      });

      return total;
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
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('orderedAt', '>=', startDate)
      );
      const querySnapshot = await getDocs(ordersQuery);

      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
      });

      return total;
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
      const dropsQuery = query(
        collection(db, DROPS_COLLECTION),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(dropsQuery);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting active drops count:', error);
      return 0;
    }
  }

  /**
   * Get total artists count
   */
  async getTotalArtistsCount(): Promise<number> {
    try {
      // Get unique artist IDs from drops
      const dropsQuery = query(collection(db, DROPS_COLLECTION));
      const querySnapshot = await getDocs(dropsQuery);

      const artistIds = new Set<string>();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.artistId) {
          artistIds.add(data.artistId);
        }
      });

      return artistIds.size;
    } catch (error) {
      console.error('Error getting total artists count:', error);
      return 0;
    }
  }

  /**
   * Get total fans count
   */
  async getTotalFansCount(): Promise<number> {
    try {
      // Get unique fan IDs from pre-orders
      const ordersQuery = query(collection(db, PRE_ORDERS_COLLECTION));
      const querySnapshot = await getDocs(ordersQuery);

      const fanIds = new Set<string>();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fanId) {
          fanIds.add(data.fanId);
        }
      });

      return fanIds.size;
    } catch (error) {
      console.error('Error getting total fans count:', error);
      return 0;
    }
  }

  /**
   * Get escrow balance (total held funds)
   */
  async getEscrowBalance(): Promise<number> {
    try {
      const ordersQuery = query(
        collection(db, PRE_ORDERS_COLLECTION),
        where('escrowStatus', '==', 'held')
      );
      const querySnapshot = await getDocs(ordersQuery);

      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
      });

      return total;
    } catch (error) {
      console.error('Error getting escrow balance:', error);
      return 0;
    }
  }
}

export const firestoreService = new FirestoreService();
