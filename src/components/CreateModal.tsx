import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import ModeCarousel from './ModeCarousel';
import { nfcService } from '../services/nfc';
import { authService } from '../services/auth';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

type CreateMode = 'studio' | 'post' | 'live';

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
}

const contentTypes = [
  {
    id: 'album',
    title: 'Album',
    gradient: ['#FF006E', '#8338EC'],
    route: '/create-album',
    locked: false,
  },
  {
    id: 'mixtape',
    title: 'Mixtape',
    gradient: ['#FFBE0B', '#06FFA5'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'film',
    title: 'Film',
    gradient: ['#06FFA5', '#3A86FF'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'podcast',
    title: 'Podcast',
    gradient: ['#8338EC', '#FF006E'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'audiobook',
    title: 'Audiobook',
    gradient: ['#FB5607', '#06FFA5'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'digitalart',
    title: 'Digital Art',
    gradient: ['#FF006E', '#FFBA08'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'valentines',
    title: "Valentine's Day",
    gradient: ['#FF006E', '#FF4D6D'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'wedding',
    title: 'Wedding',
    gradient: ['#FFD6E8', '#C77DFF'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'babyreveal',
    title: 'Baby Reveal',
    gradient: ['#FFAFCC', '#A0C4FF'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'memorial',
    title: 'Memorial',
    gradient: ['#6C757D', '#ADB5BD'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'familyphotos',
    title: 'Family Photos',
    gradient: ['#FFBA08', '#06FFA5'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'christmas',
    title: 'Christmas',
    gradient: ['#C1121F', '#2D6A4F'],
    route: '/create-album',
    locked: true,
  },
  {
    id: 'create',
    title: 'Create',
    gradient: ['#FF006E', '#FFBE0B'],
    route: '/create-album',
    locked: true,
  },
];

export default function CreateModal({ visible, onClose, mode, onModeChange }: CreateModalProps) {
  const router = useRouter();
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // NFC Scanning states
  const [showNfcScanning, setShowNfcScanning] = useState(false);
  const [nfcStatus, setNfcStatus] = useState('Initializing...');
  const [isScanning, setIsScanning] = useState(false);

  // Timer for live recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLiveRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveRecording]);

  // Reset recording state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsLiveRecording(false);
      setRecordingTime(0);
      setShowNfcScanning(false);
      setIsScanning(false);
    }
  }, [visible]);

  // Handle NFC scanning for Studio mode
  const handleNfcScan = async () => {
    console.log('🔥 Starting NFC scan in Studio mode...');
    setShowNfcScanning(true);
    setIsScanning(true);
    setNfcStatus('Initializing NFC...');

    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      const user = currentUser ? {
        id: currentUser.uid,
        uid: currentUser.uid,
        email: currentUser.email || undefined,
        name: currentUser.displayName || undefined,
        role: 'artist', // Default to artist for Studio users
      } : undefined;

      // TODO: Get user location (requires expo-location)
      // For now, pass undefined
      const location = undefined;

      // Start NFC scan with progress callback
      const result = await nfcService.scanStreamDisc(
        (status) => {
          console.log('📱 NFC Status:', status);
          setNfcStatus(status);
        },
        user,
        location
      );

      setIsScanning(false);

      if (result.success) {
        console.log('✅ NFC Scan successful:', result);
        
        if (result.data?.albumId) {
          // Programmed disc - navigate to album
          setNfcStatus('Disc verified! Opening album...');
          setTimeout(() => {
            setShowNfcScanning(false);
            onClose(); // Close create modal
            router.push(`/album/${result.data.albumId}` as any);
          }, 1000);
        } else {
          // Blank disc - show options
          setNfcStatus('Blank disc detected');
          Alert.alert(
            'Blank Stream Disc',
            'This is a blank disc. Would you like to program it with an album?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setShowNfcScanning(false),
              },
              {
                text: 'Program Disc',
                onPress: () => {
                  setShowNfcScanning(false);
                  onClose();
                  router.push('/create-album');
                },
              },
            ]
          );
        }
      } else {
        console.log('❌ NFC Scan failed:', result.error);
        setNfcStatus(`Error: ${result.error}`);
        Alert.alert('Scan Failed', result.error || 'Could not read NFC tag', [
          {
            text: 'Try Again',
            onPress: () => {
              setShowNfcScanning(false);
              setTimeout(() => handleNfcScan(), 300);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowNfcScanning(false),
          },
        ]);
      }
    } catch (error: any) {
      console.error('❌ NFC Scan error:', error);
      setIsScanning(false);
      setNfcStatus(`Error: ${error.message}`);
      Alert.alert('Error', error.message || 'An error occurred during scanning', [
        { text: 'OK', onPress: () => setShowNfcScanning(false) },
      ]);
    }
  };

  const handleCardPress = (route: string, type: string, locked: boolean) => {
    if (locked) {
      console.log(`${type} is locked - Premium feature`);
      return;
    }

    // Close modal and navigate
    onClose();
    router.push(route as any);
  };

  const renderStudioContent = () => (
    <View style={styles.cardsGrid}>
      {contentTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={styles.cardContainer}
          onPress={() => handleCardPress(type.route, type.title, type.locked)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={type.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, type.locked && styles.cardLocked]}
          >
            {type.locked && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
              </View>
            )}
            <Text style={styles.cardTitle}>{type.title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPostContent = () => (
    <View style={styles.comingSoonContainer}>
      <Ionicons name="add-circle-outline" size={80} color="#06FFA5" />
      <Text style={styles.comingSoonTitle}>Create Post</Text>
      <Text style={styles.comingSoonDescription}>
        Share your thoughts, music, and moments with your followers. Coming soon!
      </Text>
    </View>
  );

  const renderLiveContent = () => (
    <View style={styles.comingSoonContainer}>
      <Ionicons name="radio-outline" size={80} color="#FFD60A" />
      <Text style={styles.comingSoonTitle}>Go Live</Text>
      <Text style={styles.comingSoonDescription}>
        Stream live performances, DJ sets, and connect with your audience in real-time. Coming
        soon!
      </Text>
    </View>
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleButtonPress = () => {
    if (mode === 'studio') {
      // Trigger NFC scanning for Studio mode
      handleNfcScan();
    } else if (mode === 'live') {
      // Toggle recording
      setIsLiveRecording(!isLiveRecording);
    } else {
      // Close modal for other modes
      onClose();
    }
  };

  const getHeaderTitle = () => {
    switch (mode) {
      case 'studio':
        return { main: 'Stream Disc', sub: 'studio' };
      case 'post':
        return { main: 'Create', sub: 'post' };
      case 'live':
        return { main: 'Go', sub: 'live' };
      default:
        return { main: 'Stream Disc', sub: 'studio' };
    }
  };

  const headerTitle = getHeaderTitle();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{headerTitle.main}</Text>
            <Text style={styles.subtitle}>{headerTitle.sub}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'studio' && renderStudioContent()}
          {mode === 'post' && renderPostContent()}
          {mode === 'live' && renderLiveContent()}
        </ScrollView>

        {/* Bottom Navigation (Always visible) */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="home-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="library-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Library</Text>
          </TouchableOpacity>

          <View style={styles.createButtonPlaceholder}>
            {/* Create button placeholder - actual button is in parent */}
          </View>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="mail-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} activeOpacity={0.6}>
            <Ionicons name="person-outline" size={24} color="#999999" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Carousel - Positioned above bottom nav */}
        <ModeCarousel activeMode={mode} onModeChange={onModeChange} />

        {/* Floating Create Button */}
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={[
              styles.floatingCreateButton,
              mode === 'studio' && styles.floatingButtonStudio,
              mode === 'live' && !isLiveRecording && styles.floatingButtonLiveInactive,
              mode === 'live' && isLiveRecording && styles.floatingButtonLiveActive,
            ]}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            {mode === 'studio' ? (
              <Ionicons name="flame" size={32} color="#FFFFFF" />
            ) : mode === 'post' ? (
              <Ionicons name="add" size={32} color="#000000" />
            ) : mode === 'live' && isLiveRecording ? (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
              </View>
            ) : (
              <View style={styles.liveInactiveIcon}>
                <Ionicons name="radio" size={28} color="#FF3B5C" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* NFC Scanning Toast Modal */}
      {showNfcScanning && (
        <View style={styles.nfcOverlay}>
          <View style={styles.nfcToast}>
            <View style={styles.nfcHeader}>
              <Ionicons name="scan" size={28} color="#06FFA5" />
              <Text style={styles.nfcTitle}>Scanning NFC</Text>
              {!isScanning && (
                <TouchableOpacity 
                  onPress={() => {
                    setShowNfcScanning(false);
                    nfcService.cleanup();
                  }}
                  style={styles.nfcCloseButton}
                >
                  <Ionicons name="close" size={24} color="#999999" />
                </TouchableOpacity>
              )}
            </View>

            {isScanning && (
              <View style={styles.nfcAnimation}>
                <View style={styles.pulsingOrb}>
                  <View style={styles.orbOuter} />
                  <View style={styles.orbMiddle} />
                  <View style={styles.orbInner} />
                </View>
                <ActivityIndicator size="large" color="#06FFA5" style={styles.spinner} />
              </View>
            )}

            <Text style={styles.nfcStatus}>{nfcStatus}</Text>

            {!isScanning && nfcStatus.includes('Error') && (
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setShowNfcScanning(false);
                  setTimeout(() => handleNfcScan(), 300);
                }}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 36,
  },
  subtitle: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
    marginTop: -4,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 200,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardContainer: {
    width: cardWidth,
  },
  card: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 12,
    position: 'relative',
  },
  cardLocked: {
    opacity: 0.5,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  comingSoonTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  comingSoonDescription: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
    zIndex: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontWeight: '500',
  },
  createButtonPlaceholder: {
    width: 56,
    height: 56,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  floatingCreateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#000000',
  },
  floatingButtonStudio: {
    backgroundColor: '#FF3B5C',
    borderColor: '#FF3B5C',
  },
  floatingButtonLiveInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF3B5C',
    borderWidth: 4,
  },
  floatingButtonLiveActive: {
    backgroundColor: '#FF3B5C',
    borderColor: '#FF0000',
    borderWidth: 4,
  },
  liveInactiveIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // NFC Scanning Toast
  nfcOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  nfcToast: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 32,
    width: width - 64,
    alignItems: 'center',
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  nfcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  nfcTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  nfcCloseButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    padding: 4,
  },
  nfcAnimation: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulsingOrb: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  orbOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    position: 'absolute',
  },
  orbMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    position: 'absolute',
  },
  orbInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 255, 165, 0.4)',
    position: 'absolute',
  },
  spinner: {
    position: 'absolute',
  },
  nfcStatus: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#06FFA5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

