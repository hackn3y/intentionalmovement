import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { purchaseProgram } from '../../store/slices/programsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { formatters } from '../../utils/formatters';
import Button from '../../components/Button';

const CheckoutScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { programId, price } = route.params;
  const { purchaseLoading } = useSelector((state) => state.programs);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const paymentMethods = [
    { id: 'card', icon: '💳', name: 'Credit/Debit Card', description: 'Visa, Mastercard, Amex' },
    { id: 'apple', icon: '🍎', name: 'Apple Pay', description: 'Pay with Apple Pay' },
    { id: 'google', icon: 'G', name: 'Google Pay', description: 'Pay with Google Pay' },
  ];

  const handlePurchase = async () => {
    if (!selectedPayment) {
      Alert.alert('Select Payment', 'Please select a payment method');
      return;
    }

    try {
      // TODO: Implement Stripe payment integration
      await dispatch(purchaseProgram({ programId, paymentMethodId: 'pm_test_123' })).unwrap();

      Alert.alert(
        'Success',
        'Program purchased successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyPrograms'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error || 'Purchase failed');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>Program</Text>
            <Text style={styles.orderValue}>Premium Fitness Program</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderLabel}>Price</Text>
            <Text style={styles.orderValue}>{formatters.formatCurrency(price)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatters.formatCurrency(price)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentMethod, selectedPayment === method.id && styles.paymentMethodSelected]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>{method.icon}</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDescription}>{method.description}</Text>
              </View>
              <View style={[styles.radio, selectedPayment === method.id && styles.radioSelected]}>
                {selectedPayment === method.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By completing this purchase, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Refund Policy</Text>
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>{formatters.formatCurrency(price)}</Text>
        </View>
        <Button
          title="Complete Purchase"
          onPress={handlePurchase}
          loading={purchaseLoading}
          disabled={!selectedPayment || purchaseLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1 },
  section: { padding: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.dark, marginBottom: SIZES.md },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  orderLabel: { fontSize: FONT_SIZES.md, color: COLORS.gray[600] },
  orderValue: { fontSize: FONT_SIZES.md, color: COLORS.dark, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.gray[200], marginVertical: SIZES.md },
  totalLabel: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.dark },
  totalValue: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: SIZES.sm, marginBottom: SIZES.sm },
  paymentMethodSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  paymentIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  paymentIconText: { fontSize: FONT_SIZES.xl },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.dark },
  paymentDescription: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600], marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.gray[300], justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  terms: { fontSize: FONT_SIZES.xs, color: COLORS.gray[600], textAlign: 'center', padding: SIZES.lg },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  footer: { padding: SIZES.lg, borderTopWidth: 1, borderTopColor: COLORS.gray[200] },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  footerLabel: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.dark },
  footerTotal: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.primary },
});

export default CheckoutScreen;
