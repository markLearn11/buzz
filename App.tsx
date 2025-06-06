import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { View, Text, StyleSheet, LogBox, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { store, useAppDispatch, useAppSelector } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { getCurrentUserAsync, loginSuccess } from './src/store/slices/authSlice';

// 忽略一些常见的警告
LogBox.ignoreLogs([
  'Require cycle:',
  'Possible Unhandled Promise Rejection',
  'Remote debugger',
]);

// 创建一个内部App组件，以便使用Redux hooks
const AppContent = () => {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { error } = useAppSelector(state => state.auth);
  const [networkCheckFailed, setNetworkCheckFailed] = useState(false);

  // 检查认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 从AsyncStorage获取token和用户信息
        const token = await AsyncStorage.getItem('token');
        const userDataString = await AsyncStorage.getItem('userData');
        
        if (token && userDataString) {
          try {
            // 如果有缓存的用户数据，直接恢复状态
            const userData = JSON.parse(userDataString);
            dispatch(loginSuccess(userData));
            
            // 在后台尝试更新用户数据，但不阻塞UI
            dispatch(getCurrentUserAsync()).unwrap()
              .then(freshUserData => {
                // 更新成功后，保存最新的用户数据
                AsyncStorage.setItem('userData', JSON.stringify(freshUserData))
                  .catch(err => console.error('保存更新的用户数据失败:', err));
              })
              .catch(err => {
                console.error('后台更新用户数据失败:', err);
                // 即使后台更新失败，也不影响用户体验
              });
          } catch (parseError) {
            console.error('解析用户数据失败:', parseError);
            // 如果解析失败，尝试重新获取用户数据
            try {
              const userData = await dispatch(getCurrentUserAsync()).unwrap();
              // 获取成功后保存用户数据
              await AsyncStorage.setItem('userData', JSON.stringify(userData));
            } catch (fetchError) {
              console.error('获取用户信息失败:', fetchError);
              // 如果获取失败，清除token
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userData');
            }
          }
        }
      } catch (error) {
        console.error('认证检查失败:', error);
      } finally {
        // 无论成功还是失败，都设置isCheckingAuth为false
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // 设置 Expo AV 全局音频配置
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('设置音频模式失败:', error);
      }
    };
    
    setupAudio();
  }, []);

  useEffect(() => {
    // 注意：NetInfo 在新版本中已从react-native核心库移出
    // 这里使用简化的检测方式，实际项目中应使用 @react-native-community/netinfo
    const checkConnection = async () => {
      try {
        // 尝试访问多个网站，增加可靠性
        const urls = [
          'https://www.baidu.com',
          'https://www.qq.com',
          'https://www.163.com'
        ];
        
        // 只要有一个成功就认为网络连接正常
        let isAnySuccess = false;
        
        for (const url of urls) {
          try {
            const response = await fetch(url, {
              method: 'HEAD',
              mode: 'no-cors',
              cache: 'no-cache',
              headers: { 'Cache-Control': 'no-cache' },
              referrerPolicy: 'no-referrer',
            });
            if (response.status === 200) {
              isAnySuccess = true;
              break;
            }
          } catch (e) {
            console.log(`检查网络连接失败 (${url}):`, e);
          }
        }
        
        setIsConnected(isAnySuccess);
        setNetworkCheckFailed(!isAnySuccess);
      } catch (error) {
        console.error('网络连接检查失败:', error);
        setNetworkCheckFailed(true);
        setIsConnected(false);
      }
    };

    checkConnection();
    const intervalId = setInterval(checkConnection, 30000); // 每30秒检查一次，减少频率

    return () => clearInterval(intervalId);
  }, []);

  // 如果正在检查认证状态，显示加载指示器
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logoText}>Buzz</Text>
        <ActivityIndicator size="large" color="#FF4040" style={styles.loader} />
        <Text style={styles.loadingText}>正在加载...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="auto" />
      {!isConnected && (
        <View style={styles.networkWarning}>
          <Text style={styles.networkWarningText}>
            {networkCheckFailed 
              ? '网络连接不可用，视频可能无法播放，请检查网络设置' 
              : '网络连接不稳定，视频加载可能较慢'}
          </Text>
        </View>
      )}
    </NavigationContainer>
  );
};

// 主App组件，提供Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  networkWarning: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    backgroundColor: '#FF4040',
    padding: 5,
    alignItems: 'center',
  },
  networkWarningText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF4040',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
  }
}); 