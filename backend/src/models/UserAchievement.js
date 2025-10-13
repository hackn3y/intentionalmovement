const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAchievement = sequelize.define('UserAchievement', {
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
    achievementId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Achievements',
        key: 'id'
      }
    },
    earnedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'achievementId']
      }
    ]
  });

  return UserAchievement;
};
