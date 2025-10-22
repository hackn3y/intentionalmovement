import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import postsReducer from './slices/postsSlice';
import messagesReducer from './slices/messagesSlice';
import programsReducer from './slices/programsSlice';
import achievementsReducer from './slices/achievementsSlice';
import challengesReducer from './slices/challengesSlice';
import dailyContentReducer from './slices/dailyContentSlice';
import plantedMindReducer from './slices/plantedMindSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    posts: postsReducer,
    messages: messagesReducer,
    programs: programsReducer,
    achievements: achievementsReducer,
    challenges: challengesReducer,
    dailyContent: dailyContentReducer,
    plantedMind: plantedMindReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
