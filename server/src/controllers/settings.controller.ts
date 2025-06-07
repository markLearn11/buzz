import { Request, Response } from 'express';
import UserSettings, { INotificationSettings, IPrivacySettings, IAppearanceSettings } from '../models/settings.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// 获取用户设置
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    // 获取当前用户ID
    const userId = (req.user as any)._id;

    // 查找用户设置
    let userSettings = await UserSettings.findOne({ userId });

    // 如果设置不存在，创建默认设置
    if (!userSettings) {
      userSettings = await UserSettings.create({ userId });
    }

    res.status(200).json(userSettings);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '获取用户设置失败'
    });
  }
};

// 更新通知设置
export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    // 获取当前用户ID
    const userId = (req.user as any)._id;
    const notificationSettings: INotificationSettings = req.body;

    // 验证请求数据
    if (typeof notificationSettings !== 'object') {
      throw new AppError('无效的通知设置数据', 400);
    }

    // 查找并更新用户设置
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { notifications: notificationSettings } },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedSettings.notifications);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '更新通知设置失败'
    });
  }
};

// 更新隐私设置
export const updatePrivacySettings = async (req: Request, res: Response) => {
  try {
    // 获取当前用户ID
    const userId = (req.user as any)._id;
    const privacySettings: IPrivacySettings = req.body;

    // 验证请求数据
    if (typeof privacySettings !== 'object') {
      throw new AppError('无效的隐私设置数据', 400);
    }

    // 查找并更新用户设置
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { privacy: privacySettings } },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedSettings.privacy);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '更新隐私设置失败'
    });
  }
};

// 更新外观设置
export const updateAppearanceSettings = async (req: Request, res: Response) => {
  try {
    // 获取当前用户ID
    const userId = (req.user as any)._id;
    const appearanceSettings: IAppearanceSettings = req.body;

    // 验证请求数据
    if (typeof appearanceSettings !== 'object') {
      throw new AppError('无效的外观设置数据', 400);
    }

    // 查找并更新用户设置
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { appearance: appearanceSettings } },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedSettings.appearance);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '更新外观设置失败'
    });
  }
};

// 更新语言设置
export const updateLanguage = async (req: Request, res: Response) => {
  try {
    // 获取当前用户ID
    const userId = (req.user as any)._id;
    const { language } = req.body;

    // 验证请求数据
    if (!language || typeof language !== 'string' || !['zh', 'en', 'ja', 'ko'].includes(language)) {
      throw new AppError('无效的语言设置数据', 400);
    }

    // 查找并更新用户设置
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { language } },
      { new: true, upsert: true }
    );

    res.status(200).json({ language: updatedSettings.language });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '更新语言设置失败'
    });
  }
};

// 清除缓存
export const clearCache = async (req: Request, res: Response) => {
  try {
    // 这里应该实现实际的缓存清理逻辑
    // 由于这是一个模拟操作，我们只返回成功消息
    
    res.status(200).json({ 
      message: '缓存已清除',
      clearedSize: '32.5 MB'
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '清除缓存失败'
    });
  }
};

// 获取存储信息
export const getStorageInfo = async (req: Request, res: Response) => {
  try {
    // 这里应该实现实际的存储计算逻辑
    // 由于这是一个模拟操作，我们返回模拟数据
    
    res.status(200).json({
      cacheSize: '32.5 MB',
      documentSize: '15.2 MB',
      mediaSize: '34.8 MB',
      totalSize: '82.5 MB'
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      message: error.message || '获取存储信息失败'
    });
  }
}; 