const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    contentType: {
      type: DataTypes.ENUM('post', 'comment', 'user', 'message'),
      allowNull: false
    },
    contentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    reason: {
      type: DataTypes.ENUM(
        'spam',
        'harassment',
        'inappropriate_content',
        'hate_speech',
        'violence',
        'other'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewing', 'resolved', 'dismissed'),
      defaultValue: 'pending'
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Action taken after review'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['contentType', 'contentId']
      }
    ]
  });

  return Report;
};
