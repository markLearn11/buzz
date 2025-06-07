import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import videosReducer from './slices/videosSlice';
import chatReducer from './slices/chatSlice';
import appReducer from './slices/appSlice';
import commentsReducer from './slices/commentsSlice';
import themeReducer from './slices/themeSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// 判断是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    chat: chatReducer,
    app: appReducer,
    comments: commentsReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: isDevelopment ? {
        // 在开发环境中增加警告阈值
        warnAfter: 150,
        
        // 忽略特定的action类型，这些action可能包含大量数据
        ignoredActions: [
          'videos/fetchVideosSuccess',
          'videos/fetchVideoByIdAsync/fulfilled',
          'comments/fetchVideoComments/fulfilled',
          'comments/addComment/fulfilled'
        ],
        
        // 忽略特定的状态路径，这些路径可能包含大量数据
        ignoredPaths: [
          'videos.feedVideos',
          'videos.videos',
          'comments.comments'
        ],
      } : false, // 在生产环境中完全禁用序列化检查
      
      // 同样调整不可变检查的阈值
      immutableCheck: isDevelopment ? { warnAfter: 150 } : false,
    }),
  // 在开发环境中启用devTools，生产环境禁用
  devTools: isDevelopment,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 自定义钩子
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 