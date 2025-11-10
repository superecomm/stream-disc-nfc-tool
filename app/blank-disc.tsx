import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BlankDiscScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [fromDeepLink, setFromDeepLink] = useState(false);

  useEffect(() => {
    // Check if accessed via deep link
    const checkDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && initialUrl.includes('blank')) {
        setFromDeepLink(true);
      } else if (params.from === 'nfc' || params.from === 'deeplink') {
        setFromDeepLink(true);
      }
    };
    checkDeepLink();

    // Animate disc entrance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/');
  };

  const handleDownloadApp = () => {
    // Open app store or play store
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com' // Replace with actual App Store link
      : 'https://play.google.com/store'; // Replace with actual Play Store link
    Linking.openURL(storeUrl);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Disc Icon */}
        <Animated.View
          style={[
            styles.discIcon,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.discOuter}>
            <View style={styles.discInner}>
              <Ionicons name="disc-outline" size={40} color="#666666" />
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Welcome to Stream Disc</Text>

        {/* Message */}
        <Text style={styles.message}>
          {fromDeepLink
            ? "You've discovered a blank Stream Disc! Download the app to program this disc with your favorite music, photos, videos, and more."
            : 'This is a blank Stream Disc ready to be programmed with your content.'}
        </Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="musical-notes-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Music Albums & Mixtapes</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="videocam-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Videos & Films</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="images-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Photos & Digital Art</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="text-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Stories & Messages</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {fromDeepLink ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleDownloadApp}
                activeOpacity={0.5}
              >
                <Ionicons name="download-outline" size={20} color="#000000" />
                <Text style={styles.primaryButtonText}>Download App</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => Linking.openURL('https://streamdisc.com')}
                activeOpacity={0.5}
              >
                <Text style={styles.secondaryButtonText}>Learn More</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.5}
            >
              <Ionicons name="rocket-outline" size={20} color="#000000" />
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer Info */}
        <Text style={styles.footerText}>
          Tap your programmed Stream Disc to instantly access your content
        </Text>
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
  discIcon: {
    marginBottom: 40,
  },
  discOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.3)',
  },
  discInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: '#9A9A9A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 320,
  },
  featuresList: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 32,
    maxWidth: 280,
    lineHeight: 18,
  },
});

