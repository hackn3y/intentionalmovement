import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { programService } from '../../services/programService';

/**
 * Fetch all available programs
 * @param {Object} params - Filter and pagination params
 */
export const fetchPrograms = createAsyncThunk(
  'programs/fetchAll',
  async ({ category, search, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await programService.getPrograms({ category, search, page, limit });
      return {
        programs: response.data.programs,
        page,
        hasMore: response.data.pagination?.hasMore || false
      };
    } catch (error) {
      console.error('Fetch programs error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch programs');
    }
  }
);

/**
 * Fetch single program details
 * @param {string} programId - Program ID
 */
export const fetchProgramById = createAsyncThunk(
  'programs/fetchById',
  async (programId, { rejectWithValue }) => {
    try {
      const response = await programService.getProgramById(programId);
      // Backend returns { program: {...} }, extract the program object
      return response.data.program || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch program');
    }
  }
);

/**
 * Fetch user's purchased programs
 */
export const fetchMyPrograms = createAsyncThunk(
  'programs/fetchMyPrograms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await programService.getMyPrograms();
      // Backend returns { programs: [...], pagination: {...} }
      return response.data.programs || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my programs');
    }
  }
);

/**
 * Purchase a program
 * @param {Object} purchaseData - Purchase data
 * @param {string} purchaseData.programId - Program ID
 * @param {string} purchaseData.paymentMethodId - Stripe payment method ID
 */
export const purchaseProgram = createAsyncThunk(
  'programs/purchase',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await programService.purchaseProgram(purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Purchase failed');
    }
  }
);

/**
 * Fetch program progress
 * @param {string} programId - Program ID
 */
export const fetchProgramProgress = createAsyncThunk(
  'programs/fetchProgress',
  async (programId, { rejectWithValue }) => {
    try {
      const response = await programService.getProgramProgress(programId);
      return { programId, progress: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

/**
 * Update lesson progress
 * @param {Object} progressData - Progress data
 * @param {string} progressData.programId - Program ID
 * @param {string} progressData.lessonId - Lesson ID
 * @param {number} progressData.progress - Progress percentage (0-100)
 * @param {boolean} progressData.completed - Whether lesson is completed
 */
export const updateLessonProgress = createAsyncThunk(
  'programs/updateProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      const response = await programService.updateLessonProgress(progressData);
      return { programId: progressData.programId, progress: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

/**
 * Rate a program
 * @param {Object} ratingData - Rating data
 * @param {string} ratingData.programId - Program ID
 * @param {number} ratingData.rating - Rating (1-5)
 * @param {string} ratingData.review - Review text
 */
export const rateProgram = createAsyncThunk(
  'programs/rate',
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await programService.rateProgram(ratingData);
      return { programId: ratingData.programId, rating: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit rating');
    }
  }
);

/**
 * Fetch featured programs
 */
export const fetchFeaturedPrograms = createAsyncThunk(
  'programs/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await programService.getFeaturedPrograms();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured programs');
    }
  }
);

const programsSlice = createSlice({
  name: 'programs',
  initialState: {
    programs: [],
    myPrograms: [],
    featuredPrograms: [],
    currentProgram: null,
    progress: {},
    loading: false,
    purchaseLoading: false,
    error: null,
    page: 1,
    hasMore: true,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProgram: (state) => {
      state.currentProgram = null;
    },
    clearPrograms: (state) => {
      state.programs = [];
      state.page = 1;
      state.hasMore = true;
    },
    updateLocalProgress: (state, action) => {
      const { programId, lessonId, progress } = action.payload;
      if (state.progress[programId]) {
        const lessonIndex = state.progress[programId].lessons.findIndex(
          l => l.lessonId === lessonId
        );
        if (lessonIndex !== -1) {
          state.progress[programId].lessons[lessonIndex].progress = progress;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Programs
      .addCase(fetchPrograms.pending, (state) => {
        if (state.page === 1) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          // ALWAYS replace when page is 1 (fresh load)
          state.programs = action.payload.programs;
        } else {
          // Append for pagination
          state.programs = [...state.programs, ...action.payload.programs];
        }
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Program By ID
      .addCase(fetchProgramById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgramById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgram = action.payload;
      })
      .addCase(fetchProgramById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Programs
      .addCase(fetchMyPrograms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.myPrograms = action.payload;
      })
      .addCase(fetchMyPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Purchase Program
      .addCase(purchaseProgram.pending, (state) => {
        state.purchaseLoading = true;
        state.error = null;
      })
      .addCase(purchaseProgram.fulfilled, (state, action) => {
        state.purchaseLoading = false;
        state.myPrograms.push(action.payload);
      })
      .addCase(purchaseProgram.rejected, (state, action) => {
        state.purchaseLoading = false;
        state.error = action.payload;
      })
      // Fetch Program Progress
      .addCase(fetchProgramProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProgramProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress[action.payload.programId] = action.payload.progress;
      })
      .addCase(fetchProgramProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Lesson Progress
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        state.progress[action.payload.programId] = action.payload.progress;
      })
      // Rate Program
      .addCase(rateProgram.fulfilled, (state, action) => {
        const { programId } = action.payload;
        const currentProgramId = state.currentProgram?.id || state.currentProgram?._id;
        if (currentProgramId === programId) {
          state.currentProgram.userRating = action.payload.rating;
        }
      })
      // Fetch Featured Programs
      .addCase(fetchFeaturedPrograms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredPrograms = action.payload;
      })
      .addCase(fetchFeaturedPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentProgram,
  clearPrograms,
  updateLocalProgress,
} = programsSlice.actions;

export default programsSlice.reducer;
