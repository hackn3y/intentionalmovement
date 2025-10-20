const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video', 'none'),
      defaultValue: 'none'
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hashtags: {
      type: DataTypes.TEXT,
      defaultValue: '',
      get() {
        const value = this.getDataValue('hashtags');
        return value ? value.split(',').filter(Boolean) : [];
      },
      set(value) {
        this.setDataValue('hashtags', Array.isArray(value) ? value.join(',') : '');
      }
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isRepost: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    originalPostId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    visibility: {
      type: DataTypes.ENUM('public', 'followers', 'private'),
      defaultValue: 'public'
    },
    isReported: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isCurated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.TEXT,
      defaultValue: null,
      get() {
        const value = this.getDataValue('metadata');
        if (!value) return {};
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      }
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['createdAt'] },
      { fields: ['visibility'] },
      { fields: ['isHidden'] },
      { fields: ['isReported'] },
      { fields: ['isRepost'] },
      { fields: ['isCurated'] },
      { fields: ['originalPostId'] },
      { fields: ['userId', 'createdAt'] }, // Composite index for user timeline queries
      { fields: ['visibility', 'isHidden', 'createdAt'] }, // Composite index for feed queries
      { fields: ['isCurated', 'createdAt'] } // Composite index for curated content queries
    ]
  });

  return Post;
};
