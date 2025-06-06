import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  username: string;
  socketId: string;
}

// 在线用户映射
const onlineUsers = new Map<string, User>();

export const setupSocketIO = (io: SocketIOServer): void => {
  // 中间件：验证用户身份
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('未提供认证令牌'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string, username: string };
      socket.data.user = { id: decoded.id, username: decoded.username };
      next();
    } catch (error) {
      next(new Error('无效的认证令牌'));
    }
  });
  
  io.on('connection', (socket: Socket) => {
    console.log(`用户已连接: ${socket.id}`);
    
    const user = socket.data.user;
    
    if (user) {
      // 将用户添加到在线用户列表
      onlineUsers.set(user.id, {
        ...user,
        socketId: socket.id
      });
      
      // 广播用户在线状态
      io.emit('userStatus', {
        userId: user.id,
        status: 'online'
      });
      
      // 加入个人房间
      socket.join(`user:${user.id}`);
    }
    
    // 发送私信
    socket.on('sendMessage', async (data: { receiverId: string, content: string }) => {
      const { receiverId, content } = data;
      const senderId = user?.id;
      
      if (!senderId) {
        socket.emit('error', { message: '未授权' });
        return;
      }
      
      try {
        // 这里可以将消息保存到数据库
        // const message = await MessageModel.create({ senderId, receiverId, content });
        
        // 发送消息到接收者
        const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
        
        // 发送到发送者
        socket.emit('newMessage', {
          senderId,
          receiverId,
          content,
          createdAt: new Date(),
          isSent: true
        });
        
        // 发送到接收者
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', {
            senderId,
            receiverId,
            content,
            createdAt: new Date(),
            isReceived: true
          });
        }
      } catch (error) {
        console.error('发送消息错误:', error);
        socket.emit('error', { message: '发送消息失败' });
      }
    });
    
    // 视频评论通知
    socket.on('commentVideo', (data: { videoOwnerId: string, videoId: string, commentId: string }) => {
      const { videoOwnerId, videoId, commentId } = data;
      const commenterId = user?.id;
      
      if (videoOwnerId !== commenterId) {
        const ownerSocketId = onlineUsers.get(videoOwnerId)?.socketId;
        
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('newComment', {
            videoId,
            commentId,
            commenterId
          });
        }
      }
    });
    
    // 视频点赞通知
    socket.on('likeVideo', (data: { videoOwnerId: string, videoId: string }) => {
      const { videoOwnerId, videoId } = data;
      const likerId = user?.id;
      
      if (videoOwnerId !== likerId) {
        const ownerSocketId = onlineUsers.get(videoOwnerId)?.socketId;
        
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('newLike', {
            videoId,
            likerId
          });
        }
      }
    });
    
    // 用户输入状态
    socket.on('typing', (data: { receiverId: string, isTyping: boolean }) => {
      const { receiverId, isTyping } = data;
      const senderId = user?.id;
      
      if (senderId) {
        const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userTyping', {
            userId: senderId,
            isTyping
          });
        }
      }
    });
    
    // 断开连接
    socket.on('disconnect', () => {
      console.log(`用户已断开连接: ${socket.id}`);
      
      if (user) {
        onlineUsers.delete(user.id);
        
        // 广播用户离线状态
        io.emit('userStatus', {
          userId: user.id,
          status: 'offline'
        });
      }
    });
  });
}; 