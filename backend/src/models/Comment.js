const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
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
      }
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parentCommentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['postId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return Comment;
};
