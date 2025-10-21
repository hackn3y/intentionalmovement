import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUserProfile,
  followUser,
  unfollowUser,
  clearCurrentProfile,
} from '../../store/slices/userSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { formatters } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../../components/UserAvatar';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

/**
 * User profile screen with tabs for posts and achievements
 */
const ProfileScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const currentUser = useSelector((state) => state.auth.user);

  // Determine userId: use params if provided and valid, otherwise use current user's id
  const paramUserId = route.params?.userId;
  const userId = (paramUserId !== undefined && paramUserId !== null)
    ? paramUserId
    : currentUser?.id;

  const { currentProfile, loading, followLoading } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);

  const isOwnProfile = !paramUserId || currentUser?.id === userId || currentUser?._id === userId;
  const styles = getStyles(colors);

  /**
   * Load user profile on mount and when userId changes
   */
  useEffect(() => {
    loadProfile();
    return () => {
      dispatch(clearCurrentProfile());
    };
  }, [userId, route.params?._forceRefresh]);

  /**
   * Load profile data
   */
  const loadProfile = useCallback(() => {
    // Only fetch if we have a valid userId
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadProfile]);

  /**
   * Handle follow/unfollow toggle
   */
  const handleFollowToggle = async () => {
    try {
      if (currentProfile?.isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
      } else {
        await dispatch(followUser(userId)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  /**
   * Navigate to edit profile
   */
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  /**
   * Navigate to followers screen
   */
  const handleViewFollowers = () => {
    navigation.navigate('Followers', { userId });
  };

  /**
   * Navigate to following screen
   */
  const handleViewFollowing = () => {
    navigation.navigate('Following', { userId });
  };

  /**
   * Navigate to settings
   */
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  /**
   * Render header with profile info
   */
  const renderHeader = () => {
    if (!currentProfile) return null;

    return (
      <View style={styles.headerContainer}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <UserAvatar
            uri={currentProfile.profileImage || currentProfile.profilePicture}
            firstName={currentProfile.displayName?.split(' ')[0] || currentProfile.firstName}
            lastName={currentProfile.displayName?.split(' ')[1] || currentProfile.lastName}
            size={100}
          />

          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {currentProfile.displayName || `${currentProfile.firstName || ''} ${currentProfile.lastName || ''}`.trim() || currentProfile.username || 'User'}
            </Text>
            <Text style={styles.username}>@{currentProfile.username}</Text>
          </View>

          {currentProfile.bio ? (
            <Text style={styles.bio}>{currentProfile.bio}</Text>
          ) : null}

          {currentProfile.location ? (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{currentProfile.location}</Text>
            </View>
          ) : null}

          {currentProfile.website ? (
            <TouchableOpacity style={styles.websiteContainer}>
              <Text style={styles.websiteIcon}>🔗</Text>
              <Text style={styles.website}>{currentProfile.website}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.stat}>
            <Text style={styles.statValue}>
              {formatters.formatCompactNumber(currentProfile.stats?.posts || 0)}
            </Text>
            <Text style={styles.statLabel}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.stat} onPress={handleViewFollowers}>
            <Text style={styles.statValue}>
              {formatters.formatCompactNumber(currentProfile.stats?.followers || 0)}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.stat} onPress={handleViewFollowing}>
            <Text style={styles.statValue}>
              {formatters.formatCompactNumber(currentProfile.stats?.following || 0)}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isOwnProfile ? (
            <>
              <Button
                title="Edit Profile"
                variant="outline"
                onPress={handleEditProfile}
                style={styles.actionButton}
              />
              <Button
                title="Settings"
                variant="outline"
                onPress={handleSettings}
                style={styles.actionButton}
              />
            </>
          ) : (
            <>
              <Button
                title={currentProfile.isFollowing ? 'Following' : 'Follow'}
                variant={currentProfile.isFollowing ? 'outline' : 'primary'}
                onPress={handleFollowToggle}
                loading={followLoading[userId]}
                disabled={followLoading[userId]}
                style={styles.followButton}
              />
              <Button
                title="Message"
                variant="outline"
                onPress={() => navigation.navigate('Chat', { userId })}
                style={styles.messageButton}
              />
            </>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Navigate to achievements screen
   */
  const handleViewAchievements = () => {
    navigation.navigate('Achievements', { userId });
  };

  /**
   * Render tab content
   */
  const renderTabContent = () => {
    if (activeTab === 'posts') {
      return (
        <FlatList
          data={currentProfile?.posts || []}
          renderItem={({ item }) => {
            const postId = item.id || item._id;
            return (
              <PostCard
                post={item}
                onPress={() => navigation.navigate('PostDetail', { postId })}
                onUserPress={() => {}}
                onCommentPress={() => navigation.navigate('PostDetail', { postId, focusComment: true })}
              />
            );
          }}
          keyExtractor={(item) => String(item.id || item._id)}
          ListEmptyComponent={
            <EmptyState
              icon="📝"
              title="No Posts Yet"
              message={isOwnProfile ? 'Share your first post!' : 'No posts to show'}
            />
          }
          contentContainerStyle={currentProfile?.posts?.length === 0 && styles.emptyContainer}
        />
      );
    }

    if (activeTab === 'achievements') {
      return (
        <View style={styles.achievementsPreview}>
          <EmptyState
            icon="🏆"
            title="Achievements"
            message="View your achievement badges and progress"
          />
          <Button
            title="View All Achievements"
            onPress={handleViewAchievements}
            style={styles.viewAchievementsButton}
          />
        </View>
      );
    }

    return null;
  };

  if (loading && !currentProfile) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderHeader()}
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  username: {
    fontSize: FONT_SIZES.md,
    color: colors.isDark ? colors.gray[400] : colors.gray[600],
    marginTop: SIZES.xs,
  },
  bio: {
    fontSize: FONT_SIZES.md,
    color: colors.isDark ? colors.gray[300] : colors.gray[700],
    textAlign: 'center',
    marginTop: SIZES.md,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  locationIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SIZES.xs,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: colors.isDark ? colors.gray[400] : colors.gray[600],
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  websiteIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SIZES.xs,
  },
  website: {
    fontSize: FONT_SIZES.sm,
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: colors.isDark ? colors.gray[400] : colors.gray[600],
    marginTop: SIZES.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  actionButton: {
    flex: 1,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    flex: 1,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: FONT_SIZES.xl,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.isDark ? colors.gray[400] : colors.gray[600],
  },
  tabTextActive: {
    color: colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 300,
  },
  achievementsPreview: {
    flex: 1,
    padding: SIZES.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAchievementsButton: {
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.xl,
  },
});

export default ProfileScreen;
