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
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Disc } from '../types';

const DISCS_COLLECTION = 'discs';

class FirestoreService {
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
      await updateDoc(discRef, updates);
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
}

export const firestoreService = new FirestoreService();

