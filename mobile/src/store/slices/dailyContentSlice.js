import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dailyContentService from '../../services/dailyContentService';

// Async thunks
export const fetchTodayContent = createAsyncThunk(
  'dailyContent/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const data = await dailyContentService.getTodayContent();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load today\'s content');
    }
  }
);

export const fetchContentCalendar = createAsyncThunk(
  'dailyContent/fetchCalendar',
  async (days = 30, { rejectWithValue }) => {
    try {
      const data = await dailyContentService.getContentCalendar(days);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load calendar');
    }
  }
);

export const checkInToday = createAsyncThunk(
  'dailyContent/checkIn',
  async ({ notes, completed }, { rejectWithValue }) => {
    try {
      const data = await dailyContentService.checkIn(notes, completed);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to check in');
    }
  }
);

export const fetchStreak = createAsyncThunk(
  'dailyContent/fetchStreak',
  async (_, { rejectWithValue }) => {
    try {
      const data = await dailyContentService.getStreak();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load streak');
    }
  }
);

export const fetchCheckInHistory = createAsyncThunk(
  'dailyContent/fetchHistory',
  async ({ limit = 30, offset = 0 }, { rejectWithValue }) => {
    try {
      const data = await dailyContentService.getCheckInHistory(limit, offset);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load history');
    }
  }
);

const initialState = {
  todayContent: null,
  hasCheckedIn: false,
  calendar: [],
  streak: null,
  checkInHistory: [],
  loading: false,
  error: null,
  checkInLoading: false,
  checkInError: null,
  pagination: {
    total: 0,
    limit: 30,
    offset: 0,
    hasMore: false
  }
};

const dailyContentSlice = createSlice({
  name: 'dailyContent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.checkInError = null;
    },
    resetCheckIn: (state) => {
      state.checkInLoading = false;
      state.checkInError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Today's Content
      .addCase(fetchTodayContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayContent.fulfilled, (state, action) => {
        state.loading = false;
        state.todayContent = action.payload.content;
        state.hasCheckedIn = action.payload.hasCheckedIn || false;
      })
      .addCase(fetchTodayContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Calendar
      .addCase(fetchContentCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContentCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.calendar = action.payload.calendar || [];
      })
      .addCase(fetchContentCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check In
      .addCase(checkInToday.pending, (state) => {
        state.checkInLoading = true;
        state.checkInError = null;
      })
      .addCase(checkInToday.fulfilled, (state, action) => {
        state.checkInLoading = false;
        state.hasCheckedIn = true;
        state.streak = action.payload.streak;
      })
      .addCase(checkInToday.rejected, (state, action) => {
        state.checkInLoading = false;
        state.checkInError = action.payload;
      })

      // Fetch Streak
      .addCase(fetchStreak.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        state.loading = false;
        state.streak = action.payload.streak;
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Check-In History
      .addCase(fetchCheckInHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckInHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.checkInHistory = action.payload.checkIns || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchCheckInHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, resetCheckIn } = dailyContentSlice.actions;
export default dailyContentSlice.reducer;
