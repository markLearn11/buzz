import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Video {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  videoUrl: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: number;
}

interface VideoState {
  videos: Video[];
  feedVideos: Video[];
  userVideos: Video[];
  currentVideo: Video | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  videos: [],
  feedVideos: [],
  userVideos: [],
  currentVideo: null,
  isLoading: false,
  error: null,
};

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    fetchVideosStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchVideosSuccess(state, action: PayloadAction<Video[]>) {
      state.isLoading = false;
      state.feedVideos = action.payload;
      state.videos = [...state.videos, ...action.payload];
    },
    fetchVideosFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentVideo(state, action: PayloadAction<Video>) {
      state.currentVideo = action.payload;
    },
    likeVideo(state, action: PayloadAction<string>) {
      const videoId = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.likes += 1;
      }
    },
    addComment(state, action: PayloadAction<{videoId: string}>) {
      const { videoId } = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.comments += 1;
      }
    },
    shareVideo(state, action: PayloadAction<string>) {
      const videoId = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.shares += 1;
      }
    },
  },
});

export const { 
  fetchVideosStart, 
  fetchVideosSuccess, 
  fetchVideosFailure,
  setCurrentVideo,
  likeVideo,
  addComment,
  shareVideo
} = videoSlice.actions;

export default videoSlice.reducer; 