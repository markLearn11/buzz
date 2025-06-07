// 主题定义
export type ThemeColors = {
  // 背景
  primary: string;
  secondary: string;
  tertiary: string;
  
  // 表面
  surface: string;
  surfaceVariant: string;
  
  // 文本
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverted: string;
  
  // 交互元素
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // 功能色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 边框和分隔线
  border: string;
  divider: string;
  
  // 卡片和容器
  card: string;
  cardAlt: string;
  
  // 其他
  shadow: string;
  overlay: string;
  backdrop: string;
  
  // 纯色
  white: string;
  black: string;
  transparent: string;
};

// 主题模式枚举
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

// 暗色主题
export const darkTheme: ThemeColors = {
  // 背景
  primary: '#000000',
  secondary: '#121212',
  tertiary: '#1e1e1e',
  
  // 表面
  surface: '#181818',
  surfaceVariant: '#242424',
  
  // 文本
  text: '#FFFFFF',
  textSecondary: '#DDDDDD',
  textTertiary: '#999999',
  textInverted: '#000000',
  
  // 交互元素
  accent: '#FF4040', // 品牌红色
  accentLight: '#FF6C6C',
  accentDark: '#CC2929',
  
  // 功能色
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // 边框和分隔线
  border: '#333333',
  divider: '#2A2A2A',
  
  // 卡片和容器
  card: '#1A1A1A',
  cardAlt: '#222222',
  
  // 其他
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  
  // 纯色
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// 亮色主题
export const lightTheme: ThemeColors = {
  // 背景
  primary: '#FFFFFF',
  secondary: '#F5F5F5',
  tertiary: '#EEEEEE',
  
  // 表面
  surface: '#FCFCFC',
  surfaceVariant: '#F0F0F0',
  
  // 文本
  text: '#000000',
  textSecondary: '#333333',
  textTertiary: '#777777',
  textInverted: '#FFFFFF',
  
  // 交互元素
  accent: '#FF4040', // 保持品牌红色一致
  accentLight: '#FF6C6C',
  accentDark: '#CC2929',
  
  // 功能色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // 边框和分隔线
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // 卡片和容器
  card: '#FFFFFF',
  cardAlt: '#F9F9F9',
  
  // 其他
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  
  // 纯色
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// 基于当前主题模式获取颜色
export const getTheme = (mode: ThemeMode): ThemeColors => {
  return mode === ThemeMode.DARK ? darkTheme : lightTheme;
};

// 文本大小
export type TextSize = 'small' | 'medium' | 'large';

// 定义字体大小配置
export const fontSizes = {
  small: {
    h1: 24,
    h2: 20,
    h3: 18,
    body: 14,
    caption: 12,
    button: 14,
  },
  medium: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 14,
    button: 16,
  },
  large: {
    h1: 32,
    h2: 28,
    h3: 24,
    body: 18,
    caption: 16,
    button: 18,
  },
};

// 获取当前字体大小配置
export const getFontSizes = (size: TextSize) => {
  return fontSizes[size] || fontSizes.medium;
}; 