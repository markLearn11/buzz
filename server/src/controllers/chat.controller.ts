import { Request, Response } from 'express';
import Message from '../models/message.model';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

// 发送消息
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    
    // 检查接收者是否存在
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      throw new AppError('接收者不存在', 404);
    }
    
    // 不能给自己发消息
    if (receiverId === req.user._id.toString()) {
      throw new AppError('不能给自己发消息', 400);
    }
    
    // 创建消息
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content
    });
    
    // 返回完整消息信息
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .lean();
    
    res.status(201).json(populatedMessage);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取聊天列表
export const getChatList = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    // 查找所有与当前用户相关的消息
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();
    
    // 获取所有聊天对象ID
    const chatUserIds = messages.map(message => {
      return message.sender.toString() === userId.toString()
        ? message.receiver
        : message.sender;
    });
    
    // 去重
    const uniqueChatUserIds = [...new Set(chatUserIds)];
    
    // 获取每个聊天的最新消息和未读消息数量
    const chatList = await Promise.all(
      uniqueChatUserIds.map(async (chatUserId) => {
        // 获取聊天对象信息
        const chatUser = await User.findById(chatUserId)
          .select('username avatar')
          .lean();
        
        // 获取最新消息
        const latestMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: chatUserId },
            { sender: chatUserId, receiver: userId }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();
        
        // 获取未读消息数量
        const unreadCount = await Message.countDocuments({
          sender: chatUserId,
          receiver: userId,
          isRead: false
        });
        
        return {
          user: chatUser,
          latestMessage,
          unreadCount
        };
      })
    );
    
    // 按最新消息时间排序，过滤掉没有最新消息的项
    const filteredChatList = chatList.filter(chat => chat.latestMessage);
    
    filteredChatList.sort((a, b) => {
      if (!a.latestMessage || !b.latestMessage) return 0;
      return new Date(b.latestMessage.createdAt).getTime() - 
             new Date(a.latestMessage.createdAt).getTime();
    });
    
    res.json(filteredChatList);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取与特定用户的聊天记录
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;
    
    // 检查对方用户是否存在
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      throw new AppError('用户不存在', 404);
    }
    
    // 分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const skip = (page - 1) * limit;
    
    // 获取消息
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .sort({ createdAt: -1 }) // 降序获取，最新的消息在前面
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 标记消息为已读
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );
    
    // 按时间升序返回消息
    const sortedMessages = messages.reverse();
    
    // 获取消息总数
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });
    
    res.json({
      messages: sortedMessages,
      user: {
        _id: otherUser._id,
        username: otherUser.username,
        avatar: otherUser.avatar
      },
      page,
      limit,
      total: totalMessages,
      totalPages: Math.ceil(totalMessages / limit)
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取未读消息数量
export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    // 获取未读消息总数
    const totalUnread = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });
    
    res.json({ unreadCount: totalUnread });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
}; 