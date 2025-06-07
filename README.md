# Buzz 短视频应用

Buzz是一款创新的短视频社交平台，致力于连接创作者和观众，让每个人都能发现和分享精彩内容。

## 设置系统

应用包含完整的设置管理系统，允许用户自定义应用体验。所有设置支持前后端同步，即使在离线状态下也能正常工作。

### 设置页面列表

- **通知设置**：管理各类通知的开关，包括点赞、评论、关注等
- **隐私设置**：控制账户隐私、互动权限和数据个性化等
- **语言设置**：多语言支持，包括中文、英文、日语和韩语
- **外观设置**：暗黑/浅色模式切换，文本大小调整
- **存储与缓存**：管理应用存储，清除缓存
- **关于我们**：应用信息、开发者信息和设备信息

### 前后端同步机制

所有设置页面采用统一的数据处理流程：

1. 首先尝试从后端API获取最新设置
2. 如果API请求成功，更新本地存储以保持同步
3. 如果API请求失败，从本地存储加载设置
4. 当用户修改设置时，先更新本地存储，再将更改同步到服务器
5. 即使服务器同步失败，本地设置也不会丢失

### 后端API端点

- `GET /settings`：获取所有用户设置
- `PUT /settings/notifications`：更新通知设置
- `PUT /settings/privacy`：更新隐私设置
- `PUT /settings/appearance`：更新外观设置
- `PUT /settings/language`：更新语言设置
- `GET /settings/storage`：获取存储信息
- `POST /settings/clear-cache`：清除缓存

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行iOS模拟器
npm run ios

# 运行Android模拟器
npm run android
```

## 技术栈

- React Native
- Expo
- Redux & Redux Toolkit
- React Navigation
- AsyncStorage
- Node.js 后端
- MongoDB

## 许可证

© 2023 Buzz Team. 保留所有权利。