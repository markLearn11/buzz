import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  ScrollView,
  Dimensions, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { RootState } from '../store';
import { 
  fetchVideosStart, 
  fetchVideosSuccess, 
  fetchVideosFailure,
  likeVideo,
  Video as VideoType
} from '../store/slices/videosSlice';

// 模拟视频数据
const DUMMY_VIDEOS = [
  {
    id: '1',
    userId: 'user1',
    userName: '创作者小明',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/id/1/300/400',
    description: '夏日泳池的美好时光 #夏天 #游泳 #度假',
    likes: 1243,
    comments: 89,
    shares: 45,
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    userId: 'user2',
    userName: '旅行达人',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/id/2/300/400',
    description: '春天来了，花开满树 #春天 #花卉 #自然',
    likes: 8721,
    comments: 432,
    shares: 211,
    createdAt: Date.now() - 86400000,
  },
  {
    id: '3',
    userId: 'user3',
    userName: '美食博主',
    userAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/id/3/300/400',
    description: '新入手的智能手表，功能真强大 #科技 #智能手表 #开箱',
    likes: 3478,
    comments: 121,
    shares: 78,
    createdAt: Date.now() - 172800000,
  },
];

// 备用视频URL，确保在所有平台都能播放
const FALLBACK_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// 估计底部Tab栏高度
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;
// 为底部信息添加额外的安全间距
const BOTTOM_INFO_MARGIN = Platform.OS === 'ios' ? 30 : 30;
// 为视频描述文本预留的高度
const VIDEO_INFO_HEIGHT = Platform.OS === 'ios' ? 100 : 100;

// 计算固定的视频容器高度
const getExactVideoHeight = () => {
  const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);
  // 使用精确的整数值，避免小数点导致的渲染差异
  // 在iOS上，减去底部安全区域的高度，确保视频不会超出可视区域
  return Math.floor(screenHeight - (Platform.OS === 'ios' ? 34 : 0));
};

const FIXED_VIDEO_HEIGHT = getExactVideoHeight();

// 检查视频URL是否可访问
const checkVideoUrl = async (url: string): Promise<boolean> => {
  // 对于安卓设备，直接返回true，不进行网络请求
  if (Platform.OS === 'android') {
    return true;
  }
  
  try {
    // 对于某些视频服务器，HEAD 请求可能不被支持，所以我们使用 GET 请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: { Range: 'bytes=0-1024' }, // 只请求前1KB数据
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    // if (Platform.OS !== 'android') {
    //   // 只在非安卓设备上记录错误
    //   console.error('视频URL检查失败:', error);
    // }
    return false;
  }
};

const VideoItem = ({ item, isActive }) => {
  const videoRef = useRef(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(item.videoUrl);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  
  // 从全局状态获取是否应该暂停所有视频
  const shouldPauseAllVideos = useSelector((state: RootState) => state.app.shouldPauseAllVideos);
  const isVideoTabActive = useSelector((state: RootState) => state.app.isVideoTabActive);
  
  // 根据全局状态和本地状态决定视频是否应该播放
  const shouldPlay = isActive && !isPaused && isVideoTabActive && !shouldPauseAllVideos;
  
  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.playAsync().catch(err => console.log('播放错误:', err));
      } else {
        videoRef.current.pauseAsync().catch(err => console.log('暂停错误:', err));
      }
    }
  }, [shouldPlay]);
  
  // 在组件挂载时检查视频URL，但只在iOS上进行
  useEffect(() => {
    // 重置状态
    setFallbackAttempted(false);
    setHasError(false);
    
    // 安卓设备直接使用原始URL，不进行预检查
    if (Platform.OS === 'android') {
      return;
    }
    
    const verifyVideoUrl = async () => {
      try {
        // 对于iOS设备，进行URL可用性检查
        let isValid = await checkVideoUrl(item.videoUrl);
        
        if (!isValid) {
          console.warn('视频URL无效，尝试使用备用视频');
          // 使用备用视频
          setVideoUrl(FALLBACK_VIDEO_URL);
          setFallbackAttempted(true);
        }
      } catch (error) {
        console.error('验证视频URL时出错:', error);
        // 出错时使用备用视频
        setVideoUrl(FALLBACK_VIDEO_URL);
        setFallbackAttempted(true);
      }
    };
    
    verifyVideoUrl();
  }, [item.videoUrl]);
  
  const handleLike = () => {
    dispatch(likeVideo(item.id));
  };
  
  const handleComment = () => {
    navigation.navigate('VideoDetail', { videoId: item.id });
  };
  
  const handleShare = () => {
    // shareVideo不再可用，因此我们只增加内部state的shares数
    // 在实际应用中，这里应该调用API
    // dispatch(shareVideo(item.id));
    const newItem = {...item};
    newItem.shares += 1;
  };
  
  const handleUserProfile = () => {
    navigation.navigate('UserProfile', { userId: item.userId });
  };
  
  const togglePlayPause = () => {
    // 使用函数式更新确保状态一致性
    setIsPaused(prevState => !prevState);
  };
  
  // 计算底部安全区域
  const bottomSafeArea = insets.bottom;
  
  // 根据平台调整底部控件位置
  const bottomOffset = Platform.OS === 'ios' ? 
    (bottomSafeArea > 0 ? bottomSafeArea + 20 : 40) : 
    20;
  
  return (
    <View style={styles.videoContainer}>
      {/* 视频播放器 */}
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.COVER}
          shouldPlay={shouldPlay}
          isLooping
          style={styles.video}
          onError={(error) => {
            console.error('视频播放错误:', error);
            setHasError(true);
            
            // 只有当原始视频无法播放且尚未尝试备用视频时，才使用备用视频
            if (videoUrl === item.videoUrl && !fallbackAttempted) {
              console.log('原始视频无法播放，使用备用视频');
              setVideoUrl(FALLBACK_VIDEO_URL);
              setFallbackAttempted(true);
            }
          }}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoad={() => setIsLoading(false)}
          useNativeControls={Platform.OS === 'android'} // 在安卓上使用原生控制器，提高兼容性
          progressUpdateIntervalMillis={1000} // 降低进度更新频率，减少性能压力
        />
        
        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#FF4040" />
          </View>
        )}
        
        {hasError && !isLoading && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle-outline" size={40} color="#FF4040" />
            <Text style={styles.errorText}>视频加载失败，正在重试...</Text>
          </View>
        )}
      </View>
      
      {/* 视频触摸层 - 分离出来避免影响视频显示 */}
      <TouchableOpacity 
        style={styles.videoTouchable} 
        activeOpacity={1}
        onPress={togglePlayPause}
      >
        {isPaused && (
          <View style={styles.playButtonOverlay}>
            <Ionicons name="play" size={60} color="rgba(255, 255, 255, 0.8)" />
          </View>
        )}
      </TouchableOpacity>
      
      {/* 右侧控制按钮 */}
      <View style={[
        styles.rightControls, 
        {bottom: VIDEO_INFO_HEIGHT + bottomOffset}
      ]}>
        <TouchableOpacity style={styles.controlButton} onPress={handleUserProfile}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
            </View>
            <View style={styles.followButton}>
              <Ionicons name="add" size={12} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleLike}>
          <Ionicons name="heart" size={35} color="white" />
          <Text style={styles.controlText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleComment}>
          <Ionicons name="chatbubble-ellipses" size={32} color="white" />
          <Text style={styles.controlText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
          <Ionicons name="arrow-redo" size={35} color="white" />
          <Text style={styles.controlText}>{item.shares}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
          <Ionicons name={isPaused ? "play" : "pause"} size={35} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* 底部渐变和信息 */}
      <View style={[
        styles.bottomContainer, 
        {height: VIDEO_INFO_HEIGHT + TAB_BAR_HEIGHT + bottomSafeArea + (Platform.OS === 'ios' ? 20 : 0)}
      ]}>
        {/* 底部渐变背景 */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
          style={[
            styles.bottomGradient, 
            {height: VIDEO_INFO_HEIGHT + TAB_BAR_HEIGHT + bottomSafeArea + (Platform.OS === 'ios' ? 60 : 40)}
          ]}
        />
        
        {/* 底部用户信息和描述 */}
        <View style={[
          styles.videoInfoContainer, 
          {bottom: TAB_BAR_HEIGHT + BOTTOM_INFO_MARGIN + (Platform.OS === 'ios' ? bottomSafeArea : 0)}
        ]}>
          <TouchableOpacity onPress={handleUserProfile} style={styles.userNameContainer}>
            <Ionicons name="at" size={16} color="#FF4040" />
            <Text style={styles.userName}>{item.userName}</Text>
          </TouchableOpacity>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const { feedVideos, isLoading } = useSelector((state: RootState) => state.videos);
  const isVideoTabActive = useSelector((state: RootState) => state.app.isVideoTabActive);
  const activeTab = useSelector((state: RootState) => state.app.activeTab);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取视频
    dispatch(fetchVideosStart());
    try {
      dispatch(fetchVideosSuccess(DUMMY_VIDEOS));
    } catch (error) {
      dispatch(fetchVideosFailure((error as Error).message || '获取视频失败'));
    }
  }, [dispatch]);
  
  // 监听tab切换，当切换回Home tab时，恢复视频播放
  useEffect(() => {
    if (activeTab === 'Home') {
      // 确保当前视频能够正确播放
      const currentIndex = activeVideoIndex;
      setActiveVideoIndex(-1); // 先重置，触发状态更新
      setTimeout(() => {
        setActiveVideoIndex(currentIndex); // 然后恢复到正确的索引
      }, 50);
    }
  }, [activeTab]);
  
  // 处理滚动结束事件，确保视频对齐
  const handleScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / FIXED_VIDEO_HEIGHT);
    
    if (index !== activeVideoIndex && index >= 0 && index < (feedVideos.length || DUMMY_VIDEOS.length)) {
      setActiveVideoIndex(index);
      
      // 确保滚动到正确的位置
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: index * FIXED_VIDEO_HEIGHT,
          animated: true
        });
      }
    }
  };
  
  if (isLoading && feedVideos.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4040" />
      </View>
    );
  }
  
  const videos = feedVideos.length > 0 ? feedVideos : DUMMY_VIDEOS;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        decelerationRate="fast"
        snapToInterval={FIXED_VIDEO_HEIGHT}
        snapToAlignment="start"
        scrollEventThrottle={16}
        overScrollMode="never"
        style={styles.scrollView}
        contentContainerStyle={{
          // 确保内容高度是视频高度的整数倍
          height: FIXED_VIDEO_HEIGHT * videos.length
        }}
      >
        {videos.map((item, index) => (
          <VideoItem 
            key={item.id} 
            item={item} 
            isActive={index === activeVideoIndex} 
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoContainer: {
    width: screenWidth,
    height: FIXED_VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden', // 防止内容溢出
  },
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    zIndex: 20,
  },
  controlButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  controlText: {
    color: 'white',
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#FF4040',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  videoInfoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    zIndex: 2,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: 'white',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    maxWidth: '90%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default HomeScreen; 