import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { challengeService } from '../../services/challengeService';

/**
 * Fetch all active challenges
 * @param {Object} params - Filter params
 */
export const fetchChallenges = createAsyncThunk(
  'challenges/fetchAll',
  async ({ category, status = 'active' } = {}, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallenges({ category, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenges');
    }
  }
);

/**
 * Fetch single challenge details
 * @param {string} challengeId - Challenge ID
 */
export const fetchChallengeById = createAsyncThunk(
  'challenges/fetchById',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeById(challengeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge');
    }
  }
);

/**
 * Fetch user's participating challenges
 */
export const fetchMyChallenges = createAsyncThunk(
  'challenges/fetchMyChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeService.getMyChallenges();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my challenges');
    }
  }
);

/**
 * Join a challenge
 * @param {string} challengeId - Challenge ID
 */
export const joinChallenge = createAsyncThunk(
  'challenges/join',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeService.joinChallenge(challengeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join challenge');
    }
  }
);

/**
 * Leave a challenge
 * @param {string} challengeId - Challenge ID
 */
export const leaveChallenge = createAsyncThunk(
  'challenges/leave',
  async (challengeId, { rejectWithValue }) => {
    try {
      await challengeService.leaveChallenge(challengeId);
      return challengeId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave challenge');
    }
  }
);

/**
 * Update challenge progress
 * @param {Object} progressData - Progress data
 * @param {string} progressData.challengeId - Challenge ID
 * @param {number} progressData.value - Progress value
 * @param {string} progressData.type - Progress type (workout, distance, duration, etc.)
 */
export const updateChallengeProgress = createAsyncThunk(
  'challenges/updateProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const response = await challengeService.updateProgress(progressData);
      return { challengeId: progressData.challengeId, progress: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

/**
 * Fetch challenge leaderboard
 * @param {string} challengeId - Challenge ID
 */
export const fetchChallengeLeaderboard = createAsyncThunk(
  'challenges/fetchLeaderboard',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeService.getLeaderboard(challengeId);
      return { challengeId, leaderboard: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

/**
 * Fetch challenge feed/activity
 * @param {string} challengeId - Challenge ID
 */
export const fetchChallengeFeed = createAsyncThunk(
  'challenges/fetchFeed',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeFeed(challengeId);
      return { challengeId, feed: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge feed');
    }
  }
);

/**
 * Create a new challenge
 * @param {Object} challengeData - Challenge creation data
 */
export const createChallenge = createAsyncThunk(
  'challenges/create',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await challengeService.createChallenge(challengeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create challenge');
    }
  }
);

const challengesSlice = createSlice({
  name: 'challenges',
  initialState: {
    challenges: [],
    myChallenges: [],
    currentChallenge: null,
    leaderboards: {},
    feeds: {},
    loading: false,
    joinLoading: {},
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentChallenge: (state) => {
      state.currentChallenge = null;
    },
    updateLocalProgress: (state, action) => {
      const { challengeId, value } = action.payload;

      // Update in myChallenges
      const myIndex = state.myChallenges.findIndex(c => c._id === challengeId);
      if (myIndex !== -1 && state.myChallenges[myIndex].userProgress) {
        state.myChallenges[myIndex].userProgress.current += value;
      }

      // Update in currentChallenge
      if (state.currentChallenge?._id === challengeId && state.currentChallenge.userProgress) {
        state.currentChallenge.userProgress.current += value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Challenges
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload;
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Challenge By ID
      .addCase(fetchChallengeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallengeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChallenge = action.payload;
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Challenges
      .addCase(fetchMyChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.myChallenges = action.payload;
      })
      .addCase(fetchMyChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Join Challenge
      .addCase(joinChallenge.pending, (state, action) => {
        state.joinLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(joinChallenge.fulfilled, (state, action) => {
        state.joinLoading[action.payload._id] = false;

        // Add to myChallenges
        const exists = state.myChallenges.some(c => c._id === action.payload._id);
        if (!exists) {
          state.myChallenges.push(action.payload);
        }

        // Update currentChallenge if viewing
        if (state.currentChallenge?._id === action.payload._id) {
          state.currentChallenge = action.payload;
        }

        // Update in challenges list
        const index = state.challenges.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.challenges[index] = action.payload;
        }
      })
      .addCase(joinChallenge.rejected, (state, action) => {
        state.joinLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      // Leave Challenge
      .addCase(leaveChallenge.pending, (state, action) => {
        state.joinLoading[action.meta.arg] = true;
      })
      .addCase(leaveChallenge.fulfilled, (state, action) => {
        state.joinLoading[action.payload] = false;
        state.myChallenges = state.myChallenges.filter(c => c._id !== action.payload);

        // Update currentChallenge if viewing
        if (state.currentChallenge?._id === action.payload) {
          state.currentChallenge.isParticipating = false;
        }

        // Update in challenges list
        const index = state.challenges.findIndex(c => c._id === action.payload);
        if (index !== -1) {
          state.challenges[index].isParticipating = false;
        }
      })
      .addCase(leaveChallenge.rejected, (state, action) => {
        state.joinLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      // Update Progress
      .addCase(updateChallengeProgress.fulfilled, (state, action) => {
        const { challengeId, progress } = action.payload;

        // Update in myChallenges
        const myIndex = state.myChallenges.findIndex(c => c._id === challengeId);
        if (myIndex !== -1) {
          state.myChallenges[myIndex].userProgress = progress;
        }

        // Update in currentChallenge
        if (state.currentChallenge?._id === challengeId) {
          state.currentChallenge.userProgress = progress;
        }
      })
      // Fetch Leaderboard
      .addCase(fetchChallengeLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChallengeLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboards[action.payload.challengeId] = action.payload.leaderboard;
      })
      .addCase(fetchChallengeLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Feed
      .addCase(fetchChallengeFeed.fulfilled, (state, action) => {
        state.feeds[action.payload.challengeId] = action.payload.feed;
      })
      // Create Challenge
      .addCase(createChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges.unshift(action.payload);
        state.myChallenges.unshift(action.payload);
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentChallenge,
  updateLocalProgress,
} = challengesSlice.actions;

export default challengesSlice.reducer;
