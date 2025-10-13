const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Challenge = sequelize.define('Challenge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('individual', 'community', 'team'),
      defaultValue: 'individual'
    },
    goal: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Challenge goal criteria and metrics'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    reward: {
      type: DataTypes.TEXT,
      defaultValue: null,
      comment: 'Reward details (achievement, badge, etc.)'
    },
    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['startDate', 'endDate']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return Challenge;
};
