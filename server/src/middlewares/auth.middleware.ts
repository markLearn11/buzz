import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// 扩展Express的Request接口
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 检查请求头中是否有token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 获取token
      token = req.headers.authorization.split(' ')[1];

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };

      // 查找用户
      req.user = await User.findById(decoded.id).select('-password');

      next();
      return;
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: '未授权，token无效' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: '未授权，未提供token' });
  }
};

// 检查用户是否为管理员
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: '未授权，仅管理员可访问' });
  }
}; 