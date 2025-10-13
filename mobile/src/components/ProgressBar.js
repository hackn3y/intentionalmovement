import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

/**
 * Progress bar component
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.color - Bar color
 * @param {boolean} props.showLabel - Show percentage label
 * @param {string} props.height - Bar height (small, medium, large)
 */
const ProgressBar = ({
  progress = 0,
  color = COLORS.primary,
  showLabel = true,
  height = 'medium',
}) => {
  const heights = {
    small: 4,
    medium: 8,
    large: 12,
  };

  const barHeight = heights[height] || heights.medium;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      <View style={[styles.barContainer, { height: barHeight }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
              height: barHeight,
            },
          ]}
        />
      </View>

      {showLabel && (
        <Text style={styles.label}>{clampedProgress}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  barContainer: {
    flex: 1,
    backgroundColor: COLORS.gray[200],
    borderRadius: 100,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 100,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
    minWidth: 45,
    textAlign: 'right',
  },
});

export default ProgressBar;
