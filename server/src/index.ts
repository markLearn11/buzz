/*
 * @Author: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @Date: 2025-06-06 14:32:37
 * @LastEditors: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @LastEditTime: 2025-06-06 15:08:35
 * @FilePath: /buzz/server/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 导入路由
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import videoRoutes from './routes/video.routes';
import commentRoutes from './routes/comment.routes';
import chatRoutes from './routes/chat.routes';
import settingsRoutes from './routes/settings.routes';

// 导入Socket.IO处理器
import { setupSocketIO } from './services/socket.service';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 添加public目录作为静态文件服务（用于本地文件存储模式）
const publicDir = path.join(__dirname, '../../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 添加调试中间件，记录对/public路径的访问请求
app.use('/public', (req, res, next) => {
  const filePath = path.join(publicDir, req.path);
  console.log(`[静态文件请求] 路径: ${req.path}`);
  console.log(`[静态文件请求] 完整路径: ${filePath}`);
  console.log(`[静态文件请求] 文件存在: ${fs.existsSync(filePath)}`);
  
  // 如果请求的是头像文件
  if (req.path.includes('/avatars/')) {
    console.log('[头像文件请求]', req.path);
    // 列出avatars目录中的文件
    const avatarsDir = path.join(publicDir, 'avatars');
    if (fs.existsSync(avatarsDir)) {
      console.log('[头像目录内容]', fs.readdirSync(avatarsDir));
    } else {
      console.log('[头像目录不存在]', avatarsDir);
    }
  }
  
  next();
});

app.use('/public', express.static(publicDir));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/settings', settingsRoutes);

// 主页路由
app.get('/', (req, res) => {
  res.json({ message: 'Buzz API 服务正常运行' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 设置Socket.IO
setupSocketIO(io);

// 连接MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/buzz';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('已连接到MongoDB');
    
    // 启动服务器
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB连接错误:', err);
    process.exit(1);
  });

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
}); 