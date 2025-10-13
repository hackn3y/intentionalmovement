import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { likePost, unlikePost } from '../store/slices/postsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
import { useTheme } from '../context/ThemeContext';
import { formatters } from '../utils/formatters';
import UserAvatar from './UserAvatar';

const { width } = Dimensions.get('window');

/**
 * Post card component for social feed
 * @param {Object} props - Component props
 * @param {Object} props.post - Post data
 * @param {Function} props.onPress - Post press handler
 * @param {Function} props.onUserPress - User press handler
 * @param {Function} props.onCommentPress - Comment button press handler
 */
const PostCard = ({ post, onPress, onUserPress, onCommentPress }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [imageHeight, setImageHeight] = useState(300);
  const styles = getStyles(colors);

  /**
   * Handle like/unlike toggle
   */
  const handleLikeToggle = async () => {
    try {
      const postId = post._id || post.id;
      if (!postId) {
        console.error('Post ID is missing:', post);
        return;
      }

      if (post.isLiked) {
        await dispatch(unlikePost(postId)).unwrap();
      } else {
        await dispatch(likePost(postId)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  /**
   * Handle share button
   */
  const handleShare = async () => {
    try {
      const postId = post._id || post.id;
      const userName = post.user?.displayName || post.user?.username || 'User';
      const content = post.content || 'Check out this post!';

      await Share.share({
        message: `${userName}: ${content}\n\nShared from Intentional Movement`,
        title: 'Share Post',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  /**
   * Calculate image aspect ratio
   */
  const handleImageLoad = (event) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
    const ratio = imgHeight / imgWidth;
    setImageHeight(width * ratio);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => onUserPress && onUserPress(post.user)}
      >
        <UserAvatar
          uri={post.user?.profileImage || post.user?.profilePicture}
          firstName={post.user?.displayName?.split(' ')[0] || post.user?.firstName}
          lastName={post.user?.displayName?.split(' ')[1] || post.user?.lastName}
          size={40}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>
            {post.user?.displayName || `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim() || post.user?.username || 'User'}
          </Text>
          <Text style={styles.timestamp}>
            {formatters.formatRelativeTime(post.createdAt)}
          </Text>
        </View>

        {/* Menu button */}
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>•••</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Content */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {post.content && <Text style={styles.content}>{post.content}</Text>}

        {/* Media */}
        {post.mediaUrl && post.mediaType === 'image' && (
          <Image
            source={{ uri: post.mediaUrl }}
            style={[styles.media, { height: imageHeight }]}
            resizeMode="cover"
            onLoad={handleImageLoad}
          />
        )}

        {post.mediaUrl && post.mediaType === 'video' && (
          <View style={[styles.media, styles.videoPlaceholder]}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikeToggle}
          >
            <Text style={[styles.actionIcon, post.isLiked && styles.liked]}>
              {post.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionText}>
              {formatters.formatCompactNumber(post.likeCount || post.likesCount || 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onCommentPress}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>
              {formatters.formatCompactNumber(post.commentCount || post.commentsCount || 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>
              {formatters.formatCompactNumber(post.shareCount || 0)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.dark,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  menuButton: {
    padding: SIZES.xs,
  },
  menuIcon: {
    fontSize: FONT_SIZES.lg,
    color: colors.gray[600],
    fontWeight: 'bold',
  },
  content: {
    fontSize: FONT_SIZES.md,
    color: colors.dark,
    lineHeight: 22,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
  },
  media: {
    width: '100%',
    backgroundColor: colors.gray[100],
  },
  videoPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: colors.white,
  },
  footer: {
    padding: SIZES.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.lg,
  },
  actionIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SIZES.xs,
  },
  liked: {
    color: colors.danger,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    fontWeight: '500',
  },
});

export default PostCard;
