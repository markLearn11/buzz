import { Request, Response } from 'express';
import User from '../models/user.model';
import Video from '../models/video.model';
import { AppError } from '../middlewares/error.middleware';
import { uploadToOSS, deleteFromOSS } from '../services/oss.service';
import path from 'path';
import mongoose from 'mongoose';

// 用户文档接口
interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
}

// 获取用户资料
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 获取用户视频数量
    const videoCount = await Video.countDocuments({ user: user._id });

    // 获取用户总获赞数
    const videos = await Video.find({ user: user._id }).select('likes');
    const totalLikes = videos.reduce((sum, video) => sum + video.likes.length, 0);

    res.json({
      ...user,
      videoCount,
      totalLikes
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 更新用户资料
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { username, bio } = req.body;
    
    // 检查用户名是否已被使用
    if (username) {
      const existingUser = await User.findOne({ username }) as UserDocument | null;
      if (existingUser && existingUser._id.toString() !== (req.user as any)._id.toString()) {
        throw new AppError('该用户名已被使用', 400);
      }
    }

    // 更新用户资料
    const updatedUser = await User.findByIdAndUpdate(
      (req.user as any)._id,
      { 
        username: username || (req.user as any).username,
        bio: bio || (req.user as any).bio
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      throw new AppError('用户不存在', 404);
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 更新用户头像
export const updateUserAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new AppError('请上传头像文件', 400);
    }

    const user = await User.findById((req.user as any)._id);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 如果用户已有头像，删除旧头像
    if (user.avatar) {
      const oldAvatarPath = user.avatar.split('/').pop();
      if (oldAvatarPath) {
        try {
          await deleteFromOSS(`avatars/${oldAvatarPath}`);
        } catch (error) {
          console.error('删除旧头像失败:', error);
        }
      }
    }

    // 上传新头像到OSS
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${(req.user as any)._id}_${Date.now()}${fileExt}`;
    const ossPath = `avatars/${fileName}`;
    
    const avatarUrl = await uploadToOSS(req.file.path, ossPath);

    // 更新用户头像
    const updatedUser = await User.findByIdAndUpdate(
      (req.user as any)._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 关注用户
export const followUser = async (req: Request, res: Response) => {
  try {
    const userToFollow = await User.findById(req.params.id) as UserDocument | null;
    const currentUser = await User.findById((req.user as any)._id) as UserDocument | null;

    if (!userToFollow) {
      throw new AppError('要关注的用户不存在', 404);
    }

    if (!currentUser) {
      throw new AppError('当前用户不存在', 404);
    }

    // 检查是否已关注
    const followingIds = currentUser.following.map(id => id.toString());
    if (followingIds.includes(userToFollow._id.toString())) {
      throw new AppError('已经关注了该用户', 400);
    }

    // 不能关注自己
    if (currentUser._id.toString() === userToFollow._id.toString()) {
      throw new AppError('不能关注自己', 400);
    }

    // 添加关注关系
    await User.findByIdAndUpdate(
      currentUser._id,
      { $push: { following: userToFollow._id } }
    );

    await User.findByIdAndUpdate(
      userToFollow._id,
      { $push: { followers: currentUser._id } }
    );

    res.json({ message: '关注成功' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 取消关注用户
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const userToUnfollow = await User.findById(req.params.id) as UserDocument | null;
    const currentUser = await User.findById((req.user as any)._id) as UserDocument | null;

    if (!userToUnfollow) {
      throw new AppError('要取消关注的用户不存在', 404);
    }

    if (!currentUser) {
      throw new AppError('当前用户不存在', 404);
    }

    // 检查是否已关注
    const followingIds = currentUser.following.map(id => id.toString());
    if (!followingIds.includes(userToUnfollow._id.toString())) {
      throw new AppError('未关注该用户', 400);
    }

    // 移除关注关系
    await User.findByIdAndUpdate(
      currentUser._id,
      { $pull: { following: userToUnfollow._id } }
    );

    await User.findByIdAndUpdate(
      userToUnfollow._id,
      { $pull: { followers: currentUser._id } }
    );

    res.json({ message: '取消关注成功' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取用户关注列表
export const getUserFollowing = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', '_id username avatar bio')
      .select('following');

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.json(user.following);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取用户粉丝列表
export const getUserFollowers = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', '_id username avatar bio')
      .select('followers');

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.json(user.followers);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
}; 