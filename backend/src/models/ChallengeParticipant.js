const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChallengeParticipant = sequelize.define('ChallengeParticipant', {
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
    challengeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Challenges',
        key: 'id'
      }
    },
    progress: {
      type: DataTypes.TEXT,
      defaultValue: null,
      comment: 'User progress in the challenge'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'challengeId']
      }
    ]
  });

  return ChallengeParticipant;
};
