const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM(
      'like',
      'comment',
      'follow',
      'message',
      'achievement',
      'challenge',
      'purchase',
      'subscription',
      'daily_content',
      'system'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data (e.g., postId, achievementId, etc.)'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Deep link or URL to navigate when clicked'
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'User who triggered the notification (for social notifications)'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Notification;