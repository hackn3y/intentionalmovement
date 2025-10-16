const { Op } = require('sequelize');
const { User, Post, Report, Purchase, Subscription, Program, Challenge, Achievement } = require('../models');
const { sequelize } = require('../models');

// Safe attributes that exist in production database
const SAFE_USER_ATTRIBUTES = ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt'];

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalPurchases,
      activePrograms,
      activeSubscriptions,
      pendingReports,
      totalRevenue
    ] = await Promise.all([
      User.count(),
      // TEMPORARY: Skip isActive check since column doesn't exist in production
      // User.count({ where: { isActive: true } }),
      Post.count(),
      Purchase.count({ where: { status: 'completed' } }),
      Program.count({ where: { isPublished: true } }),
      Subscription.count({ where: { status: 'active' } }),
      Report.count({ where: { status: 'pending' } }),
      Purchase.sum('amount', { where: { status: 'completed' } })
    ]);

    // Get new users this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.count({
      where: {
        createdAt: { [Op.gte]: thisMonthStart }
      }
    });

    // Get recent activity - fetch more items for better chronological mixing
    const [recentUsers, recentPosts, recentPurchases] = await Promise.all([
      User.findAll({
        attributes: ['id', 'username', 'displayName', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 20
      }),
      Post.findAll({
        attributes: ['id', 'content', 'createdAt'],
        include: [{ model: User, as: 'user', attributes: ['username', 'displayName'] }],
        order: [['createdAt', 'DESC']],
        limit: 20
      }),
      Purchase.findAll({
        attributes: ['id', 'amount', 'createdAt'],
        include: [
          { model: User, as: 'user', attributes: ['username', 'displayName'] },
          { model: Program, as: 'program', attributes: ['title'] }
        ],
        where: { status: 'completed' },
        order: [['createdAt', 'DESC']],
        limit: 20
      })
    ]);

    // Format recent activity with actual timestamps for proper sorting
    const recentActivity = [
      ...recentUsers.map(u => ({
        type: 'user',
        icon: '👤',
        label: 'New User',
        description: `${u.displayName || u.username} joined`,
        timestamp: new Date(u.createdAt).getTime(),
        time: formatTimeAgo(u.createdAt)
      })),
      ...recentPosts.map(p => ({
        type: 'post',
        icon: '📝',
        label: 'New Post',
        description: `${p.user?.displayName || p.user?.username} posted`,
        timestamp: new Date(p.createdAt).getTime(),
        time: formatTimeAgo(p.createdAt)
      })),
      ...recentPurchases.map(p => ({
        type: 'purchase',
        icon: '💰',
        label: 'Purchase',
        description: `${p.user?.displayName || p.user?.username} bought ${p.program?.title}`,
        timestamp: new Date(p.createdAt).getTime(),
        time: formatTimeAgo(p.createdAt)
      }))
    ]
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by actual timestamp
      .slice(0, 15); // Show top 15 most recent activities

    // Get popular programs
    const popularPrograms = await sequelize.query(`
      SELECT
        p.id,
        p.title,
        p.price,
        COUNT(pu.id) as purchases
      FROM Programs p
      LEFT JOIN Purchases pu ON pu.programId = p.id AND pu.status = 'completed'
      WHERE p.isPublished = 1
      GROUP BY p.id
      ORDER BY purchases DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({
      totalUsers,
      activeUsers: totalUsers, // TEMPORARY: Return totalUsers since isActive column doesn't exist
      newUsersThisMonth,
      totalPosts,
      totalPurchases,
      activePrograms,
      activeSubscriptions,
      pendingReports,
      totalRevenue: parseFloat(totalRevenue) || 0,
      recentActivity,
      popularPrograms: popularPrograms.map(p => ({
        ...p,
        price: parseFloat(p.price)
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

// Get all users (with filtering and pagination)
exports.getUsers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    // TEMPORARY: Removed role and isActive filters since columns don't exist in production

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { displayName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // TEMPORARY: Skip role and isActive filters
    // if (role) {
    //   whereClause.role = role;
    // }
    // if (isActive !== undefined) {
    //   whereClause.isActive = isActive === 'true';
    // }

    const users = await User.findAll({
      where: whereClause,
      attributes: SAFE_USER_ATTRIBUTES, // Use explicit attributes instead of exclude
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await User.count({ where: whereClause });

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

// Get single user (admin)
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: SAFE_USER_ATTRIBUTES // Use explicit attributes
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional stats
    const [postsCount, followersCount, followingCount] = await Promise.all([
      Post.count({ where: { userId: id } }),
      sequelize.query(
        'SELECT COUNT(*) as count FROM "Follows" WHERE "followingId" = :userId',
        { replacements: { userId: id }, type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT COUNT(*) as count FROM "Follows" WHERE "followerId" = :userId',
        { replacements: { userId: id }, type: sequelize.QueryTypes.SELECT }
      )
    ]);

    const userData = user.toJSON();
    userData.postsCount = postsCount;
    userData.followersCount = followersCount[0]?.count || 0;
    userData.followingCount = followingCount[0]?.count || 0;

    res.json(userData);
  } catch (error) {
    next(error);
  }
};

// Update user (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive, isVerified, subscriptionTier, subscriptionStatus } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};

    if (role) {
      updateData.role = role;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (isVerified !== undefined) {
      updateData.isVerified = isVerified;
    }

    if (subscriptionTier) {
      updateData.subscriptionTier = subscriptionTier;
    }

    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
    }

    await user.update(updateData);

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Ban user
exports.banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Ban reason is required' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot ban admin users' });
    }

    await user.update({
      isBanned: true,
      banReason: reason,
      bannedAt: new Date(),
      bannedBy: req.user.id
    });

    res.json({
      message: 'User banned successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason
      }
    });
  } catch (error) {
    next(error);
  }
};

// Unban user
exports.unbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      isBanned: false,
      banReason: null,
      bannedAt: null,
      bannedBy: null
    });

    res.json({
      message: 'User unbanned successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all reports
exports.getReports = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status, contentType } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (contentType) {
      whereClause.contentType = contentType;
    }

    const reports = await Report.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Report.count({ where: whereClause });

    res.json({
      reports,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + reports.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single report
exports.getReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Fetch the reported content based on type
    let reportedContent = null;

    switch (report.contentType) {
      case 'post':
        reportedContent = await Post.findByPk(report.contentId, {
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'displayName', 'profileImage']
            }
          ]
        });
        break;

      case 'user':
        reportedContent = await User.findByPk(report.contentId, {
          attributes: { exclude: ['password'] }
        });
        break;

      // Add other content types as needed
    }

    res.json({
      report,
      reportedContent
    });
  } catch (error) {
    next(error);
  }
};

// Update report status
exports.updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, action } = req.body;

    const report = await Report.findByPk(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await report.update({
      status: status || report.status,
      action: action || report.action,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    // Take action based on the report
    if (status === 'resolved' && action) {
      await handleReportAction(report, action);
    }

    res.json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

// Handle report action
async function handleReportAction(report, action) {
  switch (action) {
    case 'hide_content':
      if (report.contentType === 'post') {
        await Post.update(
          { isHidden: true },
          { where: { id: report.contentId } }
        );
      }
      break;

    case 'delete_content':
      if (report.contentType === 'post') {
        await Post.destroy({ where: { id: report.contentId } });
      }
      break;

    case 'ban_user':
      if (report.contentType === 'user') {
        await User.update(
          { isActive: false },
          { where: { id: report.contentId } }
        );
      } else {
        // Ban the content creator
        const content = await getContentById(report.contentType, report.contentId);
        if (content && content.userId) {
          await User.update(
            { isActive: false },
            { where: { id: content.userId } }
          );
        }
      }
      break;

    case 'warning':
      // TODO: Send warning notification to user
      break;
  }
}

// Helper to get content by ID
async function getContentById(contentType, contentId) {
  switch (contentType) {
    case 'post':
      return await Post.findByPk(contentId);
    case 'user':
      return await User.findByPk(contentId);
    default:
      return null;
  }
}

// Get analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      newUsers,
      newPosts,
      newPurchases,
      newSubscriptions
    ] = await Promise.all([
      User.count({
        where: {
          createdAt: { [Op.between]: [start, end] }
        }
      }),
      Post.count({
        where: {
          createdAt: { [Op.between]: [start, end] }
        }
      }),
      Purchase.count({
        where: {
          createdAt: { [Op.between]: [start, end] },
          status: 'completed'
        }
      }),
      Subscription.count({
        where: {
          createdAt: { [Op.between]: [start, end] }
        }
      })
    ]);

    // Calculate revenue
    const revenue = await Purchase.sum('amount', {
      where: {
        createdAt: { [Op.between]: [start, end] },
        status: 'completed'
      }
    });

    // Generate time-series data (daily for last 30 days)
    const userGrowth = await generateTimeSeriesData(User, start, end, 'users');
    const revenueData = await generateTimeSeriesRevenue(start, end);

    res.json({
      analytics: {
        period: { startDate: start, endDate: end },
        newUsers,
        newPosts,
        newPurchases,
        newSubscriptions,
        revenue: parseFloat(revenue) || 0
      },
      userGrowth,
      revenue: revenueData
    });
  } catch (error) {
    next(error);
  }
};

// Generate time-series data for user growth
async function generateTimeSeriesData(Model, startDate, endDate, label) {
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // If period is more than 60 days, group by week
  // If period is more than 180 days, group by month
  // Otherwise, group by day

  if (days > 180) {
    // Group by month
    const data = await sequelize.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COUNT(*)::int as ${label}
      FROM "${Model.tableName}"
      WHERE "createdAt" BETWEEN :start AND :end
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `, {
      replacements: { start: startDate, end: endDate },
      type: sequelize.QueryTypes.SELECT
    });
    return data;
  } else if (days > 60) {
    // Group by week
    const data = await sequelize.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('week', "createdAt"), 'Mon DD') as month,
        COUNT(*)::int as ${label}
      FROM "${Model.tableName}"
      WHERE "createdAt" BETWEEN :start AND :end
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY DATE_TRUNC('week', "createdAt")
    `, {
      replacements: { start: startDate, end: endDate },
      type: sequelize.QueryTypes.SELECT
    });
    return data;
  } else {
    // Group by day - for 30 days or less, show last 7 days for readability
    const displayStart = days <= 30 ? new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) : startDate;

    const data = await sequelize.query(`
      SELECT
        TO_CHAR("createdAt", 'Mon DD') as month,
        COUNT(*)::int as ${label}
      FROM "${Model.tableName}"
      WHERE "createdAt" BETWEEN :start AND :end
      GROUP BY DATE_TRUNC('day', "createdAt"), TO_CHAR("createdAt", 'Mon DD')
      ORDER BY DATE_TRUNC('day', "createdAt")
    `, {
      replacements: { start: displayStart, end: endDate },
      type: sequelize.QueryTypes.SELECT
    });
    return data;
  }
}

// Generate time-series data for revenue
async function generateTimeSeriesRevenue(startDate, endDate) {
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  if (days > 180) {
    // Group by month
    const data = await sequelize.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COALESCE(SUM(amount), 0)::float as revenue
      FROM "Purchases"
      WHERE "createdAt" BETWEEN :start AND :end
        AND status = 'completed'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `, {
      replacements: { start: startDate, end: endDate },
      type: sequelize.QueryTypes.SELECT
    });
    return data;
  } else if (days > 60) {
    // Group by week
    const data = await sequelize.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('week', "createdAt"), 'Mon DD') as month,
        COALESCE(SUM(amount), 0)::float as revenue
      FROM "Purchases"
      WHERE "createdAt" BETWEEN :start AND :end
        AND status = 'completed'
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY DATE_TRUNC('week', "createdAt")
    `, {
      replacements: { start: startDate, end: endDate },
      type: sequelize.QueryTypes.SELECT
    });
    return data;
  } else {
    // Group by day - for 30 days or less, show last 7 days
    const displayStart = days <= 30 ? new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) : startDate;

    const data = await sequelize.query(`
      SELECT
        TO_CHAR("createdAt", 'Mon DD') as month,
        COALESCE(SUM(amount), 0)::float as revenue
      FROM "Purchases"
      WHERE "createdAt" BETWEEN :start AND :end
        AND status = 'completed'
      GROUP BY DATE_TRUNC('day', "createdAt"), TO_CHAR("createdAt", 'Mon DD')
      ORDER BY DATE_TRUNC('day', "createdAt")
    `, {
      replacements: { start: displayStart, end: endDate },
      type: sequelize.QueryTypes.SELECT
    });
    return data;
  }
}

// Get content moderation queue
exports.getModerationQueue = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Get posts that have been reported but not reviewed
    const reportedPosts = await Report.findAll({
      where: {
        contentType: 'post',
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'displayName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Get the actual posts
    const postIds = reportedPosts.map(r => r.contentId);
    const posts = await Post.findAll({
      where: { id: { [Op.in]: postIds } },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ]
    });

    const postsMap = new Map(posts.map(p => [p.id, p]));

    const queue = reportedPosts.map(report => ({
      report,
      content: postsMap.get(report.contentId)
    }));

    res.json({ queue });
  } catch (error) {
    next(error);
  }
};

// Get all programs for admin (includes unpublished)
exports.getPrograms = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, category, search, isPublished } = req.query;

    let whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === 'true';
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const programs = await Program.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Program.count({ where: whereClause });

    res.json({
      programs,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + programs.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Bulk actions
exports.bulkAction = async (req, res, next) => {
  try {
    const { action, targetType, targetIds } = req.body;

    if (!action || !targetType || !targetIds || !Array.isArray(targetIds)) {
      return res.status(400).json({ error: 'Invalid bulk action request' });
    }

    let affectedCount = 0;

    switch (targetType) {
      case 'users':
        if (action === 'deactivate') {
          const result = await User.update(
            { isActive: false },
            { where: { id: { [Op.in]: targetIds }, role: { [Op.ne]: 'admin' } } }
          );
          affectedCount = result[0];
        } else if (action === 'verify') {
          const result = await User.update(
            { isVerified: true },
            { where: { id: { [Op.in]: targetIds } } }
          );
          affectedCount = result[0];
        }
        break;

      case 'posts':
        if (action === 'hide') {
          const result = await Post.update(
            { isHidden: true },
            { where: { id: { [Op.in]: targetIds } } }
          );
          affectedCount = result[0];
        } else if (action === 'delete') {
          affectedCount = await Post.destroy({
            where: { id: { [Op.in]: targetIds } }
          });
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid target type' });
    }

    res.json({
      message: 'Bulk action completed successfully',
      affectedCount
    });
  } catch (error) {
    next(error);
  }
};
