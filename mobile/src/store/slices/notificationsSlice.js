import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '../../services/notificationService';

/**
 * Fetch notifications
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ limit = 50, offset = 0, unreadOnly = false } = {}, { rejectWithValue }) => {
    try {
      const data = await notificationService.getNotifications({ limit, offset, unreadOnly });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }
);

/**
 * Fetch unread count
 */
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch unread count');
    }
  }
);

/**
 * Mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
    }
  }
);

/**
 * Mark all as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read');
    }
  }
);

/**
 * Delete notification
 */
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete notification');
    }
  }
);

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = createAsyncThunk(
  'notifications/deleteAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationService.deleteAllRead();
      return result.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete read notifications');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    pagination: {
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: null,
  },
  reducers: {
    /**
     * Add new notification from Socket.io
     */
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.pagination.total += 1;
    },
    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
      };
    },
    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state, action) => {
        if (action.meta.arg?.offset === 0) {
          state.loading = true;
          state.refreshing = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;

        if (action.meta.arg?.offset === 0) {
          state.notifications = action.payload.notifications;
        } else {
          state.notifications = [...state.notifications, ...action.payload.notifications];
        }

        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;
        state.error = action.payload;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      })

      // Delete all read
      .addCase(deleteAllReadNotifications.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => !n.isRead);
        state.pagination.total = Math.max(0, state.pagination.total - action.payload);
      });
  },
});

export const { addNotification, clearNotifications, clearError } = notificationsSlice.actions;

export default notificationsSlice.reducer;
