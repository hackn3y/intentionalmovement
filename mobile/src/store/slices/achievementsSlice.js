import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { achievementService } from '../../services/achievementService';

/**
 * Fetch user achievements
 * @param {string} userId - User ID (optional, defaults to current user)
 */
export const fetchAchievements = createAsyncThunk(
  'achievements/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await achievementService.getAchievements(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

/**
 * Fetch all available achievement definitions
 */
export const fetchAllAchievements = createAsyncThunk(
  'achievements/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getAllAchievements();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all achievements');
    }
  }
);

/**
 * Fetch leaderboard
 * @param {Object} params - Leaderboard params
 * @param {string} params.type - Leaderboard type (weekly, monthly, allTime)
 * @param {number} params.limit - Number of entries to fetch
 */
export const fetchLeaderboard = createAsyncThunk(
  'achievements/fetchLeaderboard',
  async ({ type = 'weekly', limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await achievementService.getLeaderboard(type, limit);
      return { type, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

/**
 * Claim an achievement
 * @param {string} achievementId - Achievement ID to claim
 */
export const claimAchievement = createAsyncThunk(
  'achievements/claim',
  async (achievementId, { rejectWithValue }) => {
    try {
      const response = await achievementService.claimAchievement(achievementId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim achievement');
    }
  }
);

/**
 * Fetch user's rank and stats
 */
export const fetchUserRank = createAsyncThunk(
  'achievements/fetchRank',
  async (_, { rejectWithValue }) => {
    try {
      const response = await achievementService.getUserRank();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rank');
    }
  }
);

/**
 * Track achievement progress
 * @param {Object} progressData - Progress tracking data
 */
export const trackProgress = createAsyncThunk(
  'achievements/trackProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const response = await achievementService.trackProgress(progressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track progress');
    }
  }
);

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState: {
    userAchievements: [],
    allAchievements: [],
    leaderboards: {
      weekly: [],
      monthly: [],
      allTime: [],
    },
    userRank: {
      rank: null,
      points: 0,
      level: 1,
    },
    unclaimedAchievements: [],
    loading: false,
    error: null,
    newAchievement: null, // For showing achievement unlock notification
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNewAchievement: (state) => {
      state.newAchievement = null;
    },
    setNewAchievement: (state, action) => {
      state.newAchievement = action.payload;
      state.unclaimedAchievements.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Achievements
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.userAchievements = action.payload;
        state.unclaimedAchievements = action.payload.filter(a => !a.claimed);
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Achievements
      .addCase(fetchAllAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.allAchievements = action.payload;
      })
      .addCase(fetchAllAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboards[action.payload.type] = action.payload.data;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Claim Achievement
      .addCase(claimAchievement.pending, (state) => {
        state.loading = true;
      })
      .addCase(claimAchievement.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.userAchievements.findIndex(
          a => a._id === action.payload._id
        );
        if (index !== -1) {
          state.userAchievements[index] = action.payload;
        }
        state.unclaimedAchievements = state.unclaimedAchievements.filter(
          a => a._id !== action.payload._id
        );
        // Update user points
        state.userRank.points += action.payload.points || 0;
      })
      .addCase(claimAchievement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Rank
      .addCase(fetchUserRank.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.loading = false;
        state.userRank = action.payload;
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Track Progress
      .addCase(trackProgress.fulfilled, (state, action) => {
        // Update achievement progress
        const achievements = action.payload;
        achievements.forEach((updatedAchievement) => {
          const index = state.userAchievements.findIndex(
            a => a._id === updatedAchievement._id
          );
          if (index !== -1) {
            state.userAchievements[index] = updatedAchievement;
          } else {
            state.userAchievements.push(updatedAchievement);
          }

          // Check if newly unlocked
          if (updatedAchievement.unlocked && !updatedAchievement.claimed) {
            const alreadyUnclaimed = state.unclaimedAchievements.some(
              a => a._id === updatedAchievement._id
            );
            if (!alreadyUnclaimed) {
              state.newAchievement = updatedAchievement;
              state.unclaimedAchievements.push(updatedAchievement);
            }
          }
        });
      });
  },
});

export const { clearError, clearNewAchievement, setNewAchievement } = achievementsSlice.actions;
export default achievementsSlice.reducer;
