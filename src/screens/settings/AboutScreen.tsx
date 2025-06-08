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
import { useTheme } from '../../themes/ThemeProvider';

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
  const { isDark, colors } = useTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={[
          styles.header, 
          { 
            backgroundColor: isDark ? colors.primary : colors.white,
            borderBottomColor: isDark ? '#333' : colors.border 
          }
        ]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
            {t('settings.about')}
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
          borderBottomColor: isDark ? '#333' : colors.border 
        }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
          {t('settings.about')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={styles.appHeader}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: isDark ? colors.text : colors.text }]}>
            {appInfo.name}
          </Text>
          <Text style={[styles.appVersion, { color: isDark ? '#999' : colors.textTertiary }]}>
            {t('about.version')} {appInfo.version} ({appInfo.buildNumber})
          </Text>
        </View>

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
            {t('about.appIntro')}
          </Text>
          <Text style={[styles.description, { color: isDark ? colors.text : colors.text }]}>
            {appInfo.description}
          </Text>
        </View>

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
            {t('about.keyFeatures')}
          </Text>
          {appInfo.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={isDark ? '#40FF80' : '#30CC60'} 
              />
              <Text style={[styles.featureText, { color: isDark ? colors.text : colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

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
            {t('about.contactUs')}
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.contactItem, 
              { borderBottomColor: isDark ? '#222' : colors.border }
            ]} 
            onPress={openWebsite}
          >
            <Ionicons name="globe-outline" size={22} color={isDark ? '#ccc' : colors.textSecondary} />
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactTitle, { color: isDark ? colors.text : colors.text }]}>
                {t('about.website')}
              </Text>
              <Text style={[styles.contactValue, { color: colors.accent }]}>
                {appInfo.website}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={isDark ? '#666' : colors.textTertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={sendEmail}
          >
            <Ionicons name="mail-outline" size={22} color={isDark ? '#ccc' : colors.textSecondary} />
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactTitle, { color: isDark ? colors.text : colors.text }]}>
                {t('about.email')}
              </Text>
              <Text style={[styles.contactValue, { color: colors.accent }]}>
                {appInfo.email}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={isDark ? '#666' : colors.textTertiary} />
          </TouchableOpacity>
        </View>

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
            {t('about.followUs')}
          </Text>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[
                styles.socialButton, 
                { backgroundColor: isDark ? '#1877F2' : '#1877F2' }
              ]} 
              onPress={() => openSocialMedia('https://facebook.com')}
            >
              <Ionicons name="logo-facebook" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.socialButton, 
                { backgroundColor: isDark ? '#1DA1F2' : '#1DA1F2' }
              ]} 
              onPress={() => openSocialMedia('https://twitter.com')}
            >
              <Ionicons name="logo-twitter" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.socialButton, 
                { backgroundColor: isDark ? '#E4405F' : '#E4405F' }
              ]} 
              onPress={() => openSocialMedia('https://instagram.com')}
            >
              <Ionicons name="logo-instagram" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.socialButton, 
                { backgroundColor: isDark ? '#FF0000' : '#FF0000' }
              ]} 
              onPress={() => openSocialMedia('https://youtube.com')}
            >
              <Ionicons name="logo-youtube" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

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
            {t('about.deviceInfo')}
          </Text>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: isDark ? '#999' : colors.textTertiary }]}>
              {t('about.deviceName')}
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? colors.text : colors.text }]}>
              {appInfo.deviceName || t('about.unknownDevice')}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: isDark ? '#999' : colors.textTertiary }]}>
              {t('about.deviceModel')}
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? colors.text : colors.text }]}>
              {appInfo.deviceModel || t('about.unknownModel')}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: isDark ? '#999' : colors.textTertiary }]}>
              {t('about.operatingSystem')}
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? colors.text : colors.text }]}>
              {appInfo.deviceOS || `${Platform.OS} ${Platform.Version}`}
            </Text>
          </View>
        </View>

        <View style={[
          styles.legalLinks, 
          { backgroundColor: isDark ? '#111' : colors.secondary }
        ]}>
          <TouchableOpacity 
            style={[
              styles.legalLink, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                borderColor: isDark ? '#333' : colors.border,
                borderWidth: 1
              }
            ]} 
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={[styles.legalLinkText, { color: colors.accent }]}>
              {t('settings.privacyPolicy')}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 15 }} />
          <TouchableOpacity 
            style={[
              styles.legalLink, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                borderColor: isDark ? '#333' : colors.border,
                borderWidth: 1
              }
            ]} 
            onPress={() => navigation.navigate('TermsScreen')}
          >
            <Text style={[styles.legalLinkText, { color: colors.accent }]}>
              {t('settings.terms')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyright, { color: isDark ? '#999' : colors.textTertiary }]}>
          © {new Date().getFullYear()} {appInfo.developer}. {t('about.allRightsReserved')}
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
  },
  appVersion: {
    fontSize: 14,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  contactValue: {
    fontSize: 14,
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
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 10,
  },
  legalLink: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  legalLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  legalDivider: {
    width: 1,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    color: 'white',
  },
});

export default AboutScreen; 