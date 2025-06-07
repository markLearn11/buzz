import express from 'express';
import {
  getUserSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updateAppearanceSettings,
  updateLanguage,
  clearCache,
  getStorageInfo
} from '../controllers/settings.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// 所有设置路由都需要用户认证
router.use(protect);

// 获取用户设置
router.get('/', getUserSettings);

// 更新通知设置
router.put('/notifications', updateNotificationSettings);

// 更新隐私设置
router.put('/privacy', updatePrivacySettings);

// 更新外观设置
router.put('/appearance', updateAppearanceSettings);

// 更新语言设置
router.put('/language', updateLanguage);

// 清除缓存
router.post('/clear-cache', clearCache);

// 获取存储信息
router.get('/storage', getStorageInfo);

export default router; 