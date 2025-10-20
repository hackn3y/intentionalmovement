import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import { storage } from '../utils/storage';

/**
 * Socket.io service for real-time messaging and notifications
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.connecting = false; // Track connection state separately
    this.pendingListeners = []; // Queue listeners until socket is ready
  }

  /**
   * Connect to socket server
   */
  async connect() {
    // If already connected or in the process of connecting, skip
    if (this.socket || this.connecting) {
      console.log('Socket already exists or connecting (socket:', !!this.socket, 'connecting:', this.connecting, '), skipping connection');
      return;
    }

    // Set connecting flag immediately to prevent duplicate calls
    this.connecting = true;

    try {
      console.log('Attempting to connect to Socket.IO at:', SOCKET_URL);
      const token = await storage.get('token');

      // Don't attempt to connect if there's no token
      if (!token) {
        console.log('No token available, skipping socket connection');
        this.connecting = false;
        return;
      }

      console.log('Token found, initializing socket connection...');
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        // Try WebSocket first, fallback to polling for browser compatibility
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        if (__DEV__) {
          console.log('Socket connected');
          console.log('Transport:', this.socket.io.engine.transport.name);
        }
        this.connected = true;
        this.connecting = false; // Clear connecting flag when connected

        // Register all pending listeners
        if (this.pendingListeners.length > 0) {
          console.log(`[SocketService] Registering ${this.pendingListeners.length} pending listeners`);
          this.pendingListeners.forEach(({ event, callback }) => {
            console.log(`[SocketService] Registering queued listener for event: ${event}`);
            this.socket.on(event, callback);
          });
          this.pendingListeners = []; // Clear the queue
        }
      });

      // Log transport upgrade
      this.socket.io.engine.on('upgrade', (transport) => {
        if (__DEV__) {
          console.log('Transport upgraded to:', transport.name);
        }
      });

      this.socket.on('disconnect', () => {
        if (__DEV__) {
          console.log('Socket disconnected');
        }
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.error('Error message:', error.message);
        console.error('Error type:', error.type);
        console.error('Error description:', error.description);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt:', attemptNumber);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after all attempts');
      });
    } catch (error) {
      console.error('Failed to connect socket:', error);
      this.socket = null;
      this.connecting = false; // Reset connecting flag on error
    }
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connecting = false;
    }
  }

  /**
   * Listen for new messages
   * @param {Function} callback - Callback function
   * @returns {Function} The callback function (to use for removing specific listener)
   */
  onNewMessage(callback) {
    if (this.socket && typeof this.socket !== 'string') {
      // Socket exists and is connected, register immediately
      console.log('[SocketService] Registering new_message listener immediately');
      this.socket.on('new_message', callback);
    } else {
      // Socket doesn't exist yet, queue the listener
      console.log('[SocketService] Queueing new_message listener (socket not ready)');
      this.pendingListeners.push({ event: 'new_message', callback });
    }
    return callback;
  }

  /**
   * Remove new message listener
   * @param {Function} callback - Specific callback to remove (optional - if not provided, removes ALL listeners)
   */
  offNewMessage(callback) {
    if (this.socket) {
      if (callback) {
        // Remove specific listener
        this.socket.off('new_message', callback);
      } else {
        // Remove all listeners (use with caution)
        this.socket.off('new_message');
      }
    }
  }

  /**
   * Listen for message status updates
   * @param {Function} callback - Callback function
   */
  onMessageStatus(callback) {
    if (this.socket) {
      this.socket.on('message_status', callback);
    }
  }

  /**
   * Remove message status listener
   */
  offMessageStatus() {
    if (this.socket) {
      this.socket.off('message_status');
    }
  }

  /**
   * Listen for typing indicator
   * @param {Function} callback - Callback function
   */
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  /**
   * Remove typing listener
   */
  offTyping() {
    if (this.socket) {
      this.socket.off('typing');
    }
  }

  /**
   * Emit typing event
   * @param {string} conversationId - Conversation ID
   * @param {boolean} isTyping - Whether user is typing
   */
  emitTyping(conversationId, isTyping) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  /**
   * Join a conversation room
   * @param {string} conversationId - Conversation ID
   */
  joinConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  /**
   * Leave a conversation room
   * @param {string} conversationId - Conversation ID
   */
  leaveConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  /**
   * Listen for notifications
   * @param {Function} callback - Callback function
   */
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  /**
   * Remove notification listener
   */
  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  /**
   * Listen for achievement unlocked
   * @param {Function} callback - Callback function
   */
  onAchievementUnlocked(callback) {
    if (this.socket) {
      this.socket.on('achievement_unlocked', callback);
    }
  }

  /**
   * Remove achievement unlocked listener
   */
  offAchievementUnlocked() {
    if (this.socket) {
      this.socket.off('achievement_unlocked');
    }
  }

  /**
   * Listen for challenge updates
   * @param {Function} callback - Callback function
   */
  onChallengeUpdate(callback) {
    if (this.socket) {
      this.socket.on('challenge_update', callback);
    }
  }

  /**
   * Remove challenge update listener
   */
  offChallengeUpdate() {
    if (this.socket) {
      this.socket.off('challenge_update');
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();
