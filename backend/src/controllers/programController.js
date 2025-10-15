const { Op } = require('sequelize');
const { Program, Purchase, Progress, User } = require('../models');
const AchievementService = require('../services/achievementService');
const Fuse = require('fuse.js');

// Get all programs (marketplace)
exports.getPrograms = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, category, search, featured } = req.query;

    let whereClause = { isPublished: true };

    if (category) {
      whereClause.category = category;
    }

    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // If search is provided, use fuzzy search
    if (search && search.trim()) {
      // First, get all programs matching the base filters (category, featured, published)
      const allPrograms = await Program.findAll({
        where: whereClause,
        order: [
          ['isFeatured', 'DESC'],
          ['enrollmentCount', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      // Configure Fuse.js for fuzzy searching
      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'description', weight: 0.2 },
          { name: 'instructorName', weight: 0.1 }
        ],
        threshold: 0.4, // 0 = exact match, 1 = match anything (0.4 is generous for typos)
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: true
      };

      const fuse = new Fuse(allPrograms.map(p => p.toJSON()), fuseOptions);
      const searchResults = fuse.search(search.trim());

      // Extract the programs from search results
      const programs = searchResults
        .map(result => result.item)
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

      return res.json({
        programs,
        pagination: {
          total: searchResults.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + programs.length < searchResults.length
        }
      });
    }

    // No search - use normal filtering
    const programs = await Program.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['isFeatured', 'DESC'],
        ['enrollmentCount', 'DESC'],
        ['createdAt', 'DESC']
      ]
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

// Get single program
exports.getProgram = async (req, res, next) => {
  try {
    const { id } = req.params;

    const program = await Program.findOne({
      where: {
        [Op.or]: [{ id }, { slug: id }]
      }
    });

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (!program.isPublished && req.user.role !== 'admin') {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Check if user has purchased this program
    let hasPurchased = false;
    if (req.user) {
      const purchase = await Purchase.findOne({
        where: {
          userId: req.user.id,
          programId: program.id,
          status: 'completed'
        }
      });
      hasPurchased = !!purchase;
    }

    res.json({
      program: {
        ...program.toJSON(),
        hasPurchased
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create program (admin only)
exports.createProgram = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      longDescription,
      instructorName,
      category,
      price,
      discountPrice,
      duration,
      coverImage,
      previewVideoUrl,
      tags,
      features,
      outcomes,
      lessons,
      resources,
      requirements
    } = req.body;

    if (!title || !slug || !description || price === undefined) {
      return res.status(400).json({ error: 'Required fields: title, slug, description, price' });
    }

    // Check if slug already exists
    const existingProgram = await Program.findOne({ where: { slug } });

    if (existingProgram) {
      return res.status(409).json({ error: 'Slug already exists' });
    }

    const program = await Program.create({
      title,
      slug,
      description,
      longDescription,
      instructorName: instructorName || 'Intentional Movement',
      category: category || 'all-levels',
      price,
      discountPrice,
      duration,
      coverImage,
      previewVideoUrl,
      tags: tags || [],
      features: features || [],
      outcomes: outcomes || [],
      lessons: lessons || [],
      resources: resources || [],
      requirements: requirements || []
    });

    res.status(201).json({
      message: 'Program created successfully',
      program
    });
  } catch (error) {
    next(error);
  }
};

// Update program (admin only)
exports.updateProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const program = await Program.findByPk(id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // If slug is being updated, check for conflicts
    if (updateData.slug && updateData.slug !== program.slug) {
      const existingProgram = await Program.findOne({ where: { slug: updateData.slug } });

      if (existingProgram) {
        return res.status(409).json({ error: 'Slug already exists' });
      }
    }

    await program.update(updateData);

    res.json({
      message: 'Program updated successfully',
      program
    });
  } catch (error) {
    next(error);
  }
};

// Delete program (admin only)
exports.deleteProgram = async (req, res, next) => {
  try {
    const { id } = req.params;

    const program = await Program.findByPk(id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Check if there are active purchases
    const activePurchases = await Purchase.count({
      where: {
        programId: id,
        status: 'completed'
      }
    });

    if (activePurchases > 0) {
      return res.status(400).json({
        error: 'Cannot delete program with active purchases. Consider unpublishing instead.'
      });
    }

    await program.destroy();

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user's purchased programs
exports.getMyPrograms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const purchases = await Purchase.findAll({
      where: {
        userId,
        status: 'completed'
      },
      include: [
        {
          model: Program,
          as: 'program'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Purchase.count({
      where: {
        userId,
        status: 'completed'
      }
    });

    res.json({
      programs: purchases.map(p => p.program),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + purchases.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get program progress
exports.getProgramProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has purchased the program
    const purchase = await Purchase.findOne({
      where: {
        userId,
        programId: id,
        status: 'completed'
      }
    });

    if (!purchase) {
      return res.status(403).json({ error: 'You have not purchased this program' });
    }

    const progress = await Progress.findOne({
      where: {
        userId,
        programId: id
      }
    });

    if (!progress) {
      // Create initial progress record
      const newProgress = await Progress.create({
        userId,
        programId: id,
        completedLessons: [],
        currentLesson: 0,
        progressPercentage: 0
      });

      return res.json({ progress: newProgress });
    }

    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

// Update program progress
exports.updateProgramProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { completedLessons, currentLesson, progressPercentage } = req.body;

    // Check if user has purchased the program
    const purchase = await Purchase.findOne({
      where: {
        userId,
        programId: id,
        status: 'completed'
      }
    });

    if (!purchase) {
      return res.status(403).json({ error: 'You have not purchased this program' });
    }

    let progress = await Progress.findOne({
      where: {
        userId,
        programId: id
      }
    });

    if (!progress) {
      progress = await Progress.create({
        userId,
        programId: id,
        completedLessons: completedLessons || [],
        currentLesson: currentLesson || 0,
        progressPercentage: progressPercentage || 0
      });
    } else {
      await progress.update({
        completedLessons: completedLessons !== undefined ? completedLessons : progress.completedLessons,
        currentLesson: currentLesson !== undefined ? currentLesson : progress.currentLesson,
        progressPercentage: progressPercentage !== undefined ? progressPercentage : progress.progressPercentage,
        lastAccessedAt: new Date()
      });
    }

    // Check for progress-related achievements
    AchievementService.checkProgressAchievements(userId, id).catch(err => {
      console.error('Achievement check error:', err);
    });

    res.json({
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    next(error);
  }
};
