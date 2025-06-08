import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../themes/ThemeProvider';

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
  const { isDark, colors } = useTheme();

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
            {t('settings.privacy')}
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
          {t('settings.privacy')}
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
            {t('settings.accountPrivacy')}
          </Text>
          
          <View style={[
            styles.settingItem, 
            { borderBottomColor: isDark ? '#222' : colors.border }
          ]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: isDark ? colors.text : colors.text }]}>
                {t('settings.privateAccount')}
              </Text>
              <Text style={[styles.settingDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                {t('settings.privateAccountDesc')}
              </Text>
            </View>
            <Switch
              trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
              onValueChange={() => toggleSwitchSetting('privateAccount')}
              value={settings.privateAccount}
            />
          </View>
          
          <View style={[
            styles.settingItem, 
            { borderBottomColor: isDark ? '#222' : colors.border }
          ]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: isDark ? colors.text : colors.text }]}>
                {t('settings.showActivityStatus')}
              </Text>
              <Text style={[styles.settingDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                {t('settings.showActivityStatusDesc')}
              </Text>
            </View>
            <Switch
              trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
              onValueChange={() => toggleSwitchSetting('showActivityStatus')}
              value={settings.showActivityStatus}
            />
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
            {t('settings.interactions')}
          </Text>
          
          <View style={[
            styles.settingItem, 
            { borderBottomColor: isDark ? '#222' : colors.border }
          ]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: isDark ? colors.text : colors.text }]}>
                {t('settings.directMessagePermissions')}
              </Text>
              <Text style={[styles.settingDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                {t('settings.whoCanMessageYou')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.selectValue, { color: isDark ? colors.text : colors.text }]}>
                {getOptionDisplayText(settings.allowDirectMessages)}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.optionsContainer, 
            { 
              backgroundColor: isDark ? '#1a1a1a' : colors.secondary,
              borderBottomColor: isDark ? '#333' : colors.divider 
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.optionItem, 
                { 
                  backgroundColor: isDark ? '#252525' : colors.secondary,
                  borderColor: isDark ? '#333' : colors.border 
                },
                settings.allowDirectMessages === 'everyone' && { backgroundColor: isDark ? '#252525' : colors.secondary }
              ]}
              onPress={() => changeSelectSetting('allowDirectMessages', 'everyone')}
            >
              <Text style={[
                styles.optionText, 
                { color: isDark ? colors.text : colors.text },
                settings.allowDirectMessages === 'everyone' && { color: colors.accent }
              ]}>
                {t('settings.everyone')}
              </Text>
              {settings.allowDirectMessages === 'everyone' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionItem, 
                { 
                  backgroundColor: isDark ? '#252525' : colors.secondary,
                  borderColor: isDark ? '#333' : colors.border 
                },
                settings.allowDirectMessages === 'followers' && { backgroundColor: isDark ? '#252525' : colors.secondary }
              ]}
              onPress={() => changeSelectSetting('allowDirectMessages', 'followers')}
            >
              <Text style={[
                styles.optionText, 
                { color: isDark ? colors.text : colors.text },
                settings.allowDirectMessages === 'followers' && { color: colors.accent }
              ]}>
                {t('settings.followers')}
              </Text>
              {settings.allowDirectMessages === 'followers' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionItem, 
                { 
                  backgroundColor: isDark ? '#252525' : colors.secondary,
                  borderColor: isDark ? '#333' : colors.border 
                },
                settings.allowDirectMessages === 'none' && { backgroundColor: isDark ? '#252525' : colors.secondary }
              ]}
              onPress={() => changeSelectSetting('allowDirectMessages', 'none')}
            >
              <Text style={[
                styles.optionText, 
                { color: isDark ? colors.text : colors.text },
                settings.allowDirectMessages === 'none' && { color: colors.accent }
              ]}>
                {t('settings.noOne')}
              </Text>
              {settings.allowDirectMessages === 'none' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.settingItem, 
            { borderBottomColor: isDark ? '#222' : colors.border }
          ]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: isDark ? colors.text : colors.text }]}>
                {t('settings.commentPermissions')}
              </Text>
              <Text style={[styles.settingDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                {t('settings.whoCanCommentVideos')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.selectValue, { color: isDark ? colors.text : colors.text }]}>
                {getOptionDisplayText(settings.allowComments)}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.optionsContainer, 
            { 
              backgroundColor: isDark ? '#1a1a1a' : colors.secondary,
              borderBottomColor: isDark ? '#333' : colors.divider 
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.optionItem, 
                { 
                  backgroundColor: isDark ? '#252525' : colors.secondary,
                  borderColor: isDark ? '#333' : colors.border 
                },
                settings.allowComments === 'everyone' && { backgroundColor: isDark ? '#252525' : colors.secondary }
              ]}
              onPress={() => changeSelectSetting('allowComments', 'everyone')}
            >
              <Text style={[
                styles.optionText, 
                { color: isDark ? colors.text : colors.text },
                settings.allowComments === 'everyone' && { color: colors.accent }
              ]}>
                {t('settings.everyone')}
              </Text>
              {settings.allowComments === 'everyone' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionItem, 
                { 
                  backgroundColor: isDark ? '#252525' : colors.secondary,
                  borderColor: isDark ? '#333' : colors.border 
                },
                settings.allowComments === 'followers' && { backgroundColor: isDark ? '#252525' : colors.secondary }
              ]}
              onPress={() => changeSelectSetting('allowComments', 'followers')}
            >
              <Text style={[
                styles.optionText, 
                { color: isDark ? colors.text : colors.text },
                settings.allowComments === 'followers' && { color: colors.accent }
              ]}>
                {t('settings.followers')}
              </Text>
              {settings.allowComments === 'followers' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionItem, 
                { 
                  backgroundColor: isDark ? '#252525' : colors.secondary,
                  borderColor: isDark ? '#333' : colors.border 
                },
                settings.allowComments === 'none' && { backgroundColor: isDark ? '#252525' : colors.secondary }
              ]}
              onPress={() => changeSelectSetting('allowComments', 'none')}
            >
              <Text style={[
                styles.optionText, 
                { color: isDark ? colors.text : colors.text },
                settings.allowComments === 'none' && { color: colors.accent }
              ]}>
                {t('settings.noOne')}
              </Text>
              {settings.allowComments === 'none' && <Ionicons name="checkmark" size={20} color={colors.accent} />}
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
            {t('settings.contentPrivacy')}
          </Text>
          
          <View style={[
            styles.settingItem, 
            { borderBottomColor: isDark ? '#222' : colors.border }
          ]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: isDark ? colors.text : colors.text }]}>
                {t('settings.showLikedVideos')}
              </Text>
              <Text style={[styles.settingDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                {t('settings.showLikedVideosDesc')}
              </Text>
            </View>
            <Switch
              trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
              onValueChange={() => toggleSwitchSetting('showLikedVideos')}
              value={settings.showLikedVideos}
            />
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
            {t('settings.dataAndPersonalization')}
          </Text>
          
          <View style={[
            styles.settingItem, 
            { borderBottomColor: isDark ? '#222' : colors.border }
          ]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: isDark ? colors.text : colors.text }]}>
                {t('settings.personalizedContent')}
              </Text>
              <Text style={[styles.settingDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                {t('settings.personalizedContentDesc')}
              </Text>
            </View>
            <Switch
              trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.accent }}
              thumbColor="#f4f3f4"
              ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
              onValueChange={() => toggleSwitchSetting('dataPersonalization')}
              value={settings.dataPersonalization}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.dataManagementButton, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                borderBottomColor: isDark ? '#333' : colors.border 
              }
            ]}
            onPress={() => navigation.navigate('DataManagement')}
          >
            <Text style={[styles.dataManagementText, { color: colors.accent }]}>
              {t('settings.manageYourData')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={[
          styles.policyLinks, 
          { backgroundColor: isDark ? '#111' : colors.secondary }
        ]}>
          <TouchableOpacity 
            style={[
              styles.policyLink, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                borderColor: isDark ? '#333' : colors.border,
                borderWidth: 1
              }
            ]} 
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={[styles.policyLinkText, { color: colors.accent }]}>
              {t('settings.privacyPolicy')}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 15 }} />
          <TouchableOpacity 
            style={[
              styles.policyLink, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                borderColor: isDark ? '#333' : colors.border,
                borderWidth: 1
              }
            ]} 
            onPress={() => navigation.navigate('TermsScreen')}
          >
            <Text style={[styles.policyLinkText, { color: colors.accent }]}>
              {t('settings.terms')}
            </Text>
          </TouchableOpacity>
        </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  selectValue: {
    color: '#666',
    fontSize: 14,
  },
  optionsContainer: {
    backgroundColor: '#111',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    marginTop: 5,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  dataManagementText: {
    fontSize: 15,
    fontWeight: '500',
  },
  policyLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 10,
  },
  policyLink: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  policyLinkText: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 16,
    marginTop: 10,
  },
});

export default PrivacyScreen; 