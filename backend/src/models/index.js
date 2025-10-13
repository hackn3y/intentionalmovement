const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

// Import models
const User = require('./User')(sequelize);
const Post = require('./Post')(sequelize);
const Comment = require('./Comment')(sequelize);
const Like = require('./Like')(sequelize);
const Follow = require('./Follow')(sequelize);
const Message = require('./Message')(sequelize);
const Program = require('./Program')(sequelize);
const Purchase = require('./Purchase')(sequelize);
const Progress = require('./Progress')(sequelize);
const Achievement = require('./Achievement')(sequelize);
const UserAchievement = require('./UserAchievement')(sequelize);
const Challenge = require('./Challenge')(sequelize);
const ChallengeParticipant = require('./ChallengeParticipant')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const Report = require('./Report')(sequelize);

// Define associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Follow relationships
User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

// Messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Programs and Purchases
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Program.hasMany(Purchase, { foreignKey: 'programId', as: 'purchases' });
Purchase.belongsTo(Program, { foreignKey: 'programId', as: 'program' });

// Progress tracking
User.hasMany(Progress, { foreignKey: 'userId', as: 'progress' });
Progress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Program.hasMany(Progress, { foreignKey: 'programId', as: 'progress' });
Progress.belongsTo(Program, { foreignKey: 'programId', as: 'program' });

// Achievements
User.belongsToMany(Achievement, {
  through: UserAchievement,
  as: 'achievements',
  foreignKey: 'userId'
});
Achievement.belongsToMany(User, {
  through: UserAchievement,
  as: 'users',
  foreignKey: 'achievementId'
});

// Challenges
User.belongsToMany(Challenge, {
  through: ChallengeParticipant,
  as: 'challenges',
  foreignKey: 'userId'
});
Challenge.belongsToMany(User, {
  through: ChallengeParticipant,
  as: 'participants',
  foreignKey: 'challengeId'
});

// Subscriptions
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Reports
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reportsMade' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Follow,
  Message,
  Program,
  Purchase,
  Progress,
  Achievement,
  UserAchievement,
  Challenge,
  ChallengeParticipant,
  Subscription,
  Report
};
