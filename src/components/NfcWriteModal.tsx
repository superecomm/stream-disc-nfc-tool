import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreamDiscLogo } from './StreamDiscLogo';
import { nfcService } from '../services/nfc';
import { firestoreService } from '../services/firestore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NfcWriteModalProps {
  visible: boolean;
  onClose: () => void;
  contentId: string;
  albumCoverUrl?: string;
  onWriteComplete?: (url: string) => void;
}

export const NfcWriteModal: React.FC<NfcWriteModalProps> = ({
  visible,
  onClose,
  contentId,
  albumCoverUrl,
  onWriteComplete,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const [statusMessage, setStatusMessage] = useState('Ready to Program');
  const [isWriting, setIsWriting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const writeAttemptRef = useRef<any>(null);

  // Pan responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Slide up animation when modal opens
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      if (!showSuccess) {
        startAnimations();
        // Start write process automatically
        startWriting();
      } else {
        startSuccessAnimation();
      }
    } else {
      translateY.setValue(SCREEN_HEIGHT);
      stopAnimations();
      successScale.setValue(0);
      successOpacity.setValue(0);
    }

    return () => {
      if (writeAttemptRef.current) {
        clearTimeout(writeAttemptRef.current);
      }
    };
  }, [visible, showSuccess]);

  // Pulsing animation for the NFC orb
  const startAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Phone tap animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(phoneAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ])
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    phoneAnim.stopAnimation();
  };

  const startSuccessAnimation = () => {
    // Success pop animation
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    stopAnimations();
    if (writeAttemptRef.current) {
      clearTimeout(writeAttemptRef.current);
    }
    nfcService.cancelOperation();
    onClose();
  };

  const startWriting = async () => {
    if (!contentId || isWriting) return;

    setIsWriting(true);
    setStatusMessage('Initializing...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatusMessage('Hold your Stream Disc near the back of your phone');

      // Check if NFC is enabled
      const isEnabled = await nfcService.isEnabled();
      if (!isEnabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings.',
          [
            { text: 'Cancel', onPress: handleClose },
            { text: 'Retry', onPress: () => retryWrite() },
          ]
        );
        setIsWriting(false);
        return;
      }

      setStatusMessage('Waiting for Stream Disc...');

      // DEMO MODE: Direct write without verification
      // Keep trying until success
      await attemptWrite();

    } catch (error: any) {
      console.error('Write error:', error);
      handleWriteError(error);
    }
  };

  const attemptWrite = async () => {
    try {
      setStatusMessage('Detecting Stream Disc...');

      // Generate URL
      const mockDiscUID = `DEMO-${Date.now()}`;
      const nonce = Math.random().toString(36).substring(7);
      const url = `https://stream-disc.web.app/a/${contentId}?d=${mockDiscUID}&n=${nonce}`;

      setStatusMessage('Programming Stream Disc...');

      // Write to NFC tag - this will wait for tag
      await nfcService.writeUrl(url);

      setStatusMessage('Verifying...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatusMessage('Saving to Database...');

      // Update Firestore
      await firestoreService.updateNfcInfo(contentId, url, mockDiscUID, nonce);
      await firestoreService.updateDiscProgrammingStatus(mockDiscUID, true);

      // Success!
      setStatusMessage('Stream Disc Programmed Successfully!');
      setShowSuccess(true);
      setIsWriting(false);
      stopAnimations();
      startSuccessAnimation();

      // Call completion callback
      if (onWriteComplete) {
        setTimeout(() => {
          onWriteComplete(url);
        }, 2000);
      }

    } catch (error: any) {
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        // User canceled
        setIsWriting(false);
        setStatusMessage('Write Cancelled');
        return;
      }

      // Retry automatically after error
      console.log('Write failed, retrying in 1s...', error);
      writeAttemptRef.current = setTimeout(() => {
        attemptWrite();
      }, 1000);
    }
  };

  const retryWrite = () => {
    setIsWriting(false);
    setShowSuccess(false);
    setStatusMessage('Ready to Program');
    startWriting();
  };

  const handleWriteError = (error: any) => {
    setIsWriting(false);
    setStatusMessage('Write Failed');

    Alert.alert(
      'Write Failed',
      error.message || 'Failed to write to Stream Disc. Please try again.',
      [
        { text: 'Cancel', style: 'cancel', onPress: handleClose },
        { text: 'Retry', onPress: retryWrite },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Swipe Handle */}
          <View style={styles.handle} />

          {/* Content */}
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logo}>
              <StreamDiscLogo size={60} theme="light" />
            </View>

            {/* Title */}
            <Text style={styles.title}>{statusMessage}</Text>

            {/* NFC Visualization */}
            <View style={styles.visualContainer}>
              {showSuccess ? (
                /* Success State - Show Disc with Album Cover */
                <Animated.View
                  style={[
                    styles.successDiscContainer,
                    {
                      transform: [{ scale: successScale }],
                      opacity: successOpacity,
                    },
                  ]}
                >
                  {/* Real Stream Disc NFC Tap Image */}
                  <View style={styles.nfcTapImageContainer}>
                    <Image
                      source={require('../../assets/images/nfc-tap.png')}
                      style={styles.nfcTapImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Album Cover Overlay */}
                  {albumCoverUrl && (
                    <View style={styles.albumCoverOverlay}>
                      <Image
                        source={{ uri: albumCoverUrl }}
                        style={styles.albumCover}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {/* Success Checkmark */}
                  <View style={styles.successBadge}>
                    <Ionicons name="checkmark-circle" size={64} color="#06FFA5" />
                  </View>
                </Animated.View>
              ) : (
                /* Writing State - Show Disc with Album Cover */
                <View style={styles.writingContainer}>
                  {/* Stream Disc Image */}
                  <View style={styles.discImageContainer}>
                    <Image
                      source={require('../../assets/images/nfc-tap.png')}
                      style={styles.discImage}
                      resizeMode="contain"
                    />

                    {/* Album Cover Overlay on White Label */}
                    {albumCoverUrl && (
                      <View style={styles.albumCoverOverlayWriting}>
                        <Image
                          source={{ uri: albumCoverUrl }}
                          style={styles.albumCoverWriting}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>

                  {/* Pulsing NFC Orb */}
                  <Animated.View
                    style={[
                      styles.nfcOrb,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />

                  {/* Phone Icon with Tap Animation */}
                  <Animated.View
                    style={[
                      styles.phoneIcon,
                      {
                        transform: [
                          {
                            translateY: phoneAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -10],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.phone}>
                      <View style={styles.phoneNotch} />
                    </View>
                  </Animated.View>
                </View>
              )}
            </View>

            {/* Cancel Button */}
            {!showSuccess && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    minHeight: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 32,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  visualContainer: {
    width: 300,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  writingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  discImageContainer: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 20,
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
  albumCoverOverlayWriting: {
    position: 'absolute',
    top: '35%',
    left: '35%',
    width: '30%',
    height: '30%',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  albumCoverWriting: {
    width: '100%',
    height: '100%',
  },
  nfcOrb: {
    position: 'absolute',
    top: '15%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(58, 134, 255, 0.2)',
  },
  phoneIcon: {
    position: 'absolute',
    bottom: 0,
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
  successDiscContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  nfcTapImageContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcTapImage: {
    width: '100%',
    height: '100%',
  },
  albumCoverOverlay: {
    position: 'absolute',
    top: '35%',
    left: '35%',
    width: 75,
    height: 75,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  albumCover: {
    width: '100%',
    height: '100%',
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

