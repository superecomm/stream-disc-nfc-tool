import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { firestoreService } from '../src/services/firestore';
import { nfcVerificationService } from '../src/services/nfcVerification';
import { db } from '../src/config/firebase';

export default function AdminScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedTestDiscs = async () => {
    setIsLoading(true);
    try {
      await firestoreService.seedTestStreamDiscs();
      Alert.alert(
        'Success!',
        'Test Stream Discs have been added to the manufacturing registry.\n\nTest UIDs:\n• SD-TEST-12345\n• SD-TEST-67890\n• SD-DEMO-PROGRAMMED'
      );
    } catch (error) {
      console.error('Error seeding test discs:', error);
      Alert.alert('Error', 'Failed to seed test discs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVerification = async (isValid: boolean) => {
    setIsLoading(true);
    try {
      const verification = await nfcVerificationService.simulateScanAndVerify(isValid);
      
      if (verification.isValid) {
        Alert.alert(
          'Verification Success',
          `Valid Stream Disc!\n\nSerial: ${verification.serialNumber}\nStatus: ${verification.status}\nManufactured: ${verification.manufacturedDate?.toLocaleDateString()}`
        );
      } else {
        Alert.alert('Verification Failed', verification.message);
      }
    } catch (error) {
      console.error('Error testing verification:', error);
      Alert.alert('Error', 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin / Test Tools</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Ionicons name="construct-outline" size={48} color="#06FFA5" />
          <Text style={styles.title}>Development Tools</Text>
          <Text style={styles.subtitle}>
            Test NFC verification and seed manufacturing database
          </Text>
        </View>

        {/* Manufacturing Registry Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase Project Info</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project ID:</Text>
              <Text style={styles.infoValue}>stream-disc</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Collections:</Text>
              <Text style={styles.infoValue}>
                • users{'\n'}
                • discs{'\n'}
                • registeredDiscs (Manufacturing){'\n'}
                • discScans (Scan Logs)
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Console URL:</Text>
              <Text style={[styles.infoValue, styles.linkText]}>
                firebase.google.com/project/stream-disc
              </Text>
            </View>
          </View>
        </View>

        {/* Manufacturing Registry Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manufacturing Registry</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSeedTestDiscs}
            disabled={isLoading}
            activeOpacity={0.5}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Seed Test Stream Discs</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Add 3 test discs to manufacturing registry
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Verification Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NFC Verification Testing</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.successButton]}
            onPress={() => handleTestVerification(true)}
            disabled={isLoading}
            activeOpacity={0.5}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#06FFA5" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Test Valid Disc</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Simulate scanning a registered Stream Disc
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.errorButton]}
            onPress={() => handleTestVerification(false)}
            disabled={isLoading}
            activeOpacity={0.5}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Test Invalid Disc</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Simulate scanning an unregistered NFC tag
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#9A9A9A" />
          <Text style={styles.infoText}>
            Scan data collection includes: UID, manufacturer, technology type, max size, ATQA, SAK, chip type, scan timestamp, and NDEF records. All data is logged to the 'discScans' collection in Firestore.
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#06FFA5" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9A9A9A',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
    marginBottom: 12,
  },
  successButton: {
    borderColor: 'rgba(6, 255, 165, 0.3)',
    backgroundColor: 'rgba(6, 255, 165, 0.08)',
  },
  errorButton: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: '#9A9A9A',
    fontWeight: '400',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#9A9A9A',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A9A9A',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 20,
  },
  linkText: {
    color: '#06FFA5',
  },
  loadingOverlay: {
    marginTop: 32,
    alignItems: 'center',
  },
});

