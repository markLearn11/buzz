import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// 确保用户类型具有_id属性
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
  comparePassword: (password: string) => Promise<boolean>;
}

// 生成JWT令牌
const generateToken = (id: string): string => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'buzz_default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// 用户注册
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      if (userExists.email === email) {
        throw new AppError('该邮箱已被注册', 400);
      } else {
        throw new AppError('该用户名已被使用', 400);
      }
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    }) as UserDocument;

    if (user) {
      // 生成令牌
      const token = generateToken(user._id.toString());

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt,
        token
      });
    } else {
      throw new AppError('无效的用户数据', 400);
    }
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 用户登录
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ email }) as UserDocument;

    if (!user) {
      throw new AppError('邮箱或密码不正确', 401);
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError('邮箱或密码不正确', 401);
    }

    // 生成令牌
    const token = generateToken(user._id.toString());

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      createdAt: user.createdAt,
      token
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 为req.user增加类型定义
    const userId = (req.user as any)._id;
    const user = await User.findById(userId) as UserDocument;

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '服务器错误'
    });
  }
}; 