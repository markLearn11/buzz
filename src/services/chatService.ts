import api from './api';

// 获取聊天列表
export const fetchChatList = async () => {
  try {
    const response = await api.get('/chats');
    return response.data;
  } catch (error) {
    console.error('获取聊天列表失败:', error);
    throw error;
  }
};

// 获取与特定用户的聊天消息
export const fetchChatMessages = async (chatId: string, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    throw error;
  }
};

// 发送消息
export const sendMessage = async (chatId: string, content: string, messageType = 'text') => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, {
      content,
      messageType
    });
    return response.data;
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
};

// 创建新的聊天
export const createChat = async (recipientId: string) => {
  try {
    const response = await api.post('/chats', { recipientId });
    return response.data;
  } catch (error) {
    console.error('创建聊天失败:', error);
    throw error;
  }
};

// 标记聊天为已读
export const markChatAsRead = async (chatId: string) => {
  try {
    const response = await api.put(`/chats/${chatId}/read`);
    return response.data;
  } catch (error) {
    console.error('标记聊天已读失败:', error);
    throw error;
  }
}; 