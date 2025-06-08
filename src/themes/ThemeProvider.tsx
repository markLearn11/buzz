import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { useColorScheme, View } from 'react-native';
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
  // 添加主题过渡状态，用于缓存当前应用的主题
  const [currentThemeState, setCurrentThemeState] = useState(isDarkMode);
  
  // 初始化主题 - 只在组件挂载时执行一次
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // 监听系统主题变化（仅当设置为跟随系统时）
  useEffect(() => {
    if (followSystem && systemColorScheme) {
      dispatch(setDarkMode(systemColorScheme === 'dark'));
    }
  }, [followSystem, systemColorScheme, dispatch]);

  // 监听主题变化，确保一致性
  useEffect(() => {
    // 简单直接地更新主题状态
    setCurrentThemeState(isDarkMode);
  }, [isDarkMode]);

  // 使用useMemo优化性能，避免不必要的重新计算
  const themeContextValue = useMemo(() => {
    // 获取当前主题颜色
    // 使用缓存的主题状态，确保过渡的一致性
    const currentTheme = currentThemeState ? ThemeMode.DARK : ThemeMode.LIGHT;
    const colors = getTheme(currentTheme);
    const fonts = getFontSizes(textSize);

    return {
      colors,
      isDark: currentThemeState, // 使用缓存的主题状态
      textSize,
      fonts,
    };
  }, [currentThemeState, textSize]);

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