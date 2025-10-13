import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import { updateProfile } from './authSlice';

/**
 * Fetch user profile by ID
 * @param {string} userId - User ID
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

/**
 * Follow a user
 * @param {string} userId - User ID to follow
 */
export const followUser = createAsyncThunk(
  'user/follow',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.followUser(userId);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

/**
 * Unfollow a user
 * @param {string} userId - User ID to unfollow
 */
export const unfollowUser = createAsyncThunk(
  'user/unfollow',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.unfollowUser(userId);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

/**
 * Fetch user's followers
 * @param {string} userId - User ID
 */
export const fetchFollowers = createAsyncThunk(
  'user/fetchFollowers',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getFollowers(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followers');
    }
  }
);

/**
 * Fetch user's following
 * @param {string} userId - User ID
 */
export const fetchFollowing = createAsyncThunk(
  'user/fetchFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getFollowing(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch following');
    }
  }
);

/**
 * Fetch user stats
 * @param {string} userId - User ID
 */
export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

/**
 * Search users
 * @param {string} query - Search query
 */
export const searchUsers = createAsyncThunk(
  'user/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentProfile: null,
    followers: [],
    following: [],
    stats: {
      followers: 0,
      following: 0,
      posts: 0,
      workouts: 0,
    },
    searchResults: [],
    loading: false,
    error: null,
    followLoading: {},
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
      state.followers = [];
      state.following = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { user: {...} }, extract the user object
        state.currentProfile = action.payload.user || action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Follow User
      .addCase(followUser.pending, (state, action) => {
        state.followLoading[action.meta.arg] = true;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followLoading[action.payload.userId] = false;
        const currentProfileId = state.currentProfile?.id || state.currentProfile?._id;
        if (state.currentProfile && currentProfileId === action.payload.userId) {
          state.currentProfile.isFollowing = true;
          state.currentProfile.followersCount = (state.currentProfile.followersCount || 0) + 1;
        }
        state.stats.following += 1;
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      // Unfollow User
      .addCase(unfollowUser.pending, (state, action) => {
        state.followLoading[action.meta.arg] = true;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followLoading[action.payload.userId] = false;
        const currentProfileId = state.currentProfile?.id || state.currentProfile?._id;
        if (state.currentProfile && currentProfileId === action.payload.userId) {
          state.currentProfile.isFollowing = false;
          state.currentProfile.followersCount = Math.max((state.currentProfile.followersCount || 1) - 1, 0);
        }
        state.stats.following = Math.max(state.stats.following - 1, 0);
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { users: [...], pagination: {...} }
        state.searchResults = action.payload.users || action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Listen to auth/updateProfile to sync currentProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        // If currentProfile exists and matches the updated user, sync it
        const currentProfileId = state.currentProfile?.id || state.currentProfile?._id;
        const updatedUserId = action.payload?.id || action.payload?._id;
        if (state.currentProfile && currentProfileId === updatedUserId) {
          state.currentProfile = {
            ...state.currentProfile,
            ...action.payload,
          };
        }
      });
  },
});

export const { clearError, clearSearchResults, clearCurrentProfile } = userSlice.actions;
export default userSlice.reducer;
