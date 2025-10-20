const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserStreak = sequelize.define('UserStreak', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',  // Capital U to match Sequelize table name
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Current consecutive days of check-ins'
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Longest streak ever achieved'
    },
    lastCheckIn: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of last check-in (YYYY-MM-DD)'
    },
    totalCheckIns: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total number of check-ins all time'
    }
  }, {
    tableName: 'user_streaks',
    timestamps: true,
    indexes: [
      { fields: ['userId'], unique: true },
      { fields: ['currentStreak'] },
      { fields: ['longestStreak'] }
    ]
  });

  return UserStreak;
};
