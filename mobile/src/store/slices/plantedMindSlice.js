import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService } from '../../services/postService';

/**
 * Fetch planted mind curated posts
 * @param {Object} params - Pagination params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const fetchPlantedMindPosts = createAsyncThunk(
  'plantedMind/fetchPosts',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      // For now, we'll use the same posts endpoint with a 'curated' filter
      // In the future, the backend can have a dedicated endpoint for curated content
      const response = await postService.getPosts(page, limit, 'curated');
      return { posts: response.data.posts, page, hasMore: response.data.hasMore };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch curated posts');
    }
  }
);

const initialState = {
  posts: [],
  loading: false,
  refreshing: false,
  error: null,
  page: 1,
  hasMore: true,
};

const plantedMindSlice = createSlice({
  name: 'plantedMind',
  initialState,
  reducers: {
    clearPlantedMindPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    setPlantedMindRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch planted mind posts
      .addCase(fetchPlantedMindPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlantedMindPosts.fulfilled, (state, action) => {
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
      .addCase(fetchPlantedMindPosts.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPlantedMindPosts,
  setPlantedMindRefreshing,
} = plantedMindSlice.actions;

export default plantedMindSlice.reducer;
