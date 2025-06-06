import express from 'express';
import {
  sendMessage,
  getChatList,
  getChatMessages,
  getUnreadMessageCount
} from '../controllers/chat.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// 所有聊天相关路由都需要身份验证
router.use(protect);

// 发送消息
router.post('/', sendMessage);

// 获取聊天列表
router.get('/', getChatList);

// 获取与特定用户的聊天记录
router.get('/:userId', getChatMessages);

// 获取未读消息数量
router.get('/unread/count', getUnreadMessageCount);

export default router; 