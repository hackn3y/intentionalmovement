import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import {
  fetchPostById,
  addComment,
  likePost,
  unlikePost,
} from '../../store/slices/postsSlice';
import { commentSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { formatters } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import UserAvatar from '../../components/UserAvatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useEnterToSubmit, useEscapeToClose } from '../../hooks/useKeyboardShortcuts';

/**
 * Post detail screen with comments
 */
const PostDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors, isDarkMode } = useTheme();
  const { postId, focusComment } = route.params;
  const { currentPost, loading } = useSelector((state) => state.posts);
  const [refreshing, setRefreshing] = useState(false);
  const commentInputRef = useRef(null);
  const styles = getStyles(colors, isDarkMode);

  useEffect(() => {
    loadPost();

    if (focusComment && commentInputRef.current) {
      setTimeout(() => commentInputRef.current?.focus(), 500);
    }
  }, [postId]);

  const loadPost = useCallback(() => {
    dispatch(fetchPostById(postId));
  }, [dispatch, postId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPost();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadPost]);

  const handleLikeToggle = async () => {
    try {
      if (currentPost?.isLiked) {
        await dispatch(unlikePost(postId)).unwrap();
      } else {
        await dispatch(likePost(postId)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (values, { resetForm }) => {
    try {
      await dispatch(addComment({ postId, ...values })).unwrap();
      resetForm();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUserPress = (user) => {
    const userId = user?.id || user?._id;
    if (!userId) {
      console.error('User ID is missing:', user);
      return;
    }
    navigation.navigate('Profile', { userId, username: user.username });
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity onPress={() => handleUserPress(item.user)}>
        <UserAvatar
          uri={item.user?.profileImage || item.user?.profilePicture}
          firstName={item.user?.displayName?.split(' ')[0] || item.user?.firstName}
          lastName={item.user?.displayName?.split(' ')[1] || item.user?.lastName}
          size={36}
        />
      </TouchableOpacity>

      <View style={styles.commentContent}>
        <TouchableOpacity onPress={() => handleUserPress(item.user)}>
          <Text style={styles.commentUserName}>
            {item.user?.displayName || `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || item.user?.username || 'User'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.commentText}>{item.content || item.text}</Text>
        <Text style={styles.commentTime}>
          {formatters.formatRelativeTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  if (loading && !currentPost) {
    return <LoadingSpinner text="Loading post..." />;
  }

  if (!currentPost) {
    return (
      <EmptyState
        icon="📝"
        title="Post Not Found"
        message="This post may have been deleted"
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => handleUserPress(currentPost.user)}
          >
            <UserAvatar
              uri={currentPost.user?.profileImage || currentPost.user?.profilePicture}
              firstName={currentPost.user?.displayName?.split(' ')[0] || currentPost.user?.firstName}
              lastName={currentPost.user?.displayName?.split(' ')[1] || currentPost.user?.lastName}
              size={50}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {currentPost.user?.displayName || `${currentPost.user?.firstName || ''} ${currentPost.user?.lastName || ''}`.trim() || currentPost.user?.username || 'User'}
              </Text>
              <Text style={styles.timestamp}>
                {formatters.formatRelativeTime(currentPost.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.content}>{currentPost.content}</Text>

          {currentPost.mediaUrl && currentPost.mediaType === 'image' && (
            <View style={styles.mediaContainer}>
              <Text style={styles.mediaPlaceholder}>📷 Image</Text>
            </View>
          )}

          {currentPost.mediaUrl && currentPost.mediaType === 'video' && (
            <View style={styles.mediaContainer}>
              <Text style={styles.mediaPlaceholder}>🎥 Video</Text>
            </View>
          )}
        </View>

        {/* Post Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLikeToggle}>
            <Text style={[styles.actionIcon, currentPost.isLiked && styles.liked]}>
              {currentPost.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionText}>
              {formatters.formatCompactNumber(currentPost.likeCount || currentPost.likesCount || 0)} Likes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>
              {formatters.formatCompactNumber(currentPost.commentCount || currentPost.commentsCount || 0)} Comments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {currentPost.comments && currentPost.comments.length > 0 ? (
            <FlatList
              data={currentPost.comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id || item.id || String(Math.random())}
              scrollEnabled={false}
            />
          ) : (
            <EmptyState
              icon="💬"
              title="No Comments Yet"
              message="Be the first to comment"
            />
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <Formik
        initialValues={{ text: '' }}
        validationSchema={commentSchema}
        onSubmit={handleAddComment}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
          // Enable Enter key to submit comment and Escape to go back
          const isDisabled = !values.text.trim();
          useEnterToSubmit(handleSubmit, isDisabled);
          useEscapeToClose(() => navigation.goBack());

          return (
          <View style={styles.commentInputContainer}>
            <Input
              ref={commentInputRef}
              placeholder="Add a comment..."
              value={values.text}
              onChangeText={handleChange('text')}
              onBlur={handleBlur('text')}
              error={touched.text && errors.text}
              style={styles.commentInput}
            />
            <Button
              title="Post"
              onPress={handleSubmit}
              disabled={!values.text.trim()}
              size="small"
              style={styles.postButton}
            />
          </View>
        );
      }}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  postHeader: {
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: isDarkMode ? colors.gray[400] : colors.gray[600],
    marginTop: 2,
  },
  postContent: {
    padding: SIZES.md,
  },
  content: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: SIZES.md,
  },
  mediaContainer: {
    height: 200,
    backgroundColor: isDarkMode ? colors.gray[200] : colors.gray[100],
    borderRadius: SIZES.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholder: {
    fontSize: FONT_SIZES.xl,
    color: isDarkMode ? colors.gray[500] : colors.gray[500],
  },
  actions: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
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
    color: COLORS.danger,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: isDarkMode ? colors.gray[400] : colors.gray[600],
    fontWeight: '500',
  },
  commentsSection: {
    padding: SIZES.md,
  },
  commentsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.md,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
  },
  commentContent: {
    flex: 1,
    marginLeft: SIZES.sm,
    backgroundColor: isDarkMode ? colors.gray[200] : colors.gray[50],
    padding: SIZES.md,
    borderRadius: SIZES.sm,
  },
  commentUserName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: SIZES.xs,
  },
  commentText: {
    fontSize: FONT_SIZES.sm,
    color: isDarkMode ? colors.gray[600] : colors.gray[700],
    lineHeight: 20,
  },
  commentTime: {
    fontSize: FONT_SIZES.xs,
    color: isDarkMode ? colors.gray[500] : colors.gray[500],
    marginTop: SIZES.xs,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'flex-start',
    gap: SIZES.sm,
  },
  commentInput: {
    flex: 1,
    marginBottom: 0,
  },
  postButton: {
    marginTop: 0,
    minWidth: 70,
  },
});

export default PostDetailScreen;
