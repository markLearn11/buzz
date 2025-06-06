import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { updateProfileAsync, logoutAsync, getCurrentUserAsync } from '../store/slices/authSlice';
import { getImageUrlWithCacheBuster } from '../services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // 当页面获得焦点时刷新用户数据
  useFocusEffect(
    React.useCallback(() => {
      const refreshUserData = async () => {
        try {
          setIsRefreshing(true);
          console.log('刷新用户资料数据...');
          await dispatch(getCurrentUserAsync()).unwrap();
          setLastUpdated(Date.now());
          console.log('用户资料数据刷新成功');
        } catch (error) {
          console.error('刷新用户资料失败:', error);
        } finally {
          setIsRefreshing(false);
        }
      };
      
      refreshUserData();
    }, [dispatch])
  );

  // 手动刷新用户数据的函数
  const refreshUserDataManually = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      console.log('手动刷新用户资料数据...');
      await dispatch(getCurrentUserAsync()).unwrap();
      setLastUpdated(Date.now());
      console.log('用户资料数据手动刷新成功');
    } catch (error) {
      console.error('手动刷新用户资料失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 获取用户视频列表
  useEffect(() => {
    // 这里应该调用API获取用户视频列表
    // 暂时使用空数组
  }, [user?._id]);

  // 生成用户头像 - 如果没有头像图片，使用用户名首字母
  const getAvatarContent = () => {
    if (user?.avatar && !avatarLoadError) {
      // 使用工具函数添加时间戳避免缓存问题
      const avatarUri = getImageUrlWithCacheBuster(user.avatar);
      console.log('尝试加载头像:', {
        原始头像路径: user.avatar,
        转换后URL: avatarUri
      });
      
      return (
        <Image 
          source={{ uri: avatarUri }} 
          style={styles.avatarImage}
          onLoadStart={() => console.log('头像开始加载:', avatarUri)}
          onLoad={() => console.log('头像加载成功:', avatarUri)}
          onError={(e) => {
            console.error('头像加载失败:', avatarUri, e.nativeEvent.error);
            setAvatarLoadError(true);
            // 尝试直接通过相对路径加载（测试用）
            if (user.avatar.startsWith('/public/')) {
              console.log('尝试通过不同方式加载头像...');
            }
          }}
        />
      );
    } else {
      return <Text style={styles.avatarText}>{user?.username?.[0] || '我'}</Text>;
    }
  };

  // 当用户数据更新时，重置头像加载错误状态
  useEffect(() => {
    if (user?.avatar) {
      setAvatarLoadError(false);
    }
  }, [user?.avatar]);

  const navigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleLogout = async () => {
    Alert.alert(
      '确认登出',
      '您确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await dispatch(logoutAsync()).unwrap();
              // 登出成功，Redux会自动更新状态，用户会被重定向到登录页面
            } catch (error) {
              Alert.alert('登出失败', '请稍后重试');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  // 渲染Tab内容
  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FF4040" size="large" />
        </View>
      );
    }

    if (activeTab === 'videos' && videos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="videocam-outline" size={50} color="#444" />
          <Text style={styles.emptyText}>您还没有发布任何视频</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>立即上传</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'liked' && videos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={50} color="#444" />
          <Text style={styles.emptyText}>您还没有点赞任何视频</Text>
        </View>
      );
    }

    // 如果有视频数据，渲染网格列表
    return (
      <FlatList
        data={videos}
        renderItem={({ item }) => (
          <View style={styles.videoItem}>
            {/* 视频缩略图 */}
          </View>
        )}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.videosGrid}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的主页</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={refreshUserDataManually} 
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="refresh-outline" size={24} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="log-out-outline" size={24} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.avatar}>
          {getAvatarContent()}
        </View>
        <Text style={styles.username}>{user?.username || '用户名'}</Text>
        <Text style={styles.bio}>{user?.bio || '这里是个人简介，请在设置中完善您的资料。'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.following?.length || 0}</Text>
            <Text style={styles.statLabel}>关注</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>获赞</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editProfileButton} onPress={navigateToEditProfile}>
          <Text style={styles.editProfileText}>编辑资料</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'videos' && styles.activeTabButton]}
          onPress={() => setActiveTab('videos')}
        >
          <Ionicons 
            name={activeTab === 'videos' ? 'grid' : 'grid-outline'} 
            size={20} 
            color={activeTab === 'videos' ? 'white' : '#999'} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'liked' && styles.activeTabButton]}
          onPress={() => setActiveTab('liked')}
        >
          <Ionicons 
            name={activeTab === 'liked' ? 'heart' : 'heart-outline'} 
            size={20} 
            color={activeTab === 'liked' ? 'white' : '#999'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 20,
  },
  editProfileText: {
    color: 'white',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 20,
  },
  uploadButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF4040',
    borderRadius: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videosGrid: {
    padding: 2,
  },
  videoItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: '#333',
  }
});

export default ProfileScreen; 