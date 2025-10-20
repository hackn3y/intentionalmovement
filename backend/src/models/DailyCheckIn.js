const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailyCheckIn = sequelize.define('DailyCheckIn', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    dailyContentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'daily_contents',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of check-in (YYYY-MM-DD)'
    },
    viewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether user viewed the content'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user completed associated challenge/task'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional user notes or reflection'
    }
  }, {
    tableName: 'daily_check_ins',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'checkInDate'] },
      { fields: ['dailyContentId'] },
      { fields: ['checkInDate'] }
    ]
  });

  return DailyCheckIn;
};
