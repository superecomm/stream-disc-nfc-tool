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
} from 'firestore/firestore';
import { db } from '../config/firebase';
import { Disc } from '../types';

const USERS_COLLECTION = 'users';
const DISCS_COLLECTION = 'discs';
const TEMPLATES_COLLECTION = 'templates';

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
        // Create new user
        await setDoc(userRef, {
          ...data,
          isPremium: false,
          discsCreated: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
}

export const firestoreService = new FirestoreService();
