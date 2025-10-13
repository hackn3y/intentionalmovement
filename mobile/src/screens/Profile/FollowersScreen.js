import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowers, followUser, unfollowUser } from '../../store/slices/userSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../../components/UserAvatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

/**
 * Followers list screen
 */
const FollowersScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { userId } = route.params;
  const { followers, loading, followLoading } = useSelector((state) => state.user);
  const currentUser = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const styles = getStyles(colors);

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = useCallback(() => {
    dispatch(fetchFollowers(userId));
  }, [dispatch, userId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFollowers();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadFollowers]);

  const handleFollowToggle = async (followerId) => {
    try {
      const follower = followers.find(f => f._id === followerId);
      if (follower?.isFollowing) {
        await dispatch(unfollowUser(followerId)).unwrap();
      } else {
        await dispatch(followUser(followerId)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUserPress = (user) => {
    navigation.push('Profile', { userId: user._id, username: user.username });
  };

  const renderFollower = ({ item }) => {
    const isCurrentUser = item._id === currentUser?._id;

    return (
      <TouchableOpacity
        style={styles.followerItem}
        onPress={() => handleUserPress(item)}
      >
        <UserAvatar
          uri={item.profilePicture}
          firstName={item.firstName}
          lastName={item.lastName}
          size={50}
        />

        <View style={styles.followerInfo}>
          <Text style={styles.followerName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.followerUsername}>@{item.username}</Text>
        </View>

        {!isCurrentUser && (
          <Button
            title={item.isFollowing ? 'Following' : 'Follow'}
            variant={item.isFollowing ? 'outline' : 'primary'}
            size="small"
            onPress={() => handleFollowToggle(item._id)}
            loading={followLoading[item._id]}
            disabled={followLoading[item._id]}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading && followers.length === 0) {
    return <LoadingSpinner text="Loading followers..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={followers}
        renderItem={renderFollower}
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="No Followers"
            message="No followers to show yet"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={followers.length === 0 && styles.emptyContainer}
      />
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  followerInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  followerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  followerUsername: {
    fontSize: FONT_SIZES.sm,
    color: colors.isDark ? colors.gray[400] : colors.gray[600],
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default FollowersScreen;
