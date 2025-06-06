import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as commentService from '../../services/commentService';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: number;
  replies: Reply[];
  replyCount: number;
}

export interface Reply {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: number;
}

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// 异步actions
export const fetchVideoCommentsAsync = createAsyncThunk(
  'comments/fetchVideoComments',
  async ({ videoId, page = 1, limit = 20 }: any, { rejectWithValue }) => {
    try {
      const response = await commentService.fetchVideoComments(videoId, page, limit);
      return {
        comments: response.comments,
        page: response.page,
        totalPages: response.totalPages,
        total: response.total
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评论失败');
    }
  }
);

export const addCommentAsync = createAsyncThunk(
  'comments/addComment',
  async ({ videoId, content }: { videoId: string, content: string }, { rejectWithValue }) => {
    try {
      const response = await commentService.addComment({ videoId, content });
      return response.comment;
    } catch (error: any) {
      return rejectWithValue(error.message || '添加评论失败');
    }
  }
);

export const likeCommentAsync = createAsyncThunk(
  'comments/likeComment',
  async (commentId: string, { rejectWithValue }) => {
    try {
      await commentService.likeComment(commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message || '点赞评论失败');
    }
  }
);

export const unlikeCommentAsync = createAsyncThunk(
  'comments/unlikeComment',
  async (commentId: string, { rejectWithValue }) => {
    try {
      await commentService.unlikeComment(commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message || '取消点赞评论失败');
    }
  }
);

export const checkCommentLikeStatusAsync = createAsyncThunk(
  'comments/checkCommentLikeStatus',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const response = await commentService.checkCommentLikeStatus(commentId);
      return {
        commentId,
        isLiked: response.isLiked
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '检查评论点赞状态失败');
    }
  }
);

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
  hasMore: false,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.page = 1;
      state.totalPages = 1;
      state.hasMore = false;
    },
    updateLocalComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取视频评论
      .addCase(fetchVideoCommentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideoCommentsAsync.fulfilled, (state, action) => {
        const { comments, page, totalPages } = action.payload;
        if (page === 1) {
          state.comments = comments;
        } else {
          state.comments = [...state.comments, ...comments];
        }
        state.page = page;
        state.totalPages = totalPages;
        state.hasMore = page < totalPages;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchVideoCommentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 添加评论
      .addCase(addCommentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.comments = [action.payload, ...state.comments];
        state.loading = false;
        state.error = null;
      })
      .addCase(addCommentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 点赞评论
      .addCase(likeCommentAsync.fulfilled, (state, action) => {
        const commentId = action.payload;
        // 查找评论
        const comment = state.comments.find(c => c.id === commentId);
        if (comment) {
          comment.likes += 1;
          comment.isLiked = true;
          return;
        }
        
        // 如果不是主评论，可能是回复
        for (const mainComment of state.comments) {
          const reply = mainComment.replies?.find(r => r.id === commentId);
          if (reply) {
            reply.likes += 1;
            reply.isLiked = true;
            break;
          }
        }
      })
      
      // 取消点赞评论
      .addCase(unlikeCommentAsync.fulfilled, (state, action) => {
        const commentId = action.payload;
        // 查找评论
        const comment = state.comments.find(c => c.id === commentId);
        if (comment && comment.likes > 0) {
          comment.likes -= 1;
          comment.isLiked = false;
          return;
        }
        
        // 如果不是主评论，可能是回复
        for (const mainComment of state.comments) {
          const reply = mainComment.replies?.find(r => r.id === commentId);
          if (reply && reply.likes > 0) {
            reply.likes -= 1;
            reply.isLiked = false;
            break;
          }
        }
      })
      
      // 检查评论点赞状态
      .addCase(checkCommentLikeStatusAsync.fulfilled, (state, action) => {
        const { commentId, isLiked } = action.payload;
        // 查找评论
        const comment = state.comments.find(c => c.id === commentId);
        if (comment) {
          comment.isLiked = isLiked;
          return;
        }
        
        // 如果不是主评论，可能是回复
        for (const mainComment of state.comments) {
          const reply = mainComment.replies?.find(r => r.id === commentId);
          if (reply) {
            reply.isLiked = isLiked;
            break;
          }
        }
      })
      .addCase(checkCommentLikeStatusAsync.rejected, (state, action) => {
        console.error('检查评论点赞状态失败:', action.payload);
      });
  },
});

export const { clearComments, updateLocalComments } = commentsSlice.actions;

export default commentsSlice.reducer; 