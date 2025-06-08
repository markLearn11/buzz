import { Request, Response } from 'express';
import Comment from '../models/comment.model';
import Video from '../models/video.model';
import { AppError } from '../middlewares/error.middleware';
import { uploadToOSS } from '../services/oss.service';
import path from 'path';
import { RequestWithFiles } from '../types/request';

// 创建评论
export const createComment = async (req: RequestWithFiles, res: Response) => {
  try {
    const { videoId, content, parentCommentId, emojisData } = req.body;
    const imageCount = req.body.imageCount ? parseInt(req.body.imageCount) : 0;
    
    // 检查视频是否存在
    const video = await Video.findById(videoId);
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 验证至少有一种内容（文本、图片或表情）
    const hasEmojis = emojisData && JSON.parse(emojisData).length > 0;
    const hasImages = imageCount > 0 || req.file;
    
    if (!content && !hasImages && !hasEmojis) {
      throw new AppError('评论内容不能为空', 400);
    }
    
    // 创建评论数据
    const commentData: any = {
      user: req.user._id,
      video: videoId,
      content: content || ''
    };
    
    // 处理表情数据
    if (emojisData) {
      try {
        const emojis = JSON.parse(emojisData);
        if (emojis.length > 0) {
          // 存储第一个表情作为主表情，其余记录在额外字段中
          const firstEmoji = emojis[0];
          commentData.emojiType = firstEmoji.type;
          commentData.emojiId = firstEmoji.id;
          commentData.emojisData = emojisData; // 存储全部表情数据
        }
      } catch (e) {
        console.error('解析表情数据失败:', e);
      }
    }
    
    // 处理单张图片上传
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${req.user._id}_${Date.now()}${fileExt}`;
      const ossPath = `comments/${fileName}`;
      
      const imageUrl = await uploadToOSS(req.file.path, ossPath);
      commentData.imageUrl = imageUrl;
    }
    
    // 处理多图片上传
    if (req.files && imageCount > 0) {
      const imageUrls = [];
      
      for (let i = 0; i < imageCount; i++) {
        const imageField = `image${i}`;
        if (req.files[imageField] && req.files[imageField][0]) {
          const file = req.files[imageField][0];
          const fileExt = path.extname(file.originalname);
          const fileName = `${req.user._id}_${Date.now()}_${i}${fileExt}`;
          const ossPath = `comments/${fileName}`;
          
          const imageUrl = await uploadToOSS(file.path, ossPath);
          imageUrls.push(imageUrl);
        }
      }
      
      // 将第一张图片作为主图片，其余图片存储在额外字段中
      if (imageUrls.length > 0) {
        commentData.imageUrl = imageUrls[0];
        if (imageUrls.length > 1) {
          commentData.imageUrls = JSON.stringify(imageUrls);
        }
      }
    }
    
    // 如果是回复评论，添加父评论ID
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new AppError('父评论不存在', 404);
      }
      commentData.parentComment = parentCommentId;
    }
    
    // 创建评论
    const comment = await Comment.create(commentData);
    
    // 添加评论到视频
    await Video.findByIdAndUpdate(videoId, {
      $push: { comments: comment._id }
    });
    
    // 如果是回复评论，添加到父评论的回复列表
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }
    
    // 返回完整评论信息
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username avatar')
      .lean();
    
    res.status(201).json(populatedComment);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取视频评论
export const getVideoComments = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.videoId;
    
    // 检查视频是否存在
    const video = await Video.findById(videoId);
    if (!video) {
      throw new AppError('视频不存在', 404);
    }
    
    // 分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // 只获取顶级评论（非回复）
    const comments = await Comment.find({
      video: videoId,
      parentComment: { $exists: false }
    })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 获取每个评论的回复数量
    const commentsWithReplyCount = await Promise.all(
      comments.map(async (comment: any) => {
        const replyCount = await Comment.countDocuments({
          parentComment: comment._id
        });
        
        // 检查当前用户是否已点赞该评论
        let isLiked = false;
        if (req.user) {
          isLiked = comment.likes.some((like: any) => 
            like.toString() === req.user._id.toString()
          );
        }
        
        return {
          ...comment,
          replyCount,
          isLiked
        };
      })
    );
    
    // 获取评论总数
    const totalComments = await Comment.countDocuments({
      video: videoId,
      parentComment: { $exists: false }
    });
    
    res.json({
      comments: commentsWithReplyCount,
      page,
      limit,
      total: totalComments,
      totalPages: Math.ceil(totalComments / limit)
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取评论回复
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    
    // 检查评论是否存在
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('评论不存在', 404);
    }
    
    // 分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // 获取回复
    const replies = await Comment.find({
      parentComment: commentId
    })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // 检查当前用户是否已点赞每个回复
    if (req.user) {
      replies.forEach((reply: any) => {
        reply.isLiked = reply.likes.some((like: any) => 
          like.toString() === req.user._id.toString()
        );
      });
    }
    
    // 获取回复总数
    const totalReplies = await Comment.countDocuments({
      parentComment: commentId
    });
    
    res.json({
      replies,
      page,
      limit,
      total: totalReplies,
      totalPages: Math.ceil(totalReplies / limit)
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 点赞评论
export const likeComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    
    // 检查评论是否存在
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('评论不存在', 404);
    }
    
    // 检查用户是否已点赞
    if (comment.likes.includes(req.user._id)) {
      throw new AppError('已经点赞过该评论', 400);
    }
    
    // 添加点赞
    comment.likes.push(req.user._id);
    await comment.save();
    
    res.json({
      message: '点赞成功',
      likesCount: comment.likes.length
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 取消点赞评论
export const unlikeComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    
    // 检查评论是否存在
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('评论不存在', 404);
    }
    
    // 检查用户是否已点赞
    if (!comment.likes.includes(req.user._id)) {
      throw new AppError('尚未点赞该评论', 400);
    }
    
    // 移除点赞
    comment.likes = comment.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    await comment.save();
    
    res.json({
      message: '取消点赞成功',
      likesCount: comment.likes.length
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 删除评论
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    
    // 检查评论是否存在
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('评论不存在', 404);
    }
    
    // 检查是否为评论所有者
    if (comment.user.toString() !== req.user._id.toString()) {
      throw new AppError('无权删除该评论', 403);
    }
    
    // 从视频中移除评论
    await Video.findByIdAndUpdate(comment.video, {
      $pull: { comments: commentId }
    });
    
    // 如果是回复，从父评论中移除
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }
    
    // 删除所有回复
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: commentId });
    }
    
    // 删除评论
    await comment.deleteOne();
    
    res.json({ message: '评论删除成功' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 检查评论点赞状态
export const checkCommentLikeStatus = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    
    // 检查评论是否存在
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError('评论不存在', 404);
    }
    
    // 检查用户是否已点赞
    const isLiked = comment.likes.includes(req.user._id);
    
    res.json({
      isLiked,
      commentId
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
}; 