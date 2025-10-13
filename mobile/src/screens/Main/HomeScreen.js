import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPosts,
  clearPosts,
  setRefreshing,
} from '../../store/slices/postsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

/**
 * Home screen with social feed
 */
const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { posts, loading, refreshing, page, hasMore, error } = useSelector(
    (state) => state.posts
  );
  const [filter, setFilter] = useState('all'); // 'all' or 'following'
  const styles = getStyles(colors);

  /**
   * Load initial posts
   */
  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Reload posts when filter changes
   */
  useEffect(() => {
    dispatch(clearPosts());
    dispatch(fetchPosts({ page: 1, limit: 10, filter }));
  }, [filter]);

  /**
   * Reload posts when screen gains focus
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(clearPosts());
      dispatch(fetchPosts({ page: 1, limit: 10, filter }));
    });

    return unsubscribe;
  }, [navigation, filter]);

  /**
   * Load posts
   */
  const loadPosts = useCallback(() => {
    dispatch(fetchPosts({ page: 1, limit: 10, filter }));
  }, [dispatch, filter]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    dispatch(setRefreshing(true));
    dispatch(clearPosts());
    dispatch(fetchPosts({ page: 1, limit: 10, filter }));
  }, [dispatch, filter]);

  /**
   * Handle load more
   */
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchPosts({ page: page + 1, limit: 10, filter }));
    }
  }, [dispatch, loading, hasMore, page, filter]);

  /**
   * Navigate to post detail
   */
  const handlePostPress = (post) => {
    const postId = post._id || post.id;
    if (!postId) {
      console.error('Post ID is missing:', post);
      return;
    }
    navigation.navigate('PostDetail', { postId });
  };

  /**
   * Navigate to user profile
   */
  const handleUserPress = (user) => {
    const userId = user?.id || user?._id;
    if (!userId) {
      console.error('User ID is missing:', user);
      return;
    }
    navigation.navigate('ProfileTab', {
      screen: 'Profile',
      params: { userId, username: user.username },
    });
  };

  /**
   * Navigate to post comments
   */
  const handleCommentPress = (post) => {
    const postId = post._id || post.id;
    if (!postId) {
      console.error('Post ID is missing:', post);
      return;
    }
    navigation.navigate('PostDetail', { postId, focusComment: true });
  };

  /**
   * Navigate to create post
   */
  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  /**
   * Render post item
   */
  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onUserPress={handleUserPress}
      onCommentPress={() => handleCommentPress(item)}
    />
  );

  /**
   * Render footer
   */
  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading && page === 1) {
      return <LoadingSpinner text="Loading posts..." />;
    }

    return (
      <EmptyState
        icon="📝"
        title="No Posts Yet"
        message="Follow other users or create your first post to see content here."
        actionText="Create Post"
        onAction={handleCreatePost}
      />
    );
  };

  /**
   * Render header
   */
  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'all' && styles.filterTextActive,
          ]}
        >
          Everyone
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          filter === 'following' && styles.filterButtonActive,
        ]}
        onPress={() => setFilter('following')}
      >
        <Text
          style={[
            styles.filterText,
            filter === 'following' && styles.filterTextActive,
          ]}
        >
          Following
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={posts.length === 0 && styles.emptyContainer}
        removeClippedSubviews={false}
      />

      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    gap: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.sm,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: colors.gray[600],
  },
  filterTextActive: {
    color: colors.white,
  },
  footer: {
    paddingVertical: SIZES.lg,
  },
  fab: {
    position: 'absolute',
    bottom: SIZES.xl,
    right: SIZES.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
  },
});

export default HomeScreen;
