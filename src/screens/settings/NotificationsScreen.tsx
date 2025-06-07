import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // 加载通知设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          
          // 检查是否所有设置都是关闭的
          const allOff = Object.values(parsedSettings).every(value => value === false);
          setMasterSwitch(!allOff);
        }
      } catch (error) {
        console.error('加载通知设置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // 保存通知设置
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('保存通知设置失败:', error);
      Alert.alert('错误', '保存设置失败，请重试');
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
          <Text style={styles.headerTitle}>通知设置</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
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
        <Text style={styles.headerTitle}>通知设置</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.masterSwitchContainer}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.masterSwitchText}>通知</Text>
            <Text style={styles.settingDescription}>
              {masterSwitch ? '启用' : '禁用'}所有通知
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
          <Text style={styles.sectionTitle}>互动通知</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>点赞</Text>
              <Text style={styles.settingDescription}>有人喜欢你的视频时通知你</Text>
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
              <Text style={styles.settingText}>评论</Text>
              <Text style={styles.settingDescription}>有人评论你的视频时通知你</Text>
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
              <Text style={styles.settingText}>新关注者</Text>
              <Text style={styles.settingDescription}>有人关注你时通知你</Text>
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
              <Text style={styles.settingText}>提及</Text>
              <Text style={styles.settingDescription}>有人在评论中@你时通知你</Text>
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
          <Text style={styles.sectionTitle}>消息通知</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>私信</Text>
              <Text style={styles.settingDescription}>有人给你发送私信时通知你</Text>
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
          <Text style={styles.sectionTitle}>其他通知</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>系统通知</Text>
              <Text style={styles.settingDescription}>接收系统更新、安全提醒等通知</Text>
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
              <Text style={styles.settingText}>电子邮件通知</Text>
              <Text style={styles.settingDescription}>通过电子邮件接收重要通知</Text>
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

        <Text style={styles.tip}>
          提示: 你可以随时在此处更改通知设置。某些系统通知可能无法关闭。
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
  masterSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  masterSwitchText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
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
  tip: {
    color: '#888',
    fontSize: 14,
    margin: 16,
    marginTop: 0,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
  }
});

export default NotificationsScreen; 