import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

/**
 * Empty state component
 * @param {Object} props - Component props
 * @param {string} props.icon - Icon or emoji
 * @param {string} props.title - Main title
 * @param {string} props.message - Description message
 * @param {string} props.actionText - Action button text
 * @param {Function} props.onAction - Action button handler
 */
const EmptyState = ({ icon, title, message, actionText, onAction }) => {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}

      {title && <Text style={styles.title}>{title}</Text>}

      {message && <Text style={styles.message}>{message}</Text>}

      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    borderRadius: SIZES.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EmptyState;
