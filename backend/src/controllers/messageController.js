const { Op } = require('sequelize');
const { Message, User } = require('../models');

// Get conversations list
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get unique conversation partners
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ],
        isDeleted: false
      },
      attributes: ['senderId', 'receiverId', 'content', 'createdAt', 'isRead'],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          _id: `conv-${userId}-${partnerId}`, // Generate conversation ID
          participants: [partner], // Will add current user later
          lastMessage: {
            text: message.content,
            createdAt: message.createdAt
          },
          updatedAt: message.createdAt,
          unreadCount: 0
        });
      }

      // Count unread messages from this partner
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    // Add _id and firstName/lastName fields to participants
    const conversations = Array.from(conversationsMap.values()).map(conv => ({
      ...conv,
      participants: conv.participants.map(p => ({
        _id: p.id,
        id: p.id,
        firstName: p.displayName ? p.displayName.split(' ')[0] : p.username,
        lastName: p.displayName ? p.displayName.split(' ').slice(1).join(' ') : '',
        profilePicture: p.profileImage
      }))
    })).slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      conversations,
      pagination: {
        total: conversationsMap.size,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + conversations.length < conversationsMap.size
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get messages with a specific user
exports.getMessages = async (req, res, next) => {
  try {
    const { userId: partnerId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId }
        ],
        isDeleted: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Message.count({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId }
        ],
        isDeleted: false
      }
    });

    // Mark messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: partnerId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + messages.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, mediaUrl } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      mediaUrl
    });

    // Fetch the complete message with user data
    const createdMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ]
    });

    // Send real-time notification via Socket.IO
    const io = req.app.get('io');
    const { connectedUsers } = require('../socket');

    if (io && connectedUsers) {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', createdMessage);
        console.log('Sent real-time message notification to receiver:', receiverId);
      }
    }

    // TODO: Send push notification to receiver

    res.status(201).json({
      message: 'Message sent successfully',
      data: createdMessage
    });
  } catch (error) {
    next(error);
  }
};

// Mark message as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Ensure user is the receiver
    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to mark this message as read' });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    next(error);
  }
};

// Delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Ensure user is sender or receiver
    if (message.senderId !== req.user.id && message.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    await message.update({ isDeleted: true });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.count({
      where: {
        receiverId: userId,
        isRead: false,
        isDeleted: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
};
