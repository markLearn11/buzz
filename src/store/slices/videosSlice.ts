import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface VideosState {
  videos: Video[];
  feedVideos: Video[];
  currentVideo: Video | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialVideos: Video[] = [
  {
    id: 'video1',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/id/1/300/400',
    description: '美丽的风景，分享给大家！#旅行 #风景',
    likes: 1024,
    comments: 89,
    shares: 45,
    userName: '旅行达人',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    userId: 'user2',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'video2',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/id/2/300/400',
    description: '今天做了一道美食，大家觉得怎么样？#美食 #烹饪',
    likes: 512,
    comments: 42,
    shares: 21,
    userName: '美食博主',
    userAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    userId: 'user3',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'video3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/id/3/300/400',
    description: '分享我的日常#生活 #日常',
    likes: 256,
    comments: 32,
    shares: 15,
    userName: '创作者小明',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    userId: 'user1',
    createdAt: Date.now() - 86400000 * 3,
  },
];

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
    setCurrentVideo: (state, action: PayloadAction<Video>) => {
      state.currentVideo = action.payload;
    },
    likeVideo: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      const video = state.videos.find(v => v.id === videoId);
      if (video) {
        video.likes += 1;
      }
    },
    uploadVideoStart: (state) => {
      state.loading = true;
      state.isLoading = true;
      state.error = null;
    },
    uploadVideoSuccess: (state, action: PayloadAction<Video>) => {
      state.videos.unshift(action.payload);
      state.feedVideos.unshift(action.payload);
      state.loading = false;
      state.isLoading = false;
      state.error = null;
    },
    uploadVideoFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchVideosStart,
  fetchVideosSuccess,
  fetchVideosFailure,
  setCurrentVideo,
  likeVideo,
  uploadVideoStart,
  uploadVideoSuccess,
  uploadVideoFailure,
} = videosSlice.actions;

export default videosSlice.reducer; 