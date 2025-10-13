import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../services/messageService';

/**
 * Fetch all conversations for current user
 */
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getConversations();
      return response.data.conversations || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

/**
 * Fetch messages in a conversation
 * @param {Object} params - Conversation params
 * @param {string} params.conversationId - Conversation ID
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ conversationId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(conversationId, page, limit);
      return {
        conversationId,
        messages: response.data.messages,
        page,
        hasMore: response.data.hasMore,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

/**
 * Send a new message
 * @param {Object} messageData - Message data
 * @param {string} messageData.conversationId - Conversation ID
 * @param {string} messageData.receiverId - Receiver user ID
 * @param {string} messageData.content - Message content/text
 * @param {string} messageData.mediaUrl - Optional media URL
 */
export const sendMessage = createAsyncThunk(
  'messages/send',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData);
      // Include the receiverId in the response so we can use it as the key
      return {
        message: response.data.data,
        receiverId: messageData.receiverId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

/**
 * Create or get conversation with user
 * @param {string} userId - User ID to chat with
 */
export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await messageService.createConversation(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

/**
 * Mark conversation as read
 * @param {string} conversationId - Conversation ID
 */
export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await messageService.markAsRead(conversationId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

/**
 * Delete a message
 * @param {Object} params - Message params
 * @param {string} params.conversationId - Conversation ID
 * @param {string} params.messageId - Message ID
 */
export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(conversationId, messageId);
      return { conversationId, messageId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    currentConversation: null,
    messages: {},
    unreadCount: 0,
    loading: false,
    sendLoading: false,
    error: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.page = 1;
      state.hasMore = true;
    },
    addMessageFromSocket: (state, action) => {
      const { conversationId, message } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Check if message already exists
      const exists = state.messages[conversationId].some(m => m._id === message._id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }

      // Update conversation
      const convIndex = state.conversations.findIndex(c => c._id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        state.conversations[convIndex].updatedAt = message.createdAt;

        // Increment unread if not current conversation
        if (state.currentConversation?._id !== conversationId) {
          state.conversations[convIndex].unreadCount =
            (state.conversations[convIndex].unreadCount || 0) + 1;
          state.unreadCount += 1;
        }
      }
    },
    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;

      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find(m => m._id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        const conversations = Array.isArray(action.payload) ? action.payload : [];
        state.conversations = conversations;
        state.unreadCount = conversations.reduce(
          (sum, conv) => sum + (conv.unreadCount || 0),
          0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        if (state.page === 1) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages, page, hasMore } = action.payload;

        if (page === 1) {
          state.messages[conversationId] = messages;
        } else {
          state.messages[conversationId] = [
            ...messages,
            ...(state.messages[conversationId] || []),
          ];
        }

        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sendLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendLoading = false;
        const { message, receiverId } = action.payload;
        const conversationId = message.conversation;

        // Store message using receiverId as key (to match how fetchMessages works)
        if (!state.messages[receiverId]) {
          state.messages[receiverId] = [];
        }
        state.messages[receiverId].push(message);

        // Update conversation
        const convIndex = state.conversations.findIndex(c => c._id === conversationId);
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = message;
          state.conversations[convIndex].updatedAt = message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendLoading = false;
        state.error = action.payload;
      })
      // Create Conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const exists = state.conversations.some(c => c._id === action.payload._id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.currentConversation = action.payload;
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const convIndex = state.conversations.findIndex(c => c._id === action.payload);
        if (convIndex !== -1) {
          const unread = state.conversations[convIndex].unreadCount || 0;
          state.conversations[convIndex].unreadCount = 0;
          state.unreadCount = Math.max(state.unreadCount - unread, 0);
        }
      })
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].filter(
            m => m._id !== messageId
          );
        }
      });
  },
});

export const {
  clearError,
  setCurrentConversation,
  clearCurrentConversation,
  addMessageFromSocket,
  updateMessageStatus,
  setUnreadCount,
} = messagesSlice.actions;

export default messagesSlice.reducer;
