import mongoose, { Schema, Document } from 'mongoose';

// 通知设置接口
export interface INotificationSettings {
  likes: boolean;
  comments: boolean;
  followers: boolean;
  mentions: boolean;
  directMessages: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
}

// 隐私设置接口
export interface IPrivacySettings {
  privateAccount: boolean;
  showActivityStatus: boolean;
  allowDirectMessages: string; // 'everyone', 'followers', 'none'
  allowComments: string; // 'everyone', 'followers', 'none'
  showLikedVideos: boolean;
  dataPersonalization: boolean;
}

// 外观设置接口
export interface IAppearanceSettings {
  darkMode: boolean;
  followSystem: boolean;
  textSize: string; // 'small', 'medium', 'large'
}

// 用户设置接口
export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  notifications: INotificationSettings;
  privacy: IPrivacySettings;
  appearance: IAppearanceSettings;
  createdAt: Date;
  updatedAt: Date;
}

// 默认通知设置
const defaultNotificationSettings: INotificationSettings = {
  likes: true,
  comments: true,
  followers: true,
  mentions: true,
  directMessages: true,
  systemNotifications: true,
  emailNotifications: false,
};

// 默认隐私设置
const defaultPrivacySettings: IPrivacySettings = {
  privateAccount: false,
  showActivityStatus: true,
  allowDirectMessages: 'everyone',
  allowComments: 'everyone',
  showLikedVideos: true,
  dataPersonalization: true,
};

// 默认外观设置
const defaultAppearanceSettings: IAppearanceSettings = {
  darkMode: true,
  followSystem: false,
  textSize: 'medium',
};

// 通知设置Schema
const NotificationSettingsSchema = new Schema({
  likes: { type: Boolean, default: defaultNotificationSettings.likes },
  comments: { type: Boolean, default: defaultNotificationSettings.comments },
  followers: { type: Boolean, default: defaultNotificationSettings.followers },
  mentions: { type: Boolean, default: defaultNotificationSettings.mentions },
  directMessages: { type: Boolean, default: defaultNotificationSettings.directMessages },
  systemNotifications: { type: Boolean, default: defaultNotificationSettings.systemNotifications },
  emailNotifications: { type: Boolean, default: defaultNotificationSettings.emailNotifications },
});

// 隐私设置Schema
const PrivacySettingsSchema = new Schema({
  privateAccount: { type: Boolean, default: defaultPrivacySettings.privateAccount },
  showActivityStatus: { type: Boolean, default: defaultPrivacySettings.showActivityStatus },
  allowDirectMessages: { 
    type: String, 
    enum: ['everyone', 'followers', 'none'], 
    default: defaultPrivacySettings.allowDirectMessages 
  },
  allowComments: { 
    type: String, 
    enum: ['everyone', 'followers', 'none'], 
    default: defaultPrivacySettings.allowComments 
  },
  showLikedVideos: { type: Boolean, default: defaultPrivacySettings.showLikedVideos },
  dataPersonalization: { type: Boolean, default: defaultPrivacySettings.dataPersonalization },
});

// 外观设置Schema
const AppearanceSettingsSchema = new Schema({
  darkMode: { type: Boolean, default: defaultAppearanceSettings.darkMode },
  followSystem: { type: Boolean, default: defaultAppearanceSettings.followSystem },
  textSize: { 
    type: String, 
    enum: ['small', 'medium', 'large'], 
    default: defaultAppearanceSettings.textSize 
  },
});

// 用户设置Schema
const UserSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    language: {
      type: String,
      default: 'zh',
      enum: ['zh', 'en', 'ja', 'ko']
    },
    notifications: {
      type: NotificationSettingsSchema,
      default: () => ({})
    },
    privacy: {
      type: PrivacySettingsSchema,
      default: () => ({})
    },
    appearance: {
      type: AppearanceSettingsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema); 