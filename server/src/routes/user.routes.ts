import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getUserProfile, 
  updateUserProfile, 
  updateUserAvatar, 
  followUser, 
  unfollowUser, 
  getUserFollowers, 
  getUserFollowing 
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// 配置Multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 仅接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 限制5MB
});

// 获取用户资料
router.get('/:id', getUserProfile);

// 更新用户资料
router.put('/profile', protect, updateUserProfile);

// 更新用户头像
router.put('/avatar', protect, upload.single('avatar'), updateUserAvatar);

// 关注用户
router.post('/follow/:id', protect, followUser);

// 取消关注用户
router.delete('/follow/:id', protect, unfollowUser);

// 获取用户关注列表
router.get('/:id/following', getUserFollowing);

// 获取用户粉丝列表
router.get('/:id/followers', getUserFollowers);

export default router; 