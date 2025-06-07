import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 模拟从Redux获取主题设置
// 实际应用中，应该从Redux或Context中获取主题设置
const useThemeSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // 默认为暗黑模式
  const [followSystem, setFollowSystem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载保存的主题设置
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
        const savedFollowSystem = await AsyncStorage.getItem('followSystem');
        
        if (savedDarkMode !== null) {
          setIsDarkMode(savedDarkMode === 'true');
        }
        
        if (savedFollowSystem !== null) {
          setFollowSystem(savedFollowSystem === 'true');
        }
      } catch (error) {
        console.error('加载主题设置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemeSettings();
  }, []);

  // 保存主题设置
  const saveThemeSettings = async (dark: boolean, system: boolean) => {
    try {
      await AsyncStorage.setItem('isDarkMode', dark.toString());
      await AsyncStorage.setItem('followSystem', system.toString());
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  // 切换暗黑模式
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    saveThemeSettings(newValue, followSystem);
    // 这里应该调用Redux action或Context更新全局主题
  };

  // 切换跟随系统设置
  const toggleFollowSystem = () => {
    const newValue = !followSystem;
    setFollowSystem(newValue);
    saveThemeSettings(isDarkMode, newValue);
    // 这里应该调用Redux action或Context更新全局主题
  };

  return { isDarkMode, followSystem, isLoading, toggleDarkMode, toggleFollowSystem };
};

const AppearanceScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, followSystem, isLoading, toggleDarkMode, toggleFollowSystem } = useThemeSettings();
  const [textSize, setTextSize] = useState('medium'); // small, medium, large

  // 更改文本大小
  const handleTextSizeChange = (size: string) => {
    setTextSize(size);
    // 这里应该调用相关函数保存文本大小设置
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>外观设置</Text>
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
        <Text style={styles.headerTitle}>外观设置</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主题</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>暗黑模式</Text>
              <Text style={styles.settingDescription}>启用后将使用深色背景</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDarkMode}
              value={isDarkMode}
              disabled={followSystem}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>跟随系统设置</Text>
              <Text style={styles.settingDescription}>根据系统明暗模式自动调整</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: '#FF4040' }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleFollowSystem}
              value={followSystem}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文字大小</Text>
          
          <TouchableOpacity 
            style={[styles.textSizeOption, textSize === 'small' && styles.selectedTextSize]} 
            onPress={() => handleTextSizeChange('small')}
          >
            <Text style={[styles.textSizeOptionText, textSize === 'small' && styles.selectedTextSizeText]}>小</Text>
            {textSize === 'small' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.textSizeOption, textSize === 'medium' && styles.selectedTextSize]} 
            onPress={() => handleTextSizeChange('medium')}
          >
            <Text style={[styles.textSizeOptionText, textSize === 'medium' && styles.selectedTextSizeText]}>中</Text>
            {textSize === 'medium' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.textSizeOption, textSize === 'large' && styles.selectedTextSize]} 
            onPress={() => handleTextSizeChange('large')}
          >
            <Text style={[styles.textSizeOptionText, textSize === 'large' && styles.selectedTextSizeText]}>大</Text>
            {textSize === 'large' && <Ionicons name="checkmark" size={20} color="#FF4040" />}
          </TouchableOpacity>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>预览</Text>
          <View style={[styles.previewCard, !isDarkMode && styles.lightModePreview]}>
            <Text style={[styles.previewHeader, !isDarkMode && styles.lightModeText]}>外观预览</Text>
            <Text style={[styles.previewBody, !isDarkMode && styles.lightModeText]}>
              这是应用在{isDarkMode ? '暗黑' : '浅色'}模式下的样子。
              您可以根据自己的喜好随时调整外观设置。
            </Text>
          </View>
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
    marginBottom: 24,
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
  textSizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedTextSize: {
    borderBottomColor: '#444',
  },
  textSizeOptionText: {
    color: 'white',
    fontSize: 16,
  },
  selectedTextSizeText: {
    color: '#FF4040',
  },
  previewSection: {
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  previewTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  lightModePreview: {
    backgroundColor: '#f5f5f5',
  },
  previewHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewBody: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  lightModeText: {
    color: '#333',
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

export default AppearanceScreen; 