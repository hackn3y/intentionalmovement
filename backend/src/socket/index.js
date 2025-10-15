const jwt = require('jsonwebtoken');
const { User, Message } = require('../models');

const connectedUsers = new Map();

const initializeSocket = (io) => {
  console.log('Socket.IO middleware initialized');

  io.use(async (socket, next) => {
    try {
      console.log('=== SOCKET AUTH START ===');
      console.log('Socket handshake:', JSON.stringify({
        auth: socket.handshake.auth,
        query: socket.handshake.query,
        headers: socket.handshake.headers
      }));
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      console.log('Token received:', !!token);
      console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'none');

      if (!token) {
        console.error('No token provided');
        return next(new Error('Authentication token required'));
      }

      console.log('Verifying JWT token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded, userId:', decoded.userId);

      console.log('Fetching user from database...');
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
      });
      console.log('User found:', !!user);

      if (!user) {
        console.error('User not found for id:', decoded.userId);
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      console.log('Socket authentication successful for user:', user.username);
      next();
    } catch (error) {
      console.error('=== SOCKET AUTH ERROR ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.original) {
        console.error('Original error:', error.original);
      }
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    // Update user's last active time (commented out - lastActiveAt column doesn't exist)
    // User.update(
    //   { lastActiveAt: new Date() },
    //   { where: { id: socket.userId } }
    // );

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle direct messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, mediaUrl } = data;

        const message = await Message.create({
          senderId: socket.userId,
          receiverId,
          content,
          mediaUrl
        });

        const messageWithSender = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'username', 'displayName', 'profileImage'] }
          ]
        });

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', messageWithSender);
          // Send delivery confirmation to sender
          socket.emit('message_delivered', { messageId: message.id, deliveredAt: new Date() });
        }

        // Send back to sender for confirmation
        socket.emit('message_sent', messageWithSender);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Handle message read receipts
    socket.on('mark_read', async (data) => {
      try {
        await Message.update(
          { isRead: true, readAt: new Date() },
          { where: { id: data.messageId, receiverId: socket.userId } }
        );

        const message = await Message.findByPk(data.messageId);
        if (message) {
          const senderSocketId = connectedUsers.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read', { messageId: data.messageId });
          }
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });
};

module.exports = { initializeSocket, connectedUsers };
