import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { storage } from '../../utils/storage';
import { setTokenCache, clearTokenCache } from '../../services/api';
// import analyticsService from '../../services/analyticsService';

/**
 * Login user with email and password
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Backend wraps response in data object: response.data.data.token
      const token = response.data.data?.token || response.data.token;
      const user = response.data.data?.user || response.data.user;
      // Set token in cache immediately for instant availability
      setTokenCache(token);
      // Then save to persistent storage
      await storage.set('token', token);
      await storage.set('user', JSON.stringify(user));

      // Track login event
      // analyticsService.trackLogin(user);

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

/**
 * Register new user
 * @param {Object} userData - User registration data
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // Backend wraps response in data object: response.data.data.token
      const token = response.data.data?.token || response.data.token;
      const user = response.data.data?.user || response.data.user;
      // Set token in cache immediately for instant availability
      setTokenCache(token);
      // Then save to persistent storage
      await storage.set('token', token);
      await storage.set('user', JSON.stringify(user));

      // Track signup event
      // analyticsService.trackSignup(user, 'email');

      return { token, user };
    } catch (error) {
      console.error('Register error:', error);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

/**
 * Login with Firebase (Google/Apple)
 * @param {Object} firebaseData - Firebase auth data
 */
export const loginWithFirebase = createAsyncThunk(
  'auth/loginWithFirebase',
  async (firebaseData, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithFirebase(firebaseData);
      await storage.set('token', response.data.token);
      await storage.set('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Firebase login failed');
    }
  }
);

/**
 * Load user from storage
 */
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      // Add timeout to prevent hanging on web
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 3000)
      );

      const storagePromise = Promise.all([
        storage.get('token'),
        storage.get('user')
      ]);

      let token, userStr;
      try {
        [token, userStr] = await Promise.race([storagePromise, timeoutPromise]);
      } catch (err) {
        return rejectWithValue('Storage access failed');
      }

      if (!token || !userStr) {
        return rejectWithValue('No user found');
      }

      const user = JSON.parse(userStr);
      return { token, user };
    } catch (error) {
      return rejectWithValue('Failed to load user');
    }
  }
);

/**
 * Logout user
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      // Clear token cache
      clearTokenCache();
      // Clear storage
      await storage.remove('token');
      await storage.remove('user');
      // Reset analytics
      // analyticsService.reset();
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

/**
 * Update current user profile
 * @param {Object} userData - Updated user data
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      await storage.set('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initializing: true,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Firebase Login
      .addCase(loginWithFirebase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithFirebase.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.initializing = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // Even if backend logout fails, clear local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
