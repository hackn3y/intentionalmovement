const { Op } = require('sequelize');
const { Post, User, Comment, Like, Follow } = require('../models');

// Get feed (paginated)
exports.getFeed = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, filter = 'all' } = req.query;
    const userId = req.user.id;

    let whereClause = {
      isHidden: false,
      visibility: {
        [Op.in]: ['public', 'followers']
      }
    };

    // Filter by following
    if (filter === 'following') {
      const following = await Follow.findAll({
        where: { followerId: userId },
        attributes: ['followingId']
      });

      const followingIds = following.map(f => f.followingId);
      whereClause.userId = { [Op.in]: followingIds };
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage', 'isVerified']
        },
        {
          model: Comment,
          as: 'comments',
          limit: 3,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'displayName', 'profileImage']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Check if current user has liked each post
    const postIds = posts.map(p => p.id);
    const userLikes = await Like.findAll({
      where: {
        userId,
        postId: { [Op.in]: postIds }
      },
      attributes: ['postId']
    });

    const likedPostIds = new Set(userLikes.map(l => l.postId));

    const postsWithLikeStatus = posts.map(post => {
      const postJSON = post.toJSON();
      return {
        ...postJSON,
        isLiked: likedPostIds.has(post.id),
        isLikedByCurrentUser: likedPostIds.has(post.id), // Keep for backwards compatibility
        likesCount: postJSON.likeCount || 0, // Add plural form for admin dashboard
        commentsCount: postJSON.commentCount || 0 // Add plural form for admin dashboard
      };
    });

    const totalCount = await Post.count({ where: whereClause });

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + posts.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a post
exports.createPost = async (req, res, next) => {
  try {
    const { content, mediaType, mediaUrl, thumbnailUrl, hashtags, visibility } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await Post.create({
      userId: req.user.id,
      content,
      mediaType: mediaType || 'none',
      mediaUrl,
      thumbnailUrl,
      hashtags: hashtags || [],
      visibility: visibility || 'public'
    });

    // Fetch the complete post with user data
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage', 'isVerified']
        }
      ]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost
    });
  } catch (error) {
    next(error);
  }
};

// Get single post
exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage', 'isVerified']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'displayName', 'profileImage']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.isHidden && post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if current user has liked the post
    const userLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId: id
      }
    });

    res.json({
      post: {
        ...post.toJSON(),
        isLiked: !!userLike,
        isLikedByCurrentUser: !!userLike // Keep for backwards compatibility
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, visibility } = req.body;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ensure user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this post' });
    }

    await post.update({
      content: content || post.content,
      visibility: visibility || post.visibility
    });

    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage', 'isVerified']
        }
      ]
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ensure user owns the post or is admin
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Like post
exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      where: {
        userId,
        postId: id
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    await Like.create({
      userId,
      postId: id
    });

    // Increment like count
    await post.increment('likeCount');

    res.status(201).json({
      message: 'Post liked successfully',
      likeCount: post.likeCount + 1
    });
  } catch (error) {
    next(error);
  }
};

// Unlike post
exports.unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({
      where: {
        userId,
        postId: id
      }
    });

    if (!like) {
      return res.status(404).json({ error: 'Like not found' });
    }

    const post = await Post.findByPk(id);

    await like.destroy();

    // Decrement like count
    if (post && post.likeCount > 0) {
      await post.decrement('likeCount');
    }

    res.json({
      message: 'Post unliked successfully',
      likeCount: Math.max(0, post.likeCount - 1)
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      userId: req.user.id,
      postId: id,
      content
    });

    // Increment comment count
    await post.increment('commentCount');

    // Fetch the complete comment with user data
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ]
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: createdComment,
      commentCount: post.commentCount + 1
    });
  } catch (error) {
    next(error);
  }
};

// Get comments
exports.getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await Comment.findAll({
      where: { postId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Comment.count({ where: { postId: id } });

    res.json({
      comments,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + comments.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Repost
exports.repost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const originalPost = await Post.findByPk(id);

    if (!originalPost) {
      return res.status(404).json({ error: 'Original post not found' });
    }

    // Create repost
    const repost = await Post.create({
      userId: req.user.id,
      content: content || '',
      isRepost: true,
      originalPostId: id,
      visibility: 'public'
    });

    // Increment share count on original post
    await originalPost.increment('shareCount');

    // Fetch the complete repost with user data
    const createdRepost = await Post.findByPk(repost.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'profileImage', 'isVerified']
        }
      ]
    });

    res.status(201).json({
      message: 'Post reposted successfully',
      post: createdRepost
    });
  } catch (error) {
    next(error);
  }
};
