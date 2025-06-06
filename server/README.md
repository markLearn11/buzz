# Buzz 短视频社交应用后端服务

这是 Buzz 短视频社交应用的后端服务，使用 Node.js + Express + MongoDB + Socket.IO 构建。

## 功能特性

- 用户认证与授权（注册、登录、JWT令牌）
- 视频管理（上传、浏览、搜索、推荐）
- 社交互动（点赞、评论、关注）
- 实时聊天（私信、在线状态、通知）
- 文件存储（支持阿里云OSS）

## 技术栈

- **Node.js**: JavaScript运行时环境
- **Express**: Web应用框架
- **TypeScript**: 类型安全的JavaScript超集
- **MongoDB**: NoSQL数据库
- **Mongoose**: MongoDB对象模型工具
- **Socket.IO**: 实时通信库
- **JWT**: JSON Web Token用于用户认证
- **Multer**: 文件上传处理
- **阿里云OSS**: 对象存储服务

## 安装与运行

### 前提条件

- Node.js (>= 16.x)
- MongoDB (>= 4.4)
- npm 或 yarn

### 安装步骤

1. 克隆仓库
   ```bash
   git clone <仓库URL>
   cd buzz/server
   ```

2. 安装依赖
   ```bash
   npm install
   # 或
   yarn install
   ```

3. 配置环境变量
   - 复制 `.env.example` 为 `.env`
   - 按需修改配置项，尤其是MongoDB连接URI和阿里云OSS配置

4. 构建项目
   ```bash
   npm run build
   # 或
   yarn build
   ```

5. 启动服务
   ```bash
   # 开发模式
   npm run dev
   # 或
   yarn dev
   
   # 生产模式
   npm start
   # 或
   yarn start
   ```

## API文档

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户相关

- `GET /api/users/:id` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `PUT /api/users/avatar` - 更新用户头像
- `POST /api/users/follow/:id` - 关注用户
- `DELETE /api/users/follow/:id` - 取消关注用户
- `GET /api/users/:id/following` - 获取用户关注列表
- `GET /api/users/:id/followers` - 获取用户粉丝列表

### 视频相关

- `POST /api/videos` - 上传视频
- `GET /api/videos/:id` - 获取视频详情
- `GET /api/videos` - 获取视频列表
- `GET /api/videos/user/:userId` - 获取用户视频列表
- `POST /api/videos/:id/like` - 点赞视频
- `DELETE /api/videos/:id/like` - 取消点赞
- `DELETE /api/videos/:id` - 删除视频
- `PUT /api/videos/:id` - 更新视频信息

### 评论相关

- `POST /api/comments` - 创建评论
- `GET /api/comments/video/:videoId` - 获取视频评论
- `GET /api/comments/:commentId/replies` - 获取评论回复
- `POST /api/comments/:commentId/like` - 点赞评论
- `DELETE /api/comments/:commentId/like` - 取消点赞评论
- `DELETE /api/comments/:commentId` - 删除评论

### 聊天相关

- `POST /api/chats` - 发送消息
- `GET /api/chats` - 获取聊天列表
- `GET /api/chats/:userId` - 获取与特定用户的聊天记录
- `GET /api/chats/unread/count` - 获取未读消息数量

## Socket.IO事件

### 客户端事件（发送到服务器）

- `sendMessage` - 发送私信
- `commentVideo` - 评论视频通知
- `likeVideo` - 点赞视频通知
- `typing` - 用户输入状态

### 服务器事件（发送到客户端）

- `userStatus` - 用户在线状态
- `newMessage` - 新消息通知
- `newComment` - 新评论通知
- `newLike` - 新点赞通知
- `userTyping` - 用户输入状态通知

## 文件存储

默认情况下，文件上传到阿里云OSS。需要在`.env`文件中配置以下参数：

```
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
```

## 许可证

ISC 