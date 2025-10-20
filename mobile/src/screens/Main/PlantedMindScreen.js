import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPlantedMindPosts,
  clearPlantedMindPosts,
  setPlantedMindRefreshing,
} from '../../store/slices/plantedMindSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

/**
 * Planted Mind Moving Body screen - Admin curated feed
 */
const PlantedMindScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { posts, loading, refreshing, page, hasMore } = useSelector(
    (state) => state.plantedMind
  );
  const styles = getStyles(colors);

  /**
   * Load initial posts
   */
  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Reload posts when screen gains focus
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(clearPlantedMindPosts());
      dispatch(fetchPlantedMindPosts({ page: 1, limit: 10 }));
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * Load posts
   */
  const loadPosts = useCallback(() => {
    dispatch(fetchPlantedMindPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    dispatch(setPlantedMindRefreshing(true));
    dispatch(clearPlantedMindPosts());
    dispatch(fetchPlantedMindPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  /**
   * Handle load more
   */
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchPlantedMindPosts({ page: page + 1, limit: 10 }));
    }
  }, [dispatch, loading, hasMore, page]);

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
      return <LoadingSpinner text="Loading curated content..." />;
    }

    return (
      <EmptyState
        icon="🌱"
        title="No Content Yet"
        message="Our team is curating inspiring content for you. Check back soon!"
      />
    );
  };

  /**
   * Render header
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerBanner}>
        <Text style={styles.headerIcon}>🌱</Text>
        <Text style={styles.headerTitle}>Curated Content</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Handpicked posts to inspire your intentional living journey
      </Text>
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
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: SIZES.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: SIZES.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  footer: {
    paddingVertical: SIZES.lg,
  },
});

export default PlantedMindScreen;
