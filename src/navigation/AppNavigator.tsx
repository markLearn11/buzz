import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RootState, useAppDispatch } from '../store';
import { setActiveTab } from '../store/slices/appSlice';
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

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeFeed" component={HomeScreen} />
    <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
  </Stack.Navigator>
);

const InboxStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Messages" component={InboxScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ 
      title: route.params?.username || '聊天',
      headerShown: true 
    })} />
  </Stack.Navigator>
);

const CreateStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CreateVideo" component={CreateScreen} />
    <Stack.Screen name="VideoEditor" component={VideoEditorScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
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

const MainTabs = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(); // 使用翻译hook
  
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
              <View style={styles.createButtonContainer}>
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
        tabBarActiveTintColor: '#FF4040',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
      screenListeners={{
        tabPress: (e) => {
          // 获取目标tab的名称
          const targetTab = e.target?.split('-')[0];
          if (targetTab) {
            // 更新当前活动tab
            dispatch(setActiveTab(targetTab));
          }
        },
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

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

const styles = StyleSheet.create({
  createButtonContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 5,
  }
});

export default AppNavigator; 