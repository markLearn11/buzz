import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootState } from '../store';

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
    id: 'comment1',
    userId: 'user1',
    username: '创作者小明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: '这个视频拍得真棒！请问是用什么相机拍的？',
    likes: 12,
    createdAt: Date.now() - 3600000,
    replies: [],
  },
  {
    id: 'comment2',
    userId: 'user2',
    username: '旅行达人',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: '画面非常清晰，构图也很好，学习了！',
    likes: 8,
    createdAt: Date.now() - 7200000,
    replies: [
      {
        id: 'reply1',
        userId: 'currentUser',
        username: '我',
        avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
        text: '谢谢夸奖！',
        likes: 2,
        createdAt: Date.now() - 3600000,
      }
    ],
  },
  {
    id: 'comment3',
    userId: 'user3',
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
    return false;
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
  
  // 从全局状态获取是否应该暂停所有视频
  const shouldPauseAllVideos = useSelector((state: RootState) => state.app.shouldPauseAllVideos);
  const isVideoTabActive = useSelector((state: RootState) => state.app.isVideoTabActive);
  
  const videos = useSelector((state: RootState) => state.videos.videos) as any[];
  const video = videos.find(v => v.id === videoId) || null;
  const [videoUrl, setVideoUrl] = useState(video?.videoUrl || '');
  
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
  
  // 在组件挂载时检查视频URL
  useEffect(() => {
    if (video) {
      const verifyVideoUrl = async () => {
        const isValid = await checkVideoUrl(video.videoUrl);
        if (!isValid) {
          console.warn('视频URL无效，使用备用视频');
          // 使用更可靠的备用视频
          setVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        } else {
          setVideoUrl(video.videoUrl);
        }
      };
      
      verifyVideoUrl();
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
  
  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };
  
  if (!video) {
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
          <Text style={styles.notFoundText}>未找到视频</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>
            {formatTime(item.createdAt)}
          </Text>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="heart-outline" size={16} color="#999" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Text style={styles.actionText}>回复</Text>
          </TouchableOpacity>
        </View>
        
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {item.replies.map(reply => (
              <View key={reply.id} style={styles.replyContainer}>
                <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                <View style={styles.replyContent}>
                  <Text style={styles.commentUsername}>{reply.username}</Text>
                  <Text style={styles.commentText}>{reply.text}</Text>
                  <View style={styles.commentActions}>
                    <Text style={styles.commentTime}>
                      {formatTime(reply.createdAt)}
                    </Text>
                    <TouchableOpacity style={styles.commentAction}>
                      <Ionicons name="heart-outline" size={16} color="#999" />
                      <Text style={styles.actionText}>{reply.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
  
  const formatTime = (timestamp: number): string => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    
    const diffTime = Math.abs(now.getTime() - commentDate.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      return `${diffDays}天前`;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>评论</Text>
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
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
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
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.loadAsync({ uri: videoUrl }, {}, false);
                }
              }}
            >
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
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
      
      <View style={styles.commentHeader}>
        <Text style={styles.commentHeaderText}>
          {DUMMY_COMMENTS.length}条评论
        </Text>
      </View>
      
      <FlatList
        data={DUMMY_COMMENTS}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.commentsList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="添加评论..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#FF4040" />
        </TouchableOpacity>
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
});

export default VideoDetailScreen; 