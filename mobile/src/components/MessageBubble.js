import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
import { formatters } from '../utils/formatters';

/**
 * Chat message bubble component
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data
 * @param {boolean} props.isOwn - Whether message is from current user
 */
const MessageBubble = ({ message, isOwn }) => {
  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
          {message.text}
        </Text>

        <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
          {formatters.formatTime(message.createdAt)}
        </Text>
      </View>

      {isOwn && message.status && (
        <View style={styles.statusContainer}>
          <Text style={styles.status}>
            {message.status === 'sent' && '✓'}
            {message.status === 'delivered' && '✓✓'}
            {message.status === 'read' && '✓✓'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.sm,
    maxWidth: '75%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: SIZES.md,
    padding: SIZES.md,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: SIZES.xs,
  },
  otherBubble: {
    backgroundColor: COLORS.gray[200],
    borderBottomLeftRadius: SIZES.xs,
  },
  text: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  ownText: {
    color: COLORS.white,
  },
  otherText: {
    color: COLORS.dark,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    marginTop: SIZES.xs,
  },
  ownTimestamp: {
    color: COLORS.white + 'CC',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: COLORS.gray[600],
  },
  statusContainer: {
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  status: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
});

export default MessageBubble;
