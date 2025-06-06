import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { Audio } from 'expo-av';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

// 忽略一些常见的警告
LogBox.ignoreLogs([
  'Require cycle:',
  'Possible Unhandled Promise Rejection',
  'Remote debugger',
]);

export default function App() {
  const [isConnected, setIsConnected] = useState(true);

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
        const response = await fetch('https://www.baidu.com');
        setIsConnected(response.status === 200);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const intervalId = setInterval(checkConnection, 5000); // 每5秒检查一次

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
          {!isConnected && (
            <View style={styles.networkWarning}>
              <Text style={styles.networkWarningText}>网络连接不可用，视频可能无法播放</Text>
            </View>
          )}
        </NavigationContainer>
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
  }
}); 