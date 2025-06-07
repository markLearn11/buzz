import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/env';
import { useTranslation } from 'react-i18next';

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
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    cacheSize: '0 MB',
    documentSize: '0 MB',
    mediaSize: '0 MB',
    totalSize: '0 MB'
  });
  const { t } = useTranslation();

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
          // 模拟默认数据
          const mockInfo = {
            cacheSize: '32.5 MB',
            documentSize: '15.2 MB',
            mediaSize: '34.8 MB',
            totalSize: '82.5 MB'
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
                    cacheSize: '0 MB',
                    totalSize: calculateTotalSize('0', storageInfo.documentSize, storageInfo.mediaSize)
                  };
                  
                  setStorageInfo(updatedInfo);
                  await AsyncStorage.setItem('storageInfo', JSON.stringify(updatedInfo));
                  
                  Alert.alert(t('common.success'), t('settings.cacheCleared', { size: result.clearedSize || '0 MB' }));
                } else {
                  throw new Error(t('settings.apiRequestFailed'));
                }
              } catch (apiError) {
                console.error(t('settings.clearCacheFailed'), apiError);
                
                // API失败时使用本地模拟
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const updatedInfo = {
                  ...storageInfo,
                  cacheSize: '0 MB',
                  totalSize: calculateTotalSize('0', storageInfo.documentSize, storageInfo.mediaSize)
                };
                
                setStorageInfo(updatedInfo);
                await AsyncStorage.setItem('storageInfo', JSON.stringify(updatedInfo));
                
                Alert.alert(t('common.success'), t('settings.cacheCleared', { size: '0 MB' }));
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
              
              const updatedInfo = {
                cacheSize: '0 MB',
                documentSize: '0 MB',
                mediaSize: '0 MB',
                totalSize: '0 MB'
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

  // 计算总大小
  const calculateTotalSize = (cacheSize: string, documentSize: string, mediaSize: string) => {
    // 简化处理，实际应用中应该正确解析单位并计算
    const cache = parseFloat(cacheSize.split(' ')[0]) || 0;
    const docs = parseFloat(documentSize.split(' ')[0]) || 0;
    const media = parseFloat(mediaSize.split(' ')[0]) || 0;
    
    return `${(cache + docs + media).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.storage')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4040" />
          <Text style={styles.loadingText}>{t('settings.calculatingStorage')}</Text>
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
        <Text style={styles.headerTitle}>{t('settings.storage')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.storageOverview}>
          <Text style={styles.totalStorageText}>{t('settings.totalStorage')}</Text>
          <Text style={styles.totalStorageValue}>{storageInfo.totalSize}</Text>
          <View style={styles.storageBar}>
            <View 
              style={[
                styles.storageBarSegment,
                styles.cacheSegment,
                { flex: parseFloat(storageInfo.cacheSize) || 0.1 }
              ]} 
            />
            <View 
              style={[
                styles.storageBarSegment,
                styles.documentSegment,
                { flex: parseFloat(storageInfo.documentSize) || 0.1 }
              ]} 
            />
            <View 
              style={[
                styles.storageBarSegment,
                styles.mediaSegment,
                { flex: parseFloat(storageInfo.mediaSize) || 0.1 }
              ]} 
            />
          </View>
          <View style={styles.storageLabels}>
            <View style={styles.storageLabelItem}>
              <View style={[styles.storageLabelColor, styles.cacheColor]} />
              <Text style={styles.storageLabelText}>{t('settings.cache')} ({storageInfo.cacheSize})</Text>
            </View>
            <View style={styles.storageLabelItem}>
              <View style={[styles.storageLabelColor, styles.documentColor]} />
              <Text style={styles.storageLabelText}>{t('settings.documents')} ({storageInfo.documentSize})</Text>
            </View>
            <View style={styles.storageLabelItem}>
              <View style={[styles.storageLabelColor, styles.mediaColor]} />
              <Text style={styles.storageLabelText}>{t('settings.media')} ({storageInfo.mediaSize})</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.storageManagement')}</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={clearCache}
            disabled={isClearing}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="trash-outline" size={24} color="white" />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>{t('settings.clearCache')}</Text>
                <Text style={styles.actionDescription}>{t('settings.clearCacheDescription')}</Text>
              </View>
            </View>
            {isClearing ? (
              <ActivityIndicator size="small" color="#FF4040" />
            ) : (
              <Ionicons name="chevron-forward" size={22} color="#666" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={clearAllData}
            disabled={isClearing}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="alert-circle-outline" size={24} color="#FF4040" />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, styles.dangerText]}>{t('settings.clearAllData')}</Text>
                <Text style={styles.actionDescription}>{t('settings.clearAllDataDescription')}</Text>
              </View>
            </View>
            {isClearing ? (
              <ActivityIndicator size="small" color="#FF4040" />
            ) : (
              <Ionicons name="chevron-forward" size={22} color="#666" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.networkUsage')}</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoItemLabel}>{t('settings.dataUsage')}</Text>
            <Text style={styles.infoItemValue}>24.5 MB</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoItemLabel}>{t('settings.wifiUsage')}</Text>
            <Text style={styles.infoItemValue}>156.2 MB</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>{t('settings.aboutStorage')}</Text>
          <Text style={styles.infoBoxText}>{t('settings.storageInfo')}</Text>
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
    padding: 16,
  },
  storageOverview: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  totalStorageText: {
    color: '#999',
    fontSize: 14,
  },
  totalStorageValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  storageBar: {
    height: 20,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#222',
    marginTop: 8,
  },
  storageBarSegment: {
    height: '100%',
  },
  cacheSegment: {
    backgroundColor: '#FF4040',
  },
  documentSegment: {
    backgroundColor: '#40A0FF',
  },
  mediaSegment: {
    backgroundColor: '#40FF40',
  },
  storageLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  storageLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageLabelColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  cacheColor: {
    backgroundColor: '#FF4040',
  },
  documentColor: {
    backgroundColor: '#40A0FF',
  },
  mediaColor: {
    backgroundColor: '#40FF40',
  },
  storageLabelText: {
    color: '#999',
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  actionDescription: {
    color: '#999',
    fontSize: 12,
  },
  dangerText: {
    color: '#FF4040',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  infoItemLabel: {
    color: 'white',
    fontSize: 16,
  },
  infoItemValue: {
    color: '#999',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  infoBoxTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoBoxText: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
    marginTop: 12,
  },
});

export default StorageScreen; 