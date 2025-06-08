import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createComment,
  getVideoComments,
  getCommentReplies,
  likeComment,
  unlikeComment,
  deleteComment,
  checkCommentLikeStatus
} from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
const commentsDir = path.join(uploadsDir, 'comments');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(commentsDir)) fs.mkdirSync(commentsDir);

// 配置Multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, commentsDir);
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

// 创建评论 - 添加图片上传支持
router.post('/', protect, upload.single('image'), createComment);

// 获取视频评论
router.get('/video/:videoId', getVideoComments);

// 获取评论回复
router.get('/:commentId/replies', getCommentReplies);

// 点赞评论
router.post('/:commentId/like', protect, likeComment);

// 取消点赞评论
router.delete('/:commentId/like', protect, unlikeComment);

// 删除评论
router.delete('/:commentId', protect, deleteComment);

// 检查评论点赞状态
router.get('/:commentId/like/status', protect, checkCommentLikeStatus);

export default router; 