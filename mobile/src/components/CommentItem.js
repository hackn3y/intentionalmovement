import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
import { formatters } from '../utils/formatters';
import UserAvatar from './UserAvatar';

/**
 * Comment item component
 * @param {Object} props - Component props
 * @param {Object} props.comment - Comment data
 * @param {Function} props.onUserPress - User press handler
 * @param {Function} props.onLikePress - Like press handler
 */
const CommentItem = ({ comment, onUserPress, onLikePress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onUserPress && onUserPress(comment.user)}>
        <UserAvatar
          uri={comment.user?.profilePicture}
          firstName={comment.user?.firstName}
          lastName={comment.user?.lastName}
          size={36}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.bubble}>
          <TouchableOpacity onPress={() => onUserPress && onUserPress(comment.user)}>
            <Text style={styles.userName}>
              {comment.user?.firstName} {comment.user?.lastName}
            </Text>
          </TouchableOpacity>

          <Text style={styles.text}>{comment.text}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {formatters.formatRelativeTime(comment.createdAt)}
          </Text>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onLikePress && onLikePress(comment)}
          >
            <Text style={styles.likeIcon}>{comment.isLiked ? '❤️' : '🤍'}</Text>
            {comment.likesCount > 0 && (
              <Text style={styles.likeCount}>{comment.likesCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  content: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  bubble: {
    backgroundColor: COLORS.gray[50],
    padding: SIZES.md,
    borderRadius: SIZES.sm,
  },
  userName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
    paddingHorizontal: SIZES.md,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.lg,
  },
  likeIcon: {
    fontSize: FONT_SIZES.sm,
  },
  likeCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    marginLeft: SIZES.xs,
  },
});

export default CommentItem;
