import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#ec4899',
  white: '#ffffff',
  dark: '#1f2937',
};

const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
};

const UpgradeBanner = ({ style, compact = false }) => {
  const { user } = useSelector((state) => state.auth);
  const navigation = useNavigation();

  // Only show for free tier users
  if (!user || user.subscriptionTier !== 'free') {
    return null;
  }

  const handleUpgrade = () => {
    navigation.navigate('ProfileTab', {
      screen: 'Pricing',
    });
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactBanner, style]}
        onPress={handleUpgrade}
      >
        <Ionicons name="star-outline" size={16} color={COLORS.white} />
        <Text style={styles.compactText}>Upgrade to Premium</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.banner, style]}
      onPress={handleUpgrade}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="star" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Unlock Premium Features</Text>
        <Text style={styles.subtitle}>
          Create posts, message members, and more
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 12,
    padding: SIZES.lg,
    marginVertical: SIZES.md,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.dark,
    opacity: 0.7,
  },
  compactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default UpgradeBanner;
