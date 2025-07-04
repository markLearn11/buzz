import api from './api';
import { Comment } from '../store/slices/commentsSlice';

// 获取视频评论
export const fetchVideoComments = async (videoId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/comments/video/${videoId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('获取视频评论失败:', error);
    throw error;
  }
};

// 获取评论回复
export const fetchCommentReplies = async (commentId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/comments/${commentId}/replies`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('获取评论回复失败:', error);
    throw error;
  }
};

// 添加文本评论
export const addComment = async (data: { videoId: string; content?: string; parentId?: string; emojiType?: string; emojiId?: string }) => {
  try {
    const response = await api.post('/comments', data);
    return response.data;
  } catch (error) {
    console.error('添加评论失败:', error);
    throw error;
  }
};

// 添加带图片的评论
export const addCommentWithMedia = async (data: { 
  videoId: string; 
  content?: string; 
  parentId?: string; 
  images?: any[];
  emojis?: {
    type: 'static' | 'animated' | null;
    id: string | null;
    position: number | null;
  }[];
}) => {
  try {
    const formData = new FormData();
    formData.append('videoId', data.videoId);
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.parentId) {
      formData.append('parentCommentId', data.parentId);
    }
    
    // 处理表情数据
    if (data.emojis && data.emojis.length > 0) {
      formData.append('emojisData', JSON.stringify(data.emojis));
    }
    
    // 处理多图片上传
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      
      formData.append('imageCount', String(data.images.length));
    }
    
    const response = await api.post('/comments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('添加带媒体的评论失败:', error);
    throw error;
  }
};

// 删除评论
export const deleteComment = async (commentId: string) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('删除评论失败:', error);
    throw error;
  }
};

// 举报评论
export const reportComment = async (commentId: string, reason: string) => {
  try {
    const response = await api.post(`/comments/${commentId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('举报评论失败:', error);
    throw error;
  }
};

// 点赞评论 - 使用API请求
export const likeComment = async (commentId: string) => {
  try {
    // 发送API请求
    const response = await api.post(`/comments/${commentId}/like`);
    
    console.log(`评论点赞成功: ${commentId}`, response.data);
    return {
      ...response.data,
      success: true,
      message: '点赞评论成功',
      isLiked: true
    };
  } catch (error) {
    console.error('点赞评论失败:', error);
    throw error;
  }
};

// 取消点赞评论 - 使用API请求
export const unlikeComment = async (commentId: string) => {
  try {
    // 发送API请求
    const response = await api.delete(`/comments/${commentId}/like`);
    
    console.log(`取消评论点赞成功: ${commentId}`, response.data);
    return {
      ...response.data,
      success: true,
      message: '取消点赞评论成功',
      isLiked: false
    };
  } catch (error) {
    console.error('取消点赞评论失败:', error);
    throw error;
  }
};

// 检查评论点赞状态 - 使用API请求
export const checkCommentLikeStatus = async (commentId: string) => {
  try {
    const response = await api.get(`/comments/${commentId}/like/status`);
    console.log(`检查评论点赞状态: ${commentId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('检查评论点赞状态失败:', error);
    throw error;
  }
}; 