import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';

class NfcService {
  private isInitialized = false;

  /**
   * Initialize NFC Manager
   */
  async initialize(): Promise<boolean> {
    try {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        this.isInitialized = true;
        return true;
      }
      console.log('NFC not supported on this device');
      return false;
    } catch (error) {
      console.error('Error initializing NFC:', error);
      // Don't throw, just return false so app doesn't crash
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
   * Generate a random nonce for security
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Write album data to NFC tag
   */
  async writeToNfc(
    contentId: string,
    onTagDetected?: () => void
  ): Promise<{ discUID: string; nonce: string; url: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Request NDEF technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Get tag information
      const tag = await NfcManager.getTag();
      if (!tag || !tag.id) {
        throw new Error('Unable to read tag information');
      }

      const discUID = tag.id;
      const nonce = this.generateNonce();
      const url = `https://app.streamdisc.com/a/${contentId}?d=${discUID}&n=${nonce}`;

      // Notify that tag was detected
      onTagDetected?.();

      // Create NDEF message with URL record
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);

      // Write to tag
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      // Clean up
      await NfcManager.cancelTechnologyRequest();

      return { discUID, nonce, url };
    } catch (error) {
      console.error('Error writing to NFC:', error);
      await NfcManager.cancelTechnologyRequest();
      throw error;
    }
  }

  /**
   * Read NFC tag
   */
  async readNfc(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      await NfcManager.cancelTechnologyRequest();

      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];
        const payload = ndefRecord.payload;
        
        // Parse URL from payload (skip first byte which is URL identifier)
        const url = String.fromCharCode(...payload.slice(1));
        return url;
      }

      return null;
    } catch (error) {
      console.error('Error reading NFC:', error);
      await NfcManager.cancelTechnologyRequest();
      throw error;
    }
  }

  /**
   * Check if tag is blank
   */
  async isBlankTag(): Promise<boolean> {
    try {
      const url = await this.readNfc();
      return !url || url.includes('app.streamdisc.com/blank');
    } catch (error) {
      // If we can't read the tag, assume it's blank or empty
      return true;
    }
  }

  /**
   * Register for tag discovery (background scanning)
   */
  async registerTagListener(
    onTagDiscovered: (tag: any) => void
  ): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      NfcManager.setEventListener(NfcEvents.DiscoverTag, onTagDiscovered);
      await NfcManager.registerTagEvent();
    } catch (error) {
      console.error('Error registering tag listener:', error);
      throw error;
    }
  }

  /**
   * Unregister tag listener
   */
  async unregisterTagListener(): Promise<void> {
    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      await NfcManager.unregisterTagEvent();
    } catch (error) {
      console.error('Error unregistering tag listener:', error);
    }
  }

  /**
   * Cancel current NFC operation
   */
  async cancelOperation(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.error('Error canceling NFC operation:', error);
    }
  }

  /**
   * Clean up NFC Manager
   */
  async cleanup(): Promise<void> {
    try {
      await this.unregisterTagListener();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error cleaning up NFC:', error);
    }
  }
}

export const nfcService = new NfcService();

