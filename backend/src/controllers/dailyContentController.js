const { Op } = require('sequelize');
const { DailyContent, DailyCheckIn, UserStreak, User } = require('../models');

// Get today's daily content
exports.getTodayContent = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const content = await DailyContent.findOne({
      where: {
        date: today,
        isActive: true
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'No content available for today' });
    }

    // Check if user has already checked in today
    let hasCheckedIn = false;
    if (req.user) {
      const checkIn = await DailyCheckIn.findOne({
        where: {
          userId: req.user.id,
          checkInDate: today
        }
      });
      hasCheckedIn = !!checkIn;
    }

    res.json({
      content,
      hasCheckedIn
    });
  } catch (error) {
    next(error);
  }
};

// Get daily content by date
exports.getContentByDate = async (req, res, next) => {
  try {
    const { date } = req.params; // YYYY-MM-DD

    const content = await DailyContent.findOne({
      where: {
        date,
        isActive: true
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'No content found for this date' });
    }

    res.json({ content });
  } catch (error) {
    next(error);
  }
};

// Get content calendar (past 30 days)
exports.getContentCalendar = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const contents = await DailyContent.findAll({
      where: {
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0]
        },
        isActive: true
      },
      order: [['date', 'DESC']]
    });

    // If user is logged in, get their check-ins
    let checkIns = [];
    if (req.user) {
      checkIns = await DailyCheckIn.findAll({
        where: {
          userId: req.user.id,
          checkInDate: {
            [Op.gte]: startDate.toISOString().split('T')[0]
          }
        }
      });
    }

    const calendar = contents.map(content => ({
      ...content.toJSON(),
      checkedIn: checkIns.some(c => c.checkInDate === content.date)
    }));

    res.json({ calendar });
  } catch (error) {
    next(error);
  }
};

// Check in for today's content
exports.checkIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const { notes, completed } = req.body;

    // Get today's content
    const content = await DailyContent.findOne({
      where: {
        date: today,
        isActive: true
      }
    });

    if (!content) {
      return res.status(404).json({ error: 'No content available for today' });
    }

    // Check if already checked in
    const existingCheckIn = await DailyCheckIn.findOne({
      where: {
        userId,
        checkInDate: today
      }
    });

    if (existingCheckIn) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Create check-in
    const checkIn = await DailyCheckIn.create({
      userId,
      dailyContentId: content.id,
      checkInDate: today,
      viewed: true,
      completed: completed || false,
      notes: notes || null
    });

    // Update streak
    await updateUserStreak(userId, today);

    // Get updated streak info
    const streak = await UserStreak.findOne({ where: { userId } });

    res.json({
      message: 'Check-in recorded successfully',
      checkIn,
      streak
    });
  } catch (error) {
    next(error);
  }
};

// Get user's streak information
exports.getStreak = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let streak = await UserStreak.findOne({ where: { userId } });

    if (!streak) {
      // Create initial streak record
      streak = await UserStreak.create({ userId });
    }

    res.json({ streak });
  } catch (error) {
    next(error);
  }
};

// Get user's check-in history
exports.getCheckInHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 30, offset = 0 } = req.query;

    const checkIns = await DailyCheckIn.findAll({
      where: { userId },
      include: [
        {
          model: DailyContent,
          as: 'dailyContent',
          attributes: ['id', 'date', 'contentType', 'title', 'message']
        }
      ],
      order: [['checkInDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalCount = await DailyCheckIn.count({ where: { userId } });

    res.json({
      checkIns,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + checkIns.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update user streak
async function updateUserStreak(userId, checkInDate) {
  let streak = await UserStreak.findOne({ where: { userId } });

  if (!streak) {
    // Create new streak
    streak = await UserStreak.create({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastCheckIn: checkInDate,
      totalCheckIns: 1
    });
    return streak;
  }

  // Calculate days since last check-in
  const lastDate = new Date(streak.lastCheckIn);
  const currentDate = new Date(checkInDate);
  const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

  let newCurrentStreak = streak.currentStreak;

  if (daysDiff === 1) {
    // Consecutive day - increment streak
    newCurrentStreak = streak.currentStreak + 1;
  } else if (daysDiff > 1) {
    // Streak broken - reset to 1
    newCurrentStreak = 1;
  }
  // If daysDiff === 0, same day check-in (shouldn't happen, but keep current streak)

  const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

  await streak.update({
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastCheckIn: checkInDate,
    totalCheckIns: streak.totalCheckIns + 1
  });

  return streak;
}

// ADMIN ONLY - Create daily content
exports.createDailyContent = async (req, res, next) => {
  try {
    const {
      date,
      contentType,
      title,
      message,
      mediaUrl,
      category,
      isActive
    } = req.body;

    if (!date || !contentType || !title || !message) {
      return res.status(400).json({ error: 'Required fields: date, contentType, title, message' });
    }

    // Check if content already exists for this date
    const existing = await DailyContent.findOne({ where: { date } });
    if (existing) {
      return res.status(409).json({
        error: 'Content already exists for this date. Please choose a different date or edit the existing content.',
        existingContent: {
          id: existing.id,
          title: existing.title,
          contentType: existing.contentType
        }
      });
    }

    const content = await DailyContent.create({
      date,
      contentType,
      title,
      message,
      mediaUrl,
      category,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'Daily content created successfully',
      content
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY - Update daily content
exports.updateDailyContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const content = await DailyContent.findByPk(id);

    if (!content) {
      return res.status(404).json({ error: 'Daily content not found' });
    }

    // If date is being changed, check if new date is available
    if (updateData.date && updateData.date !== content.date) {
      const existing = await DailyContent.findOne({
        where: {
          date: updateData.date,
          id: { [Op.ne]: id } // Exclude current record
        }
      });

      if (existing) {
        return res.status(409).json({ error: 'Content already exists for this date. Please choose a different date.' });
      }
    }

    await content.update(updateData);

    res.json({
      message: 'Daily content updated successfully',
      content
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY - Delete daily content
exports.deleteDailyContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const content = await DailyContent.findByPk(id);

    if (!content) {
      return res.status(404).json({ error: 'Daily content not found' });
    }

    await content.destroy();

    res.json({ message: 'Daily content deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY - Get all daily content
exports.getAllDailyContent = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, contentType, isActive } = req.query;

    const whereClause = {};
    if (contentType) whereClause.contentType = contentType;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const contents = await DailyContent.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalCount = await DailyContent.count({ where: whereClause });

    res.json({
      contents,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + contents.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY - Get content statistics
exports.getContentStats = async (req, res, next) => {
  try {
    const totalContents = await DailyContent.count();
    const activeContents = await DailyContent.count({ where: { isActive: true } });
    const totalCheckIns = await DailyCheckIn.count();
    const uniqueUsers = await DailyCheckIn.count({
      distinct: true,
      col: 'userId'
    });

    const today = new Date().toISOString().split('T')[0];
    const todayCheckIns = await DailyCheckIn.count({
      where: { checkInDate: today }
    });

    res.json({
      totalContents,
      activeContents,
      totalCheckIns,
      uniqueUsers,
      todayCheckIns
    });
  } catch (error) {
    next(error);
  }
};
