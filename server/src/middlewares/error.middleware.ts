import { Request, Response, NextFunction } from 'express';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 处理404错误
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`找不到 - ${req.originalUrl}`, 404);
  next(error);
};

// 全局错误处理器
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
}; 