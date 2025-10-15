const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailyContent = sequelize.define('DailyContent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
      comment: 'The date this content is scheduled for (YYYY-MM-DD)'
    },
    contentType: {
      type: DataTypes.ENUM('quote', 'tip', 'challenge', 'affirmation', 'reflection'),
      allowNull: false,
      defaultValue: 'quote',
      comment: 'Type of daily content'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Title or headline of the daily content'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Main content message or body'
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Optional image or video URL'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Category tag (mindfulness, movement, motivation, etc.)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this content is active and should be shown'
    },
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether push notification has been sent for this content'
    }
  }, {
    tableName: 'daily_contents',
    timestamps: true,
    indexes: [
      { fields: ['date'] },
      { fields: ['contentType'] },
      { fields: ['isActive'] }
    ]
  });

  return DailyContent;
};
