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
import { fetchFollowing, followUser, unfollowUser } from '../../store/slices/userSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../../components/UserAvatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

/**
 * Following list screen
 */
const FollowingScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { userId } = route.params;
  const { following, loading, followLoading } = useSelector((state) => state.user);
  const currentUser = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const styles = getStyles(colors);

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = useCallback(() => {
    dispatch(fetchFollowing(userId));
  }, [dispatch, userId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFollowing();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadFollowing]);

  const handleFollowToggle = async (followingId) => {
    try {
      const followedUser = following.find(f => f._id === followingId);
      if (followedUser?.isFollowing) {
        await dispatch(unfollowUser(followingId)).unwrap();
      } else {
        await dispatch(followUser(followingId)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUserPress = (user) => {
    navigation.push('Profile', { userId: user._id, username: user.username });
  };

  const renderFollowing = ({ item }) => {
    const isCurrentUser = item._id === currentUser?._id;

    return (
      <TouchableOpacity
        style={styles.followingItem}
        onPress={() => handleUserPress(item)}
      >
        <UserAvatar
          uri={item.profilePicture}
          firstName={item.firstName}
          lastName={item.lastName}
          size={50}
        />

        <View style={styles.followingInfo}>
          <Text style={styles.followingName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.followingUsername}>@{item.username}</Text>
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

  if (loading && following.length === 0) {
    return <LoadingSpinner text="Loading following..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={following}
        renderItem={renderFollowing}
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="Not Following Anyone"
            message="No following to show yet"
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
        contentContainerStyle={following.length === 0 && styles.emptyContainer}
      />
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  followingInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  followingName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  followingUsername: {
    fontSize: FONT_SIZES.sm,
    color: colors.isDark ? colors.gray[400] : colors.gray[600],
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default FollowingScreen;
