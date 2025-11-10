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

  useEffect(() => {
    checkUserStatus();
    
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange(() => {
      checkUserStatus();
    });

    return () => unsubscribe();
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
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.5}
          >
            <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Premium/Auth CTA Button */}
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={handlePremiumUpgrade}
          activeOpacity={0.5}
        >
          <View style={styles.premiumContent}>
            <Ionicons 
              name={hasAccount ? "diamond-outline" : "person-outline"} 
              size={20} 
              color="#FFFFFF" 
            />
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>
                {!hasAccount ? 'Sign In / Sign Up' : isPremium ? 'Premium Active' : 'Upgrade to Premium'}
              </Text>
              <Text style={styles.premiumSubtitle}>
                {!hasAccount ? 'Save your work and unlock all features' : isPremium ? 'All content types unlocked' : 'Unlock all content types'}
              </Text>
            </View>
            {!isPremium && (
              <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
            )}
          </View>
        </TouchableOpacity>

        {/* Ad Banner */}
        <AdBanner />

        {/* Store Button */}
        <TouchableOpacity
          style={styles.storeButton}
          onPress={() => router.push('/store')}
          activeOpacity={0.5}
        >
          <View style={styles.storeContent}>
            <View style={styles.storeIconContainer}>
              <Ionicons name="storefront-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.storeTextContainer}>
              <Text style={styles.storeTitle}>Stream Disc Store</Text>
              <Text style={styles.storeSubtitle}>Browse and buy physical discs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9A9A9A" />
          </View>
        </TouchableOpacity>

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
                      <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
                    </View>
                  )}
                  <Text style={styles.cardTitle}>{type.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  dashboardButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  premiumTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  storeButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  storeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  storeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  storeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  storeSubtitle: {
    fontSize: 12,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: cardWidth,
    height: cardWidth * 0.75,
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
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});

