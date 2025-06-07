import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppThunkAction } from '../types';
import { Appearance } from 'react-native';

export interface ThemeState {
  isDarkMode: boolean;
  followSystem: boolean;
  textSize: 'small' | 'medium' | 'large';
  isLoading: boolean;
}

const initialState: ThemeState = {
  isDarkMode: true,
  followSystem: false,
  textSize: 'medium',
  isLoading: true
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.followSystem = false;
    },
    setFollowSystem: (state, action: PayloadAction<boolean>) => {
      state.followSystem = action.payload;
      if (action.payload) {
        // 如果跟随系统，根据系统设置更新主题
        state.isDarkMode = Appearance.getColorScheme() === 'dark';
      }
    },
    setTextSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.textSize = action.payload;
    },
    setThemeSettings: (state, action: PayloadAction<{
      isDarkMode: boolean;
      followSystem: boolean;
      textSize: 'small' | 'medium' | 'large';
    }>) => {
      state.isDarkMode = action.payload.isDarkMode;
      state.followSystem = action.payload.followSystem;
      state.textSize = action.payload.textSize;
      state.isLoading = false;
    },
    setThemeLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

// 导出actions
export const {
  setDarkMode,
  setFollowSystem,
  setTextSize,
  setThemeSettings,
  setThemeLoading
} = themeSlice.actions;

// 初始化主题 Thunk
export const initializeTheme = (): AppThunkAction => async (dispatch) => {
  try {
    dispatch(setThemeLoading(true));
    
    // 尝试从本地存储加载主题设置
    const savedSettings = await AsyncStorage.getItem('appearanceSettings');
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      dispatch(setThemeSettings({
        isDarkMode: settings.darkMode,
        followSystem: settings.followSystem,
        textSize: settings.textSize || 'medium'
      }));
      
      // 如果设置为跟随系统，监听系统主题变化
      if (settings.followSystem) {
        Appearance.addChangeListener(({ colorScheme }) => {
          dispatch(setDarkMode(colorScheme === 'dark'));
        });
      }
    } else {
      // 回退到旧的存储格式
      const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
      const savedFollowSystem = await AsyncStorage.getItem('followSystem');
      const savedTextSize = await AsyncStorage.getItem('textSize');
      
      // 构建设置对象
      const themeSettings = {
        isDarkMode: savedDarkMode ? savedDarkMode === 'true' : true,
        followSystem: savedFollowSystem ? savedFollowSystem === 'true' : false,
        textSize: (savedTextSize as 'small' | 'medium' | 'large') || 'medium'
      };
      
      // 保存设置
      dispatch(setThemeSettings(themeSettings));
      
      // 保存到新格式
      await AsyncStorage.setItem('appearanceSettings', JSON.stringify({
        darkMode: themeSettings.isDarkMode,
        followSystem: themeSettings.followSystem,
        textSize: themeSettings.textSize
      }));
      
      // 如果设置为跟随系统，监听系统主题变化
      if (themeSettings.followSystem) {
        Appearance.addChangeListener(({ colorScheme }) => {
          dispatch(setDarkMode(colorScheme === 'dark'));
        });
      }
    }
  } catch (error) {
    console.error('初始化主题失败:', error);
    // 出错时使用默认值
    dispatch(setThemeSettings({
      isDarkMode: true,
      followSystem: false,
      textSize: 'medium'
    }));
  } finally {
    dispatch(setThemeLoading(false));
  }
};

// 保存主题设置 Thunk
export const saveThemeSettings = (settings: {
  isDarkMode: boolean;
  followSystem: boolean;
  textSize: 'small' | 'medium' | 'large';
}): AppThunkAction => async (dispatch) => {
  try {
    // 更新Redux状态
    dispatch(setThemeSettings(settings));
    
    // 保存到AsyncStorage
    await AsyncStorage.setItem('appearanceSettings', JSON.stringify({
      darkMode: settings.isDarkMode,
      followSystem: settings.followSystem,
      textSize: settings.textSize
    }));
    
    // 更新旧版格式（兼容性）
    await AsyncStorage.setItem('isDarkMode', settings.isDarkMode.toString());
    await AsyncStorage.setItem('followSystem', settings.followSystem.toString());
    await AsyncStorage.setItem('textSize', settings.textSize);
    
    // 如果设置为跟随系统，确保监听系统主题变化
    if (settings.followSystem) {
      Appearance.addChangeListener(({ colorScheme }) => {
        dispatch(setDarkMode(colorScheme === 'dark'));
      });
    }
    
    // 可以在这里添加同步到API的逻辑
  } catch (error) {
    console.error('保存主题设置失败:', error);
  }
};

export default themeSlice.reducer; 