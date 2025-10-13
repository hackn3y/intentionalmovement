const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProgramReview = sequelize.define('ProgramReview', {
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['programId']
      },
      {
        fields: ['userId']
      },
      {
        unique: true,
        fields: ['userId', 'programId']
      },
      {
        fields: ['rating']
      }
    ]
  });

  return ProgramReview;
};
