const { Op } = require('sequelize');
const { Achievement, UserAchievement, User, sequelize } = require('../models');

// Get all achievements
exports.getAchievements = async (req, res, next) => {
  try {
    const { category, rarity } = req.query;

    let whereClause = { isActive: true };

    if (category) {
      whereClause.category = category;
    }

    if (rarity) {
      whereClause.rarity = rarity;
    }

    const achievements = await Achievement.findAll({
      where: whereClause,
      order: [
        ['category', 'ASC'],
        ['points', 'DESC']
      ]
    });

    // Get user's earned achievements
    const userId = req.user.id;
    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      attributes: ['achievementId', 'earnedAt']
    });

    const earnedMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua.earnedAt])
    );

    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement.toJSON(),
      isEarned: earnedMap.has(achievement.id),
      earnedAt: earnedMap.get(achievement.id) || null
    }));

    res.json({ achievements: achievementsWithStatus });
  } catch (error) {
    next(error);
  }
};

// Get single achievement
exports.getAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByPk(id);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check if user has earned this achievement
    const userId = req.user.id;
    const userAchievement = await UserAchievement.findOne({
      where: {
        userId,
        achievementId: id
      }
    });

    res.json({
      achievement: {
        ...achievement.toJSON(),
        isEarned: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's earned achievements
exports.getUserAchievements = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [
        {
          model: Achievement,
          as: 'Achievement',
          where: { isActive: true }
        }
      ],
      order: [['earnedAt', 'DESC']]
    });

    res.json({
      achievements: userAchievements.map(ua => ({
        ...ua.Achievement.toJSON(),
        earnedAt: ua.earnedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Award achievement to user (admin only or system)
exports.awardAchievement = async (req, res, next) => {
  try {
    const { userId, achievementId } = req.body;

    if (!userId || !achievementId) {
      return res.status(400).json({ error: 'User ID and Achievement ID are required' });
    }

    const achievement = await Achievement.findByPk(achievementId);

    if (!achievement || !achievement.isActive) {
      return res.status(404).json({ error: 'Achievement not found or inactive' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has this achievement
    const existingAchievement = await UserAchievement.findOne({
      where: {
        userId,
        achievementId
      }
    });

    if (existingAchievement) {
      return res.status(400).json({ error: 'User already has this achievement' });
    }

    // Award the achievement
    const userAchievement = await UserAchievement.create({
      userId,
      achievementId
    });

    // TODO: Send push notification to user
    // TODO: Create notification in system

    res.status(201).json({
      message: 'Achievement awarded successfully',
      userAchievement: {
        ...achievement.toJSON(),
        earnedAt: userAchievement.earnedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create achievement (admin only)
exports.createAchievement = async (req, res, next) => {
  try {
    const { title, description, icon, badgeUrl, category, criteria, points, rarity } = req.body;

    if (!title || !description || !category || !criteria) {
      return res.status(400).json({
        error: 'Required fields: title, description, category, criteria'
      });
    }

    const achievement = await Achievement.create({
      title,
      description,
      icon,
      badgeUrl,
      category,
      criteria,
      points: points || 0,
      rarity: rarity || 'common'
    });

    res.status(201).json({
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    next(error);
  }
};

// Update achievement (admin only)
exports.updateAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const achievement = await Achievement.findByPk(id);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    await achievement.update(updateData);

    res.json({
      message: 'Achievement updated successfully',
      achievement
    });
  } catch (error) {
    next(error);
  }
};

// Delete achievement (admin only)
exports.deleteAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByPk(id);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Soft delete by deactivating
    await achievement.update({ isActive: false });

    res.json({ message: 'Achievement deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// Get achievement leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    // Get users with most achievements
    const leaderboard = await UserAchievement.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('achievementId')), 'achievementCount']
      ],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      group: ['userId', 'User.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('achievementId')), 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};
