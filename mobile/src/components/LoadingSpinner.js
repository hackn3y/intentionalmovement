import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

/**
 * Loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (small, large)
 * @param {string} props.color - Spinner color
 * @param {boolean} props.overlay - Show as fullscreen overlay
 * @param {string} props.text - Loading text
 */
const LoadingSpinner = ({
  size = 'large',
  color = COLORS.primary,
  overlay = false,
  text,
}) => {
  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={styles.overlayText}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    backgroundColor: COLORS.white,
    padding: SIZES.xxl,
    borderRadius: SIZES.md,
    alignItems: 'center',
    minWidth: 150,
  },
  text: {
    marginTop: SIZES.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  overlayText: {
    marginTop: SIZES.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
