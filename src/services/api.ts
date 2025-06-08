import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 增加超时时间到30秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// 图像URL加载时添加时间戳防止缓存
export const getImageUrlWithCacheBuster = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // 处理相对路径，将其转换为完整URL
  let fullUrl = url;
  if (url.startsWith('/')) {
    // 如果是以 / 开头的相对路径，添加基础 URL
    // 注意：API_BASE_URL 的末尾可能已经有 /api，所以对于 /public 路径需要特殊处理
    if (url.startsWith('/public/')) {
      // 对于 /public 路径，需要去掉 API_BASE_URL 中的 /api 部分
      const baseUrlWithoutApi = API_BASE_URL.replace(/\/api$/, '');
      fullUrl = `${baseUrlWithoutApi}${url}`;
    } else {
      fullUrl = `${API_BASE_URL}${url}`;
    }
    console.log('转换相对路径为完整URL:', url, '=>', fullUrl);
  }
  
  // 添加时间戳作为查询参数防止缓存
  const cacheBuster = `_cb=${Date.now()}`;
  return fullUrl.includes('?') ? `${fullUrl}&${cacheBuster}` : `${fullUrl}?${cacheBuster}`;
};

// 请求拦截器，添加token到请求头
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 优化日志输出，GET请求不显示undefined
      if (config.method?.toUpperCase() === 'GET') {
        console.log(`请求: ${config.method.toUpperCase()} ${config.url}`);
      } else {
        console.log(`请求: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      
      return config;
    } catch (error) {
      console.error('请求拦截器错误:', error);
      return config;
    }
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`响应: ${response.config.url}`, response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('API错误:', error);
    
    // 检查是否是网络错误
    if (!error.response) {
      console.error('网络错误: 无法连接到服务器');
      // 检查API_BASE_URL是否正确
      console.error('当前API地址:', API_BASE_URL);
      console.error('请确保服务器正在运行，并且可以通过此地址访问');
      error.message = '网络错误: 无法连接到服务器，请检查您的网络连接和服务器状态';
      return Promise.reject(error);
    }
    
    if (error.response) {
      // 服务器返回了错误响应
      console.error('响应错误:', error.response.status, error.response.data);
      
      // 处理502错误（网关错误）
      if (error.response.status === 502) {
        console.error('服务器网关错误(502)，服务器可能暂时不可用');
        error.message = '服务器暂时不可用，请稍后再试或联系管理员';
        return Promise.reject(error);
      }
      
      // 处理401错误（未授权，通常是token过期）
      if (error.response.status === 401) {
        console.log('认证失败，清除token和用户数据');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userData');
        // 这里可以添加重定向到登录页的逻辑
      }
      
      // 处理400错误（通常是表单验证错误）
      if (error.response.status === 400) {
        console.error('请求参数错误:', error.response.data);
      }
      
      // 处理500错误（服务器内部错误）
      if (error.response.status === 500) {
        console.error('服务器内部错误:', error.response.data);
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('网络错误: 未收到服务器响应，请检查服务器状态和网络连接');
      error.message = '网络错误: 未能连接到服务器，请检查您的网络连接';
    } else {
      // 请求配置出错
      console.error('请求错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 