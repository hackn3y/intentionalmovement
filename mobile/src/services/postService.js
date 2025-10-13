import api from './api';

/**
 * Post service
 */
export const postService = {
  /**
   * Get posts for feed
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} filter - Filter type ('all' or 'following')
   */
  getPosts: (page = 1, limit = 10, filter = 'all') => {
    return api.get(`/posts?page=${page}&limit=${limit}&filter=${filter}`);
  },

  /**
   * Get user's posts
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getUserPosts: (userId, page = 1, limit = 10) => {
    return api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  },

  /**
   * Get single post by ID
   * @param {string} postId - Post ID
   */
  getPostById: (postId) => {
    return api.get(`/posts/${postId}`);
  },

  /**
   * Create new post
   * @param {Object} postData - Post data
   * @param {string} postData.content - Post text content
   * @param {string} postData.mediaUrl - Media URL (optional)
   * @param {string} postData.mediaType - Media type (image, video)
   */
  createPost: (postData) => {
    return api.post('/posts', postData);
  },

  /**
   * Update existing post
   * @param {string} postId - Post ID
   * @param {Object} postData - Updated post data
   */
  updatePost: (postId, postData) => {
    return api.put(`/posts/${postId}`, postData);
  },

  /**
   * Delete post
   * @param {string} postId - Post ID
   */
  deletePost: (postId) => {
    return api.delete(`/posts/${postId}`);
  },

  /**
   * Like a post
   * @param {string} postId - Post ID
   */
  likePost: (postId) => {
    return api.post(`/posts/${postId}/like`);
  },

  /**
   * Unlike a post
   * @param {string} postId - Post ID
   */
  unlikePost: (postId) => {
    return api.delete(`/posts/${postId}/like`);
  },

  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   */
  getComments: (postId) => {
    return api.get(`/posts/${postId}/comments`);
  },

  /**
   * Add comment to post
   * @param {string} postId - Post ID
   * @param {string} content - Comment content
   */
  addComment: (postId, content) => {
    return api.post(`/posts/${postId}/comments`, { content });
  },

  /**
   * Update comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @param {string} content - Updated comment content
   */
  updateComment: (postId, commentId, content) => {
    return api.put(`/posts/${postId}/comments/${commentId}`, { content });
  },

  /**
   * Delete comment
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   */
  deleteComment: (postId, commentId) => {
    return api.delete(`/posts/${postId}/comments/${commentId}`);
  },

  /**
   * Upload post media
   * @param {FormData} formData - Form data with media file
   */
  uploadMedia: (formData) => {
    return api.post('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Report a post
   * @param {string} postId - Post ID
   * @param {Object} reportData - Report details
   */
  reportPost: (postId, reportData) => {
    return api.post(`/posts/${postId}/report`, reportData);
  },

  /**
   * Get trending posts
   */
  getTrendingPosts: () => {
    return api.get('/posts/trending');
  },
};
