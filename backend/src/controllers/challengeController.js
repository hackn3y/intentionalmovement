const { Op } = require('sequelize');
const { Challenge, ChallengeParticipant, User } = require('../models');

// Get all active challenges
exports.getChallenges = async (req, res, next) => {
  try {
    const { type, status = 'active', limit = 20, offset = 0 } = req.query;

    let whereClause = { isActive: true };

    if (type) {
      whereClause.type = type;
    }

    const now = new Date();

    // Filter by status
    if (status === 'active') {
      whereClause.startDate = { [Op.lte]: now };
      whereClause.endDate = { [Op.gte]: now };
    } else if (status === 'upcoming') {
      whereClause.startDate = { [Op.gt]: now };
    } else if (status === 'completed') {
      whereClause.endDate = { [Op.lt]: now };
    }

    const challenges = await Challenge.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startDate', 'DESC']]
    });

    // Check user participation
    const userId = req.user.id;
    const challengeIds = challenges.map(c => c.id);
    const userParticipation = await ChallengeParticipant.findAll({
      where: {
        userId,
        challengeId: { [Op.in]: challengeIds }
      },
      attributes: ['challengeId', 'isCompleted', 'progress']
    });

    const participationMap = new Map(
      userParticipation.map(p => [p.challengeId, p])
    );

    const challengesWithStatus = challenges.map(challenge => ({
      ...challenge.toJSON(),
      isParticipating: participationMap.has(challenge.id),
      userProgress: participationMap.get(challenge.id) || null
    }));

    const totalCount = await Challenge.count({ where: whereClause });

    res.json({
      challenges: challengesWithStatus,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + challenges.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single challenge
exports.getChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check user participation
    const userId = req.user.id;
    const participation = await ChallengeParticipant.findOne({
      where: {
        userId,
        challengeId: id
      }
    });

    res.json({
      challenge: {
        ...challenge.toJSON(),
        isParticipating: !!participation,
        userProgress: participation || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Join a challenge
exports.joinChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (!challenge.isActive) {
      return res.status(400).json({ error: 'Challenge is not active' });
    }

    // Check if challenge has started
    const now = new Date();
    if (now > new Date(challenge.endDate)) {
      return res.status(400).json({ error: 'Challenge has ended' });
    }

    // Check if already participating
    const existingParticipation = await ChallengeParticipant.findOne({
      where: {
        userId,
        challengeId: id
      }
    });

    if (existingParticipation) {
      return res.status(400).json({ error: 'Already participating in this challenge' });
    }

    // Join the challenge
    const participation = await ChallengeParticipant.create({
      userId,
      challengeId: id,
      progress: {}
    });

    // Increment participant count
    await challenge.increment('participantCount');

    res.status(201).json({
      message: 'Successfully joined challenge',
      participation
    });
  } catch (error) {
    next(error);
  }
};

// Leave a challenge
exports.leaveChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participation = await ChallengeParticipant.findOne({
      where: {
        userId,
        challengeId: id
      }
    });

    if (!participation) {
      return res.status(404).json({ error: 'Not participating in this challenge' });
    }

    if (participation.isCompleted) {
      return res.status(400).json({ error: 'Cannot leave a completed challenge' });
    }

    await participation.destroy();

    // Decrement participant count
    const challenge = await Challenge.findByPk(id);
    if (challenge && challenge.participantCount > 0) {
      await challenge.decrement('participantCount');
    }

    res.json({ message: 'Successfully left challenge' });
  } catch (error) {
    next(error);
  }
};

// Update challenge progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { progress } = req.body;

    const participation = await ChallengeParticipant.findOne({
      where: {
        userId,
        challengeId: id
      }
    });

    if (!participation) {
      return res.status(404).json({ error: 'Not participating in this challenge' });
    }

    await participation.update({
      progress: progress || participation.progress
    });

    res.json({
      message: 'Progress updated successfully',
      participation
    });
  } catch (error) {
    next(error);
  }
};

// Get challenge leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const challenge = await Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const leaderboard = await ChallengeParticipant.findAll({
      where: { challengeId: id },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      order: [
        ['isCompleted', 'DESC'],
        ['rank', 'ASC'],
        ['updatedAt', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

// Get user's challenges
exports.getMyChallenges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let whereClause = { userId };

    if (status === 'completed') {
      whereClause.isCompleted = true;
    } else if (status === 'active') {
      whereClause.isCompleted = false;
    }

    const participations = await ChallengeParticipant.findAll({
      where: whereClause,
      include: [
        {
          model: Challenge,
          as: 'Challenge',
          where: { isActive: true }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      challenges: participations.map(p => ({
        ...p.Challenge.toJSON(),
        userProgress: {
          progress: p.progress,
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
          rank: p.rank
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Create challenge (admin only)
exports.createChallenge = async (req, res, next) => {
  try {
    const { title, description, type, goal, startDate, endDate, reward, coverImage } = req.body;

    if (!title || !description || !goal || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Required fields: title, description, goal, startDate, endDate'
      });
    }

    const challenge = await Challenge.create({
      title,
      description,
      type: type || 'individual',
      goal,
      startDate,
      endDate,
      reward: reward || {},
      coverImage
    });

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    next(error);
  }
};

// Update challenge (admin only)
exports.updateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const challenge = await Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    await challenge.update(updateData);

    res.json({
      message: 'Challenge updated successfully',
      challenge
    });
  } catch (error) {
    next(error);
  }
};

// Delete challenge (admin only)
exports.deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findByPk(id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Soft delete by deactivating
    await challenge.update({ isActive: false });

    res.json({ message: 'Challenge deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
