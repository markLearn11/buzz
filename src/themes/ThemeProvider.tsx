import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector, useAppDispatch } from '../store';
import { setDarkMode, initializeTheme } from '../store/slices/themeSlice';
import { ThemeColors, ThemeMode, getTheme, getFontSizes, TextSize } from './index';

// 创建主题上下文
interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  textSize: TextSize;
  fonts: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    button: number;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isDarkMode, followSystem, textSize, isLoading } = useAppSelector((state) => state.theme);
  const systemColorScheme = useColorScheme(); // 获取系统颜色方案

  // 初始化主题
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // 监听系统主题变化（仅当设置为跟随系统时）
  useEffect(() => {
    if (followSystem && systemColorScheme) {
      dispatch(setDarkMode(systemColorScheme === 'dark'));
    }
  }, [followSystem, systemColorScheme, dispatch]);

  // 获取当前主题颜色
  const currentTheme = isDarkMode ? ThemeMode.DARK : ThemeMode.LIGHT;
  const colors = getTheme(currentTheme);
  const fonts = getFontSizes(textSize);

  const themeContextValue: ThemeContextType = {
    colors,
    isDark: isDarkMode,
    textSize,
    fonts,
  };

  // 当主题正在加载时，使用默认主题（暗色）
  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的自定义钩子
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 