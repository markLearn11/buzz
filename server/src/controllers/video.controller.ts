import { Request, Response } from 'express';
import Video from '../models/video.model';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { uploadToOSS, deleteFromOSS } from '../services/oss.service';
import path from 'path';
import fs from 'fs';

// 扩展Request接口，添加files属性
interface RequestWithFiles extends Request {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}

// 上传视频
export const uploadVideo = async (req: RequestWithFiles, res: Response) => {
  try {
    const { title, description, tags, isPrivate } = req.body;
    
    // 检查是否上传了视频文件
    if (!req.files || !req.files['video']) {
      throw new AppError('请上传视频文件', 400);
    }
    
    const videoFile = req.files['video'][0];
    
    // 上传视频到OSS
    const videoExt = path.extname(videoFile.originalname);
    const videoFileName = `${req.user._id}_${Date.now()}${videoExt}`;
    const videoOssPath = `videos/${videoFileName}`;
    
    const videoUrl = await uploadToOSS(videoFile.path, videoOssPath);
    
    // 如果上传了封面图，也上传到OSS
    let coverUrl = '';
    if (req.files['cover'] && req.files['cover'].length > 0) {
      const coverFile = req.files['cover'][0];
      
      const coverExt = path.extname(coverFile.originalname);
      const coverFileName = `${req.user._id}_${Date.now()}${coverExt}`;
      const coverOssPath = `covers/${coverFileName}`;
      
      coverUrl = await uploadToOSS(coverFile.path, coverOssPath);
    }
    
    // 创建视频记录
    const video = await Video.create({
      user: req.user._id,
      title,
      description: description || '',
      videoUrl,
      coverUrl,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      isPrivate: isPrivate === 'true'
    });
    
    res.status(201).json(video);
  } catch (error: any) {
    // 如果上传过程中出错，清理临时文件
    if (req.files) {
      if (req.files['video']) {
        const videoFile = req.files['video'][0];
        if (fs.existsSync(videoFile.path)) {
          fs.unlinkSync(videoFile.path);
        }
      }
      
      if (req.files['cover'] && req.files['cover'].length > 0) {
        const coverFile = req.files['cover'][0];
        if (fs.existsSync(coverFile.path)) {
          fs.unlinkSync(coverFile.path);
        }
      }
    }
    
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取视频详情
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', '_id username avatar')
      .lean();
    
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 如果视频是私有的，只有视频所有者可以查看
    if (video.isPrivate && (!req.user || video.user._id.toString() !== req.user._id.toString())) {
      throw new AppError('无权查看该视频', 403);
    }
    
    // 增加观看次数
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    // 检查当前用户是否已点赞该视频
    let isLiked = false;
    if (req.user) {
      isLiked = video.likes.some((like: any) => like.toString() === req.user._id.toString());
    }
    
    res.json({
      ...video,
      isLiked
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取视频列表（分页）
export const getVideos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // 基本查询条件：公开视频或当前用户的私有视频
    const query: any = {
      $or: [
        { isPrivate: false }
      ]
    };
    
    // 如果用户已登录，添加查看自己私有视频的条件
    if (req.user) {
      query.$or.push({ 
        isPrivate: true, 
        user: req.user._id 
      });
    }
    
    // 如果提供了标签过滤
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // 如果提供了搜索关键词
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }
    
    // 获取视频总数
    const total = await Video.countDocuments(query);
    
    // 获取视频列表
    const videos = await Video.find(query)
      .populate('user', '_id username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 如果用户已登录，标记用户是否已点赞每个视频
    if (req.user) {
      videos.forEach((video: any) => {
        video.isLiked = video.likes.some((like: any) => 
          like.toString() === req.user._id.toString()
        );
      });
    }
    
    res.json({
      videos,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取用户视频列表
export const getUserVideos = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // 检查用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }
    
    // 查询条件：指定用户的公开视频，或者如果是当前用户查看自己的视频，则包括私有视频
    const query: any = { user: userId };
    
    // 如果不是查看自己的视频，则只显示公开视频
    if (!req.user || req.user._id.toString() !== userId.toString()) {
      query.isPrivate = false;
    }
    
    // 获取视频总数
    const total = await Video.countDocuments(query);
    
    // 获取视频列表
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 如果用户已登录，标记用户是否已点赞每个视频
    if (req.user) {
      videos.forEach((video: any) => {
        video.isLiked = video.likes.some((like: any) => 
          like.toString() === req.user._id.toString()
        );
      });
    }
    
    res.json({
      videos,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 点赞视频
export const likeVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 检查用户是否已点赞
    if (video.likes.includes(req.user._id)) {
      throw new AppError('已经点赞过该视频', 400);
    }
    
    // 添加点赞
    video.likes.push(req.user._id);
    await video.save();
    
    res.json({ message: '点赞成功', likesCount: video.likes.length });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 取消点赞
export const unlikeVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 检查用户是否已点赞
    if (!video.likes.includes(req.user._id)) {
      throw new AppError('尚未点赞该视频', 400);
    }
    
    // 移除点赞
    video.likes = video.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    await video.save();
    
    res.json({ message: '取消点赞成功', likesCount: video.likes.length });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 删除视频
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 检查是否为视频所有者
    if (video.user.toString() !== req.user._id.toString()) {
      throw new AppError('无权删除该视频', 403);
    }
    
    // 从OSS删除视频文件
    const videoPath = video.videoUrl.split('/').pop();
    if (videoPath) {
      try {
        await deleteFromOSS(`videos/${videoPath}`);
      } catch (error) {
        console.error('删除视频文件失败:', error);
      }
    }
    
    // 如果有封面，也从OSS删除
    if (video.coverUrl) {
      const coverPath = video.coverUrl.split('/').pop();
      if (coverPath) {
        try {
          await deleteFromOSS(`covers/${coverPath}`);
        } catch (error) {
          console.error('删除封面文件失败:', error);
        }
      }
    }
    
    // 删除视频记录
    await video.deleteOne();
    
    res.json({ message: '视频删除成功' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 更新视频信息
export const updateVideo = async (req: RequestWithFiles, res: Response) => {
  try {
    const { title, description, tags, isPrivate } = req.body;
    
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 检查是否为视频所有者
    if (video.user.toString() !== req.user._id.toString()) {
      throw new AppError('无权更新该视频', 403);
    }
    
    // 更新视频信息
    video.title = title || video.title;
    video.description = description !== undefined ? description : video.description;
    video.isPrivate = isPrivate === 'true';
    
    if (tags) {
      video.tags = tags.split(',').map((tag: string) => tag.trim());
    }
    
    // 如果上传了新封面
    if (req.files && req.files['cover'] && req.files['cover'].length > 0) {
      const coverFile = req.files['cover'][0];
      
      // 删除旧封面
      if (video.coverUrl) {
        const oldCoverPath = video.coverUrl.split('/').pop();
        if (oldCoverPath) {
          try {
            await deleteFromOSS(`covers/${oldCoverPath}`);
          } catch (error) {
            console.error('删除旧封面失败:', error);
          }
        }
      }
      
      // 上传新封面
      const coverExt = path.extname(coverFile.originalname);
      const coverFileName = `${req.user._id}_${Date.now()}${coverExt}`;
      const coverOssPath = `covers/${coverFileName}`;
      
      const coverUrl = await uploadToOSS(coverFile.path, coverOssPath);
      video.coverUrl = coverUrl;
    }
    
    await video.save();
    
    res.json(video);
  } catch (error: any) {
    // 清理临时文件
    if (req.files && req.files['cover'] && req.files['cover'].length > 0) {
      const coverFile = req.files['cover'][0];
      if (fs.existsSync(coverFile.path)) {
        fs.unlinkSync(coverFile.path);
      }
    }
    
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 检查视频点赞状态
export const checkVideoLikeStatus = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 检查用户是否已点赞
    const isLiked = video.likes.includes(req.user._id);
    
    res.json({ 
      isLiked,
      videoId: req.params.id 
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
}; 