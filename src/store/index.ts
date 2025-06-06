import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import videosReducer from './slices/videosSlice';
import chatReducer from './slices/chatSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    chat: chatReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 