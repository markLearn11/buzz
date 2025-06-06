import express from 'express';
import {
  createComment,
  getVideoComments,
  getCommentReplies,
  likeComment,
  unlikeComment,
  deleteComment
} from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// 创建评论
router.post('/', protect, createComment);

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

export default router; 