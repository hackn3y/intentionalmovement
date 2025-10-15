import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { SIZES, FONT_SIZES } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

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
  color,
  overlay = false,
  text,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color || colors.primary;
  const styles = getStyles(colors);
  // Add visible feedback for web platform
  const spinnerContent = (
    <>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && <Text style={styles.text}>{text}</Text>}
      {Platform.OS === 'web' && !text && <Text style={styles.text}>Loading...</Text>}
    </>
  );

  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={spinnerColor} />
          {text && <Text style={styles.overlayText}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      {spinnerContent}
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: colors.background,
  },
  webContainer: {
    backgroundColor: colors.background,
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
    backgroundColor: colors.card,
    padding: SIZES.xxl,
    borderRadius: SIZES.md,
    alignItems: 'center',
    minWidth: 150,
  },
  text: {
    marginTop: SIZES.md,
    fontSize: FONT_SIZES.md,
    color: colors.text,
    textAlign: 'center',
  },
  overlayText: {
    marginTop: SIZES.md,
    fontSize: FONT_SIZES.md,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
