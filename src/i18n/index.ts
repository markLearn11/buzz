/*
 * @Author: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @Date: 2025-06-08 02:42:08
 * @LastEditors: jihao00122 52628008+jihao00122@users.noreply.github.com
 * @LastEditTime: 2025-06-08 02:50:39
 * @FilePath: /buzz/src/i18n/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入翻译文件
import zh from './translations/zh';
import en from './translations/en';
import ja from './translations/ja';
import ko from './translations/ko';

const resources = {
  zh: {
    translation: zh
  },
  en: {
    translation: en
  },
  ja: {
    translation: ja
  },
  ko: {
    translation: ko
  }
};

// 从本地存储获取语言设置的函数
const getLanguageFromStorage = async () => {
  try {
    const language = await AsyncStorage.getItem('appLanguage');
    return language || 'zh'; // 如果没有设置，默认使用中文
  } catch (error) {
    console.error('获取语言设置失败:', error);
    return 'zh'; // 出错时返回默认语言
  }
};

// 初始化i18n
const initI18n = async () => {
  const language = await getLanguageFromStorage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false // 不需要React已经处理的转义
      },
      react: {
        useSuspense: false // 避免在React Native中使用Suspense
      },
      compatibilityJSON: 'v3', // 使用v3兼容模式，解决Intl.PluralRules不可用的问题
      // 禁用Intl API的使用，直接使用兼容性JSON
      pluralSeparator: '_',
      contextSeparator: '_'
    });
};

// 立即初始化
initI18n();

export default i18n; 