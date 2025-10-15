const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firebaseUid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Can be null if using Firebase Auth
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    movementGoals: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'moderator'),
      defaultValue: 'user'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    banReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bannedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bannedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Subscription fields
    subscriptionTier: {
      type: DataTypes.ENUM('free', 'basic', 'premium'),
      defaultValue: 'free',
      allowNull: true // Allow null for backwards compatibility with existing database
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'trialing', 'canceled', 'expired', 'past_due'),
      defaultValue: 'active',
      allowNull: true // Allow null for backwards compatibility with existing database
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
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
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['firebaseUid'] },
      { fields: ['role'] },
      { fields: ['isActive'] },
      { fields: ['lastActiveAt'] },
      { fields: ['createdAt'] },
      { fields: ['subscriptionTier'] },
      { fields: ['subscriptionStatus'] },
      { fields: ['stripeSubscriptionId'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Subscription helper methods
  User.prototype.hasAccess = function(requiredTier) {
    const tierHierarchy = { free: 0, basic: 1, premium: 2 };
    const userTierLevel = tierHierarchy[this.subscriptionTier] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 0;
    return userTierLevel >= requiredTierLevel;
  };

  User.prototype.isSubscriptionActive = function() {
    if (this.subscriptionStatus === 'canceled' || this.subscriptionStatus === 'expired') {
      return false;
    }
    if (this.subscriptionEndDate && new Date() > new Date(this.subscriptionEndDate)) {
      return false;
    }
    return true;
  };

  User.prototype.isOnTrial = function() {
    if (!this.trialEndsAt) return false;
    return new Date() < new Date(this.trialEndsAt) && this.subscriptionStatus === 'trialing';
  };

  User.prototype.canCreatePosts = function() {
    return this.hasAccess('basic');
  };

  User.prototype.canSendMessages = function() {
    return this.hasAccess('premium');
  };

  User.prototype.canPurchasePrograms = function() {
    return this.hasAccess('basic');
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  return User;
};
