import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  View, 
  ScrollView,
  Dimensions, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Text,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState, useAppDispatch, useAppSelector } from '../store';
import { 
  fetchVideosStart, 
  fetchVideosSuccess, 
  fetchVideosFailure,
  likeVideo,
  Video as VideoType,
  updateLocalVideo,
  unlikeVideoAsync,
  likeVideoAsync
} from '../store/slices/videosSlice';
import { fetchVideoCommentsAsync, addCommentAsync, likeCommentAsync, unlikeCommentAsync } from '../store/slices/commentsSlice';
import api from '../services/api';
import CommentsBottomSheet from '../components/CommentsBottomSheet';

// 模拟视频数据
const DUMMY_VIDEOS = [
  {
    id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439001',
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
    id: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439002',
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
    id: '507f1f77bcf86cd799439013',
    userId: '507f1f77bcf86cd799439003',
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
  {
    id: '507f1f77bcf86cd799439014',
    userId: '507f1f77bcf86cd799439004',
    userName: '科技达人',
    userAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/id/4/300/400',
    description: '最新款手机开箱体验 #科技 #手机 #开箱',
    likes: 5621,
    comments: 231,
    shares: 112,
    createdAt: Date.now() - 259200000,
  },
  {
    id: '507f1f77bcf86cd799439015',
    userId: '507f1f77bcf86cd799439005',
    userName: '宠物博主',
    userAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://picsum.photos/id/5/300/400',
    description: '我家猫咪的日常 #宠物 #猫咪 #日常',
    likes: 9872,
    comments: 542,
    shares: 321,
    createdAt: Date.now() - 345600000,
  }
];

// 简化视频URL处理函数
const diagnoseAndFixVideoUrl = async (url: string): Promise<string> => {
  console.log('处理视频URL:', url);
  
  if (!url) {
    console.error('视频URL为空');
    return '';
  }
  
  try {
    // 基本URL格式验证
    const parsedUrl = new URL(url);
    
    // 确保使用HTTPS
    if (parsedUrl.protocol === 'http:') {
      const httpsUrl = url.replace('http:', 'https:');
      console.log('将HTTP URL转换为HTTPS:', httpsUrl);
      return httpsUrl;
    }
    
    // 直接返回原始URL，不进行额外检查
    return url;
  } catch (e) {
    console.error('URL格式无效:', e);
    return url; // 即使URL格式无效，也尝试使用原始URL
  }
};

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

// 修改检查视频URL函数，简化检查逻辑
const checkVideoUrl = async (url: string): Promise<boolean> => {
  // 如果URL为空，直接返回false
  if (!url) return false;
  
  // 简化检查逻辑，默认返回true以尝试播放视频
  return true;
};

const VideoItem: React.FC<{ item: any; isActive: boolean }> = ({ item, isActive }) => {
  const videoRef = useRef(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadRetryCount, setLoadRetryCount] = useState(0); // 保留重试计数
  const [lastTapTime, setLastTapTime] = useState(0); // 添加记录最后点击时间的状态
  const [tapCount, setTapCount] = useState(0); // 添加点击次数计数器
  
  // 从全局状态获取是否应该暂停所有视频
  const shouldPauseAllVideos = useSelector((state: RootState) => state.app.shouldPauseAllVideos);
  const isVideoTabActive = useSelector((state: RootState) => state.app.isVideoTabActive);
  
  // 根据全局状态和本地状态决定视频是否应该播放
  const shouldPlay = isActive && !isPaused && isVideoTabActive && !shouldPauseAllVideos;
  
  // 添加日志以跟踪shouldPlay的值
  useEffect(() => {
    console.log(`视频播放状态 - shouldPlay: ${shouldPlay}, isPaused: ${isPaused}, isActive: ${isActive}`);
  }, [shouldPlay, isPaused, isActive]);
  
  // 处理视频加载错误
  const handleVideoError = async (error) => {
    console.error('视频播放错误:', JSON.stringify(error));
    
    // 增加重试计数
    const newRetryCount = loadRetryCount + 1;
    setLoadRetryCount(newRetryCount);
    
    // 如果重试次数小于3，尝试重新加载当前视频
    if (newRetryCount < 3) {
      console.log(`尝试重新加载视频 (${newRetryCount}/3)...`);
      
      // 短暂延迟后重试
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.loadAsync({ uri: item.videoUrl }, {}, false);
          setIsLoading(true);
        }
      }, 1000);
    } else {
      // 超过重试次数，显示错误状态
      setHasError(true);
      setIsLoading(false);
    }
  };
  
  // 设置视频URL - 简化逻辑
  useEffect(() => {
    if (item && item.videoUrl) {
      // 直接使用原始视频URL，不进行复杂处理
      setVideoUrl(item.videoUrl);
      setIsLoading(true);
      setHasError(false);
    } else {
      console.error('视频项或URL为空');
      setHasError(true);
      setIsLoading(false);
    }
  }, [item]);
  
  const handleLike = async () => {
    if (!item) return;
    
    try {
      // 本地更新UI
      const isLiked = item.isLiked || false;
      
      // 如果已经点赞，则不再重复点赞
      if (isLiked) {
        console.log('视频已经被点赞，忽略操作');
        return;
      }
      
      console.log('执行点赞操作');
      
      // 更新本地状态
      dispatch(updateLocalVideo({
        ...item,
        likes: isLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
        isLiked: !isLiked
      }));
      
      // 发送API请求
      if (isLiked) {
        await dispatch(unlikeVideoAsync(item.id)).unwrap();
      } else {
        await dispatch(likeVideoAsync(item.id)).unwrap();
      }
      
      console.log('点赞操作完成');
    } catch (error: any) {
      console.error('点赞操作失败:', error);
      
      // 恢复原始状态
      dispatch(updateLocalVideo(item));
      
      Alert.alert('操作失败', error.message || '点赞操作失败，请重试');
    }
  };
  
  // 评论相关状态
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localCommentLikes, setLocalCommentLikes] = useState<{[commentId: string]: number}>({});
  const [localCommentIsLiked, setLocalCommentIsLiked] = useState<{[commentId: string]: boolean}>({});
  const [processingLikes, setProcessingLikes] = useState<{[commentId: string]: boolean}>({});
  
  // 获取评论数据
  const { comments, loading: commentsLoading, hasMore, page } = useAppSelector(state => state.comments);
  
  const handleComment = () => {
    // 显示评论弹窗而不是导航到VideoDetail页面
    // 加载评论数据
    if (comments.length === 0 && !commentsLoading) {
      dispatch(fetchVideoCommentsAsync({ videoId: item.id, page: 1, limit: 20 }));
    }
    setIsCommentsVisible(true);
  };
  
  // 关闭评论弹窗
  const hideComments = () => {
    setIsCommentsVisible(false);
  };
  
  // 提交评论处理函数
  const handleSubmitComment = async (data: {
    text?: string;
    images?: any[];
    emojis?: {
      type: 'static' | 'animated' | null;
      id: string | null;
      position: number | null;
    }[];
  }) => {
    if ((!data.text || !data.text.trim()) && (!data.images || data.images.length === 0) && (!data.emojis || data.emojis.length === 0) || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);

      // 处理图片数据
      let processedImages = data.images;
      if (data.images && data.images.length > 0) {
        // 转换 Expo ImagePicker 的结果为适合 API 的格式
        processedImages = data.images.map(img => {
          // 创建一个文件对象
          const filenameParts = img.uri.split('/');
          const filename = filenameParts[filenameParts.length - 1];
          
          // 在 React Native 中，我们不能直接创建 File 对象
          // 但可以创建一个包含必要属性的对象以便被 FormData 处理
          return {
            uri: img.uri,
            name: filename,
            type: `image/${filename.split('.').pop()}` // 推断 MIME 类型
          };
        });
      }
      
      await dispatch(addCommentAsync({ 
        videoId: item.id, 
        text: data.text,
        images: processedImages,
        emojis: data.emojis
      })).unwrap();
      
      // 更新评论计数
      dispatch(updateLocalVideo({
        ...item,
        comments: item.comments + 1
      }));
    } catch (error: any) {
      console.error('评论提交失败:', error);
      Alert.alert('评论失败', error.message || '提交评论失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理评论点赞
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    // 防止重复点击
    if (processingLikes[commentId]) return;
    
    try {
      // 标记为处理中
      setProcessingLikes(prev => ({...prev, [commentId]: true}));
      
      // 获取当前状态
      const currentIsLiked = localCommentIsLiked[commentId] !== undefined 
        ? localCommentIsLiked[commentId] 
        : isLiked;
        
      const currentLikes = localCommentLikes[commentId] !== undefined
        ? localCommentLikes[commentId]
        : (comments.find(c => c.id === commentId)?.likes || 
           comments.flatMap(c => c.replies || []).find(r => r.id === commentId)?.likes || 
           0);
      
      // 更新本地状态
      setLocalCommentIsLiked(prev => ({
        ...prev, 
        [commentId]: !currentIsLiked
      }));
      
      setLocalCommentLikes(prev => ({
        ...prev,
        [commentId]: currentIsLiked 
          ? Math.max(0, currentLikes - 1) 
          : currentLikes + 1
      }));
      
      // 发送API请求
      if (currentIsLiked) {
        await dispatch(unlikeCommentAsync(commentId)).unwrap();
      } else {
        await dispatch(likeCommentAsync(commentId)).unwrap();
      }
    } catch (error: any) {
      // 如果API请求失败，恢复原来的状态
      console.error('评论点赞操作失败:', error);
      
      // 恢复本地状态
      const originalIsLiked = comments.find(c => c.id === commentId)?.isLiked || 
                             comments.flatMap(c => c.replies || []).find(r => r.id === commentId)?.isLiked || 
                             false;
      
      const originalLikes = comments.find(c => c.id === commentId)?.likes || 
                           comments.flatMap(c => c.replies || []).find(r => r.id === commentId)?.likes || 
                           0;
      
      setLocalCommentIsLiked(prev => ({
        ...prev,
        [commentId]: originalIsLiked
      }));
      
      setLocalCommentLikes(prev => ({
        ...prev,
        [commentId]: originalLikes
      }));
      
      Alert.alert('操作失败', error.message || '点赞操作失败，请重试');
    } finally {
      // 取消处理中状态
      setProcessingLikes(prev => ({...prev, [commentId]: false}));
    }
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
    setIsPaused(prevState => {
      const newState = !prevState;
      console.log(`视频状态切换: ${prevState ? '播放' : '暂停'} -> ${newState ? '暂停' : '播放'}`);
      
      // 使用ref直接控制视频播放状态
      if (videoRef.current) {
        if (newState) {
          console.log('直接调用视频暂停');
          videoRef.current.pauseAsync();
        } else {
          console.log('直接调用视频播放');
          videoRef.current.playAsync();
        }
      }
      
      return newState;
    });
  };

  // 处理视频区域点击
  const handleVideoPress = () => {
    console.log('视频区域被点击 - 新的实现');
    
    // 直接切换播放/暂停状态，不再处理双击和多次点击
    togglePlayPause();
    
    // 以下是双击点赞逻辑，保留但简化
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 双击判定时间间隔(毫秒)
    
    if (now - lastTapTime < DOUBLE_TAP_DELAY) {
      console.log('检测到双击，触发点赞');
      handleLike();
      setLastTapTime(0);
    } else {
      setLastTapTime(now);
    }
  };
  
  // 计算底部安全区域
  const bottomSafeArea = insets.bottom;
  
  // 根据平台调整底部控件位置
  const bottomOffset = Platform.OS === 'ios' ? 
    (bottomSafeArea > 0 ? bottomSafeArea + 20 : 40) : 
    20;
  
  return (
    <View style={[styles.videoContainer, { height: FIXED_VIDEO_HEIGHT }]}>
      {videoUrl ? (
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={handleVideoPress}
          android_ripple={{color: 'rgba(255, 255, 255, 0.1)'}}
          hitSlop={0}
          pressRetentionOffset={0}
          delayLongPress={300}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="cover"
            isLooping
            shouldPlay={shouldPlay}
            onPlaybackStatusUpdate={(status) => {
              // 视频播放状态更新
              if (status.isLoaded) {
                if (isLoading) setIsLoading(false);
              }
            }}
            onError={handleVideoError}
            onLoad={() => {
              console.log('视频加载成功:', videoUrl);
              setIsLoading(false);
              setHasError(false);
            }}
            onLoadStart={() => {
              console.log('开始加载视频:', videoUrl);
              setIsLoading(true);
            }}
          />
          
          {/* 用户信息和交互按钮 */}
          <View style={[
            styles.videoOverlay,
            { paddingBottom: insets.bottom + BOTTOM_INFO_MARGIN }
          ]}>
            <View style={[
              styles.rightControls,
              // 针对安卓设备调整垂直位置
              Platform.OS === 'android' ? { 
                top: '40%', // 从顶部40%位置开始显示控件
                transform: [{ translateY: -100 }] // 向上偏移，使控件居中
              } : {}
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
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={35} 
                  color={item.isLiked ? "#FF4040" : "white"} 
                />
                <Text style={[
                  styles.controlText,
                  item.isLiked && { color: "#FF4040" }
                ]}>
                  {item.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={handleComment}>
                <Ionicons name="chatbubble-ellipses" size={32} color="white" />
                <Text style={styles.controlText}>{item.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
                <Ionicons name="arrow-redo" size={35} color="white" />
                <Text style={styles.controlText}>{item.shares}</Text>
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
          
          {isLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#FF4040" />
            </View>
          )}
          
          {hasError && !isLoading && (
            <View style={styles.errorOverlay}>
              <Ionicons name="alert-circle-outline" size={40} color="#FF4040" />
              <Text style={styles.errorText}>视频加载失败</Text>
            </View>
          )}
          
          {isPaused && (
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play" size={50} color="rgba(255, 255, 255, 0.8)" />
            </View>
          )}
        </Pressable>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF4040" />
          <Text style={styles.loadingText}>加载视频中...</Text>
        </View>
      )}
      
      {/* 底部评论弹窗 */}
      <CommentsBottomSheet
        isVisible={isCommentsVisible}
        onClose={hideComments}
        comments={comments}
        isLoading={commentsLoading}
        hasMore={hasMore}
        onLoadMore={() => {
          if (hasMore && !commentsLoading) {
            dispatch(fetchVideoCommentsAsync({ videoId: item.id, page: page + 1, limit: 20 }));
          }
        }}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
        localCommentLikes={localCommentLikes}
        localCommentIsLiked={localCommentIsLiked}
        processingLikes={processingLikes}
      />
    </View>
  );
};

const HomeScreen = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const { feedVideos, isLoading } = useSelector((state: RootState) => state.videos);
  const isVideoTabActive = useSelector((state: RootState) => state.app.isVideoTabActive);
  const activeTab = useSelector((state: RootState) => state.app.activeTab);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // 检查用户是否已登录，如果没有则自动登录测试账号
  useEffect(() => {
    const checkAuthAndLogin = async () => {
      try {
        // 检查是否有token
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          console.log('未找到token，尝试登录测试账号...');
          // 登录测试账号
          const response = await api.post('/auth/login', {
            email: 'test@example.com',
            password: 'password123'
          });
          
          // 保存token
          if (response.data && response.data.token) {
            await AsyncStorage.setItem('token', response.data.token);
            console.log('测试账号登录成功，已保存token');
          }
        } else {
          console.log('已有token，无需重新登录');
        }
      } catch (error) {
        console.error('登录失败:', error);
        Alert.alert('登录失败', '无法自动登录测试账号，点赞功能可能无法正常工作');
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuthAndLogin();
  }, []);
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取视频
    if (!isAuthChecking) {
      dispatch(fetchVideosStart());
      try {
        dispatch(fetchVideosSuccess(DUMMY_VIDEOS));
      } catch (error) {
        dispatch(fetchVideosFailure((error as Error).message || '获取视频失败'));
      }
    }
  }, [dispatch, isAuthChecking]);
  
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
  
  if (isLoading || isAuthChecking) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4040" />
        <Text style={styles.loadingText}>
          {isAuthChecking ? '正在准备点赞功能...' : '加载视频中...'}
        </Text>
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
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    zIndex: 20,
    // 为所有平台设置一个基础位置
    top: '50%',
    transform: [{ translateY: -120 }]
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
    zIndex: 30, // 进一步提高zIndex值
    backgroundColor: 'transparent', // 确保背景透明
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14
  },
  retryButton: {
    backgroundColor: '#FF4040',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  videoControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playPauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default HomeScreen; 