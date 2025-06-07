import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  // 加载隐私设置
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
            const apiSettings = data.privacy;
            setSettings(apiSettings);
            
            // 同步到本地存储
            await AsyncStorage.setItem('privacySettings', JSON.stringify(apiSettings));
            return;
          }
        } catch (apiError) {
          console.error(t('settings.loadPrivacySettingsFailed'), apiError);
          // 失败后继续尝试从本地存储加载
        }

        // 从本地存储加载
        const savedSettings = await AsyncStorage.getItem('privacySettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error(t('settings.loadPrivacySettingsFailed'), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [t]);

  // 保存隐私设置
  const saveSettings = async (newSettings: PrivacySettings) => {
    try {
      // 先保存到本地
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
      
      // 再同步到服务器
      try {
        const response = await fetch(`${API_BASE_URL}/settings/privacy`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
          },
          body: JSON.stringify(newSettings)
        });

        if (!response.ok) {
          console.error(t('settings.syncPrivacySettingsFailed'), await response.text());
        }
      } catch (apiError) {
        console.error(t('settings.apiRequestFailed'), apiError);
      }
    } catch (error) {
      console.error(t('settings.savePrivacySettingsFailed'), error);
      Alert.alert(t('common.error'), t('settings.saveFailed'));
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

  // 获取选项显示文本
  const getOptionDisplayText = (option: string) => {
    switch (option) {
      case 'everyone':
        return t('settings.everyone');
      case 'followers':
        return t('settings.followers');
      case 'none':
        return t('settings.noOne');
      default:
        return option;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.privacy')}</Text>
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
        <Text style={styles.headerTitle}>{t('settings.privacy')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.accountPrivacy')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.privateAccount')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.privateAccountDesc')}
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
              <Text style={styles.settingText}>{t('settings.showActivityStatus')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.showActivityStatusDesc')}
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
          <Text style={styles.sectionTitle}>{t('settings.interactions')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.directMessagePermissions')}</Text>
              <Text style={styles.settingDescription}>{t('settings.whoCanMessageYou')}</Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.selectValue}>
                {getOptionDisplayText(settings.allowDirectMessages)}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowDirectMessages === 'everyone' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowDirectMessages', 'everyone')}
            >
              <Text style={[styles.optionText, settings.allowDirectMessages === 'everyone' && styles.selectedOptionText]}>{t('settings.everyone')}</Text>
              {settings.allowDirectMessages === 'everyone' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowDirectMessages === 'followers' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowDirectMessages', 'followers')}
            >
              <Text style={[styles.optionText, settings.allowDirectMessages === 'followers' && styles.selectedOptionText]}>{t('settings.followers')}</Text>
              {settings.allowDirectMessages === 'followers' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowDirectMessages === 'none' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowDirectMessages', 'none')}
            >
              <Text style={[styles.optionText, settings.allowDirectMessages === 'none' && styles.selectedOptionText]}>{t('settings.noOne')}</Text>
              {settings.allowDirectMessages === 'none' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.commentPermissions')}</Text>
              <Text style={styles.settingDescription}>{t('settings.whoCanCommentVideos')}</Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.selectValue}>
                {getOptionDisplayText(settings.allowComments)}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowComments === 'everyone' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowComments', 'everyone')}
            >
              <Text style={[styles.optionText, settings.allowComments === 'everyone' && styles.selectedOptionText]}>{t('settings.everyone')}</Text>
              {settings.allowComments === 'everyone' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowComments === 'followers' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowComments', 'followers')}
            >
              <Text style={[styles.optionText, settings.allowComments === 'followers' && styles.selectedOptionText]}>{t('settings.followers')}</Text>
              {settings.allowComments === 'followers' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, settings.allowComments === 'none' && styles.selectedOption]} 
              onPress={() => changeSelectSetting('allowComments', 'none')}
            >
              <Text style={[styles.optionText, settings.allowComments === 'none' && styles.selectedOptionText]}>{t('settings.noOne')}</Text>
              {settings.allowComments === 'none' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.contentPrivacy')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.showLikedVideos')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.showLikedVideosDesc')}
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
          <Text style={styles.sectionTitle}>{t('settings.dataAndPersonalization')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>{t('settings.personalizedContent')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.personalizedContentDesc')}
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
          
          <TouchableOpacity 
            style={styles.dataManagementButton}
            onPress={() => navigation.navigate('DataManagement')}
          >
            <Text style={styles.dataManagementText}>{t('settings.manageYourData')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.policyLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.policyLink}>{t('settings.privacyPolicy')}</Text>
          </TouchableOpacity>
          <View style={styles.policyDivider} />
          <TouchableOpacity onPress={() => navigation.navigate('TermsScreen')}>
            <Text style={styles.policyLink}>{t('settings.terms')}</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginRight: 12,
  },
  settingText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    color: '#999',
    fontSize: 13,
  },
  selectValue: {
    color: '#666',
    fontSize: 14,
  },
  optionsContainer: {
    backgroundColor: '#111',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#252525',
    borderColor: '#FF4040',
    borderWidth: 1,
  },
  optionText: {
    color: 'white',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#FF4040',
  },
  dataManagementButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  dataManagementText: {
    color: '#40A0FF',
    fontSize: 15,
  },
  policyLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  policyLink: {
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 10,
  },
  policyDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#444',
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

export default PrivacyScreen; 