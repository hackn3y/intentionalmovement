import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../../config/constants';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification as deleteNotificationAction,
  markAllNotificationsAsRead as markAllAsReadAction,
  deleteAllReadNotifications as deleteAllReadAction,
  addNotification,
} from '../../store/slices/notificationsSlice';
import socketService from '../../services/socketService';

/**
 * Notifications Screen - Shows all app notifications except messages
 * Includes: likes, comments, follows, achievements, program updates, etc.
 */
const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const dispatch = useDispatch();

  const { notifications, loading, refreshing, unreadCount } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50, offset: 0 }));

    // Set up Socket.io listener for real-time notifications
    const handleNewNotification = (notification) => {
      console.log('New notification received:', notification);
      dispatch(addNotification(notification));
    };

    socketService.onNotification(handleNewNotification);

    // ESC key support for web
    const handleKeyPress = (event) => {
      if (Platform.OS === 'web' && event.key === 'Escape') {
        navigation.goBack();
      }
    };

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyPress);
    }

    // Cleanup
    return () => {
      socketService.offNotification();
      if (Platform.OS === 'web') {
        window.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [dispatch, navigation]);

  const handleRefresh = () => {
    dispatch(fetchNotifications({ limit: 50, offset: 0 }));
  };

  const handleDeleteNotification = (notificationId) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this notification?')) {
        dispatch(deleteNotificationAction(notificationId));
      }
    } else {
      Alert.alert(
        'Delete Notification',
        'Are you sure you want to delete this notification?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => dispatch(deleteNotificationAction(notificationId)),
          },
        ]
      );
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    dispatch(markAllAsReadAction());
  };

  const handleClearAll = () => {
    const readCount = notifications.filter((n) => n.isRead).length;
    if (readCount === 0) {
      Alert.alert('No Read Notifications', 'There are no read notifications to clear.');
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Clear ${readCount} read notification${readCount !== 1 ? 's' : ''}?`)) {
        dispatch(deleteAllReadAction());
      }
    } else {
      Alert.alert(
        'Clear Read Notifications',
        `Clear ${readCount} read notification${readCount !== 1 ? 's' : ''}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: () => dispatch(deleteAllReadAction()),
          },
        ]
      );
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'follow':
        if (notification.fromUser) {
          navigation.navigate('ProfileTab', {
            screen: 'Profile',
            params: { username: notification.fromUser.username },
          });
        }
        break;
      case 'like':
      case 'comment':
        // Navigate to post detail if actionUrl contains post ID
        if (notification.data?.postId) {
          // navigation.navigate('PostDetail', { postId: notification.data.postId });
        }
        break;
      case 'achievement':
        navigation.navigate('ProfileTab', { screen: 'Achievements' });
        break;
      case 'program':
      case 'purchase':
        if (notification.data?.programId) {
          navigation.navigate('ProgramsTab', {
            screen: 'ProgramDetail',
            params: { id: notification.data.programId },
          });
        }
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
      case 'purchase':
      case 'subscription':
        return { name: 'book', color: colors.accent };
      case 'daily_content':
        return { name: 'calendar', color: colors.info };
      case 'challenge':
        return { name: 'flame', color: colors.warning };
      case 'system':
        return { name: 'information-circle', color: colors.info };
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
      <View style={styles.notificationWrapper}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !item.isRead && styles.unreadNotification,
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          <View style={styles.notificationContent}>
            <Text style={[
              styles.notificationTitle,
              !item.isRead && styles.notificationTitleUnread
            ]}>
              {item.title}
            </Text>
            <Text style={[
              styles.notificationText,
              !item.isRead && styles.notificationTextUnread
            ]}>
              {item.fromUser && (
                <Text style={styles.username}>@{item.fromUser.username} </Text>
              )}
              {item.message}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
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
      {/* Header Actions */}
      {notifications.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            style={[styles.headerButton, unreadCount === 0 && styles.headerButtonDisabled]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={unreadCount === 0 ? colors.textSecondary : colors.primary}
            />
            <Text style={[styles.headerButtonText, unreadCount === 0 && styles.headerButtonTextDisabled]}>
              Mark All Read
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.headerButtonText, { color: colors.danger }]}>
              Clear Read
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: SIZES.sm,
      paddingHorizontal: SIZES.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SIZES.xs,
      paddingHorizontal: SIZES.md,
      borderRadius: SIZES.sm,
      backgroundColor: colors.background,
    },
    headerButtonDisabled: {
      opacity: 0.5,
    },
    headerButtonText: {
      marginLeft: SIZES.xs,
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    headerButtonTextDisabled: {
      color: colors.textSecondary,
    },
    listContainer: {
      paddingVertical: SIZES.sm,
    },
    emptyListContainer: {
      flexGrow: 1,
    },
    notificationWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notificationItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: SIZES.md,
    },
    deleteButton: {
      padding: SIZES.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unreadNotification: {
      backgroundColor: colors.primary + '15',
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
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
    notificationTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SIZES.xxs,
    },
    notificationTitleUnread: {
      fontWeight: '700',
      color: colors.text,
    },
    notificationText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      marginBottom: SIZES.xs,
    },
    notificationTextUnread: {
      color: colors.text,
      opacity: 0.9,
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
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginLeft: SIZES.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 3,
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
