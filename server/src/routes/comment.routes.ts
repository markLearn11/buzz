/*
 * @Author: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @Date: 2025-06-06 14:54:10
 * @LastEditors: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @LastEditTime: 2025-06-08 18:30:31
 * @FilePath: /buzz/server/src/routes/comment.routes.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

// 导入自定义的 RequestWithFiles 接口，确保与 multer 类型兼容
import { RequestWithFiles } from '../types/request';

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

// 创建评论 - 添加多图片上传支持
const uploadImages = upload.fields([
  { name: 'image0', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 },
  { name: 'image6', maxCount: 1 },
  { name: 'image7', maxCount: 1 },
  { name: 'image8', maxCount: 1 },
  { name: 'image9', maxCount: 1 },
]);

// 创建评论 - 支持多图片上传
// 使用类型断言解决类型不兼容问题
router.post('/', protect, uploadImages, createComment as express.RequestHandler);

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