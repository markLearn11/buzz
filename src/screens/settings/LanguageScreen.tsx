import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useTheme } from '../../themes/ThemeProvider';

// 语言选项
const languages = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

// TODO: 当前语言设置只保存了用户偏好，但没有实际实现国际化功能
// 需要集成i18n库(如i18next或react-i18next)来使语言设置真正生效
// 并确保所有界面元素(包括底部标签栏)能够动态翻译

const LanguageScreen = () => {
  const navigation = useNavigation();
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation(); // 使用翻译hook
  const { isDark, colors } = useTheme();

  // 加载语言设置
  useEffect(() => {
    const loadLanguage = async () => {
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
            const apiLanguage = data.language;
            if (apiLanguage) {
              setCurrentLanguage(apiLanguage);
              
              // 同步到本地存储
              await AsyncStorage.setItem('appLanguage', apiLanguage);
              return;
            }
          }
        } catch (apiError) {
          console.error(t('settings.apiLoadLanguageFailed'), apiError);
          // 失败后继续尝试从本地存储加载
        }

        // 从本地存储加载
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error(t('settings.loadLanguageFailed'), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLanguage();
  }, [t]);

  // 保存语言设置
  const saveLanguage = async (languageCode: string) => {
    try {
      // 先保存到本地
      await AsyncStorage.setItem('appLanguage', languageCode);
      
      // 再同步到服务器
      try {
        const response = await fetch(`${API_BASE_URL}/settings/language`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          },
          body: JSON.stringify({ language: languageCode })
        });

        if (!response.ok) {
          console.error(t('settings.syncLanguageFailed'), await response.text());
        }
      } catch (apiError) {
        console.error(t('settings.apiRequestFailed'), apiError);
      }
      
      // 刷新应用语言设置
      // 使用i18n库立即更新全局语言设置
      i18n.changeLanguage(languageCode);
    } catch (error) {
      console.error(t('settings.saveLanguageFailed'), error);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  };

  // 选择语言
  const selectLanguage = (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      setCurrentLanguage(languageCode);
      saveLanguage(languageCode);
      
      // 通知用户语言已更改
      Alert.alert(
        t('settings.languageChanged'),
        t('settings.languageChangeDescription'),
        [{ text: t('common.confirm'), onPress: () => {} }]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={[
          styles.header, 
          { 
            backgroundColor: isDark ? colors.primary : colors.white,
            borderBottomColor: isDark ? '#222' : colors.border 
          }
        ]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
            {t('settings.language')}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: isDark ? '#ccc' : colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: isDark ? colors.primary : colors.white,
          borderBottomColor: isDark ? '#222' : colors.border 
        }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
          {t('settings.language')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={[
          styles.section, 
          { 
            backgroundColor: isDark ? '#111' : colors.secondary,
            borderColor: isDark ? '#222' : colors.border 
          }
        ]}>
          <Text style={[
            styles.sectionTitle, 
            { 
              color: isDark ? '#ccc' : colors.textSecondary,
              borderBottomColor: isDark ? '#222' : colors.border 
            }
          ]}>
            {t('settings.selectLanguage')}
          </Text>
          
          {languages.map((language) => (
            <TouchableOpacity 
              key={language.code}
              style={[
                styles.languageItem,
                { borderBottomColor: isDark ? '#222' : colors.border },
                currentLanguage === language.code && [
                  styles.selectedLanguageItem,
                  { backgroundColor: isDark ? '#1e1e1e' : colors.surfaceVariant }
                ]
              ]}
              onPress={() => selectLanguage(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={[styles.languageName, { color: isDark ? 'white' : colors.text }]}>
                  {t(`settings.languageOptions.${language.code}`)}
                </Text>
              </View>
              {currentLanguage === language.code && (
                <Ionicons name="checkmark" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.tip, { color: isDark ? '#999' : colors.textTertiary }]}>
          {t('settings.languageTip')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  selectedLanguageItem: {
    // backgroundColor set dynamically
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 22,
    marginRight: 15,
  },
  languageName: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  tip: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
});

export default LanguageScreen; 