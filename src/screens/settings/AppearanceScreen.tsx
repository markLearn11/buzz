import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector, useAppDispatch } from '../../store';
import { 
  setDarkMode, 
  setFollowSystem, 
  setTextSize,
  saveThemeSettings
} from '../../store/slices/themeSlice';
import { useTheme } from '../../themes/ThemeProvider';
import { TextSize } from '../../themes';
import { API_BASE_URL } from '../../config/env';

// 外观设置接口
interface AppearanceSettings {
  darkMode: boolean;
  followSystem: boolean;
  textSize: TextSize;
}

// 默认设置
const defaultSettings: AppearanceSettings = {
  darkMode: true,
  followSystem: false,
  textSize: 'medium'
};

const AppearanceScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isDarkMode, followSystem, textSize, isLoading } = useAppSelector(state => state.theme);
  const theme = useTheme();

  // 加载外观设置
  // useEffect(() => {
  //   console.log(isDarkMode,'isDarkMode__')
  //   const loadSettings = async () => {
  //     try {
  //       // 先尝试从API获取
  //       try {
  //         const response = await fetch(`${API_BASE_URL}/settings`, {
  //           method: 'GET',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
  //           }
  //         });

  //         if (response.ok) {
  //           const data = await response.json();
  //           const apiSettings = data.appearance;
  //           if (apiSettings) {
  //             dispatch(setDarkMode(apiSettings.darkMode));
  //             dispatch(setFollowSystem(apiSettings.followSystem));
              
  //             // 确保textSize是合法的值
  //             const size = apiSettings.textSize as TextSize;
  //             if (size === 'small' || size === 'medium' || size === 'large') {
  //               dispatch(setTextSize(size));
  //             } else {
  //               dispatch(setTextSize('medium'));
  //             }
              
  //             // 同步到本地存储
  //             await AsyncStorage.setItem('appearanceSettings', JSON.stringify(apiSettings));
  //             return;
  //           }
  //         }
  //       } catch (apiError) {
  //         console.error(t('settings.loadAppearanceSettingsFailed'), apiError);
  //         // 失败后继续尝试从本地存储加载
  //       }

  //       // 从本地存储加载
  //       const savedSettings = await AsyncStorage.getItem('appearanceSettings');
  //       if (savedSettings) {
  //         const savedSettingsObj = JSON.parse(savedSettings);
  //         dispatch(setDarkMode(savedSettingsObj.darkMode));
  //         dispatch(setFollowSystem(savedSettingsObj.followSystem));
          
  //         // 确保textSize是合法的值
  //         const size = savedSettingsObj.textSize as TextSize;
  //         if (size === 'small' || size === 'medium' || size === 'large') {
  //           dispatch(setTextSize(size));
  //         } else {
  //           dispatch(setTextSize('medium'));
  //         }
  //       } else {
  //         // 如果没有本地设置，使用默认值
  //         const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
  //         const savedFollowSystem = await AsyncStorage.getItem('followSystem');
  //         const savedTextSize = await AsyncStorage.getItem('textSize');
          
  //         // 从旧的存储格式迁移
  //         if (savedDarkMode !== null || savedFollowSystem !== null || savedTextSize !== null) {
  //           // 确保textSize是合法的值
  //           let size: TextSize = 'medium';
  //           if (savedTextSize === 'small' || savedTextSize === 'medium' || savedTextSize === 'large') {
  //             size = savedTextSize as TextSize;
  //           }
            
  //           const migratedSettings = {
  //             darkMode: savedDarkMode === 'true',
  //             followSystem: savedFollowSystem === 'true',
  //             textSize: size
  //           };
            
  //           dispatch(setDarkMode(migratedSettings.darkMode));
  //           dispatch(setFollowSystem(migratedSettings.followSystem));
  //           dispatch(setTextSize(migratedSettings.textSize));
  //           await AsyncStorage.setItem('appearanceSettings', JSON.stringify(migratedSettings));
  //         }
  //       }
  //     } catch (error) {
  //       console.error(t('settings.loadAppearanceSettingsFailed'), error);
  //     } finally {
  //       dispatch(saveThemeSettings({
  //         isDarkMode,
  //         followSystem,
  //         textSize
  //       }));
  //     }
  //   };
    
  //   loadSettings();
  // }, [t, dispatch]);

  // 保存外观设置
  const saveSettings = async (newSettings: AppearanceSettings) => {
    try {
      // 先保存到本地
      await AsyncStorage.setItem('appearanceSettings', JSON.stringify(newSettings));
      
      // 同步旧的格式（兼容性）
      await AsyncStorage.setItem('isDarkMode', newSettings.darkMode.toString());
      await AsyncStorage.setItem('followSystem', newSettings.followSystem.toString());
      if (newSettings.textSize) {
        await AsyncStorage.setItem('textSize', newSettings.textSize);
      }
      
      // 再同步到服务器
      try {
        const response = await fetch(`${API_BASE_URL}/settings/appearance`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          },
          body: JSON.stringify(newSettings)
        });

        if (!response.ok) {
          console.error(t('settings.syncAppearanceSettingsFailed'), await response.text());
        }
      } catch (apiError) {
        console.error(t('settings.apiRequestFailed'), apiError);
      }
    } catch (error) {
      console.error(t('settings.saveAppearanceSettingsFailed'), error);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  };

  // 切换暗黑模式
  const toggleDarkMode = () => {
    dispatch(setDarkMode(!isDarkMode));
    
    // 保存设置
    dispatch(saveThemeSettings({
      isDarkMode: !isDarkMode,
      followSystem: false,
      textSize
    }));
  };

  // 切换跟随系统设置
  const toggleFollowSystem = () => {
    dispatch(setFollowSystem(!followSystem));
    
    // 保存设置
    dispatch(saveThemeSettings({
      isDarkMode: isDarkMode,
      followSystem: !followSystem,
      textSize
    }));
  };

  // 更改文本大小
  const handleTextSizeChange = (size: TextSize) => {
    dispatch(setTextSize(size));
    
    // 保存设置
    dispatch(saveThemeSettings({
      isDarkMode,
      followSystem,
      textSize: size
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, !isDarkMode && styles.lightContainer]}>
        <View style={[styles.header, !isDarkMode && styles.lightHeader]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "black"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, !isDarkMode && styles.lightHeaderTitle]}>{t('settings.appearance')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4040" />
          <Text style={[styles.loadingText, !isDarkMode && styles.lightLoadingText]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, !isDarkMode && styles.lightContainer]}>
      <View style={[styles.header, !isDarkMode && styles.lightHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, !isDarkMode && styles.lightHeaderTitle]}>{t('settings.appearance')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, !isDarkMode && styles.lightSectionTitle]}>{t('settings.theme')}</Text>
          
          <View style={[styles.settingItem, !isDarkMode && styles.lightSettingItem]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, !isDarkMode && styles.lightSettingText]}>{t('settings.darkMode')}</Text>
              <Text style={[styles.settingDescription, !isDarkMode && styles.lightSettingDescription]}>{t('settings.darkModeDescription')}</Text>
            </View>
            <Switch
              trackColor={{ false: isDarkMode ? '#3e3e3e' : '#d0d0d0', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDarkMode ? '#3e3e3e' : '#d0d0d0'}
              onValueChange={toggleDarkMode}
              value={isDarkMode}
            />
          </View>

          <View style={[styles.settingItem, !isDarkMode && styles.lightSettingItem]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, !isDarkMode && styles.lightSettingText]}>{t('settings.followSystem')}</Text>
              <Text style={[styles.settingDescription, !isDarkMode && styles.lightSettingDescription]}>{t('settings.followSystemDescription')}</Text>
            </View>
            <Switch
              trackColor={{ false: isDarkMode ? '#3e3e3e' : '#d0d0d0', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDarkMode ? '#3e3e3e' : '#d0d0d0'}
              onValueChange={toggleFollowSystem}
              value={followSystem}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, !isDarkMode && styles.lightSectionTitle]}>{t('settings.textSize')}</Text>
          
          <TouchableOpacity 
            style={[
              styles.textSizeOption, 
              !isDarkMode && styles.lightTextSizeOption,
              textSize === 'small' && styles.selectedTextSize,
              textSize === 'small' && !isDarkMode && styles.lightSelectedTextSize
            ]}
            onPress={() => handleTextSizeChange('small')}
          >
            <Text style={[styles.textSizeLabel, !isDarkMode && styles.lightTextSizeLabel, { fontSize: 14 }]}>
              {t('settings.small')}
            </Text>
            {textSize === 'small' && (
              <Ionicons name="checkmark" size={22} color="#FF4040" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.textSizeOption, 
              !isDarkMode && styles.lightTextSizeOption,
              textSize === 'medium' && styles.selectedTextSize,
              textSize === 'medium' && !isDarkMode && styles.lightSelectedTextSize
            ]}
            onPress={() => handleTextSizeChange('medium')}
          >
            <Text style={[styles.textSizeLabel, !isDarkMode && styles.lightTextSizeLabel, { fontSize: 16 }]}>
              {t('settings.medium')}
            </Text>
            {textSize === 'medium' && (
              <Ionicons name="checkmark" size={22} color="#FF4040" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.textSizeOption, 
              !isDarkMode && styles.lightTextSizeOption,
              textSize === 'large' && styles.selectedTextSize,
              textSize === 'large' && !isDarkMode && styles.lightSelectedTextSize
            ]}
            onPress={() => handleTextSizeChange('large')}
          >
            <Text style={[styles.textSizeLabel, !isDarkMode && styles.lightTextSizeLabel, { fontSize: 18 }]}>
              {t('settings.large')}
            </Text>
            {textSize === 'large' && (
              <Ionicons name="checkmark" size={22} color="#FF4040" />
            )}
          </TouchableOpacity>
        </View>

        {/* 添加主题预览 */}
        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, !isDarkMode && styles.lightSectionTitle]}>{t('settings.preview')}</Text>
          
          <View style={[styles.previewCard, !isDarkMode && styles.lightModePreview]}>
            <Text style={[styles.previewHeader, !isDarkMode && styles.lightPreviewHeader]}>
              {t('settings.previewTitle')}
            </Text>
            <Text style={[styles.previewBody, !isDarkMode && styles.lightPreviewBody]}>
              {t('settings.previewBody')}
            </Text>
          </View>
        </View>

        <Text style={[styles.note, !isDarkMode && styles.lightNote]}>
          {t('settings.appearanceNote')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  lightHeader: {
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  lightHeaderTitle: {
    color: 'black',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  lightSectionTitle: {
    color: '#777',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  lightSettingItem: {
    borderBottomColor: '#e0e0e0',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    color: 'white',
    fontSize: 16,
  },
  lightSettingText: {
    color: 'black',
  },
  settingDescription: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  lightSettingDescription: {
    color: '#666',
  },
  textSizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  lightTextSizeOption: {
    borderBottomColor: '#e0e0e0',
  },
  selectedTextSize: {
    borderBottomColor: '#444',
  },
  lightSelectedTextSize: {
    borderBottomColor: '#ddd',
  },
  textSizeLabel: {
    color: 'white',
  },
  lightTextSizeLabel: {
    color: 'black',
  },
  previewSection: {
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  previewTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  lightModePreview: {
    backgroundColor: '#f5f5f5',
  },
  previewHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lightPreviewHeader: {
    color: '#333',
  },
  previewBody: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  lightPreviewBody: {
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
  },
  lightLoadingText: {
    color: '#333',
  },
  note: {
    color: '#999',
    fontSize: 14,
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  lightNote: {
    color: '#666',
  },
});

export default AppearanceScreen; 