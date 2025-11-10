import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../src/services/auth';
import { AdBanner } from '../src/components/AdBanner';
import { NfcScanModal } from '../src/components/NfcScanModal';
import { BottomNav } from '../src/components/BottomNav';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

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
    locked: true, // Locked until after album flow is complete
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

export default function HomeScreen() {
  const router = useRouter();
  const [hasAccount, setHasAccount] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);

  useEffect(() => {
    checkUserStatus();
    
    // Show NFC modal on first launch (delayed)
    const timer = setTimeout(() => {
      setShowNfcModal(true);
    }, 1000);
    
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange(() => {
      checkUserStatus();
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const checkUserStatus = async () => {
    const hasPermanentAccount = authService.hasPermanentAccount();
    const premiumStatus = await authService.isPremium();
    
    setHasAccount(hasPermanentAccount);
    setIsPremium(premiumStatus);
  };

  const handleCardPress = (route: string, type: string, locked: boolean) => {
    if (locked) {
      Alert.alert(
        'Premium Feature',
        'Upgrade to Premium to unlock this content type and create unlimited Stream Discs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => handlePremiumUpgrade() },
        ]
      );
      return;
    }

    if (type === 'album' || type === 'mixtape') {
      router.push('/create-album');
    }
  };

  const handlePremiumUpgrade = () => {
    if (!hasAccount) {
      // Show sign in/sign up prompt
      Alert.alert(
        'Save Your Work',
        'Sign in to save your Stream Discs and access premium features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => handleSignIn() },
          { text: 'Sign Up', onPress: () => handleSignUp() },
        ]
      );
    } else if (!isPremium) {
      // Show premium upgrade
      router.push('/subscription');
    }
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Stream Disc</Text>
            <Text style={styles.subtitle}>studio</Text>
          </View>
        </View>

        {/* Scrollable Content Type Cards */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardsContainer}>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleCardPress(type.route, type.id, type.locked)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={type.gradient}
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
        </ScrollView>
      </View>

      {/* NFC Scan Modal */}
      <NfcScanModal
        visible={showNfcModal}
        onClose={() => setShowNfcModal(false)}
        mode="read"
      />

      {/* Bottom Navigation */}
      <BottomNav
        onBurnPress={() => setShowNfcModal(true)}
        isScanning={showNfcModal}
      />
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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9A9A9A',
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'lowercase',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: cardWidth,
    height: 120,
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 12,
    marginBottom: 0,
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
});

