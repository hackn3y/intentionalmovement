const { Achievement, UserAchievement, User, Post, Purchase, Progress } = require('../models');
const logger = require('../utils/logger');

/**
 * Achievement Service
 * Handles achievement unlocking and triggers
 */

class AchievementService {
  /**
   * Check and unlock achievement for a user
   * @param {string} userId - User ID
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<Object|null>} - Unlocked achievement or null
   */
  static async unlockAchievement(userId, achievementId) {
    try {
      // Check if user already has this achievement
      const existing = await UserAchievement.findOne({
        where: { userId, achievementId }
      });

      if (existing) {
        return null; // Already unlocked
      }

      // Unlock the achievement
      const userAchievement = await UserAchievement.create({
        userId,
        achievementId,
        unlockedAt: new Date()
      });

      const achievement = await Achievement.findByPk(achievementId);

      logger.info(`Achievement unlocked: ${achievement.name} for user ${userId}`);

      return {
        userAchievement,
        achievement
      };
    } catch (error) {
      logger.error('Error unlocking achievement:', error);
      return null;
    }
  }

  /**
   * Check post-related achievements
   * @param {string} userId - User ID
   */
  static async checkPostAchievements(userId) {
    try {
      const postCount = await Post.count({ where: { userId } });

      // First Post
      if (postCount === 1) {
        await this.unlockAchievementByKey(userId, 'first_post');
      }

      // Active Member - 10 posts
      if (postCount === 10) {
        await this.unlockAchievementByKey(userId, 'active_member');
      }

      // Content Creator - 50 posts
      if (postCount === 50) {
        await this.unlockAchievementByKey(userId, 'content_creator');
      }

      // Influencer - 100 posts
      if (postCount === 100) {
        await this.unlockAchievementByKey(userId, 'influencer');
      }
    } catch (error) {
      logger.error('Error checking post achievements:', error);
    }
  }

  /**
   * Check purchase-related achievements
   * @param {string} userId - User ID
   */
  static async checkPurchaseAchievements(userId) {
    try {
      const purchaseCount = await Purchase.count({
        where: { userId, status: 'completed' }
      });

      // First Program
      if (purchaseCount === 1) {
        await this.unlockAchievementByKey(userId, 'first_program');
      }

      // Committed Learner - 5 programs
      if (purchaseCount === 5) {
        await this.unlockAchievementByKey(userId, 'committed_learner');
      }

      // Program Collector - 10 programs
      if (purchaseCount === 10) {
        await this.unlockAchievementByKey(userId, 'program_collector');
      }
    } catch (error) {
      logger.error('Error checking purchase achievements:', error);
    }
  }

  /**
   * Check progress-related achievements
   * @param {string} userId - User ID
   * @param {string} programId - Program ID
   */
  static async checkProgressAchievements(userId, programId) {
    try {
      const progress = await Progress.findOne({
        where: { userId, programId }
      });

      if (!progress) return;

      // Program Completed
      if (progress.progressPercentage === 100) {
        await this.unlockAchievementByKey(userId, 'program_completed');

        // Check if user has completed 5 programs
        const completedCount = await Progress.count({
          where: { userId, progressPercentage: 100 }
        });

        if (completedCount === 5) {
          await this.unlockAchievementByKey(userId, 'dedication_master');
        }

        if (completedCount === 10) {
          await this.unlockAchievementByKey(userId, 'completion_legend');
        }
      }

      // Halfway There
      if (progress.progressPercentage >= 50 && progress.progressPercentage < 100) {
        await this.unlockAchievementByKey(userId, 'halfway_there');
      }
    } catch (error) {
      logger.error('Error checking progress achievements:', error);
    }
  }

  /**
   * Check social achievements
   * @param {string} userId - User ID
   */
  static async checkSocialAchievements(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return;

      const followerCount = await user.countFollowers();

      // Popular - 10 followers
      if (followerCount === 10) {
        await this.unlockAchievementByKey(userId, 'popular');
      }

      // Community Leader - 50 followers
      if (followerCount === 50) {
        await this.unlockAchievementByKey(userId, 'community_leader');
      }

      // Influencer - 100 followers
      if (followerCount === 100) {
        await this.unlockAchievementByKey(userId, 'social_influencer');
      }

      // Celebrity - 500 followers
      if (followerCount === 500) {
        await this.unlockAchievementByKey(userId, 'celebrity');
      }
    } catch (error) {
      logger.error('Error checking social achievements:', error);
    }
  }

  /**
   * Check engagement achievements (likes received)
   * @param {string} userId - User ID
   */
  static async checkEngagementAchievements(userId) {
    try {
      const posts = await Post.findAll({
        where: { userId },
        attributes: ['likeCount']
      });

      const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);

      // Well Liked - 10 likes
      if (totalLikes === 10) {
        await this.unlockAchievementByKey(userId, 'well_liked');
      }

      // Fan Favorite - 100 likes
      if (totalLikes === 100) {
        await this.unlockAchievementByKey(userId, 'fan_favorite');
      }

      // Viral Sensation - 1000 likes
      if (totalLikes === 1000) {
        await this.unlockAchievementByKey(userId, 'viral_sensation');
      }
    } catch (error) {
      logger.error('Error checking engagement achievements:', error);
    }
  }

  /**
   * Unlock achievement by key (slug/identifier)
   * @param {string} userId - User ID
   * @param {string} key - Achievement key
   */
  static async unlockAchievementByKey(userId, key) {
    try {
      const achievement = await Achievement.findOne({ where: { key } });
      if (achievement) {
        return await this.unlockAchievement(userId, achievement.id);
      }
    } catch (error) {
      logger.error(`Error unlocking achievement by key ${key}:`, error);
    }
  }

  /**
   * Get user's achievements
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's achievements
   */
  static async getUserAchievements(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Achievement,
            as: 'achievements',
            through: {
              attributes: ['unlockedAt']
            }
          }
        ]
      });

      return user ? user.achievements : [];
    } catch (error) {
      logger.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get all available achievements
   * @returns {Promise<Array>} - All achievements
   */
  static async getAllAchievements() {
    try {
      return await Achievement.findAll({
        order: [['points', 'ASC']]
      });
    } catch (error) {
      logger.error('Error getting all achievements:', error);
      return [];
    }
  }
}

module.exports = AchievementService;
