import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';

// 外观设置接口
interface AppearanceSettings {
  darkMode: boolean;
  followSystem: boolean;
  textSize: string; // 'small', 'medium', 'large'
}

// 默认设置
const defaultSettings: AppearanceSettings = {
  darkMode: true,
  followSystem: false,
  textSize: 'medium'
};

const AppearanceScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const { t } = useTranslation();

  // 加载外观设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 先尝试从API获取
        try {
          const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const apiSettings = data.appearance;
            if (apiSettings) {
              setSettings(apiSettings);
              
              // 同步到本地存储
              await AsyncStorage.setItem('appearanceSettings', JSON.stringify(apiSettings));
              return;
            }
          }
        } catch (apiError) {
          console.error(t('settings.loadAppearanceSettingsFailed'), apiError);
          // 失败后继续尝试从本地存储加载
        }

        // 从本地存储加载
        const savedSettings = await AsyncStorage.getItem('appearanceSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          // 如果没有本地设置，使用默认值
          const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
          const savedFollowSystem = await AsyncStorage.getItem('followSystem');
          const savedTextSize = await AsyncStorage.getItem('textSize');
          
          // 从旧的存储格式迁移
          if (savedDarkMode !== null || savedFollowSystem !== null || savedTextSize !== null) {
            const migratedSettings = {
              darkMode: savedDarkMode === 'true',
              followSystem: savedFollowSystem === 'true',
              textSize: savedTextSize || 'medium'
            };
            setSettings(migratedSettings);
            await AsyncStorage.setItem('appearanceSettings', JSON.stringify(migratedSettings));
          }
        }
      } catch (error) {
        console.error(t('settings.loadAppearanceSettingsFailed'), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [t]);

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
    const newSettings = { 
      ...settings,
      darkMode: !settings.darkMode
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    // 这里应该调用Redux action或Context更新全局主题
  };

  // 切换跟随系统设置
  const toggleFollowSystem = () => {
    const newSettings = { 
      ...settings,
      followSystem: !settings.followSystem
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    // 这里应该调用Redux action或Context更新全局主题
  };

  // 更改文本大小
  const handleTextSizeChange = (size: string) => {
    const newSettings = { 
      ...settings,
      textSize: size
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    // 这里应该调用相关函数更新全局文本大小
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.appearance')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4040" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.appearance')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.darkMode')}</Text>
              <Text style={styles.settingDescription}>{t('settings.darkModeDescription')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDarkMode}
              value={settings.darkMode}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.followSystem')}</Text>
              <Text style={styles.settingDescription}>{t('settings.followSystemDescription')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleFollowSystem}
              value={settings.followSystem}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.textSize')}</Text>
          
          <TouchableOpacity 
            style={[
              styles.textSizeOption, 
              settings.textSize === 'small' && styles.selectedTextSize
            ]}
            onPress={() => handleTextSizeChange('small')}
          >
            <Text style={[styles.textSizeLabel, { fontSize: 14 }]}>
              {t('settings.small')}
            </Text>
            {settings.textSize === 'small' && (
              <Ionicons name="checkmark" size={22} color="#FF4040" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.textSizeOption, 
              settings.textSize === 'medium' && styles.selectedTextSize
            ]}
            onPress={() => handleTextSizeChange('medium')}
          >
            <Text style={[styles.textSizeLabel, { fontSize: 16 }]}>
              {t('settings.medium')}
            </Text>
            {settings.textSize === 'medium' && (
              <Ionicons name="checkmark" size={22} color="#FF4040" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.textSizeOption, 
              settings.textSize === 'large' && styles.selectedTextSize
            ]}
            onPress={() => handleTextSizeChange('large')}
          >
            <Text style={[styles.textSizeLabel, { fontSize: 18 }]}>
              {t('settings.large')}
            </Text>
            {settings.textSize === 'large' && (
              <Ionicons name="checkmark" size={22} color="#FF4040" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    color: 'white',
    fontSize: 16,
  },
  settingDescription: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  textSizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedTextSize: {
    borderBottomColor: '#444',
  },
  textSizeLabel: {
    color: 'white',
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
  previewBody: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  lightModeText: {
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
  note: {
    color: '#999',
    fontSize: 14,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});

export default AppearanceScreen; 