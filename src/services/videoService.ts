import api from './api';
import { Video } from '../store/slices/videosSlice';

// 获取视频列表（支持分页、搜索、标签过滤）
export const fetchVideos = async (page = 1, limit = 10, search = '', tags = '') => {
  try {
    const response = await api.get('/videos', {
      params: { page, limit, search, tags }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取视频列表失败:', error);
    throw error;
  }
};

// 获取单个视频详情
export const fetchVideoById = async (videoId: string) => {
  try {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('获取视频详情失败:', error);
    throw error;
  }
};

// 获取特定用户的视频列表
export const fetchUserVideos = async (userId: string, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/videos/user/${userId}`, {
      params: { page, limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取用户视频失败:', error);
    throw error;
  }
};

// 上传视频
export const uploadVideo = async (formData: FormData) => {
  try {
    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('上传视频失败:', error);
    throw error;
  }
};

// 检查视频URL是否有效
export const checkVideoUrl = async (url: string): Promise<boolean> => {
  // 如果URL为空，直接返回false
  if (!url) return false;
  
  try {
    // 验证URL格式
    new URL(url);
  } catch (e) {
    console.error('URL格式无效:', url);
    return false;
  }
  
  try {
    // 创建一个GET请求来检查视频URL是否有效
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: { Range: 'bytes=0-1024' }, // 只请求前1KB数据
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    // 检查响应状态码
    if (response.status >= 200 && response.status < 300) {
      return true;
    }
    
    // 对于某些特殊的视频服务器，即使返回了非200状态码，视频也可能是可用的
    // 所以我们检查Content-Type
    const contentType = response.headers.get('Content-Type');
    if (contentType && (
      contentType.includes('video/') || 
      contentType.includes('application/octet-stream')
    )) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('检查视频URL失败:', error);
    return false;
  }
};

// 点赞视频 - 使用API请求
export const likeVideo = async (videoId: string) => {
  try {
    // 发送API请求
    const response = await api.post(`/videos/${videoId}/like`);
    
    console.log(`视频点赞成功: ${videoId}`, response.data);
    return {
      ...response.data,
      success: true,
      message: '点赞成功',
      isLiked: true
    };
  } catch (error) {
    console.error('点赞视频失败:', error);
    throw error;
  }
};

// 取消点赞 - 使用API请求
export const unlikeVideo = async (videoId: string) => {
  try {
    // 发送API请求
    const response = await api.delete(`/videos/${videoId}/like`);
    
    console.log(`取消视频点赞成功: ${videoId}`, response.data);
    return {
      ...response.data,
      success: true,
      message: '取消点赞成功',
      isLiked: false
    };
  } catch (error) {
    console.error('取消点赞失败:', error);
    throw error;
  }
};

// 检查视频点赞状态 - 使用API请求
export const checkVideoLikeStatus = async (videoId: string) => {
  try {
    const response = await api.get(`/videos/${videoId}/like/status`);
    console.log(`检查视频点赞状态: ${videoId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('检查视频点赞状态失败:', error);
    throw error;
  }
};

// 删除视频
export const deleteVideo = async (videoId: string) => {
  try {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('删除视频失败:', error);
    throw error;
  }
};

// 更新视频信息
export const updateVideo = async (videoId: string, data: any) => {
  try {
    const response = await api.put(`/videos/${videoId}`, data);
    return response.data;
  } catch (error) {
    console.error('更新视频信息失败:', error);
    throw error;
  }
}; 