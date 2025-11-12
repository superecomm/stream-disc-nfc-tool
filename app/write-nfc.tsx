import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { nfcService } from '../src/services/nfc';
import { firestoreService } from '../src/services/firestore';
import { StreamDiscLogo } from '../src/components/StreamDiscLogo';

export default function WriteNfcScreen() {
  const router = useRouter();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [isScanning, setIsScanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Hold your Stream Disc steady near the back of your phone.');
  const [nfcSupported, setNfcSupported] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setStatusMessage('Initializing...');

    try {
      // DEMO MODE: Skip Stream Disc verification, write to ANY NFC tag
      console.log('DEMO MODE: Writing to any NFC tag for content:', contentId);
      
      setStatusMessage('Hold your Stream Disc near the back of your phone...');
      
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

      // Direct write - no verification required for demo
      setIsWriting(true);
      setStatusMessage('Writing to Stream Disc...');
      
      // Generate URL
      const mockDiscUID = `DEMO-${Date.now()}`;
      const nonce = Math.random().toString(36).substring(7);
      const url = `https://stream-disc.web.app/a/${contentId}?d=${mockDiscUID}&n=${nonce}`;

      // Write to NFC tag
      await nfcService.writeUrl(url);
      
      setStatusMessage('Saving...');

      // Update Firestore
      await firestoreService.updateNfcInfo(contentId, url, mockDiscUID, nonce);
      await firestoreService.updateDiscProgrammingStatus(mockDiscUID, true);

      // Show success
      setShowSuccess(true);
      setStatusMessage('Stream Disc Programmed!');
      
      // Navigate to success screen
      setTimeout(() => {
        router.push({
          pathname: '/success',
          params: { contentId, url },
        });
      }, 1500);

    } catch (error: any) {
      console.error('Error writing to NFC:', error);
      
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        setIsScanning(false);
        setIsWriting(false);
        setStatusMessage('Hold your Stream Disc steady near the back of your phone.');
      } else {
        Alert.alert(
          'Write Failed',
          'Failed to write to NFC tag. Please try again.',
          [{ text: 'OK', onPress: () => {
            setIsScanning(false);
            setIsWriting(false);
            setStatusMessage('Hold your Stream Disc steady near the back of your phone.');
          }}]
        );
      }
    }
  };

  const handleCancel = async () => {
    await nfcService.cancelOperation();
    setIsScanning(false);
    setIsWriting(false);
    setShowSuccess(false);
    setStatusMessage('Hold your Stream Disc steady near the back of your phone.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* White Modal Container */}
      <View style={styles.modal}>
        {/* Stream Disc Logo */}
        <View style={styles.logoContainer}>
          <StreamDiscLogo size={60} theme="light" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{showSuccess ? 'Success!' : statusMessage}</Text>

        {/* NFC Visualization */}
        <View style={styles.visualContainer}>
          {showSuccess ? (
            /* Success State */
            <View style={styles.successContainer}>
              <Image
                source={require('../assets/images/nfc-tap.png')}
                style={styles.nfcImage}
                resizeMode="contain"
              />
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={64} color="#06FFA5" />
              </View>
            </View>
          ) : (
            /* Scanning State */
            <>
              <View style={styles.nfcCircle}>
                <Ionicons name="wifi" size={80} color="#3A86FF" />
              </View>
              <View style={styles.phoneContainer}>
                <View style={styles.phone}>
                  <View style={styles.phoneNotch} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Status Text */}
        {isWriting && !showSuccess && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#06FFA5" />
            <Text style={styles.statusText}>Writing...</Text>
          </View>
        )}

        {/* Action Button */}
        {!isScanning && !showSuccess && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScan}
            disabled={!nfcSupported}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        )}

        {isScanning && !showSuccess && (
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  visualContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  nfcCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  phoneContainer: {
    alignItems: 'center',
  },
  phone: {
    width: 80,
    height: 140,
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  successContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  nfcImage: {
    width: 200,
    height: 200,
  },
  successBadge: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.2,
  },
});
