const jwt = require('jsonwebtoken');
const { User, Message } = require('../models');

const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    connectedUsers.set(socket.userId, socket.id);

    // Update user's last active time
    User.update(
      { lastActiveAt: new Date() },
      { where: { id: socket.userId } }
    );

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
