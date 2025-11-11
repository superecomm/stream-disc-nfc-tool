import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface StreamDiscAppPromoProps {
  onClose?: () => void;
}

export function StreamDiscAppPromo({ onClose }: StreamDiscAppPromoProps) {
  const openAppStore = () => {
    // TODO: Replace with actual app store links when available
    Linking.openURL('https://play.google.com/store');
  };

  const openWebsite = () => {
    Linking.openURL('https://www.streamdiscplayer.com');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={['#06FFA5', '#00D4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoContainer}
        >
          <Ionicons name="disc" size={64} color="#000000" />
        </LinearGradient>

        <Text style={styles.appName}>Stream Disc</Text>
        <Text style={styles.tagline}>Play Your Discs Anywhere</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="play-circle" size={24} color="#06FFA5" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Music Player</Text>
            <Text style={styles.featureDescription}>
              Play albums from your Stream Discs with a beautiful interface
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="people" size={24} color="#06FFA5" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Social Features</Text>
            <Text style={styles.featureDescription}>
              Follow artists, discover new music, and share your collection
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="cloud-download" size={24} color="#06FFA5" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Offline Access</Text>
            <Text style={styles.featureDescription}>
              Download your discs for offline listening
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="storefront" size={24} color="#06FFA5" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Marketplace</Text>
            <Text style={styles.featureDescription}>
              Browse and buy albums from independent artists
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openAppStore}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#06FFA5', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Ionicons name="download" size={20} color="#000000" />
            <Text style={styles.primaryButtonText}>Download App</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={openWebsite}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Learn More</Text>
          <Ionicons name="arrow-forward" size={18} color="#06FFA5" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        This is the Studio app for creating content.{'\n'}
        Download the Player app to enjoy your discs.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  ctaContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#06FFA5',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06FFA5',
    marginRight: 8,
    letterSpacing: -0.3,
  },
  footer: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
});

