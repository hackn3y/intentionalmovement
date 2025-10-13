import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService } from '../../services/postService';

/**
 * Fetch posts for social feed
 * @param {Object} params - Pagination params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.filter - Filter type ('all' or 'following')
 */
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10, filter = 'all' }, { rejectWithValue }) => {
    try {
      const response = await postService.getPosts(page, limit, filter);
      return { posts: response.data.posts, page, hasMore: response.data.hasMore };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

/**
 * Fetch user's posts
 * @param {Object} params - User ID and pagination
 */
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await postService.getUserPosts(userId, page, limit);
      return { posts: response.data.posts, page, hasMore: response.data.hasMore };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

/**
 * Fetch single post by ID
 * @param {string} postId - Post ID
 */
export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.getPostById(postId);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

/**
 * Create new post
 * @param {Object} postData - Post data including content, media, etc.
 */
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

/**
 * Update existing post
 * @param {Object} params - Post ID and update data
 */
export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await postService.updatePost(postId, postData);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

/**
 * Delete post
 * @param {string} postId - Post ID
 */
export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, { rejectWithValue }) => {
    try {
      await postService.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

/**
 * Like a post
 * @param {string} postId - Post ID
 */
export const likePost = createAsyncThunk(
  'posts/like',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.likePost(postId);
      return { postId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

/**
 * Unlike a post
 * @param {string} postId - Post ID
 */
export const unlikePost = createAsyncThunk(
  'posts/unlike',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.unlikePost(postId);
      return { postId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike post');
    }
  }
);

/**
 * Fetch comments for a post
 * @param {string} postId - Post ID
 */
export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.getComments(postId);
      return { postId, comments: response.data.comments };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

/**
 * Add comment to post
 * @param {Object} params - Post ID and comment data
 */
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content, text }, { rejectWithValue }) => {
    try {
      // Accept both 'content' and 'text' for backward compatibility
      const commentContent = content || text;
      const response = await postService.addComment(postId, commentContent);
      return { postId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

/**
 * Delete comment
 * @param {Object} params - Post ID and comment ID
 */
export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await postService.deleteComment(postId, commentId);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    userPosts: [],
    currentPost: null,
    comments: {},
    loading: false,
    refreshing: false,
    error: null,
    page: 1,
    hasMore: true,
    createLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        if (state.page === 1) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        if (action.payload.page === 1) {
          state.posts = action.payload.posts;
        } else {
          state.posts = [...state.posts, ...action.payload.posts];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })
      // Fetch User Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload.posts;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Post By ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createLoading = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
        state.userPosts = state.userPosts.filter(p => p._id !== action.payload);
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const updateLike = (post) => {
          const postId = post.id || post._id;
          if (postId === action.payload.postId) {
            post.isLiked = true;
            // Update both field names for backward compatibility
            const currentCount = post.likeCount || post.likesCount || 0;
            post.likeCount = currentCount + 1;
            post.likesCount = currentCount + 1;
          }
        };
        state.posts.forEach(updateLike);
        state.userPosts.forEach(updateLike);
        const currentPostId = state.currentPost?.id || state.currentPost?._id;
        if (currentPostId === action.payload.postId) {
          updateLike(state.currentPost);
        }
      })
      // Unlike Post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const updateUnlike = (post) => {
          const postId = post.id || post._id;
          if (postId === action.payload.postId) {
            post.isLiked = false;
            // Update both field names for backward compatibility
            const currentCount = post.likeCount || post.likesCount || 1;
            post.likeCount = Math.max(currentCount - 1, 0);
            post.likesCount = Math.max(currentCount - 1, 0);
          }
        };
        state.posts.forEach(updateUnlike);
        state.userPosts.forEach(updateUnlike);
        const currentPostId = state.currentPost?.id || state.currentPost?._id;
        if (currentPostId === action.payload.postId) {
          updateUnlike(state.currentPost);
        }
      })
      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (!state.comments[action.payload.postId]) {
          state.comments[action.payload.postId] = [];
        }
        state.comments[action.payload.postId].push(action.payload.comment);

        const updateCommentCount = (post) => {
          const postId = post.id || post._id;
          if (postId === action.payload.postId) {
            // Update both field names for backward compatibility
            const currentCount = post.commentCount || post.commentsCount || 0;
            post.commentCount = currentCount + 1;
            post.commentsCount = currentCount + 1;
          }
        };
        state.posts.forEach(updateCommentCount);
        const currentPostId = state.currentPost?.id || state.currentPost?._id;
        if (currentPostId === action.payload.postId) {
          updateCommentCount(state.currentPost);
          // Also update comments array in currentPost
          if (!state.currentPost.comments) {
            state.currentPost.comments = [];
          }
          state.currentPost.comments.push(action.payload.comment);
        }
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        if (state.comments[action.payload.postId]) {
          state.comments[action.payload.postId] = state.comments[action.payload.postId].filter(
            c => c._id !== action.payload.commentId
          );
        }

        const updateCommentCount = (post) => {
          const postId = post.id || post._id;
          if (postId === action.payload.postId) {
            // Update both field names for backward compatibility
            const currentCount = post.commentCount || post.commentsCount || 1;
            post.commentCount = Math.max(currentCount - 1, 0);
            post.commentsCount = Math.max(currentCount - 1, 0);
          }
        };
        state.posts.forEach(updateCommentCount);
        const currentPostId = state.currentPost?.id || state.currentPost?._id;
        if (currentPostId === action.payload.postId) {
          updateCommentCount(state.currentPost);
          // Also update comments array in currentPost
          if (state.currentPost.comments) {
            state.currentPost.comments = state.currentPost.comments.filter(
              c => (c.id || c._id) !== action.payload.commentId
            );
          }
        }
      });
  },
});

export const { clearError, clearCurrentPost, clearPosts, setRefreshing } = postsSlice.actions;
export default postsSlice.reducer;
