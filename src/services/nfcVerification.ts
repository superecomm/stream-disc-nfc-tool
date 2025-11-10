import { Alert } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { firestoreService } from './firestore';

/**
 * NFC Verification Service
 * Handles verification of Stream Disc authenticity by checking against manufacturing database
 */

export interface NfcDiscData {
  uid: string; // Unique NFC chip ID
  manufacturer: string;
  technology: string;
  maxSize: number;
  atqa?: string;
  sak?: string;
  type?: string;
  scannedAt: Date;
  ndefRecords?: any[];
}

export interface StreamDiscVerification {
  isValid: boolean;
  discData: NfcDiscData | null;
  serialNumber?: string;
  manufacturedDate?: Date;
  status?: 'blank' | 'programmed' | 'invalid';
  message: string;
}

class NfcVerificationService {
  /**
   * Scan NFC tag and collect all metadata
   */
  async scanAndCollectData(): Promise<NfcDiscData | null> {
    try {
      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Get tag information
      const tag = await NfcManager.getTag();
      
      if (!tag) {
        throw new Error('No NFC tag detected');
      }

      // Extract tag metadata
      const nfcData: NfcDiscData = {
        uid: tag.id || 'unknown',
        manufacturer: tag.techTypes?.join(', ') || 'unknown',
        technology: tag.techTypes?.[0] || 'unknown',
        maxSize: tag.maxSize || 0,
        atqa: (tag as any).atqa,
        sak: (tag as any).sak,
        type: tag.type,
        scannedAt: new Date(),
        ndefRecords: tag.ndefMessage || [],
      };

      console.log('NFC Data Collected:', nfcData);

      // Cancel the technology request
      await NfcManager.cancelTechnologyRequest();

      return nfcData;
    } catch (error) {
      console.error('Error scanning NFC:', error);
      await NfcManager.cancelTechnologyRequest();
      return null;
    }
  }

  /**
   * Verify if scanned disc is a legitimate Stream Disc
   */
  async verifyStreamDisc(nfcData: NfcDiscData): Promise<StreamDiscVerification> {
    try {
      // Check against manufacturing database
      const registeredDisc = await firestoreService.getRegisteredStreamDisc(nfcData.uid);

      if (!registeredDisc) {
        return {
          isValid: false,
          discData: nfcData,
          status: 'invalid',
          message: 'Not a Stream Disc. This NFC tag is not registered in our system.',
        };
      }

      // Log the scan event
      await firestoreService.logDiscScan({
        discUid: nfcData.uid,
        scannedAt: nfcData.scannedAt,
        metadata: nfcData,
      });

      // Determine disc status
      const status = registeredDisc.isProgrammed ? 'programmed' : 'blank';

      return {
        isValid: true,
        discData: nfcData,
        serialNumber: registeredDisc.serialNumber,
        manufacturedDate: registeredDisc.manufacturedDate,
        status: status,
        message: status === 'blank' 
          ? 'Valid Stream Disc detected. Ready to program!'
          : 'Valid Stream Disc detected. Already programmed.',
      };
    } catch (error) {
      console.error('Error verifying Stream Disc:', error);
      return {
        isValid: false,
        discData: nfcData,
        status: 'invalid',
        message: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Scan and verify Stream Disc in one step
   */
  async scanAndVerify(): Promise<StreamDiscVerification> {
    try {
      // Scan NFC tag
      const nfcData = await this.scanAndCollectData();

      if (!nfcData) {
        return {
          isValid: false,
          discData: null,
          status: 'invalid',
          message: 'Failed to read NFC tag. Please try again.',
        };
      }

      // Verify against database
      const verification = await this.verifyStreamDisc(nfcData);

      // Show alert based on verification result
      if (!verification.isValid) {
        Alert.alert('Not a Stream Disc', verification.message);
      }

      return verification;
    } catch (error) {
      console.error('Error in scan and verify:', error);
      return {
        isValid: false,
        discData: null,
        status: 'invalid',
        message: 'An error occurred during verification.',
      };
    }
  }

  /**
   * Simulate scan for development/testing
   */
  async simulateScanAndVerify(isValid: boolean = true): Promise<StreamDiscVerification> {
    console.log('DEV MODE: Simulating NFC scan');

    const mockNfcData: NfcDiscData = {
      uid: isValid ? 'SD-TEST-12345' : 'INVALID-67890',
      manufacturer: 'NXP',
      technology: 'NfcA',
      maxSize: 888,
      atqa: '0044',
      sak: '00',
      type: 'NTAG216',
      scannedAt: new Date(),
      ndefRecords: [],
    };

    if (isValid) {
      return {
        isValid: true,
        discData: mockNfcData,
        serialNumber: 'SD-2024-12345',
        manufacturedDate: new Date('2024-01-15'),
        status: 'blank',
        message: 'Valid Stream Disc detected. Ready to program!',
      };
    } else {
      return {
        isValid: false,
        discData: mockNfcData,
        status: 'invalid',
        message: 'Not a Stream Disc. This NFC tag is not registered in our system.',
      };
    }
  }
}

export const nfcVerificationService = new NfcVerificationService();

