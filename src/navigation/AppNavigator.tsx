import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { RootState, useAppDispatch, useAppSelector } from '../store';
import { setActiveTab } from '../store/slices/appSlice';
import { useTheme } from '../themes/ThemeProvider';
import '../i18n'; // 导入i18n配置

// 屏幕
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import CreateScreen from '../screens/CreateScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import ChatScreen from '../screens/ChatScreen';
import VideoDetailScreen from '../screens/VideoDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// 设置子页面
import PasswordChangeScreen from '../screens/settings/PasswordChangeScreen';
import AppearanceScreen from '../screens/settings/AppearanceScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import StorageScreen from '../screens/settings/StorageScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import HelpScreen from '../screens/settings/HelpScreen';
import TermsScreen from '../screens/settings/TermsScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 自定义导航主题，匹配我们的应用主题
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF4040',
    background: '#000000',
    card: '#121212',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#FF4040',
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF4040',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#FF4040',
  },
};

const HomeStack = () => {
  const { isDark } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' } 
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
};

const InboxStack = () => {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Messages" 
        component={InboxScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={({ route }) => ({ 
          title: route.params?.username || t('inbox.chat'),
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? colors.surface : colors.primary,
          },
          headerTintColor: isDark ? colors.text : colors.white,
          headerTitleStyle: {
            color: isDark ? colors.text : colors.white,
          },
          contentStyle: { 
            backgroundColor: isDark ? colors.primary : colors.white 
          }
        })} 
      />
    </Stack.Navigator>
  );
};

const CreateStack = () => {
  const { isDark } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' } 
      }}
    >
      <Stack.Screen name="CreateVideo" component={CreateScreen} />
      <Stack.Screen name="VideoEditor" component={VideoEditorScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { isDark, colors } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? colors.primary : colors.white } 
      }}
    >
      <Stack.Screen name="UserProfile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      
      {/* 设置子页面 */}
      <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacyScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageScreen} />
      <Stack.Screen name="StorageSettings" component={StorageScreen} />
      <Stack.Screen name="AboutUs" component={AboutScreen} />
      <Stack.Screen name="HelpCenter" component={HelpScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(); // 使用翻译hook
  const { isDark, colors } = useTheme();
  const [currentTab, setCurrentTab] = React.useState('Home');
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Create') {
            return (
              <View style={[
                styles.createButtonContainer, 
                isDark ? styles.createButtonDark : styles.createButtonLight
              ]}>
                <Ionicons name="add" size={size + 15} color="#FF4040" />
              </View>
            );
          } else if (route.name === 'Inbox') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: isDark ? '#888888' : '#666666',
        // 根据当前选中的标签决定是否显示标签栏
        tabBarStyle: currentTab === 'Create' ? 
          { display: 'none' } : 
          {
            backgroundColor: isDark ? colors.surface : colors.white,
            borderTopColor: isDark ? colors.border : '#E0E0E0',
          },
        headerShown: false,
      })}
      screenListeners={{
        tabPress: (e) => {
          // 获取目标tab的名称
          const targetTab = e.target?.split('-')[0];
          if (targetTab) {
            // 设置当前选中的标签
            setCurrentTab(targetTab);
            // 更新当前活动tab
            dispatch(setActiveTab(targetTab));
          }
        },
        state: (e) => {
          // 从state事件中获取当前活动tab
          const state = e.data.state;
          if (state && state.index >= 0) {
            const activeRouteName = state.routes[state.index].name;
            setCurrentTab(activeRouteName);
          }
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ tabBarLabel: t('tabs.home') }} 
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen} 
        options={{ tabBarLabel: t('tabs.discover') }} 
      />
      <Tab.Screen 
        name="Create" 
        component={CreateStack} 
        options={{ tabBarLabel: '' }} 
      />
      <Tab.Screen 
        name="Inbox" 
        component={InboxStack} 
        options={{ tabBarLabel: t('tabs.inbox') }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ tabBarLabel: t('tabs.profile') }} 
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  const { isDark, colors } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? colors.primary : colors.white } 
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isDark } = useTheme();

  // 选择合适的导航主题
  const theme = isDark ? customDarkTheme : customLightTheme;

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

const styles = StyleSheet.create({
  createButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 5,
  },
  createButtonLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
  },
  createButtonDark: {
    backgroundColor: '#2A2A2A',
    shadowColor: '#000000',
  }
});

export default AppNavigator; 