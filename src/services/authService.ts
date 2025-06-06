import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../store/slices/authSlice';

// 用户登录
export const login = async (email: string, password: string, retryCount = 0) => {
  try {
    console.log('发送登录请求:', { email });
    console.log('API地址:', api.defaults.baseURL);
    
    const response = await api.post('/auth/login', { email, password });
    const { token, ...userData } = response.data;
    
    console.log('登录成功, 保存token和用户数据');
    // 保存token和用户数据到AsyncStorage
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('Token和用户数据保存成功');
    } catch (storageError) {
      console.error('保存登录信息失败:', storageError);
      throw new Error('无法保存登录信息，请检查设备存储空间');
    }
    
    return userData;
  } catch (error: any) {
    console.error('登录请求失败:', error);
    
    // 添加重试逻辑，最多重试2次
    if (retryCount < 2 && (!error.response || error.response.status === 502)) {
      console.log(`尝试第${retryCount + 1}次重试登录...`);
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
      return login(email, password, retryCount + 1);
    }
    
    // 检查是否是网络连接问题
    if (!error.response) {
      console.error('网络连接错误，无法连接到服务器');
      throw new Error('网络连接失败，请检查您的网络设置或服务器状态');
    }
    
    // 特别处理502错误
    if (error.response && error.response.status === 502) {
      console.error('服务器网关错误(502)，服务器可能暂时不可用');
      throw new Error('服务器暂时不可用，请检查后端服务是否正常运行');
    }
    
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || '登录失败';
      console.error('服务器返回错误:', errorMessage);
      
      if (error.response.status === 401) {
        throw new Error('邮箱或密码不正确，请重新输入');
      } else {
        throw new Error(errorMessage);
      }
    }
    throw new Error('登录时出错，请检查您的网络连接或服务器状态');
  }
};

// 用户注册
export const register = async (username: string, email: string, password: string) => {
  try {
    console.log('发送注册请求:', { username, email });
    console.log('API地址:', api.defaults.baseURL);
    
    const response = await api.post('/auth/register', { username, email, password });
    const { token, ...userData } = response.data;
    
    console.log('注册成功, 保存token和用户数据');
    // 保存token和用户数据到AsyncStorage
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('Token和用户数据保存成功');
    } catch (storageError) {
      console.error('保存登录信息失败:', storageError);
      throw new Error('无法保存登录信息，请检查设备存储空间');
    }
    
    return userData;
  } catch (error: any) {
    console.error('注册请求失败:', error);
    
    // 检查是否是网络连接问题
    if (!error.response) {
      console.error('网络连接错误，无法连接到服务器');
      throw new Error('网络连接失败，请检查您的网络设置或服务器状态');
    }
    
    // 根据不同错误类型提供更详细的错误信息
    if (error.response) {
      // 服务器返回了错误
      const serverError = error.response.data;
      console.error('服务器响应错误:', serverError);
      
      // 提取服务器返回的错误信息
      const errorMessage = serverError.message || '注册失败';
      
      if (errorMessage.includes('邮箱已被注册')) {
        throw new Error('该邮箱已被注册，请使用其他邮箱或尝试找回密码');
      } else if (errorMessage.includes('用户名已被使用')) {
        throw new Error('该用户名已被使用，请选择其他用户名');
      } else {
        throw new Error(errorMessage);
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('网络错误: 未收到服务器响应');
      throw new Error('网络连接失败，请检查您的网络设置或稍后再试');
    } else {
      // 请求设置时出错
      console.error('请求错误:', error.message);
      throw new Error('注册过程中发生错误，请稍后再试');
    }
  }
};

// 用户登出
export const logout = async () => {
  try {
    // 从AsyncStorage移除token和用户数据
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error: any) {
    console.error('登出失败:', error);
    throw new Error('登出失败');
  }
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    // 保存最新的用户数据到AsyncStorage
    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '获取用户信息失败');
    }
    throw new Error('获取用户信息失败，请检查您的网络连接');
  }
};

// 更新用户资料
export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    console.log('发送更新资料请求:', { userId, ...userData });
    // 确保将userId也传递给服务器，让服务器知道要更新哪个用户
    const response = await api.put(`/users/profile`, userData);
    console.log('更新资料响应:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('更新资料失败:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '更新用户资料失败');
    }
    throw new Error('更新用户资料失败，请检查您的网络连接');
  }
};

// 更新用户头像
export const updateUserAvatar = async (userId: string, formData: FormData) => {
  try {
    console.log('发送头像更新请求:', { userId, formData });
    // 使用正确的API路径
    const response = await api.put(`/users/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('头像更新响应:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('头像更新失败:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '更新用户头像失败');
    }
    throw new Error('更新用户头像失败，请检查您的网络连接');
  }
};

// 获取其他用户信息
export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '获取用户信息失败');
    }
    throw new Error('获取用户信息失败，请检查您的网络连接');
  }
}; 