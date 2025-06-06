import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadVideo,
  getVideoById,
  getVideos,
  getUserVideos,
  likeVideo,
  unlikeVideo,
  deleteVideo,
  updateVideo,
  checkVideoLikeStatus
} from '../controllers/video.controller';
import { protect } from '../middlewares/auth.middleware';
import { Request } from 'express';

// 定义RequestWithFiles接口，与controller中定义的一致
interface RequestWithFiles extends Request {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}

const router = express.Router();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const coversDir = path.join(uploadsDir, 'covers');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir);
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir);

// 配置Multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, videosDir);
    } else if (file.fieldname === 'cover') {
      cb(null, coversDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'video') {
    // 接受常见视频格式
    if (
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'video/webm' ||
      file.mimetype === 'video/quicktime' ||
      file.mimetype === 'video/x-msvideo'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  } else if (file.fieldname === 'cover') {
    // 接受图片格式
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  } else {
    cb(null, false);
  }
};

// 视频大小限制（默认100MB）
const maxVideoSize = parseInt(process.env.MAX_VIDEO_SIZE || '100') * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxVideoSize
  }
});

// 视频上传处理，支持视频文件和封面图片
const videoUpload = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

// 使用类型断言解决类型不兼容问题
// 上传视频
router.post('/', protect, videoUpload, (req, res) => {
  uploadVideo(req as unknown as RequestWithFiles, res);
});

// 获取视频详情
router.get('/:id', getVideoById);

// 获取视频列表（分页、搜索、标签过滤）
router.get('/', getVideos);

// 获取用户视频列表
router.get('/user/:userId', getUserVideos);

// 点赞视频
router.post('/:id/like', protect, likeVideo);

// 取消点赞
router.delete('/:id/like', protect, unlikeVideo);

// 检查点赞状态
router.get('/:id/like/status', protect, checkVideoLikeStatus);

// 删除视频
router.delete('/:id', protect, deleteVideo);

// 更新视频信息 - 使用类型断言解决类型不兼容问题
router.put('/:id', protect, videoUpload, (req, res) => {
  updateVideo(req as unknown as RequestWithFiles, res);
});

export default router; 