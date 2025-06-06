import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as videoService from '../../services/videoService';

export interface Video {
  id: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  userName: string;
  userAvatar: string;
  userId: string;
  createdAt: number;
  isLiked?: boolean;
}

interface VideosState {
  videos: Video[];
  feedVideos: Video[];
  currentVideo: Video | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

// 异步actions
export const fetchVideosAsync = createAsyncThunk(
  'videos/fetchVideos',
  async ({ page = 1, limit = 10, search = '', tags = '' }: any, { rejectWithValue }) => {
    try {
      const response = await videoService.fetchVideos(page, limit, search, tags);
      return response.videos;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取视频失败');
    }
  }
);

export const fetchVideoByIdAsync = createAsyncThunk(
  'videos/fetchVideoById',
  async (videoId: string, { rejectWithValue }) => {
    try {
      return await videoService.fetchVideoById(videoId);
    } catch (error: any) {
      return rejectWithValue(error.message || '获取视频详情失败');
    }
  }
);

export const uploadVideoAsync = createAsyncThunk(
  'videos/uploadVideo',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      return await videoService.uploadVideo(formData);
    } catch (error: any) {
      return rejectWithValue(error.message || '上传视频失败');
    }
  }
);

export const likeVideoAsync = createAsyncThunk(
  'videos/likeVideo',
  async (videoId: string, { rejectWithValue }) => {
    try {
      await videoService.likeVideo(videoId);
      return videoId;
    } catch (error: any) {
      return rejectWithValue(error.message || '点赞视频失败');
    }
  }
);

export const unlikeVideoAsync = createAsyncThunk(
  'videos/unlikeVideo',
  async (videoId: string, { rejectWithValue }) => {
    try {
      await videoService.unlikeVideo(videoId);
      return videoId;
    } catch (error: any) {
      return rejectWithValue(error.message || '取消点赞失败');
    }
  }
);

export const checkVideoLikeStatusAsync = createAsyncThunk(
  'videos/checkVideoLikeStatus',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const response = await videoService.checkVideoLikeStatus(videoId);
      return {
        videoId,
        isLiked: response.isLiked
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '检查视频点赞状态失败');
    }
  }
);

// 示例初始数据，实际应用中可以将其移除，改为空数组
const initialVideos: Video[] = [];

const initialState: VideosState = {
  videos: initialVideos,
  feedVideos: initialVideos,
  currentVideo: null,
  loading: false,
  isLoading: false,
  error: null,
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<Video>) => {
      state.currentVideo = action.payload;
    },
    fetchVideosStart: (state) => {
      state.loading = true;
      state.isLoading = true;
      state.error = null;
    },
    fetchVideosSuccess: (state, action: PayloadAction<Video[]>) => {
      state.videos = action.payload;
      state.feedVideos = action.payload;
      state.loading = false;
      state.isLoading = false;
      state.error = null;
    },
    fetchVideosFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    likeVideo: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.likes += 1;
      }
      if (state.currentVideo && state.currentVideo.id === videoId) {
        state.currentVideo.likes += 1;
      }
    },
    updateLocalVideo: (state, action: PayloadAction<Video>) => {
      const updatedVideo = action.payload;
      const videoIndex = state.videos.findIndex(v => v.id === updatedVideo.id);
      if (videoIndex !== -1) {
        state.videos[videoIndex] = updatedVideo;
      }
      
      const feedVideoIndex = state.feedVideos.findIndex(v => v.id === updatedVideo.id);
      if (feedVideoIndex !== -1) {
        state.feedVideos[feedVideoIndex] = updatedVideo;
      }
      
      if (state.currentVideo && state.currentVideo.id === updatedVideo.id) {
        state.currentVideo = updatedVideo;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取视频列表
      .addCase(fetchVideosAsync.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideosAsync.fulfilled, (state, action) => {
        state.videos = action.payload;
        state.feedVideos = action.payload;
        state.loading = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchVideosAsync.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // 获取单个视频
      .addCase(fetchVideoByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoByIdAsync.fulfilled, (state, action) => {
        state.currentVideo = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchVideoByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 上传视频
      .addCase(uploadVideoAsync.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadVideoAsync.fulfilled, (state, action) => {
        state.videos.unshift(action.payload);
        state.feedVideos.unshift(action.payload);
        state.loading = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(uploadVideoAsync.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // 点赞视频
      .addCase(likeVideoAsync.fulfilled, (state, action) => {
        const videoId = action.payload;
        const video = state.videos.find(v => v.id === videoId);
        if (video) {
          video.likes += 1;
          video.isLiked = true;
        }
        if (state.currentVideo && state.currentVideo.id === videoId) {
          state.currentVideo.likes += 1;
          state.currentVideo.isLiked = true;
        }
      })
      
      // 取消点赞
      .addCase(unlikeVideoAsync.fulfilled, (state, action) => {
        const videoId = action.payload;
        const video = state.videos.find(v => v.id === videoId);
        if (video && video.likes > 0) {
          video.likes -= 1;
          video.isLiked = false;
        }
        if (state.currentVideo && state.currentVideo.id === videoId && state.currentVideo.likes > 0) {
          state.currentVideo.likes -= 1;
          state.currentVideo.isLiked = false;
        }
      })
      
      // 检查视频点赞状态
      .addCase(checkVideoLikeStatusAsync.fulfilled, (state, action) => {
        const { videoId, isLiked } = action.payload;
        const video = state.videos.find(v => v.id === videoId);
        if (video) {
          video.isLiked = isLiked;
        }
        if (state.currentVideo && state.currentVideo.id === videoId) {
          state.currentVideo.isLiked = isLiked;
        }
      })
      .addCase(checkVideoLikeStatusAsync.rejected, (state, action) => {
        // 可以选择是否处理错误
        console.error('检查视频点赞状态失败:', action.payload);
      });
  },
});

export const { setCurrentVideo, fetchVideosStart, fetchVideosSuccess, fetchVideosFailure, likeVideo, updateLocalVideo } = videosSlice.actions;

export default videosSlice.reducer; 