import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface DiscPackage {
  id: string;
  quantity: number;
  price: number;
  popular?: boolean;
  discount?: string;
}

const packages: DiscPackage[] = [
  {
    id: 'single',
    quantity: 1,
    price: 9.99,
  },
  {
    id: 'pack-5',
    quantity: 5,
    price: 39.99,
    popular: true,
    discount: 'Save 20%',
  },
  {
    id: 'pack-10',
    quantity: 10,
    price: 69.99,
    discount: 'Save 30%',
  },
  {
    id: 'pack-25',
    quantity: 25,
    price: 149.99,
    discount: 'Save 40%',
  },
];

export default function BlankDiscsScreen() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string>('pack-5');

  const handlePurchase = () => {
    const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage);
    if (!selectedPkg) return;

    Alert.alert(
      'Purchase Blank Discs',
      `You are about to purchase ${selectedPkg.quantity} blank Stream Disc${selectedPkg.quantity > 1 ? 's' : ''} for $${selectedPkg.price}.\n\nThis will be integrated with Stripe or another payment provider.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Order placed! Your blank discs will ship within 2-3 business days.');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Blank Discs</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.discPreview}>
            <View style={styles.discOuter}>
              <View style={styles.discInner}>
                <Ionicons name="disc-outline" size={48} color="#06FFA5" />
              </View>
            </View>
          </View>
          <Text style={styles.heroTitle}>Official Stream Discs</Text>
          <Text style={styles.heroSubtitle}>
            Premium NFC-enabled discs ready to program with your content
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Verified & Authenticated</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="infinite-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Rewritable Content</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flash-outline" size={20} color="#06FFA5" />
            <Text style={styles.featureText}>Instant NFC Transfer</Text>
          </View>
        </View>

        {/* Packages */}
        <View style={styles.packagesSection}>
          <Text style={styles.sectionTitle}>Choose Your Package</Text>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                selectedPackage === pkg.id && styles.packageCardSelected,
                pkg.popular && styles.packageCardPopular,
              ]}
              onPress={() => setSelectedPackage(pkg.id)}
              activeOpacity={0.7}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.packageHeader}>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageQuantity}>{pkg.quantity} Discs</Text>
                  {pkg.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{pkg.discount}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.packagePricing}>
                  <Text style={styles.packagePrice}>${pkg.price}</Text>
                  <Text style={styles.packagePriceUnit}>
                    ${(pkg.price / pkg.quantity).toFixed(2)}/disc
                  </Text>
                </View>
              </View>

              <View style={styles.packageDetails}>
                <View style={styles.packageDetailItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#06FFA5" />
                  <Text style={styles.packageDetailText}>Free shipping on orders over $50</Text>
                </View>
                <View style={styles.packageDetailItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#06FFA5" />
                  <Text style={styles.packageDetailText}>Lifetime disc warranty</Text>
                </View>
                {pkg.quantity >= 10 && (
                  <View style={styles.packageDetailItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#06FFA5" />
                    <Text style={styles.packageDetailText}>Bulk pricing & priority support</Text>
                  </View>
                )}
              </View>

              <View style={styles.selectIndicator}>
                <Ionicons
                  name={selectedPackage === pkg.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedPackage === pkg.id ? '#06FFA5' : '#666666'}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Specifications */}
        <View style={styles.specsSection}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Size</Text>
            <Text style={styles.specValue}>5" x 5" (127mm x 127mm)</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Technology</Text>
            <Text style={styles.specValue}>NFC Type 2 (NTAG216)</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Memory</Text>
            <Text style={styles.specValue}>888 bytes</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Compatibility</Text>
            <Text style={styles.specValue}>iOS & Android</Text>
          </View>
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          activeOpacity={0.5}
        >
          <Ionicons name="cart" size={20} color="#000000" />
          <Text style={styles.purchaseButtonText}>
            Purchase {packages.find((p) => p.id === selectedPackage)?.quantity} Discs - $
            {packages.find((p) => p.id === selectedPackage)?.price}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  discPreview: {
    marginBottom: 24,
  },
  discOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.3)',
  },
  discInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#9A9A9A',
    textAlign: 'center',
    lineHeight: 20,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  packagesSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  packageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: '#06FFA5',
    backgroundColor: 'rgba(6, 255, 165, 0.08)',
  },
  packageCardPopular: {
    borderColor: 'rgba(6, 255, 165, 0.5)',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    backgroundColor: '#06FFA5',
    paddingVertical: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 16,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageQuantity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 190, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFBE0B',
  },
  packagePricing: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  packagePriceUnit: {
    fontSize: 12,
    color: '#9A9A9A',
    marginTop: 2,
  },
  packageDetails: {
    gap: 8,
    marginBottom: 12,
  },
  packageDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageDetailText: {
    fontSize: 12,
    color: '#CCCCCC',
    flex: 1,
  },
  selectIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  specsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  specLabel: {
    fontSize: 14,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
});

