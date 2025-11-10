import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { nfcService } from '../src/services/nfc';
import { firestoreService } from '../src/services/firestore';
import { nfcVerificationService } from '../src/services/nfcVerification';

export default function WriteNfcScreen() {
  const router = useRouter();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(true);

  useEffect(() => {
    initializeNfc();
    return () => {
      nfcService.cancelOperation();
    };
  }, []);

  const initializeNfc = async () => {
    try {
      const supported = await nfcService.initialize();
      setNfcSupported(supported);

      if (!supported) {
        console.log('NFC not supported - running in dev/test mode');
        // Don't block in dev mode, just log
      }
    } catch (error) {
      console.log('NFC initialization failed (expected in dev mode):', error);
      setNfcSupported(false);
    }
  };

  const handleScan = async () => {
    if (!contentId) {
      Alert.alert('Error', 'No content ID provided');
      return;
    }

    setIsScanning(true);
    setIsWriting(false);

    try {
      // In dev mode, simulate successful verification and write
      if (!nfcSupported) {
        console.log('DEV MODE: Simulating NFC verification and write for content:', contentId);
        
        // Simulate verification
        const verification = await nfcVerificationService.simulateScanAndVerify(true);
        
        if (!verification.isValid) {
          Alert.alert('Not a Stream Disc', verification.message);
          setIsScanning(false);
          return;
        }

        Alert.alert('Verified!', `${verification.message}\nSerial: ${verification.serialNumber}`);
        
        setIsWriting(true);
        // Simulate write delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create mock NFC data
        const mockDiscUID = verification.discData?.uid || `DEV-${Date.now()}`;
        const mockNonce = Math.random().toString(36).substring(7);
        const mockUrl = `https://app.streamdisc.com/a/${contentId}?d=${mockDiscUID}&n=${mockNonce}`;
        
        // Update Firestore
        await firestoreService.updateNfcInfo(contentId, mockUrl, mockDiscUID, mockNonce);
        
        // Update disc programming status
        await firestoreService.updateDiscProgrammingStatus(mockDiscUID, true);
        
        // Navigate to success
        router.push({
          pathname: '/success',
          params: { contentId, url: mockUrl },
        });
        return;
      }

      // Real NFC flow with verification
      // Check if NFC is enabled
      const isEnabled = await nfcService.isEnabled();
      if (!isEnabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings.',
          [{ text: 'OK' }]
        );
        setIsScanning(false);
        return;
      }

      // Step 1: Scan and verify the disc
      const verification = await nfcVerificationService.scanAndVerify();
      
      if (!verification.isValid) {
        // Not a valid Stream Disc - stop here
        setIsScanning(false);
        return;
      }

      // Step 2: Write content to the verified disc
      setIsWriting(true);
      
      const discUID = verification.discData!.uid;
      const nonce = Math.random().toString(36).substring(7);
      const url = `https://app.streamdisc.com/a/${contentId}?d=${discUID}&n=${nonce}`;

      // Write to NFC using the existing nfcService method
      await nfcService.writeUrl(url);

      // Update Firestore
      await firestoreService.updateNfcInfo(contentId, url, discUID, nonce);
      
      // Mark disc as programmed
      await firestoreService.updateDiscProgrammingStatus(discUID, true);

      // Navigate to success screen
      router.push({
        pathname: '/success',
        params: { contentId, url },
      });
    } catch (error: any) {
      console.error('Error writing to NFC:', error);
      
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        // User canceled, just reset state
        setIsScanning(false);
        setIsWriting(false);
      } else {
        Alert.alert(
          'Error',
          'Failed to write to NFC tag. Please try again.',
          [{ text: 'OK', onPress: () => setIsScanning(false) }]
        );
      }
    }
  };

  const handleCancel = async () => {
    await nfcService.cancelOperation();
    setIsScanning(false);
    setIsWriting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* NFC Icon */}
        <View style={styles.nfcIconContainer}>
          <View style={styles.nfcCircle}>
            <View style={styles.nfcWaveContainer}>
              <View style={[styles.nfcWave, styles.nfcWave1]} />
              <View style={[styles.nfcWave, styles.nfcWave2]} />
              <View style={[styles.nfcWave, styles.nfcWave3]} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Ready to Scan</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Mode: NFC write | Hold the NFC tag steady and long enough to your{' '}
          {Platform.OS === 'ios' ? 'iPhone' : 'phone'}.
        </Text>

        {/* Status */}
        {isWriting && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#06FFA5" />
            <Text style={styles.statusText}>Writing to tag...</Text>
          </View>
        )}

        {/* Phone Icon */}
        {!isWriting && (
          <View style={styles.phoneIconContainer}>
            <View style={styles.phoneCircle}>
              <View style={styles.phoneIcon}>
                <View style={styles.phoneNotch} />
              </View>
            </View>
          </View>
        )}

        {/* Scan Button or Cancel Button */}
        {!isScanning ? (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScan}
            disabled={!nfcSupported}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  nfcIconContainer: {
    marginBottom: 40,
  },
  nfcCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0A4D8C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcWaveContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  nfcWave: {
    position: 'absolute',
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#B8A389',
  },
  nfcWave1: {
    width: 80,
    height: 20,
    top: 10,
    left: 0,
  },
  nfcWave2: {
    width: 60,
    height: 16,
    top: 25,
    left: 10,
  },
  nfcWave3: {
    width: 40,
    height: 12,
    top: 35,
    left: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 16,
    color: '#06FFA5',
    marginTop: 16,
  },
  phoneIconContainer: {
    marginBottom: 60,
  },
  phoneCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#3A86FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    width: 80,
    height: 120,
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    position: 'relative',
  },
  phoneNotch: {
    width: 40,
    height: 6,
    backgroundColor: '#D4E4F7',
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 20,
  },
  scanButton: {
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 20,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 12,
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

