import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import SettingsScreenBase from '../../components/SettingsScreenBase';
import { useTheme } from '../../themes/ThemeProvider';
import { API_BASE_URL } from '../../config/env';

interface NotificationSettings {
  pushEnabled: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
  followNotifications: boolean;
  messageNotifications: boolean;
  systemNotifications: boolean;
}

const defaultSettings: NotificationSettings = {
  pushEnabled: true,
  commentNotifications: true,
  likeNotifications: true,
  followNotifications: true,
  messageNotifications: true,
  systemNotifications: true,
};

const NotificationsScreen = () => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      // 在这里可以添加同步到服务器的逻辑
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
          console.error('Failed to sync notification settings:', await response.text());
        }
      } catch (apiError) {
        console.error('API request failed:', apiError);
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    
    // 如果总开关被关闭，则所有通知类型都被禁用
    if (key === 'pushEnabled' && !newSettings.pushEnabled) {
      newSettings.commentNotifications = false;
      newSettings.likeNotifications = false;
      newSettings.followNotifications = false;
      newSettings.messageNotifications = false;
      newSettings.systemNotifications = false;
    }
    
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (isLoading) {
    return (
      <SettingsScreenBase title={t('settings.notifications')}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: isDark ? colors.textSecondary : colors.textTertiary }}>
            {t('common.loading')}
          </Text>
        </View>
      </SettingsScreenBase>
    );
  }

  return (
    <SettingsScreenBase title={t('settings.notifications')}>
      <View style={styles.section}>
        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.enablePushNotifications')}
            </Text>
            <Text style={[styles.settingDescription, { color: isDark ? colors.textTertiary : colors.textTertiary }]}>
              {t('settings.pushNotificationsDescription')}
            </Text>
          </View>
          <Switch
            trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
            thumbColor="#f4f3f4"
            ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
            onValueChange={() => handleToggle('pushEnabled')}
            value={settings.pushEnabled}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#666' : '#888' }]}>
          {t('settings.notificationTypes')}
        </Text>

        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
          <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.textSecondary }]}>
            {t('settings.commentNotifications')}
          </Text>
          <Switch
            trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
            thumbColor="#f4f3f4"
            ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
            onValueChange={() => handleToggle('commentNotifications')}
            value={settings.commentNotifications && settings.pushEnabled}
            disabled={!settings.pushEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
          <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.textSecondary }]}>
            {t('settings.likeNotifications')}
          </Text>
          <Switch
            trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
            thumbColor="#f4f3f4"
            ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
            onValueChange={() => handleToggle('likeNotifications')}
            value={settings.likeNotifications && settings.pushEnabled}
            disabled={!settings.pushEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
          <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.textSecondary }]}>
            {t('settings.followNotifications')}
          </Text>
          <Switch
            trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
            thumbColor="#f4f3f4"
            ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
            onValueChange={() => handleToggle('followNotifications')}
            value={settings.followNotifications && settings.pushEnabled}
            disabled={!settings.pushEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
          <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.textSecondary }]}>
            {t('settings.messageNotifications')}
          </Text>
          <Switch
            trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
            thumbColor="#f4f3f4"
            ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
            onValueChange={() => handleToggle('messageNotifications')}
            value={settings.messageNotifications && settings.pushEnabled}
            disabled={!settings.pushEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
          <Text style={[styles.settingLabel, { color: isDark ? colors.text : colors.textSecondary }]}>
            {t('settings.systemNotifications')}
          </Text>
          <Switch
            trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
            thumbColor="#f4f3f4"
            ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
            onValueChange={() => handleToggle('systemNotifications')}
            value={settings.systemNotifications && settings.pushEnabled}
            disabled={!settings.pushEnabled}
          />
        </View>
      </View>

      <Text style={[styles.note, { color: isDark ? colors.textTertiary : colors.textTertiary }]}>
        {t('settings.notificationsNote')}
      </Text>
    </SettingsScreenBase>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  note: {
    fontSize: 14,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
  },
});

export default NotificationsScreen; 