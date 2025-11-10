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
const TEMPLATES_COLLECTION = 'templates';
const REGISTERED_DISCS_COLLECTION = 'registeredDiscs'; // Manufacturing registry
const DISC_SCANS_COLLECTION = 'discScans'; // Scan logs

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
}

export const firestoreService = new FirestoreService();
