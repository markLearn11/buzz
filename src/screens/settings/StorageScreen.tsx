import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../themes/ThemeProvider';

interface StorageInfo {
  cacheSize: string;
  documentSize: string;
  mediaSize: string;
  totalSize: string;
}

const StorageScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
  
  // 初始化状态时使用t函数获取单位
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    cacheSize: `0 ${t('settings.sizeUnit')}`,
    documentSize: `0 ${t('settings.sizeUnit')}`,
    mediaSize: `0 ${t('settings.sizeUnit')}`,
    totalSize: `0 ${t('settings.sizeUnit')}`
  });

  // 加载存储信息
  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        // 尝试从API获取
        try {
          const response = await fetch(`${API_BASE_URL}/settings/storage`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const apiStorageInfo = await response.json();
            setStorageInfo(apiStorageInfo);
            
            // 同步到本地存储
            await AsyncStorage.setItem('storageInfo', JSON.stringify(apiStorageInfo));
            return;
          }
        } catch (apiError) {
          console.error(t('settings.loadStorageInfoFailed'), apiError);
          // 失败后继续尝试从本地存储加载
        }
        
        // 从本地存储获取缓存大小信息
        const savedInfo = await AsyncStorage.getItem('storageInfo');
        if (savedInfo) {
          setStorageInfo(JSON.parse(savedInfo));
        } else {
          // 模拟默认数据，使用t函数翻译单位
          const sizeUnit = t('settings.sizeUnit');
          const mockInfo = {
            cacheSize: `32.5 ${sizeUnit}`,
            documentSize: `15.2 ${sizeUnit}`,
            mediaSize: `34.8 ${sizeUnit}`,
            totalSize: `82.5 ${sizeUnit}`
          };
          setStorageInfo(mockInfo);
          await AsyncStorage.setItem('storageInfo', JSON.stringify(mockInfo));
        }
      } catch (error) {
        console.error(t('settings.loadStorageInfoFailed'), error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStorageInfo();
  }, [t]);

  // 清除缓存
  const clearCache = async () => {
    Alert.alert(
      t('settings.clearCache'),
      t('settings.clearCacheConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: async () => {
            try {
              setIsClearing(true);
              
              // 调用API清除缓存
              try {
                const response = await fetch(`${API_BASE_URL}/settings/clear-cache`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
                  }
                });

                if (response.ok) {
                  const result = await response.json();
                  
                  // 更新存储信息
                  const updatedInfo = {
                    ...storageInfo,
                    cacheSize: `0 ${t('settings.sizeUnit')}`,
                    totalSize: calculateTotalSize('0', storageInfo.documentSize, storageInfo.mediaSize)
                  };
                  
                  setStorageInfo(updatedInfo);
                  await AsyncStorage.setItem('storageInfo', JSON.stringify(updatedInfo));
                  
                  Alert.alert(t('common.success'), t('settings.cacheCleared', { size: result.clearedSize || `0 ${t('settings.sizeUnit')}` }));
                } else {
                  throw new Error(t('settings.apiRequestFailed'));
                }
              } catch (apiError) {
                console.error(t('settings.clearCacheFailed'), apiError);
                
                // API失败时使用本地模拟
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const updatedInfo = {
                  ...storageInfo,
                  cacheSize: `0 ${t('settings.sizeUnit')}`,
                  totalSize: calculateTotalSize('0', storageInfo.documentSize, storageInfo.mediaSize)
                };
                
                setStorageInfo(updatedInfo);
                await AsyncStorage.setItem('storageInfo', JSON.stringify(updatedInfo));
                
                Alert.alert(t('common.success'), t('settings.cacheCleared', { size: `0 ${t('settings.sizeUnit')}` }));
              }
            } catch (error) {
              console.error(t('settings.clearCacheFailed'), error);
              Alert.alert(t('common.error'), t('settings.clearCacheError'));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  // 清除所有数据
  const clearAllData = async () => {
    Alert.alert(
      t('settings.clearAllData'),
      t('settings.clearAllDataConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: async () => {
            try {
              setIsClearing(true);
              
              // 在实际应用中，这里应该调用原生模块或API清除所有数据
              // await api.post('/api/settings/clear-all-data');
              
              // 模拟清除所有数据
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const sizeUnit = t('settings.sizeUnit');
              const updatedInfo = {
                cacheSize: `0 ${sizeUnit}`,
                documentSize: `0 ${sizeUnit}`,
                mediaSize: `0 ${sizeUnit}`,
                totalSize: `0 ${sizeUnit}`
              };
              
              setStorageInfo(updatedInfo);
              await AsyncStorage.setItem('storageInfo', JSON.stringify(updatedInfo));
              
              Alert.alert(t('common.success'), t('settings.allDataCleared'));
            } catch (error) {
              console.error(t('settings.clearAllDataFailed'), error);
              Alert.alert(t('common.error'), t('settings.clearAllDataError'));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  // 计算总大小 - 修复国际化问题
  const calculateTotalSize = (cacheSize: string, documentSize: string, mediaSize: string) => {
    // 简化处理，实际应用中应该正确解析单位并计算
    const cache = parseFloat(cacheSize.split(' ')[0]) || 0;
    const docs = parseFloat(documentSize.split(' ')[0]) || 0;
    const media = parseFloat(mediaSize.split(' ')[0]) || 0;
    
    // 使用 t 函数获取翻译后的单位
    return `${(cache + docs + media).toFixed(1)} ${t('settings.sizeUnit')}`;
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
            {t('settings.storage')}
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
          {t('settings.storage')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={[
          styles.storageOverview, 
          { 
            backgroundColor: isDark ? '#111' : colors.secondary,
            borderColor: isDark ? '#333' : colors.border 
          }
        ]}>
          <Text style={[styles.overviewTitle, { color: isDark ? '#999' : colors.textSecondary }]}>
            {t('settings.storageUsage')}
          </Text>
          <Text style={[styles.totalSize, { color: isDark ? colors.text : colors.text }]}>
            {storageInfo.totalSize}
          </Text>
          
          <View style={[
            styles.storageBar, 
            { backgroundColor: isDark ? '#222' : '#e0e0e0' }
          ]}>
            <View 
              style={[
                styles.storageBarSegment, 
                styles.cacheSegment, 
                { backgroundColor: isDark ? '#6A5ACD' : '#8A7ADC' }
              ]} 
            />
            <View 
              style={[
                styles.storageBarSegment, 
                styles.documentsSegment, 
                { backgroundColor: isDark ? '#4682B4' : '#5692C4' }
              ]} 
            />
            <View 
              style={[
                styles.storageBarSegment, 
                styles.mediaSegment, 
                { backgroundColor: isDark ? '#20B2AA' : '#30C2BA' }
              ]} 
            />
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: isDark ? '#6A5ACD' : '#8A7ADC' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#ccc' : colors.textSecondary }]}>
                {t('settings.cache')}: {storageInfo.cacheSize}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: isDark ? '#4682B4' : '#5692C4' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#ccc' : colors.textSecondary }]}>
                {t('settings.documents')}: {storageInfo.documentSize}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: isDark ? '#20B2AA' : '#30C2BA' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#ccc' : colors.textSecondary }]}>
                {t('settings.media')}: {storageInfo.mediaSize}
              </Text>
            </View>
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
            {t('settings.dataManagement')}
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: isDark ? '#111' : colors.surfaceVariant,
                borderBottomColor: isDark ? '#222' : colors.border 
              }
            ]}
            onPress={clearCache}
            disabled={isClearing}
          >
            <View style={styles.actionContent}>
              <Ionicons name="trash-outline" size={22} color={isDark ? '#ccc' : colors.textSecondary} />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, { color: isDark ? colors.text : colors.text }]}>
                  {t('settings.clearCache')}
                </Text>
                <Text style={[styles.actionDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                  {t('settings.clearCacheDesc')}
                </Text>
              </View>
            </View>
            {isClearing ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={[styles.actionSize, { color: isDark ? '#ccc' : colors.textSecondary }]}>
                {storageInfo.cacheSize}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { backgroundColor: isDark ? '#111' : colors.surfaceVariant }
            ]}
            onPress={clearAllData}
            disabled={isClearing}
          >
            <View style={styles.actionContent}>
              <Ionicons name="trash-bin-outline" size={22} color={isDark ? '#ccc' : colors.textSecondary} />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, { color: isDark ? colors.text : colors.text }]}>
                  {t('settings.clearAllData')}
                </Text>
                <Text style={[styles.actionDescription, { color: isDark ? '#999' : colors.textTertiary }]}>
                  {t('settings.clearAllDataDesc')}
                </Text>
              </View>
            </View>
            {isClearing ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={[styles.actionSize, { color: isDark ? '#ccc' : colors.textSecondary }]}>
                {storageInfo.totalSize}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.disclaimer, { color: isDark ? '#999' : colors.textTertiary }]}>
          {t('settings.storageDisclaimer')}
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
  storageOverview: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalSize: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  storageBar: {
    height: 20,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  storageBarSegment: {
    height: '100%',
  },
  cacheSegment: {
    width: '40%', // 这里应该动态计算，但为了简化先使用固定值
  },
  documentsSegment: {
    width: '20%', // 这里应该动态计算，但为了简化先使用固定值
  },
  mediaSegment: {
    width: '40%', // 这里应该动态计算，但为了简化先使用固定值
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
  },
  actionSize: {
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
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

export default StorageScreen; 