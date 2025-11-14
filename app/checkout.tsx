import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../src/services/auth';
import { paymentService } from '../src/services/payment';
import { firestoreService } from '../src/services/firestore';

export default function CheckoutScreen() {
  const router = useRouter();
  const { dropId } = useLocalSearchParams<{ dropId: string }>();
  
  const [drop, setDrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingZip, setBillingZip] = useState('');

  // Shipping states
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('United States');

  useEffect(() => {
    loadDropAndUserData();
  }, []);

  const loadDropAndUserData = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'You must be signed in to checkout');
        router.back();
        return;
      }

      // Load drop data (mock for now)
      const mockDrop = {
        id: dropId,
        title: 'Midnight Dreams',
        artistName: 'Luna Rey',
        price: 24.99,
        coverImage: 'https://picsum.photos/seed/album1/400/400',
      };

      setDrop(mockDrop);

      // Pre-fill with user data if available
      if (user.displayName) {
        setCardholderName(user.displayName);
        setShippingName(user.displayName);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      Alert.alert('Error', 'Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateForm = (): boolean => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }

    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return false;
    }

    if (!cardholderName.trim()) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return false;
    }

    if (!shippingName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a shipping name');
      return false;
    }

    if (!shippingAddress.trim()) {
      Alert.alert('Invalid Address', 'Please enter a shipping address');
      return false;
    }

    if (!shippingCity.trim()) {
      Alert.alert('Invalid City', 'Please enter a shipping city');
      return false;
    }

    if (!shippingState.trim()) {
      Alert.alert('Invalid State', 'Please enter a shipping state');
      return false;
    }

    if (!shippingZip.trim()) {
      Alert.alert('Invalid ZIP', 'Please enter a shipping ZIP code');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Create pre-order with payment and shipping info
      const preOrderId = await paymentService.createPreOrder({
        userId: user.uid,
        dropId: drop.id,
        albumId: drop.albumId || 'album-1',
        artistId: drop.artistId || 'artist-1',
        amount: drop.price,
        paymentMethod: {
          last4: cardNumber.replace(/\s/g, '').slice(-4),
          brand: 'visa', // In production, detect from card number
          expiryMonth: expiryDate.split('/')[0],
          expiryYear: '20' + expiryDate.split('/')[1],
        },
        shippingAddress: {
          name: shippingName,
          address: shippingAddress,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip,
          country: shippingCountry,
        },
      });

      // Navigate to confirmation
      router.replace({
        pathname: '/order-confirmation',
        params: {
          preOrderId,
          dropTitle: drop.title,
          artistName: drop.artistName,
          amount: drop.price.toFixed(2),
        },
      });
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Payment Failed',
        'There was an error processing your payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06FFA5" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!drop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B5C" />
          <Text style={styles.errorText}>Drop not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const platformFee = drop.price * 0.3; // 30% platform fee
  const artistEarnings = drop.price * 0.7; // 70% to artist
  const total = drop.price;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{drop.title}</Text>
                <Text style={styles.summaryValue}>${drop.price.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelSmall}>by {drop.artistName}</Text>
                <Text style={styles.summaryLabelSmall}>Pre-Order</Text>
              </View>
            </View>

            <View style={styles.escrowNotice}>
              <Ionicons name="shield-checkmark" size={20} color="#3A86FF" />
              <Text style={styles.escrowNoticeText}>
                Funds held in escrow until manufacturing begins
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CARD NUMBER</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card" size={20} color="#9A9A9A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#9A9A9A"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                <Text style={styles.inputLabel}>EXPIRY DATE</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="MM/YY"
                  placeholderTextColor="#9A9A9A"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="123"
                  placeholderTextColor="#9A9A9A"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="John Doe"
                placeholderTextColor="#9A9A9A"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BILLING ZIP CODE</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="12345"
                placeholderTextColor="#9A9A9A"
                value={billingZip}
                onChangeText={setBillingZip}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="John Doe"
                placeholderTextColor="#9A9A9A"
                value={shippingName}
                onChangeText={setShippingName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>STREET ADDRESS</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="123 Main St"
                placeholderTextColor="#9A9A9A"
                value={shippingAddress}
                onChangeText={setShippingAddress}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>CITY</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="New York"
                  placeholderTextColor="#9A9A9A"
                  value={shippingCity}
                  onChangeText={setShippingCity}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>STATE</Text>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="NY"
                  placeholderTextColor="#9A9A9A"
                  value={shippingState}
                  onChangeText={(text) => setShippingState(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ZIP CODE</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="10001"
                placeholderTextColor="#9A9A9A"
                value={shippingZip}
                onChangeText={setShippingZip}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>COUNTRY</Text>
              <TextInput
                style={styles.inputSmall}
                value={shippingCountry}
                onChangeText={setShippingCountry}
                editable={false}
              />
            </View>
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Drop Price</Text>
                <Text style={styles.breakdownValue}>${drop.price.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelSmall}>
                  Artist Earnings (70%)
                </Text>
                <Text style={styles.breakdownValueSmall}>
                  ${artistEarnings.toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelSmall}>
                  Platform Fee (30%)
                </Text>
                <Text style={styles.breakdownValueSmall}>
                  ${platformFee.toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelTotal}>Total</Text>
                <Text style={styles.breakdownValueTotal}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Manufacturing Notice */}
          <View style={styles.manufacturingNotice}>
            <Ionicons name="information-circle" size={20} color="#3A86FF" />
            <View style={styles.manufacturingTextContainer}>
              <Text style={styles.manufacturingTitle}>About Manufacturing</Text>
              <Text style={styles.manufacturingText}>
                Stream Discs are produced and shipped in scheduled manufacturing batches. 
                You'll receive email updates when your batch enters production and when it ships.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <View style={styles.ctaFooter}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaLabel}>Total</Text>
            <Text style={styles.ctaPrice}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.ctaButton, processing && styles.ctaButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#000000" />
                <Text style={styles.ctaButtonText}>Place Pre-Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B5C',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  summaryCard: {
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.2)',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  summaryLabelSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.2)',
  },
  escrowNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#3A86FF',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#06FFA5',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
  },
  inputSmall: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breakdownLabelSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  breakdownValueSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  breakdownLabelTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breakdownValueTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
  },
  manufacturingNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 134, 255, 0.2)',
  },
  manufacturingTextContainer: {
    flex: 1,
  },
  manufacturingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A86FF',
    marginBottom: 6,
  },
  manufacturingText: {
    fontSize: 13,
    color: '#3A86FF',
    lineHeight: 18,
  },
  ctaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  ctaLeft: {
    flex: 1,
  },
  ctaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9A9A',
    marginBottom: 2,
  },
  ctaPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
    letterSpacing: -0.5,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#06FFA5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

