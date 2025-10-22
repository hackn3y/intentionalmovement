import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../../config/constants';
import api from '../../services/api';

/**
 * Notifications Screen - Shows all app notifications except messages
 * Includes: likes, comments, follows, achievements, program updates, etc.
 */
const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call when backend endpoint is ready
      // const response = await api.get('/notifications');
      // setNotifications(response.data.notifications);

      // Mock data for now
      setNotifications([
        {
          id: '1',
          type: 'follow',
          user: { username: 'jane_doe', profileImage: null },
          message: 'started following you',
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'like',
          user: { username: 'john_smith', profileImage: null },
          message: 'liked your post',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'comment',
          user: { username: 'alex_wellness', profileImage: null },
          message: 'commented on your post',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          read: true,
        },
        {
          id: '4',
          type: 'achievement',
          message: 'You unlocked a new achievement: 7-Day Streak!',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    // TODO: API call to mark notification as read

    // Navigate based on notification type
    switch (notification.type) {
      case 'follow':
        navigation.navigate('ProfileTab', {
          screen: 'Profile',
          params: { username: notification.user?.username },
        });
        break;
      case 'like':
      case 'comment':
        // Navigate to post detail
        // navigation.navigate('PostDetail', { postId: notification.postId });
        break;
      case 'achievement':
        navigation.navigate('ProfileTab', { screen: 'Achievements' });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return { name: 'person-add', color: colors.primary };
      case 'like':
        return { name: 'heart', color: colors.danger };
      case 'comment':
        return { name: 'chatbubble', color: colors.info };
      case 'achievement':
        return { name: 'trophy', color: colors.warning };
      case 'program':
        return { name: 'book', color: colors.accent };
      default:
        return { name: 'notifications', color: colors.primary };
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            {item.user && (
              <Text style={styles.username}>@{item.user.username} </Text>
            )}
            {item.message}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color={colors.gray[400]} />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        You'll see likes, comments, follows, and more here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={!loading && renderEmpty}
      />
    </View>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContainer: {
      paddingVertical: SIZES.sm,
    },
    emptyListContainer: {
      flexGrow: 1,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SIZES.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    unreadNotification: {
      backgroundColor: colors.primary + '08',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SIZES.md,
    },
    notificationContent: {
      flex: 1,
    },
    notificationText: {
      fontSize: FONT_SIZES.md,
      color: colors.text,
      marginBottom: SIZES.xs,
    },
    username: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    timeText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginLeft: SIZES.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SIZES.xl,
    },
    emptyText: {
      fontSize: FONT_SIZES.xl,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: SIZES.lg,
      marginBottom: SIZES.sm,
    },
    emptySubtext: {
      fontSize: FONT_SIZES.md,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

export default NotificationsScreen;
