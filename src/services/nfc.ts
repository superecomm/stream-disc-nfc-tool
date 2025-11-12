/**
 * NFC Service for Stream Disc Studio
 * Handles reading and writing NFC chips with complete data collection
 * Based on Stream Disc Mobile App implementation
 */

import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

export interface StreamDiscData {
  uid: string;              // NFC chip UID
  albumId?: string;         // Album identifier
  signature?: string;       // Cryptographic signature
  mintDate?: Date;          // When disc was created
  serialNumber?: string;    // Physical disc serial
  edition?: string;         // Limited edition info
  artistId?: string;        // Artist who created it
}

export interface ScanResult {
  success: boolean;
  verified: boolean;
  data?: StreamDiscData;
  error?: string;
  albumData?: any;          // Full album data from Firebase
}

export interface NFCTagInfo {
  // Tag Identification
  uid: string;                    // Unique tag identifier
  uidHex: string;                 // UID in hex format
  macAddress?: string;            // MAC address style format
  
  // Tag Technology & Type
  type: string;                   // Tag type (e.g., "NFC Forum Type 2")
  techTypes: string[];            // Available tech types (Ndef, NfcA, etc.)
  manufacturer?: string;          // Manufacturer name
  manufacturerId?: string;        // Manufacturer ID
  
  // Memory Information
  maxSize?: number;               // Maximum NDEF message size (bytes)
  currentSize?: number;           // Current NDEF message size (bytes)
  isWritable?: boolean;           // Can tag be written to
  canMakeReadOnly?: boolean;      // Can tag be locked
  
  // NFC-A Specific (most common)
  atqa?: string;                  // Answer to Request Type A
  sak?: number;                   // Select Acknowledge
  
  // Additional Properties
  isLocked?: boolean;             // Is tag read-only
  ndefCapable?: boolean;          // Supports NDEF
  ndefRecordCount?: number;       // Number of NDEF records
  
  // NDEF Data (all content on tag)
  ndefRecords?: Array<{
    id?: string;
    tnf: number;                  // Type Name Format
    type: string;                 // Record type
    payload: string;              // Decoded payload
    payloadRaw?: any;             // Raw payload bytes
  }>;
  
  // Memory Blocks (if available)
  memoryBlocks?: string[];        // Raw memory block data
  memoryDump?: string;            // Complete memory dump
  
  // Raw Data
  rawData?: any;                  // Full raw tag object
}

export interface ScanRecord {
  id?: string;
  discUID: string;
  albumId?: string;              // Optional - may not have album yet
  verified: boolean;
  
  // Timestamp (ISO format + Firestore Timestamp)
  timestamp: Timestamp;
  timestampISO?: string;         // ISO 8601 format
  timestampUnix?: number;        // Unix timestamp
  date?: string;                 // Human readable date
  time?: string;                 // Human readable time
  timezone?: string;             // Timezone
  
  // Platform
  platform: string;              // 'android' | 'ios'
  
  // Complete Device Information
  deviceInfo?: {
    model?: string;              // Device model
    brand?: string;              // Device brand
    manufacturer?: string;       // Device manufacturer
    os?: string;                 // OS version
    osName?: string;             // OS name (Android/iOS)
    osVersion?: string;          // OS version number
    appVersion?: string;         // App version
    deviceName?: string;         // Device name
    deviceId?: string;           // Device ID
    screenSize?: string;         // Screen dimensions
    isEmulator?: boolean;        // Is this an emulator
  };
  
  firstScan?: boolean;
  
  // Phase 1: Complete tag information
  tagInfo?: NFCTagInfo;
  
  // Phase 1: User tracking (complete)
  userId?: string;               // User account ID
  userUid?: string;              // Firebase UID
  userEmail?: string;            // User email
  userName?: string;             // User display name
  userPhone?: string;            // User phone
  userRole?: string;             // User role (Artist/Fan/etc)
  isGuest?: boolean;             // Is guest user
  
  // Phase 1: Geolocation (complete)
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;           // meters
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
  };
  address?: {                    // Reverse geocoded address
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    formatted?: string;          // Full formatted address
  };
  
  // Phase 1: Scan classification
  scanType: 'blank_tag' | 'stream_disc' | 'unknown_tag';
  isProgrammed: boolean;         // Does tag have Stream Disc data
  
  // Scan Event Metadata
  scanDuration?: number;         // How long scan took (ms)
  scanMethod?: string;           // 'manual' | 'auto'
  appState?: string;             // 'foreground' | 'background'
}

class NfcService {
  private isInitialized = false;
  private scanInProgress = false;

  /**
   * Initialize NFC Manager
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        console.log('❌ NFC not supported on this device');
        return false;
      }

      await NfcManager.start();
      this.isInitialized = true;
      console.log('✅ NFC initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ NFC initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if device supports NFC
   */
  async isSupported(): Promise<boolean> {
    try {
      return await NfcManager.isSupported();
    } catch (error) {
      console.error('Error checking NFC support:', error);
      return false;
    }
  }

  /**
   * Check if NFC is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      return await NfcManager.isEnabled();
    } catch (error) {
      console.error('Error checking NFC status:', error);
      return false;
    }
  }

  /**
   * Request user to enable NFC (Android only)
   */
  async requestEnable(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await NfcManager.goToNfcSetting();
      }
    } catch (error) {
      console.error('Error opening NFC settings:', error);
    }
  }

  /**
   * Scan a Stream Disc
   * Phase 1: Collects complete tag info, user data, and geolocation
   */
  async scanStreamDisc(
    onProgress?: (status: string) => void,
    user?: { id: string; uid?: string; email?: string; name?: string; role?: string },
    location?: { latitude: number; longitude: number; accuracy?: number }
  ): Promise<ScanResult> {
    if (this.scanInProgress) {
      return {
        success: false,
        verified: false,
        error: 'Scan already in progress',
      };
    }

    this.scanInProgress = true;
    const scanStartTime = Date.now(); // Track scan duration

    try {
      onProgress?.('Initializing...');

      // Ensure NFC is initialized
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('NFC not available');
      }

      onProgress?.('Waiting for tag...');

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your Stream Disc near the back of your phone',
      });

      onProgress?.('Reading tag...');

      // Get tag info
      const tag = await NfcManager.getTag();
      
      if (!tag) {
        throw new Error('No NFC tag detected');
      }

      console.log('📱 NFC Tag detected:', tag);

      // Extract comprehensive tag information
      const tagInfo = this.extractTagInfo(tag);
      const uid = tagInfo.uid;
      
      if (!uid) {
        throw new Error('Could not read tag UID');
      }

      console.log('🆔 Tag UID:', uid);
      console.log('📋 Tag Info:', tagInfo);

      onProgress?.('Parsing data...');

      // Read NDEF records
      const ndefRecords = tag.ndefMessage || [];
      
      // Parse Stream Disc data
      const streamDiscData = await this.parseStreamDiscData(ndefRecords, uid);
      
      console.log('📀 Stream Disc data:', streamDiscData);

      onProgress?.('Verifying authenticity...');

      // Verify authenticity
      const verified = await this.verifyStreamDisc(streamDiscData);
      
      console.log(verified ? '✅ Disc verified' : '⚠️ Disc not verified');

      // Load album data from Firebase (only if programmed)
      const albumData = streamDiscData.albumId 
        ? await this.loadAlbumData(streamDiscData.albumId)
        : null;

      onProgress?.('Saving scan...');

      // Phase 1: Collect device information
      const deviceData = {
        os: Platform.Version?.toString(),
        osName: Platform.OS === 'android' ? 'Android' : 'iOS',
        osVersion: Platform.Version?.toString(),
      };

      // Phase 1: Save scan with COMPLETE information
      await this.saveScan(streamDiscData, verified, tagInfo, user, location, deviceData, scanStartTime);

      return {
        success: true,
        verified,
        data: streamDiscData,
        albumData,
      };
      
    } catch (error: any) {
      console.error('❌ NFC Scan Error:', error);
      return {
        success: false,
        verified: false,
        error: error.message || 'Failed to read NFC tag',
      };
    } finally {
      // Always cancel technology request
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        console.log('Error canceling NFC request:', e);
      }
      this.scanInProgress = false;
    }
  }

  /**
   * Parse Stream Disc data from NDEF records
   */
  private async parseStreamDiscData(records: any[], uid: string): Promise<StreamDiscData> {
    try {
      console.log('📝 Parsing NDEF records:', records.length);

      // Look for custom Stream Disc record (application/streamdisc)
      const streamDiscRecord = records.find(r => {
        const typeString = this.bytesToString(r.type);
        return typeString.includes('streamdisc');
      });

      if (streamDiscRecord) {
        console.log('Found Stream Disc record');
        const payload = this.bytesToString(streamDiscRecord.payload);
        const data = JSON.parse(payload);
        
        return {
          uid,
          albumId: data.albumId,
          signature: data.signature,
          mintDate: data.mintDate ? new Date(data.mintDate) : undefined,
          serialNumber: data.serialNumber || uid,
          edition: data.edition,
          artistId: data.artistId,
        };
      }

      // Fallback: Look for URL record
      const urlRecord = records.find(r => r.tnf === Ndef.TNF_WELL_KNOWN);
      if (urlRecord) {
        console.log('Found URL record');
        try {
          const url = Ndef.uri.decodePayload(urlRecord.payload);
          console.log('URL:', url);
          
          // Extract album ID from URL (e.g., https://stream-disc.web.app/a/album-123)
          const match = url.match(/\/a\/([^/]+)/);
          const albumId = match ? match[1] : '';
          
          if (albumId) {
            return {
              uid,
              albumId,
              serialNumber: uid,
            };
          }
          console.log('⚠️ URL found but could not extract album ID');
        } catch (error) {
          console.log('⚠️ Could not parse URL record:', error);
        }
      }

      // Fallback: Check if this is a known UID in database
      const knownDisc = await this.findDiscByUID(uid);
      if (knownDisc) {
        console.log('Found disc by UID in database');
        return knownDisc;
      }

      // Phase 1: No fallback - Return blank tag data only
      console.log('⚠️ No Stream Disc data found - Blank/unprogrammed tag');
      return {
        uid,
        serialNumber: uid,
        // NO albumId - this is a blank tag
      };
      
    } catch (error) {
      console.error('Parse error:', error);
      // Phase 1: Return only real tag data
      console.log('⚠️ Parse error - Recording blank tag');
      return {
        uid: uid || 'unknown',
        serialNumber: uid || 'unknown',
        // NO albumId - this is a blank tag
      };
    }
  }

  /**
   * Find disc by UID in database
   */
  private async findDiscByUID(uid: string): Promise<StreamDiscData | null> {
    try {
      const discsRef = collection(db, 'discs');
      const q = query(discsRef, where('uid', '==', uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const discData = snapshot.docs[0].data();
      return {
        uid,
        albumId: discData.albumId,
        signature: discData.signature,
        mintDate: discData.createdAt?.toDate(),
        serialNumber: discData.serialNumber,
        edition: discData.edition,
        artistId: discData.artistId,
      };
    } catch (error) {
      console.error('Error finding disc by UID:', error);
      return null;
    }
  }

  /**
   * Verify Stream Disc authenticity
   */
  private async verifyStreamDisc(data: StreamDiscData): Promise<boolean> {
    try {
      console.log('🔐 Verifying disc:', data.uid);

      // Check if UID exists in our database
      const discsRef = collection(db, 'discs');
      const q = query(discsRef, where('uid', '==', data.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️ Disc UID not found in database - might be a blank/test disc');
        // For blank discs, return true (they're valid, just not programmed)
        return !data.albumId;
      }

      const discDoc = snapshot.docs[0].data();

      // Check if disc is revoked
      if (discDoc.revoked) {
        console.log('❌ Disc has been revoked');
        return false;
      }

      // Check if album exists (if programmed)
      if (data.albumId) {
        const albumExists = await this.checkAlbumExists(data.albumId);
        if (!albumExists) {
          console.log('⚠️ Album not found in database');
          return false;
        }
      }

      console.log('✅ Disc verified successfully');
      return true;

    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  /**
   * Check if album exists in database
   */
  private async checkAlbumExists(albumId: string): Promise<boolean> {
    try {
      const albumRef = doc(db, 'albums', albumId);
      const albumDoc = await getDoc(albumRef);
      return albumDoc.exists();
    } catch (error) {
      console.error('Error checking album:', error);
      return false;
    }
  }

  /**
   * Load album data from Firebase
   */
  private async loadAlbumData(albumId: string): Promise<any> {
    try {
      const albumRef = doc(db, 'albums', albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (albumDoc.exists()) {
        return { id: albumDoc.id, ...albumDoc.data() };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading album:', error);
      return null;
    }
  }

  /**
   * Save scan record to Firebase with COMPLETE information
   * Phase 1: Everything about the tag and scan event
   */
  async saveScan(
    data: StreamDiscData, 
    verified: boolean, 
    tagInfo?: NFCTagInfo,
    user?: { id: string; uid?: string; email?: string; name?: string; phone?: string; role?: string },
    location?: { latitude: number; longitude: number; accuracy?: number },
    deviceInfo?: any,
    scanStartTime?: number
  ): Promise<void> {
    try {
      const scansRef = collection(db, 'scans');
      
      // Phase 1: Determine scan type based on real data only
      const isProgrammed = !!data.albumId; // Has albumId = programmed
      const scanType: 'blank_tag' | 'stream_disc' | 'unknown_tag' = 
        isProgrammed ? 'stream_disc' : 
        (tagInfo?.ndefCapable ? 'blank_tag' : 'unknown_tag');
      
      // Phase 1: Build COMPLETE scan record
      const now = new Date();
      const scanRecord: any = {
        // Tag identification
        discUID: data.uid,
        
        // Verification
        verified,
        isProgrammed,
        scanType,
        
        // Complete Timestamp Information
        timestamp: Timestamp.now(),
        timestampISO: now.toISOString(),
        timestampUnix: Date.now(),
        date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        
        // Platform
        platform: Platform.OS,
        
        // Complete Device Information
        deviceInfo: deviceInfo || {
          os: Platform.Version?.toString(),
          osName: Platform.OS === 'android' ? 'Android' : 'iOS',
          osVersion: Platform.Version?.toString(),
        },
      };

      // Scan duration
      if (scanStartTime) {
        scanRecord.scanDuration = Date.now() - scanStartTime;
      }

      // Album ID (only if programmed)
      if (isProgrammed && data.albumId) {
        scanRecord.albumId = data.albumId;
      }
      
      // Complete tag information
      if (tagInfo) {
        scanRecord.tagInfo = tagInfo;
      }
      
      // Complete User Information
      if (user) {
        if (user.id) scanRecord.userId = user.id;
        if (user.uid) scanRecord.userUid = user.uid;
        if (user.email) scanRecord.userEmail = user.email;
        if (user.name) scanRecord.userName = user.name;
        if (user.phone) scanRecord.userPhone = user.phone;
        if (user.role) scanRecord.userRole = user.role;
        scanRecord.isGuest = !user.id;
      } else {
        scanRecord.isGuest = true;
      }
      
      // Complete Location Information
      if (location) {
        scanRecord.location = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: Date.now(),
        };
      }

      // Scan event metadata
      scanRecord.scanMethod = 'manual';
      scanRecord.appState = 'foreground';

      const docRef = await addDoc(scansRef, scanRecord);
      console.log('✅ Phase 1: Scan saved to database');
      console.log('   - Scan ID:', docRef.id);
      console.log('   - Tag UID:', data.uid);
      console.log('   - Type:', scanType);
      console.log('   - Programmed:', isProgrammed);
      console.log('   - User:', user?.name || 'Guest');
      console.log('   - Location:', location ? `${location.latitude}, ${location.longitude}` : 'Not available');
    } catch (error) {
      console.error('❌ Failed to save scan:', error);
      // Don't throw - scan record is nice to have but not critical
    }
  }

  /**
   * Extract comprehensive tag information
   * Removes undefined values to prevent Firebase errors
   */
  private extractTagInfo(tag: any): NFCTagInfo {
    const uid = tag.id || '';
    const uidHex = this.bytesToHex(uid);
    
    // Determine manufacturer from UID prefix
    const getManufacturer = (uidStr: string): string => {
      const prefix = uidStr.substring(0, 2);
      const manufacturers: { [key: string]: string } = {
        '04': 'NXP Semiconductors',
        '02': 'STMicroelectronics',
        '05': 'Infineon Technologies',
        '07': 'Texas Instruments',
        '08': 'Fujitsu',
        'E0': 'Sony',
      };
      return manufacturers[prefix] || 'Unknown';
    };

    // Build tagInfo object without undefined values
    const tagInfo: any = {
      uid: uidHex,
      uidHex: uidHex,
      macAddress: uidHex,
      type: tag.type || 'Unknown',
      techTypes: tag.techTypes || [],
      manufacturer: getManufacturer(uidHex),
      manufacturerId: uidHex.substring(0, 2),
      isLocked: !tag.isWritable,
      ndefCapable: !!tag.ndefMessage || tag.techTypes?.includes('Ndef'),
      ndefRecordCount: tag.ndefMessage?.length || 0,
    };

    // Only add fields with actual values
    if (tag.maxSize !== undefined) tagInfo.maxSize = tag.maxSize;
    if (tag.ndefMessage?.length) tagInfo.currentSize = tag.ndefMessage.length;
    if (tag.isWritable !== undefined) tagInfo.isWritable = tag.isWritable;
    if (tag.canMakeReadOnly !== undefined) tagInfo.canMakeReadOnly = tag.canMakeReadOnly;
    if (tag.atqa) tagInfo.atqa = this.bytesToHex(tag.atqa);
    if (tag.sak !== undefined) tagInfo.sak = tag.sak;

    // Extract ALL NDEF records with complete data
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      tagInfo.ndefRecords = tag.ndefMessage.map((record: any, index: number) => {
        const recordData: any = {
          tnf: record.tnf,
          type: this.bytesToString(record.type) || 'unknown',
        };

        // Try to decode payload based on type
        try {
          if (record.tnf === Ndef.TNF_WELL_KNOWN) {
            // URL record
            recordData.payload = Ndef.uri.decodePayload(record.payload);
          } else if (record.tnf === Ndef.TNF_MIME_MEDIA) {
            // MIME type record
            recordData.payload = this.bytesToString(record.payload);
          } else {
            // Generic text
            recordData.payload = this.bytesToString(record.payload);
          }
        } catch (e) {
          recordData.payload = `[Binary data: ${record.payload?.length || 0} bytes]`;
        }

        // Store raw payload
        if (record.payload) {
          recordData.payloadRaw = Array.from(record.payload);
        }

        if (record.id) {
          recordData.id = this.bytesToString(record.id);
        }

        return recordData;
      });
    }

    // Store raw data without undefined values
    const rawData: any = {};
    Object.keys(tag).forEach(key => {
      if (tag[key] !== undefined) {
        rawData[key] = tag[key];
      }
    });
    tagInfo.rawData = rawData;

    return tagInfo as NFCTagInfo;
  }

  /**
   * Convert byte array to hex string
   */
  private bytesToHex(bytes: number[] | Uint8Array | undefined): string {
    if (!bytes) return '';
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(':');
  }

  /**
   * Convert byte array to string
   */
  private bytesToString(bytes: number[] | Uint8Array | undefined): string {
    if (!bytes) return '';
    return String.fromCharCode(...Array.from(bytes));
  }

  /**
   * Write album data to NFC tag
   */
  async writeToNfc(
    contentId: string,
    contentType: 'album' | 'video' | 'photos' | 'custom',
    userId: string
  ): Promise<{ success: boolean; message: string; uid?: string }> {
    try {
      // Ensure NFC is initialized
      const initialized = await this.initialize();
      if (!initialized) {
        return { success: false, message: 'NFC not available on this device' };
      }

      // Check if NFC is enabled
      const enabled = await this.isEnabled();
      if (!enabled) {
        return { success: false, message: 'Please enable NFC in your device settings' };
      }

      console.log('🔥 Starting NFC write process...');
      console.log('Content ID:', contentId);
      console.log('Content Type:', contentType);

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your Stream Disc near the back of your phone to program it',
      });

      // Get tag
      const tag = await NfcManager.getTag();
      console.log('📱 Tag detected:', tag);

      if (!tag) {
        throw new Error('No NFC tag detected');
      }

      // Check if tag is writable
      if (!tag.isWritable) {
        throw new Error('This NFC tag is read-only and cannot be programmed');
      }

      // Create URL record
      const url = `https://stream-disc.web.app/a/${contentId}`;
      console.log('📝 Writing URL:', url);

      const urlBytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);

      // Write to tag
      await NfcManager.writeNdefMessage(urlBytes);
      console.log('✅ Successfully wrote to NFC tag');

      // Get tag UID for database record
      const uid = tag.id ? this.bytesToHex(tag.id) : 'unknown';

      // Cancel technology request
      await NfcManager.cancelTechnologyRequest();

      return {
        success: true,
        message: 'Stream Disc programmed successfully!',
        uid,
      };

    } catch (error: any) {
      console.error('❌ NFC Write Error:', error);
      
      // Always try to cancel the request
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        console.log('Error canceling NFC request:', e);
      }

      return {
        success: false,
        message: error.message || 'Failed to write to NFC tag',
      };
    }
  }

  /**
   * Write a URL directly to NFC tag (DEMO MODE - no verification)
   */
  async writeUrl(url: string): Promise<void> {
    console.log('🔥 Direct URL write (DEMO MODE):', url);

    // Request NFC technology for writing
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Hold your Stream Disc near the back of your phone',
    });

    try {
      // Wait for tag
      const tag = await NfcManager.getTag();
      console.log('📱 Tag detected:', tag);

      if (!tag) {
        throw new Error('No NFC tag detected');
      }

      // Encode URL
      const urlBytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
      console.log('📝 Writing URL:', url);

      // Write directly to tag
      await NfcManager.writeNdefMessage(urlBytes);
      console.log('✅ Successfully wrote URL to NFC tag');

      // Cancel technology request
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      // Cancel on error
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        // Ignore
      }
      throw error;
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
      this.isInitialized = false;
      console.log('✅ NFC service cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get NFC status info
   */
  async getStatus(): Promise<{
    supported: boolean;
    enabled: boolean;
    initialized: boolean;
  }> {
    return {
      supported: await this.isSupported(),
      enabled: await this.isEnabled(),
      initialized: this.isInitialized,
    };
  }
}

export const nfcService = new NfcService();
export default nfcService;
