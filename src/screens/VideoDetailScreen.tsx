import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../store';
import { useAppDispatch, useAppSelector } from '../store';
import { likeVideoAsync, unlikeVideoAsync, checkVideoLikeStatusAsync } from '../store/slices/videosSlice';
import { fetchVideoCommentsAsync, addCommentAsync, likeCommentAsync, unlikeCommentAsync, Comment as CommentType, checkCommentLikeStatusAsync } from '../store/slices/commentsSlice';
import { fetchVideoByIdAsync } from '../store/slices/videosSlice';
import { formatTime } from '../utils/timeUtils';
import api from '../services/api';
import CommentsBottomSheet from '../components/CommentsBottomSheet';

// 定义类型
interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  createdAt: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  createdAt: number;
}

// 导航参数类型
type RootStackParamList = {
  VideoDetail: { videoId: string };
  Home: undefined;
};

// 模拟评论数据
const DUMMY_COMMENTS: Comment[] = [
  {
    id: '507f1f77bcf86cd799439021',
    userId: '507f1f77bcf86cd799439001',
    username: '创作者小明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: '这个视频拍得真棒！请问是用什么相机拍的？',
    likes: 12,
    createdAt: Date.now() - 3600000,
    replies: [],
  },
  {
    id: '507f1f77bcf86cd799439022',
    userId: '507f1f77bcf86cd799439002',
    username: '旅行达人',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: '画面非常清晰，构图也很好，学习了！',
    likes: 8,
    createdAt: Date.now() - 7200000,
    replies: [
      {
        id: '507f1f77bcf86cd799439031',
        userId: '507f1f77bcf86cd799439003',
        username: '我',
        avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
        text: '谢谢夸奖！',
        likes: 2,
        createdAt: Date.now() - 3600000,
      }
    ],
  },
  {
    id: '507f1f77bcf86cd799439023',
    userId: '507f1f77bcf86cd799439003',
    username: '美食博主',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    text: '可以分享一下拍摄地点吗？看起来很美',
    likes: 5,
    createdAt: Date.now() - 86400000,
    replies: [],
  },
];

// 获取屏幕尺寸
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 估计底部Tab栏高度
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

// 检查视频URL是否可访问
const checkVideoUrl = async (url: string): Promise<boolean> => {
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
    console.error('视频URL检查失败:', error);
    // 即使检查失败，我们也尝试播放视频
    return true;
  }
};

const VideoDetailScreen = () => {
  const route = useRoute() as any;
  const navigation = useNavigation() as any;
  const { videoId } = route.params || { videoId: '' };
  const videoRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // 添加底部评论弹窗状态
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  
  // 添加本地状态来管理点赞
  const [localVideoLikes, setLocalVideoLikes] = useState<number | null>(null);
  const [localIsLiked, setLocalIsLiked] = useState<boolean | null>(null);
  
  // 添加本地状态来管理评论点赞
  const [localCommentLikes, setLocalCommentLikes] = useState<{[commentId: string]: number}>({});
  const [localCommentIsLiked, setLocalCommentIsLiked] = useState<{[commentId: string]: boolean}>({});
  const [processingLikes, setProcessingLikes] = useState<{[commentId: string]: boolean}>({});
  
  // 从全局状态获取是否应该暂停所有视频
  const shouldPauseAllVideos = useSelector((state: RootState) => state.app.shouldPauseAllVideos);
  const isVideoTabActive = useSelector((state: RootState) => state.app.isVideoTabActive);
  
  const videos = useSelector((state: RootState) => state.videos.videos) as any[];
  const video = videos.find(v => v.id === videoId) || null;
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || '');
  
  // 获取评论数据
  const { comments, loading: commentsLoading, hasMore, page } = useAppSelector(state => state.comments);
  const dispatch = useAppDispatch();
  
  // 根据平台调整字体大小
  const usernameFontSize = Platform.OS === 'ios' ? 15 : 14;
  const descriptionFontSize = Platform.OS === 'ios' ? 13 : 12;
  
  // 计算视频容器高度 - 减小高度以减少空隙
  const videoContainerHeight = Math.min(
    screenHeight * 0.22, // 减少视频容器高度
    Platform.OS === 'ios' ? 160 : 140 // 进一步减小最大高度
  );
  
  // 根据全局状态和本地状态决定视频是否应该播放
  const shouldPlay = !isPaused && isVideoTabActive && !shouldPauseAllVideos;
  
  // 添加防抖状态
  const [isProcessingVideoLike, setIsProcessingVideoLike] = useState(false);
  
  // 添加动画值
  const likeAnimationScale = useRef(new Animated.Value(1)).current;
  const likeAnimationOpacity = useRef(new Animated.Value(1)).current;
  
  // 点赞动画函数
  const animateLike = () => {
    // 重置动画值
    likeAnimationScale.setValue(1);
    likeAnimationOpacity.setValue(1);
    
    // 创建动画序列
    Animated.sequence([
      // 先放大
      Animated.timing(likeAnimationScale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      // 再缩小回原大小
      Animated.timing(likeAnimationScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 同步视频点赞状态到本地状态
  useEffect(() => {
    if (video) {
      if (localVideoLikes === null) {
        setLocalVideoLikes(video.likes);
      }
      if (localIsLiked === null) {
        setLocalIsLiked(video.isLiked || false);
      }
    }
  }, [video, localVideoLikes, localIsLiked]);
  
  // 在组件挂载时设置视频URL
  useEffect(() => {
    if (video) {
      console.log('设置视频URL:', video.videoUrl);
      setVideoUrl(video.videoUrl);
    }
  }, [video]);
  
  // 控制视频播放
  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, [shouldPlay]);
  
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
  
  // 在组件挂载时获取视频详情和评论
  useEffect(() => {
    if (videoId && !isAuthChecking) {
      dispatch(fetchVideoByIdAsync(videoId));
      dispatch(fetchVideoCommentsAsync({ videoId, page: 1 }));
      
      // 检查视频点赞状态
      dispatch(checkVideoLikeStatusAsync(videoId));
    }
  }, [dispatch, videoId, isAuthChecking]);
  
  // 同步评论点赞状态到本地
  useEffect(() => {
    if (comments.length > 0) {
      // 检查所有评论的点赞状态
      comments.forEach(comment => {
        dispatch(checkCommentLikeStatusAsync(comment.id));
        
        // 检查回复的点赞状态
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            dispatch(checkCommentLikeStatusAsync(reply.id));
          });
        }
      });
    }
  }, [comments, dispatch]);
  
  // 显示评论弹窗
  const showComments = () => {
    // 加载评论数据
    if (comments.length === 0 && !commentsLoading) {
      dispatch(fetchVideoCommentsAsync({ videoId, page: 1, limit: 20 }));
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
    if ((!data.text || !data.text.trim()) && (!data.images || data.images.length === 0) && (!data.emojis || data.emojis.length === 0)) return;
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await dispatch(addCommentAsync({ 
        videoId, 
        text: data.text?.trim(),
        images: data.images,
        emojis: data.emojis
      })).unwrap();
    } catch (error: any) {
      console.error('评论提交失败:', error);
      Alert.alert('评论失败', error.message || '提交评论失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 点赞视频 - 添加动画效果
  const handleLikeVideo = async () => {
    if (!video || isProcessingVideoLike) return;
    
    try {
      // 标记为处理中
      setIsProcessingVideoLike(true);
      
      // 使用本地状态来立即更新UI
      const currentIsLiked = localIsLiked !== null ? localIsLiked : (video.isLiked || false);
      const currentLikes = localVideoLikes !== null ? localVideoLikes : video.likes;
      
      // 更新本地状态
      setLocalIsLiked(!currentIsLiked);
      setLocalVideoLikes(currentIsLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1);
      
      // 播放动画
      if (!currentIsLiked) {
        animateLike();
      }
      
      console.log('点赞状态更新:', {
        之前: { isLiked: currentIsLiked, likes: currentLikes },
        之后: { isLiked: !currentIsLiked, likes: currentIsLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 }
      });
      
      // 发送API请求
      if (currentIsLiked) {
        const result = await dispatch(unlikeVideoAsync(video.id)).unwrap();
        console.log('取消点赞结果:', result);
      } else {
        const result = await dispatch(likeVideoAsync(video.id)).unwrap();
        console.log('点赞结果:', result);
      }
    } catch (error: any) {
      // 如果API请求失败，恢复原来的状态
      console.error('点赞操作失败:', error);
      
      // 恢复本地状态
      setLocalIsLiked(video.isLiked || false);
      setLocalVideoLikes(video.likes);
      
      Alert.alert('操作失败', error.message || '点赞操作失败，请重试');
    } finally {
      // 取消处理中状态
      setIsProcessingVideoLike(false);
    }
  };
  
  // 评论点赞动画
  const commentLikeAnimations = useRef<{[commentId: string]: {
    scale: Animated.Value,
    opacity: Animated.Value
  }}>({}).current;
  
  // 获取或创建评论点赞动画
  const getCommentLikeAnimation = (commentId: string) => {
    if (!commentLikeAnimations[commentId]) {
      commentLikeAnimations[commentId] = {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1)
      };
    }
    return commentLikeAnimations[commentId];
  };
  
  // 播放评论点赞动画
  const animateCommentLike = (commentId: string) => {
    const animation = getCommentLikeAnimation(commentId);
    
    // 重置动画值
    animation.scale.setValue(1);
    animation.opacity.setValue(1);
    
    // 创建动画序列
    Animated.sequence([
      // 先放大
      Animated.timing(animation.scale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      // 再缩小回原大小
      Animated.timing(animation.scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // 添加颜色闪烁效果
    Animated.sequence([
      Animated.timing(animation.opacity, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation.opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 点赞评论 - 添加动画效果
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
      
      // 播放动画
      if (!currentIsLiked) {
        animateCommentLike(commentId);
      }
      
      console.log('评论点赞状态更新:', {
        commentId,
        之前: { isLiked: currentIsLiked, likes: currentLikes },
        之后: { 
          isLiked: !currentIsLiked, 
          likes: currentIsLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 
        }
      });
      
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
  
  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };
  
  if (!video || isAuthChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>视频详情</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          {isAuthChecking ? (
            <>
              <ActivityIndicator size="large" color="#FF4040" />
              <Text style={styles.notFoundText}>正在准备点赞功能...</Text>
            </>
          ) : (
            <Text style={styles.notFoundText}>未找到视频</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }
  
  const renderComment = ({ item }: { item: CommentType }) => {
    // 获取本地点赞状态
    const isLiked = localCommentIsLiked[item.id] !== undefined 
      ? localCommentIsLiked[item.id] 
      : item.isLiked;
      
    const likesCount = localCommentLikes[item.id] !== undefined
      ? localCommentLikes[item.id]
      : item.likes;
    
    return (
      <View style={styles.commentContainer}>
        <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.commentActions}>
            <Text style={styles.commentTime}>
              {formatTime(item.createdAt)}
            </Text>
            <TouchableOpacity 
              style={styles.commentAction}
              onPress={() => handleLikeComment(item.id, isLiked)}
              disabled={processingLikes[item.id]}
            >
              <Animated.View
                style={{
                  transform: [{ scale: getCommentLikeAnimation(item.id).scale }],
                  opacity: getCommentLikeAnimation(item.id).opacity,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isLiked ? "#FF4040" : "#999"} 
                />
              </Animated.View>
              <Text style={[
                styles.actionText,
                isLiked && { color: "#FF4040" }
              ]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commentAction}>
              <Text style={styles.actionText}>回复</Text>
            </TouchableOpacity>
          </View>
          
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map(reply => {
                // 获取回复的本地点赞状态
                const replyIsLiked = localCommentIsLiked[reply.id] !== undefined 
                  ? localCommentIsLiked[reply.id] 
                  : reply.isLiked;
                  
                const replyLikesCount = localCommentLikes[reply.id] !== undefined
                  ? localCommentLikes[reply.id]
                  : reply.likes;
                
                return (
                  <View key={reply.id} style={styles.replyContainer}>
                    <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                    <View style={styles.replyContent}>
                      <Text style={styles.commentUsername}>{reply.username}</Text>
                      <Text style={styles.commentText}>{reply.content}</Text>
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>
                          {formatTime(reply.createdAt)}
                        </Text>
                        <TouchableOpacity 
                          style={styles.commentAction}
                          onPress={() => handleLikeComment(reply.id, replyIsLiked)}
                          disabled={processingLikes[reply.id]}
                        >
                          <Animated.View
                            style={{
                              transform: [{ scale: getCommentLikeAnimation(reply.id).scale }],
                              opacity: getCommentLikeAnimation(reply.id).opacity,
                              width: 20,
                              height: 20,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons 
                              name={replyIsLiked ? "heart" : "heart-outline"} 
                              size={16} 
                              color={replyIsLiked ? "#FF4040" : "#999"} 
                            />
                          </Animated.View>
                          <Text style={[
                            styles.actionText,
                            replyIsLiked && { color: "#FF4040" }
                          ]}>
                            {replyLikesCount}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>视频详情</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={[styles.videoContainer, { height: videoContainerHeight }]}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={shouldPlay}
          onError={(error) => {
            console.error('视频播放错误:', error);
            setHasError(true);
            
            // 尝试重新加载视频
            setTimeout(() => {
              if (videoRef.current && video) {
                console.log('尝试重新加载视频:', video.videoUrl);
                videoRef.current.loadAsync({ uri: video.videoUrl }, {}, false);
                setIsLoading(true);
                setHasError(false);
              }
            }, 2000);
          }}
          onLoadStart={() => {
            console.log('开始加载视频:', videoUrl);
            setIsLoading(true);
          }}
          onLoad={() => {
            console.log('视频加载成功:', videoUrl);
            setIsLoading(false);
            setHasError(false);
          }}
        />
        
        <TouchableOpacity 
          style={styles.videoTouchable} 
          activeOpacity={1}
          onPress={togglePlayPause}
        >
          {isPaused && (
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play" size={40} color="rgba(255, 255, 255, 0.8)" />
            </View>
          )}
        </TouchableOpacity>
        
        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#FF4040" />
          </View>
        )}
        {hasError && (
          <View style={styles.loaderOverlay}>
            <Ionicons name="alert-circle-outline" size={40} color="#FF4040" />
            <Text style={styles.errorText}>视频加载失败</Text>
          </View>
        )}
      </View>
      
      <View style={styles.videoInfo}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: video.userAvatar }}
            style={styles.userAvatar}
          />
          <Text 
            style={[
              styles.username, 
              { 
                fontSize: usernameFontSize,
                lineHeight: usernameFontSize * 1.2
              }
            ]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            @{video.userName}
          </Text>
          
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={handleLikeVideo}
            disabled={isProcessingVideoLike || isLoading || hasError}
          >
            <Animated.View
              style={{
                transform: [{ scale: likeAnimationScale }],
                opacity: likeAnimationOpacity,
              }}
            >
              <Ionicons 
                name={localIsLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={localIsLiked ? "#FF4040" : "white"} 
              />
            </Animated.View>
            <Text style={[
              styles.likeCount,
              localIsLiked && { color: "#FF4040" }
            ]}>
              {localVideoLikes !== null ? localVideoLikes : (video ? video.likes : 0)}
            </Text>
          </TouchableOpacity>
        </View>
        <Text 
          style={[
            styles.description, 
            { 
              fontSize: descriptionFontSize,
              lineHeight: descriptionFontSize * 1.3
            }
          ]} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {video.description}
        </Text>
      </View>
      
      {/* 评论按钮 */}
      <TouchableOpacity style={styles.commentButton} onPress={showComments}>
        <Ionicons name="chatbubble-outline" size={22} color="white" />
        <Text style={styles.commentButtonText}>
          {comments.length > 0 ? `${comments.length}条评论` : '查看评论'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>
      
      {/* 底部评论弹窗 */}
      <CommentsBottomSheet
        isVisible={isCommentsVisible}
        onClose={hideComments}
        comments={comments}
        isLoading={commentsLoading}
        hasMore={hasMore}
        onLoadMore={() => {
          if (hasMore && !commentsLoading) {
            dispatch(fetchVideoCommentsAsync({ videoId, page: page + 1, limit: 20 }));
          }
        }}
        onSubmitComment={handleSubmitComment}
        onLikeComment={handleLikeComment}
        localCommentLikes={localCommentLikes}
        localCommentIsLiked={localCommentIsLiked}
        processingLikes={processingLikes}
      />
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
    padding: 10, // 减少内边距
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: '#999',
    fontSize: 16,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
  },
  videoInfo: {
    padding: 10, // 减少内边距
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // 减少间距
    width: '100%',
  },
  userAvatar: {
    width: 32, // 减小头像尺寸
    height: 32, // 减小头像尺寸
    borderRadius: 16, // 调整圆角
    marginRight: 8, // 减少右边距
  },
  username: {
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 3
  },
  description: {
    color: 'white',
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 3,
    marginBottom: 0 // 移除底部边距
  },
  commentHeader: {
    padding: 10, // 减少内边距
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  commentHeaderText: {
    fontSize: 15, // 减小字体
    fontWeight: 'bold',
    color: 'white',
  },
  commentsList: {
    padding: 10, // 减少内边距
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16, // 减少评论之间的间距
  },
  commentAvatar: {
    width: 32, // 减小头像尺寸
    height: 32, // 减小头像尺寸
    borderRadius: 16, // 调整圆角
    marginRight: 8, // 减少右边距
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 13, // 减小字体
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 1, // 减少间距
  },
  commentText: {
    fontSize: 13, // 减小字体
    color: 'white',
    marginBottom: 2, // 减少间距
    lineHeight: 18 // 减小行高
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 11, // 减小字体
    color: '#999',
    marginRight: 12, // 减少间距
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, // 减少间距
    minWidth: 40, // 确保点赞按钮有足够宽度
    height: 24, // 固定高度
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20, // 固定宽度
    height: 20, // 固定高度
  },
  actionText: {
    fontSize: 11, // 减小字体
    color: '#999',
    marginLeft: 3, // 减少间距
  },
  repliesContainer: {
    marginTop: 8, // 减少间距
    marginLeft: 8, // 减少间距
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 8, // 减少间距
  },
  replyAvatar: {
    width: 24, // 减小头像尺寸
    height: 24, // 减小头像尺寸
    borderRadius: 12, // 调整圆角
    marginRight: 6, // 减少间距
  },
  replyContent: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8, // 减少内边距
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: Platform.OS === 'ios' ? 10 : 12
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 14, // 减少内边距
    paddingVertical: 6, // 减少内边距
    fontSize: 14,
    color: 'white',
  },
  sendButton: {
    marginLeft: 8, // 减少间距
    padding: 6, // 减少内边距
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#FF4040',
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    padding: 4,
  },
  likeCount: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
  },
  loadingFooter: {
    padding: 10,
    alignItems: 'center',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  // 添加评论按钮样式
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  commentButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

export default VideoDetailScreen; 