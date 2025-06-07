import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';

interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  followers: boolean;
  mentions: boolean;
  directMessages: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
}

const defaultSettings: NotificationSettings = {
  likes: true,
  comments: true,
  followers: true,
  mentions: true,
  directMessages: true,
  systemNotifications: true,
  emailNotifications: false,
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [masterSwitch, setMasterSwitch] = useState(true);
  const { t } = useTranslation();

  // 加载通知设置
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
            const apiSettings = data.notifications;
            setSettings(apiSettings);
            
            // 检查是否所有设置都是关闭的
            const allOff = Object.values(apiSettings).every(value => value === false);
            setMasterSwitch(!allOff);
            
            // 同步到本地存储
            await AsyncStorage.setItem('notificationSettings', JSON.stringify(apiSettings));
            return;
          }
        } catch (apiError) {
          console.error(t('settings.loadNotificationSettingsFailed'), apiError);
          // 失败后继续尝试从本地存储加载
        }

        // 从本地存储加载
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          
          // 检查是否所有设置都是关闭的
          const allOff = Object.values(parsedSettings).every(value => value === false);
          setMasterSwitch(!allOff);
        }
      } catch (error) {
        console.error(t('settings.loadNotificationSettingsFailed'), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [t]);

  // 保存通知设置
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      // 先保存到本地
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      // 再同步到服务器
      try {
        const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          },
          body: JSON.stringify(newSettings)
        });

        if (!response.ok) {
          console.error(t('settings.syncNotificationSettingsFailed'), await response.text());
        }
      } catch (apiError) {
        console.error(t('settings.apiRequestFailed'), apiError);
      }
    } catch (error) {
      console.error(t('settings.saveNotificationSettingsFailed'), error);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  };

  // 切换单个设置项
  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // 更新主开关状态
    const allOff = Object.values(newSettings).every(value => value === false);
    setMasterSwitch(!allOff);
  };

  // 切换主开关
  const toggleMasterSwitch = () => {
    const newMasterValue = !masterSwitch;
    setMasterSwitch(newMasterValue);
    
    // 如果关闭主开关，则关闭所有通知
    // 如果打开主开关，则恢复默认设置
    const newSettings = newMasterValue ? defaultSettings : {
      likes: false,
      comments: false,
      followers: false,
      mentions: false,
      directMessages: false,
      systemNotifications: false,
      emailNotifications: false,
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.notifications')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
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
        <Text style={styles.headerTitle}>{t('settings.notifications')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.masterSwitchContainer}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.masterSwitchText}>{t('settings.notifications')}</Text>
            <Text style={styles.settingDescription}>
              {masterSwitch ? t('settings.enableAll') : t('settings.disableAll')}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleMasterSwitch}
            value={masterSwitch}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.interactionNotifications')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('common.like')}</Text>
              <Text style={styles.settingDescription}>{t('settings.likeNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('likes')}
              value={settings.likes}
              disabled={!masterSwitch}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('common.comment')}</Text>
              <Text style={styles.settingDescription}>{t('settings.commentNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('comments')}
              value={settings.comments}
              disabled={!masterSwitch}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.newFollowers')}</Text>
              <Text style={styles.settingDescription}>{t('settings.followerNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('followers')}
              value={settings.followers}
              disabled={!masterSwitch}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.mentions')}</Text>
              <Text style={styles.settingDescription}>{t('settings.mentionNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('mentions')}
              value={settings.mentions}
              disabled={!masterSwitch}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.messageNotifications')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.directMessages')}</Text>
              <Text style={styles.settingDescription}>{t('settings.dmNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('directMessages')}
              value={settings.directMessages}
              disabled={!masterSwitch}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.otherNotifications')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.systemNotifications')}</Text>
              <Text style={styles.settingDescription}>{t('settings.systemNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('systemNotifications')}
              value={settings.systemNotifications}
              disabled={!masterSwitch}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.emailNotifications')}</Text>
              <Text style={styles.settingDescription}>{t('settings.emailNotificationDesc')}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSetting('emailNotifications')}
              value={settings.emailNotifications}
              disabled={!masterSwitch}
            />
          </View>
        </View>
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
  masterSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#111',
  },
  masterSwitchText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
  },
});

export default NotificationsScreen; 