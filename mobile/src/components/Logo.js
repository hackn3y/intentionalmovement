import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

/**
 * IMC Logo Component
 * @param {Object} props
 * @param {number} props.size - Size of the logo (defaults to 80)
 * @param {boolean} props.showText - Whether to show company name below logo
 * @param {Object} props.style - Custom style
 */
const Logo = ({ size = 80, showText = false, style }) => {
  const logoSize = size;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{
          width: logoSize * 3,
          height: logoSize,
        }}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.companyName}>Intentional Movement Corp</Text>
          <Text style={styles.tagline}>Transform Your Body, Elevate Your Mind</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoCircle: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  textContainer: {
    marginTop: SIZES.md,
    alignItems: 'center',
  },
  companyName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'center',
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
});

export default Logo;
