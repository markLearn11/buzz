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

# 视频创建功能

参考抖音/快手App风格实现的视频创建功能，包括拍摄、编辑、特效、滤镜等功能。

## 主要组件

### 1. VideoCreationScreen

主页面，整合了所有功能组件，提供以下功能：
- 拍摄照片或视频
- 从相册选择媒体
- 图片编辑
- 视频编辑
- 图文动态创建

### 2. CameraPreview

相机预览组件，提供以下功能：
- 拍照
- 录制视频
- 切换前后摄像头
- 闪光灯控制
- 媒体预览

### 3. VideoEditor

视频编辑组件，提供以下功能：
- 视频剪辑
- 文字添加
- 贴纸添加
- 特效应用
- 滤镜应用
- 音乐添加
- 速度调整
- 配音

### 4. ImageEditor

图片编辑组件，提供以下功能：
- 裁剪
- 文字添加
- 贴纸添加
- 滤镜应用
- 亮度、对比度等参数调整
- 绘制
- 模糊效果

### 5. TextOverlay

文本叠加层组件，提供以下功能：
- 添加文本
- 编辑文本内容
- 拖动文本位置
- 调整文本样式（字体、颜色、大小等）
- 删除文本

### 6. StickerSelector

贴纸选择器组件，提供以下功能：
- 表情贴纸选择
- 文字贴纸选择
- 自定义文字贴纸创建
- 贴纸搜索

### 7. StickerOverlay

贴纸叠加层组件，提供以下功能：
- 添加贴纸
- 拖动贴纸位置
- 缩放和旋转贴纸
- 调整贴纸层级
- 删除贴纸

### 8. PostEditor

图文动态编辑器，提供以下功能：
- 多图片管理
- 文字内容编辑
- 话题选择
- 位置添加
- 隐私设置

## 技术特点

1. **模块化设计**：各组件高内聚、低耦合，便于维护和扩展
2. **TypeScript支持**：全面使用TypeScript，提供类型安全
3. **响应式UI**：适配不同屏幕尺寸
4. **手势支持**：支持拖动、缩放、旋转等手势操作
5. **媒体处理**：支持图片和视频的拍摄、选择和编辑
6. **UI风格统一**：参考主流短视频App的设计标准

## 使用方法

```jsx
import VideoCreationScreen from './src/screens/VideoCreationScreen';

// 在应用中使用
<VideoCreationScreen />
```

## 依赖库

- expo-camera：相机功能
- expo-av：音视频处理
- expo-image-picker：媒体选择
- expo-media-library：媒体库访问
- @react-native-community/slider：滑动控件

## 未来计划

1. 添加更多滤镜和特效
2. 优化视频编辑性能
3. 添加AI美颜功能
4. 支持更多贴纸类型
5. 添加社交分享功能