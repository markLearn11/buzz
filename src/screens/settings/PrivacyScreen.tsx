import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivacySettings {
  privateAccount: boolean;
  showActivityStatus: boolean;
  allowDirectMessages: string; // 'everyone', 'followers', 'none'
  allowComments: string; // 'everyone', 'followers', 'none'
  showLikedVideos: boolean;
  dataPersonalization: boolean;
}

const defaultSettings: PrivacySettings = {
  privateAccount: false,
  showActivityStatus: true,
  allowDirectMessages: 'everyone',
  allowComments: 'everyone',
  showLikedVideos: true,
  dataPersonalization: true,
};

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);

  // 加载隐私设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('privacySettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('加载隐私设置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // 保存隐私设置
  const saveSettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('保存隐私设置失败:', error);
      Alert.alert('错误', '保存设置失败，请重试');
    }
  };

  // 切换开关设置
  const toggleSwitchSetting = (key: keyof PrivacySettings) => {
    if (typeof settings[key] === 'boolean') {
      const newSettings = { 
        ...settings, 
        [key]: !settings[key] 
      };
      setSettings(newSettings);
      saveSettings(newSettings);
    }
  };

  // 更改选择设置
  const changeSelectSetting = (key: keyof PrivacySettings, value: string) => {
    const newSettings = { ...settings, [key]: value };
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
          <Text style={styles.headerTitle}>隐私设置</Text>
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
        <Text style={styles.headerTitle}>隐私设置</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户隐私</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>私密账户</Text>
              <Text style={styles.settingDescription}>
                只有你批准的关注者才能看到你的内容
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitchSetting('privateAccount')}
              value={settings.privateAccount}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>显示活动状态</Text>
              <Text style={styles.settingDescription}>
                允许其他用户看到你最后活动的时间
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitchSetting('showActivityStatus')}
              value={settings.showActivityStatus}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>互动</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>私信权限</Text>
              <Text style={styles.settingDescription}>谁可以给你发送私信</Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.selectValue}>
                {settings.allowDirectMessages === 'everyone' ? '所有人' : 
                 settings.allowDirectMessages === 'followers' ? '关注者' : '无人'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowDirectMessages === 'everyone' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowDirectMessages', 'everyone')}
            >
              <Text style={[styles.optionText, settings.allowDirectMessages === 'everyone' && styles.selectedOptionText]}>所有人</Text>
              {settings.allowDirectMessages === 'everyone' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowDirectMessages === 'followers' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowDirectMessages', 'followers')}
            >
              <Text style={[styles.optionText, settings.allowDirectMessages === 'followers' && styles.selectedOptionText]}>关注者</Text>
              {settings.allowDirectMessages === 'followers' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowDirectMessages === 'none' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowDirectMessages', 'none')}
            >
              <Text style={[styles.optionText, settings.allowDirectMessages === 'none' && styles.selectedOptionText]}>无人</Text>
              {settings.allowDirectMessages === 'none' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>评论权限</Text>
              <Text style={styles.settingDescription}>谁可以在你的视频下评论</Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.selectValue}>
                {settings.allowComments === 'everyone' ? '所有人' : 
                 settings.allowComments === 'followers' ? '关注者' : '无人'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowComments === 'everyone' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowComments', 'everyone')}
            >
              <Text style={[styles.optionText, settings.allowComments === 'everyone' && styles.selectedOptionText]}>所有人</Text>
              {settings.allowComments === 'everyone' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowComments === 'followers' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowComments', 'followers')}
            >
              <Text style={[styles.optionText, settings.allowComments === 'followers' && styles.selectedOptionText]}>关注者</Text>
              {settings.allowComments === 'followers' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowComments === 'none' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowComments', 'none')}
            >
              <Text style={[styles.optionText, settings.allowComments === 'none' && styles.selectedOptionText]}>无人</Text>
              {settings.allowComments === 'none' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>显示喜欢的视频</Text>
              <Text style={styles.settingDescription}>
                允许他人在你的个人资料中查看你喜欢的视频
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitchSetting('showLikedVideos')}
              value={settings.showLikedVideos}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>个性化广告</Text>
              <Text style={styles.settingDescription}>
                基于你的行为和偏好显示更相关的广告
              </Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitchSetting('dataPersonalization')}
              value={settings.dataPersonalization}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>下载我的数据</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>清除搜索记录</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>管理屏蔽用户</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>
          了解更多关于我们如何处理你的数据，请查看我们的隐私政策。
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  selectValue: {
    color: '#FF4040',
    fontSize: 16,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  selectedOption: {
    backgroundColor: '#111',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#FF4040',
  },
  actionButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  tip: {
    color: '#888',
    fontSize: 14,
    margin: 16,
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

export default PrivacyScreen; 