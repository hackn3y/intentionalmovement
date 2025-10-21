const { Op } = require('sequelize');
const { User, Follow, Post, Purchase, Program, Achievement, UserAchievement } = require('../models');
const AchievementService = require('../services/achievementService');
const s3Service = require('../services/s3Service');

// Safe attributes that exist in production database
const SAFE_USER_ATTRIBUTES = ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt'];

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findByPk(id, {
      attributes: SAFE_USER_ATTRIBUTES,
      include: [
        {
          model: User,
          as: 'followers',
          attributes: ['id', 'username', 'displayName', 'profileImage'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'displayName', 'profileImage'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user is following this profile
    const isFollowing = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: id
      }
    });

    // Get user posts
    const posts = await Post.findAll({
      where: { userId: id, isHidden: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get user stats
    const [followerCount, followingCount, postCount] = await Promise.all([
      user.countFollowers(),
      user.countFollowing(),
      Post.count({ where: { userId: id } })
    ]);

    const userJSON = user.toJSON();
    userJSON.isFollowing = !!isFollowing;
    userJSON.posts = posts;
    userJSON.stats = {
      followers: followerCount,
      following: followingCount,
      posts: postCount,
      workouts: 0 // Placeholder for now
    };

    res.json({ user: userJSON });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure user can only update their own profile (skip role check - column doesn't exist)
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { displayName, username, bio, movementGoals, profileImage, coverImage } = req.body;

    const user = await User.findByPk(id, {
      attributes: SAFE_USER_ATTRIBUTES
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: { username },
        attributes: ['id', 'username']
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    await user.update({
      displayName: displayName !== undefined ? displayName : user.displayName,
      username: username !== undefined ? username : user.username,
      bio: bio !== undefined ? bio : user.bio,
      movementGoals: movementGoals !== undefined ? movementGoals : user.movementGoals,
      profileImage: profileImage !== undefined ? profileImage : user.profileImage,
      coverImage: coverImage !== undefined ? coverImage : user.coverImage
    });

    // Return user without password
    const userJSON = user.toJSON();

    res.json({
      message: 'Profile updated successfully',
      user: userJSON
    });
  } catch (error) {
    next(error);
  }
};

// Get followers list
exports.getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const user = await User.findByPk(id, { attributes: SAFE_USER_ATTRIBUTES });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await user.getFollowers({
      attributes: ['id', 'username', 'displayName', 'profileImage', 'bio'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await user.countFollowers();

    res.json({
      followers,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + followers.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get following list
exports.getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const user = await User.findByPk(id, { attributes: SAFE_USER_ATTRIBUTES });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await user.getFollowing({
      attributes: ['id', 'username', 'displayName', 'profileImage', 'bio'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await user.countFollowing();

    res.json({
      following,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + following.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Follow a user
exports.followUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findByPk(id);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: id
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    await Follow.create({
      followerId: currentUserId,
      followingId: id
    });

    // Check for social achievements (for the user being followed)
    AchievementService.checkSocialAchievements(id).catch(err => {
      console.error('Achievement check error:', err);
    });

    res.status(201).json({ message: 'Successfully followed user' });
  } catch (error) {
    next(error);
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const follow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: id
      }
    });

    if (!follow) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    await follow.destroy();

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    next(error);
  }
};

// Search users
exports.searchUsers = async (req, res, next) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ users: [], pagination: { total: 0, limit: parseInt(limit), offset: parseInt(offset), hasMore: false } });
    }

    const searchTerm = q.trim();

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${searchTerm}%` } },
          { displayName: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } }
        ]
        // Skip isActive check - column doesn't exist in production
      },
      attributes: ['id', 'username', 'displayName', 'profileImage', 'bio'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['username', 'ASC']]
    });

    const totalCount = await User.count({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${searchTerm}%` } },
          { displayName: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } }
        ]
        // Skip isActive check - column doesn't exist in production
      }
    });

    res.json({
      users,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + users.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { attributes: SAFE_USER_ATTRIBUTES });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [
      followerCount,
      followingCount,
      postCount,
      purchaseCount,
      achievementCount
    ] = await Promise.all([
      user.countFollowers(),
      user.countFollowing(),
      Post.count({ where: { userId: id } }),
      Purchase.count({ where: { userId: id, status: 'completed' } }),
      UserAchievement.count({ where: { userId: id } })
    ]);

    // Get total likes received on posts
    const posts = await Post.findAll({
      where: { userId: id },
      attributes: ['likeCount']
    });
    const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);

    res.json({
      stats: {
        followers: followerCount,
        following: followingCount,
        posts: postCount,
        purchases: purchaseCount,
        achievements: achievementCount,
        totalLikes
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure user can only update their own profile (skip role check - column doesn't exist)
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const user = await User.findByPk(id, { attributes: SAFE_USER_ATTRIBUTES });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let imageUrl;

    // Upload to S3 if configured, otherwise use local storage
    if (process.env.STORAGE_MODE === 's3') {
      try {
        const s3Result = await s3Service.uploadImage(req.file, 'profiles', {
          width: 800,
          height: 800,
          quality: 85
        });
        imageUrl = s3Result.url;
        console.log('Profile image uploaded to S3:', imageUrl);
      } catch (s3Error) {
        console.error('S3 upload error:', s3Error);
        return res.status(500).json({ error: 'Failed to upload image to S3', details: s3Error.message });
      }
    } else {
      // Local storage fallback
      imageUrl = `/uploads/profiles/${req.file.filename}`;
    }

    await user.update({ profileImage: imageUrl });

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl
    });
  } catch (error) {
    next(error);
  }
};

// Upload cover image
exports.uploadCoverImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure user can only update their own profile (skip role check - column doesn't exist)
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const user = await User.findByPk(id, { attributes: SAFE_USER_ATTRIBUTES });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let imageUrl;

    // Upload to S3 if configured, otherwise use local storage
    if (process.env.STORAGE_MODE === 's3') {
      try {
        const s3Result = await s3Service.uploadImage(req.file, 'covers', {
          width: 1500,
          height: 500,
          quality: 85
        });
        imageUrl = s3Result.url;
        console.log('Cover image uploaded to S3:', imageUrl);
      } catch (s3Error) {
        console.error('S3 upload error:', s3Error);
        return res.status(500).json({ error: 'Failed to upload image to S3', details: s3Error.message });
      }
    } else {
      // Local storage fallback
      imageUrl = `/uploads/profiles/${req.file.filename}`;
    }

    await user.update({ coverImage: imageUrl });

    res.json({
      message: 'Cover image uploaded successfully',
      coverImage: imageUrl
    });
  } catch (error) {
    next(error);
  }
};

// Get privacy settings
exports.getPrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'metadata']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const metadata = user.metadata || {};
    const privacySettings = metadata.privacySettings || {};

    // Return default privacy settings if none exist
    const settings = {
      profileVisibility: privacySettings.profileVisibility || 'public',
      showEmail: privacySettings.showEmail || false,
      showPhoneNumber: privacySettings.showPhoneNumber || false,
      allowFollowRequests: privacySettings.allowFollowRequests !== false,
      allowMessages: privacySettings.allowMessages || 'everyone',
      showActivity: privacySettings.showActivity !== false,
      showPurchases: privacySettings.showPurchases || false,
      allowTagging: privacySettings.allowTagging !== false
    };

    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

// Update privacy settings
exports.updatePrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      profileVisibility,
      showEmail,
      showPhoneNumber,
      allowFollowRequests,
      allowMessages,
      showActivity,
      showPurchases,
      allowTagging
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get existing metadata
    const metadata = user.metadata || {};

    // Update privacy settings in metadata
    metadata.privacySettings = {
      profileVisibility: profileVisibility !== undefined ? profileVisibility : (metadata.privacySettings?.profileVisibility || 'public'),
      showEmail: showEmail !== undefined ? showEmail : (metadata.privacySettings?.showEmail || false),
      showPhoneNumber: showPhoneNumber !== undefined ? showPhoneNumber : (metadata.privacySettings?.showPhoneNumber || false),
      allowFollowRequests: allowFollowRequests !== undefined ? allowFollowRequests : (metadata.privacySettings?.allowFollowRequests !== false),
      allowMessages: allowMessages !== undefined ? allowMessages : (metadata.privacySettings?.allowMessages || 'everyone'),
      showActivity: showActivity !== undefined ? showActivity : (metadata.privacySettings?.showActivity !== false),
      showPurchases: showPurchases !== undefined ? showPurchases : (metadata.privacySettings?.showPurchases || false),
      allowTagging: allowTagging !== undefined ? allowTagging : (metadata.privacySettings?.allowTagging !== false)
    };

    // Update user metadata
    await user.update({ metadata });

    res.json({
      message: 'Privacy settings updated successfully',
      settings: metadata.privacySettings
    });
  } catch (error) {
    next(error);
  }
};
