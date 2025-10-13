const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
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
    tier: {
      type: DataTypes.ENUM('basic', 'premium', 'elite'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'expired', 'past_due'),
      defaultValue: 'active'
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cancelAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT,
      defaultValue: null
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Subscription;
};
