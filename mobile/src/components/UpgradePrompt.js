import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#ec4899',
  light: '#fdf2f8',
  white: '#ffffff',
  dark: '#1f2937',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  success: '#10b981',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const UpgradePrompt = ({
  visible,
  onClose,
  title = 'Upgrade Required',
  message,
  requiredTier = 'basic',
  feature,
}) => {
  const navigation = useNavigation();

  const tierInfo = {
    basic: {
      name: 'Basic',
      price: '$9.99/month',
      color: COLORS.success,
      icon: 'star',
      features: [
        'Create unlimited posts',
        'Purchase up to 3 programs',
        'Ad-free experience',
        'Basic achievements',
      ],
    },
    premium: {
      name: 'Premium',
      price: '$29.99/month',
      color: COLORS.primary,
      icon: 'trophy',
      features: [
        'Everything in Basic',
        'Unlimited program purchases',
        'Direct messaging',
        'All achievements',
        'Exclusive content',
        'Priority support',
      ],
    },
  };

  const tier = tierInfo[requiredTier] || tierInfo.basic;

  const handleUpgrade = () => {
    onClose();
    // Navigate to pricing screen - need to go through ProfileTab stack
    navigation.navigate('ProfileTab', {
      screen: 'Pricing',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: tier.color }]}>
              <View style={styles.iconContainer}>
                <Ionicons name={tier.icon} size={32} color={COLORS.white} />
              </View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>
                Upgrade to {tier.name}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {message ? (
                <Text style={styles.message}>{message}</Text>
              ) : (
                <Text style={styles.message}>
                  {feature} requires a {tier.name} membership.
                </Text>
              )}

              <View style={styles.priceContainer}>
                <Text style={styles.price}>{tier.price}</Text>
                <Text style={styles.priceNote}>
                  14-day free trial • Cancel anytime
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What&apos;s included:</Text>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={tier.color}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: tier.color }]}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade to {tier.name}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={COLORS.white}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  modal: {
    width: width - SIZES.xxl * 2,
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  content: {
    padding: SIZES.xl,
  },
  message: {
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: SIZES.lg,
    lineHeight: 22,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  priceNote: {
    fontSize: 14,
    color: COLORS.gray,
  },
  featuresContainer: {
    marginBottom: SIZES.md,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    gap: SIZES.md,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.dark,
  },
  actions: {
    padding: SIZES.xl,
    paddingTop: 0,
  },
  upgradeButton: {
    flexDirection: 'row',
    paddingVertical: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UpgradePrompt;
