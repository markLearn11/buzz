import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { useTranslation } from 'react-i18next';

// 应用信息接口
interface AppInfo {
  name: string;
  version: string;
  buildNumber: string;
  description: string;
  features: string[];
  developer: string;
  website: string;
  email: string;
  deviceName?: string;
  deviceModel?: string;
  deviceOS?: string;
}

const AboutScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const [appInfo, setAppInfo] = useState<AppInfo>({
    name: 'Buzz',
    version: '1.0.0',
    buildNumber: '20230701',
    description: t('about.appDescription'),
    features: [
      t('about.feature1'),
      t('about.feature2'),
      t('about.feature3'),
      t('about.feature4'),
      t('about.feature5')
    ],
    developer: 'Buzz Team',
    website: 'https://www.example.com/buzz',
    email: 'support@buzzvideo.com'
  });

  // 加载应用信息
  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        // 尝试获取设备应用信息
        let nativeVersion = '1.0.0';
        let nativeBuildNumber = '20230701';
        
        // 获取本机版本信息
        try {
          if (Platform.OS === 'ios') {
            nativeVersion = Application.nativeApplicationVersion || '1.0.0';
            nativeBuildNumber = Application.nativeBuildVersion || '20230701';
          } else {
            nativeVersion = Application.nativeApplicationVersion || '1.0.0';
            nativeBuildNumber = Application.nativeBuildVersion?.toString() || '20230701';
          }
        } catch (deviceError) {
          console.error(t('about.deviceInfoLoadFailed'), deviceError);
        }
        
        // 尝试从API获取应用信息
        try {
          const response = await fetch(`${API_BASE_URL}/app-info`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const apiAppInfo = await response.json();
            
            // 合并API和本地信息
            setAppInfo({
              ...appInfo,
              ...apiAppInfo,
              version: nativeVersion || apiAppInfo.version || '1.0.0',
              buildNumber: nativeBuildNumber || apiAppInfo.buildNumber || '20230701',
              description: t('about.appDescription'),
              features: [
                t('about.feature1'),
                t('about.feature2'),
                t('about.feature3'),
                t('about.feature4'),
                t('about.feature5')
              ]
            });
            return;
          }
        } catch (apiError) {
          console.error(t('about.apiInfoLoadFailed'), apiError);
        }
        
        // 如果API获取失败，使用设备信息更新
        setAppInfo({
          ...appInfo,
          version: nativeVersion,
          buildNumber: nativeBuildNumber,
          deviceName: Device.deviceName || t('about.unknownDevice'),
          deviceModel: Device.modelName || t('about.unknownModel'),
          deviceOS: `${Device.osName} ${Device.osVersion}`,
          description: t('about.appDescription'),
          features: [
            t('about.feature1'),
            t('about.feature2'),
            t('about.feature3'),
            t('about.feature4'),
            t('about.feature5')
          ]
        });
      } catch (error) {
        console.error(t('about.appInfoLoadFailed'), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppInfo();
  }, [t]);

  // 打开网站
  const openWebsite = () => {
    Linking.openURL(appInfo.website);
  };

  // 发送邮件
  const sendEmail = () => {
    Linking.openURL(`mailto:${appInfo.email}`);
  };

  // 打开社交媒体
  const openSocialMedia = (url: string) => {
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.about')}</Text>
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
        <Text style={styles.headerTitle}>{t('settings.about')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.appHeader}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>{t('about.version')} {appInfo.version} ({appInfo.buildNumber})</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.appIntro')}</Text>
          <Text style={styles.description}>{appInfo.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.keyFeatures')}</Text>
          {appInfo.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#40FF80" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.contactUs')}</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={openWebsite}>
            <Ionicons name="globe-outline" size={22} color="#ccc" />
            <Text style={styles.contactText}>{t('about.officialWebsite')}</Text>
            <Ionicons name="open-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactItem} onPress={sendEmail}>
            <Ionicons name="mail-outline" size={22} color="#ccc" />
            <Text style={styles.contactText}>{t('about.contactEmail')}</Text>
            <Ionicons name="open-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => openSocialMedia('https://weibo.com/example')}
          >
            <Ionicons name="logo-twitter" size={22} color="#ccc" />
            <Text style={styles.contactText}>{t('about.officialWeibo')}</Text>
            <Ionicons name="open-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => openSocialMedia('https://example.com/wechat')}
          >
            <Ionicons name="chatbubbles-outline" size={22} color="#ccc" />
            <Text style={styles.contactText}>{t('about.officialWechat')}</Text>
            <Ionicons name="open-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {appInfo.deviceName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('about.deviceInfo')}</Text>
            <View style={styles.deviceInfoItem}>
              <Text style={styles.deviceInfoLabel}>{t('about.deviceName')}</Text>
              <Text style={styles.deviceInfoValue}>{appInfo.deviceName}</Text>
            </View>
            <View style={styles.deviceInfoItem}>
              <Text style={styles.deviceInfoLabel}>{t('about.deviceModel')}</Text>
              <Text style={styles.deviceInfoValue}>{appInfo.deviceModel}</Text>
            </View>
            <View style={styles.deviceInfoItem}>
              <Text style={styles.deviceInfoLabel}>{t('about.operatingSystem')}</Text>
              <Text style={styles.deviceInfoValue}>{appInfo.deviceOS}</Text>
            </View>
          </View>
        )}

        <View style={styles.legalLinks}>
          <TouchableOpacity 
            style={styles.legalButton}
            onPress={() => navigation.navigate('TermsScreen')}
          >
            <Text style={styles.legalButtonText}>{t('settings.terms')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.legalButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.legalButtonText}>{t('settings.privacyPolicy')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} {appInfo.developer}. {t('about.allRightsReserved')}
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
    padding: 16,
  },
  appHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  contactText: {
    fontSize: 15,
    color: 'white',
    flex: 1,
    marginLeft: 12,
  },
  deviceInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  deviceInfoLabel: {
    fontSize: 14,
    color: '#999',
  },
  deviceInfoValue: {
    fontSize: 14,
    color: 'white',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  legalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#222',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  legalButtonText: {
    fontSize: 14,
    color: '#ccc',
  },
  copyright: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
    marginTop: 12,
  },
});

export default AboutScreen; 