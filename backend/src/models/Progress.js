const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Progress = sequelize.define('Progress', {
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
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Programs',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    progressPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    watchTime: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.TEXT,
      defaultValue: null
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'programId', 'lessonId']
      }
    ]
  });

  return Progress;
};
