import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutAsync } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../themes/ThemeProvider';
import { CommonActions } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
  const { isDarkMode } = useAppSelector(state => state.theme);

  const handleLogout = () => {
    Alert.alert(
      t('auth.logoutConfirmTitle'),
      t('auth.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              await dispatch(logoutAsync());
            } catch (error) {
              console.error(t('auth.logoutFailed'), error);
              Alert.alert(t('common.error'), t('auth.logoutFailed'));
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const navigateToAppearance = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: {
          display: 'flex',
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderTopColor: isDark ? '#333333' : '#E0E0E0',
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 3,
        }
      });
    }
    
    navigation.navigate('Appearance', {
      preloadedTheme: isDarkMode ? 'dark' : 'light',
      keepDarkTab: false
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? colors.border : colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.textSecondary }]}>
          {t('settings.title')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#666' : '#888' }]}>
            {t('settings.account')}
          </Text>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="person-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('profile.editProfile')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('PasswordChange')}
          >
            <Ionicons name="lock-closed-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('auth.changePassword')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Ionicons name="notifications-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.notifications')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#666' : '#888' }]}>
            {t('settings.title')}
          </Text>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('LanguageSettings')}
          >
            <Ionicons name="language-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.language')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <Ionicons name="shield-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.privacy')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={navigateToAppearance}
          >
            <Ionicons name="eye-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.appearance')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('StorageSettings')}
          >
            <Ionicons name="cloud-download-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.storage')}
            </Text>
            <View style={[styles.storageBadge, { backgroundColor: isDark ? '#333' : '#eee' }]}>
              <Text style={[styles.storageBadgeText, { color: isDark ? '#ccc' : '#666' }]}>82.5MB</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#666' : '#888' }]}>
            {t('settings.about')}
          </Text>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('AboutUs')}
          >
            <Ionicons name="information-circle-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.about')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <Ionicons name="help-circle-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.help')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('TermsScreen')}
          >
            <Ionicons name="document-text-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.terms')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDark ? colors.border : colors.divider }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color={isDark ? "#ccc" : "#666"} />
            <Text style={[styles.menuText, { color: isDark ? colors.text : colors.textSecondary }]}>
              {t('settings.privacyPolicy')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#666" : "#999"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: isDark ? '#666' : '#999' }]}>
          {t('settings.version', { version: '1.0.0' })}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  storageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  storageBadgeText: {
    fontSize: 12,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#FF4040',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
});

export default SettingsScreen; 