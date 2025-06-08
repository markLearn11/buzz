import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../themes/ThemeProvider';

// 模拟滤镜数据
const FILTERS = [
  { id: 'original', name: '原始', icon: '🎬' },
  { id: 'warm', name: '温暖', icon: '🔆' },
  { id: 'cool', name: '冷色', icon: '❄️' },
  { id: 'vintage', name: '复古', icon: '📷' },
  { id: 'bw', name: '黑白', icon: '🖤' },
  { id: 'sepia', name: '褐色', icon: '🏆' },
  { id: 'vivid', name: '鲜艳', icon: '🌈' },
  { id: 'dramatic', name: '戏剧', icon: '🎭' },
];

// 模拟音乐数据
const MUSIC_TRACKS = [
  { id: '1', title: '热门歌曲 1', artist: '艺术家 1', duration: '01:30' },
  { id: '2', title: '热门歌曲 2', artist: '艺术家 2', duration: '02:15' },
  { id: '3', title: '热门歌曲 3', artist: '艺术家 3', duration: '01:45' },
  { id: '4', title: '热门歌曲 4', artist: '艺术家 4', duration: '03:00' },
  { id: '5', title: '热门歌曲 5', artist: '艺术家 5', duration: '02:30' },
];

// 获取屏幕尺寸
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 估计底部Tab栏高度
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

const VideoEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { videoUri } = route.params || {};
  const { isDark } = useTheme();
  
  const [description, setDescription] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');
  
  // 获取安全区域
  const insets = useSafeAreaInsets();
  
  // 计算视频容器高度 - 进一步减小高度
  const videoContainerHeight = Math.min(
    screenHeight * 0.2, // 减少视频容器高度
    Platform.OS === 'ios' ? 150 : 130 // 进一步减小最大高度
  );
  
  // 新增标题相关状态
  const [titleText, setTitleText] = useState('');
  const [titlePosition, setTitlePosition] = useState({ 
    x: screenWidth / 2 - 100, 
    y: videoContainerHeight / 3 
  });
  const [titleColor, setTitleColor] = useState('#FFFFFF');
  const [titleFontSize, setTitleFontSize] = useState(Platform.OS === 'ios' ? 18 : 16);
  const [titleVisible, setTitleVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef(null);
  
  // 创建拖动响应器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        setTitlePosition(prev => ({
          x: Math.max(0, Math.min(screenWidth - 200, prev.x + gestureState.dx)),
          y: Math.max(0, Math.min(videoContainerHeight - 30, prev.y + gestureState.dy))
        }));
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      }
    })
  ).current;
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, []);
  
  // 当文本输入变化时显示标题
  useEffect(() => {
    if (titleText.trim() !== '') {
      setTitleVisible(true);
    } else {
      setTitleVisible(false);
    }
  }, [titleText]);
  
  const handlePublish = async () => {
    if (description.trim() === '') {
      Alert.alert('提示', '请添加视频描述');
      return;
    }
    
    setIsPublishing(true);
    
    // 这里应该是实际的视频处理和上传逻辑
    // 包括应用滤镜、添加音乐、压缩视频等
    
    try {
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 上传成功后返回首页
      navigation.navigate('Home');
      
      // 显示成功消息
      Alert.alert('成功', '视频已成功发布！');
    } catch (error) {
      console.error('发布视频失败:', error);
      Alert.alert('错误', '发布视频失败，请重试。');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const renderFiltersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>选择滤镜</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterItem,
              selectedFilter === filter.id && styles.selectedFilterItem,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={styles.filterName}>{filter.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  const renderMusicTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>添加音乐</Text>
      <ScrollView style={styles.musicContainer} showsVerticalScrollIndicator={false}>
        {MUSIC_TRACKS.map((track) => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.musicItem,
              selectedMusic?.id === track.id && styles.selectedMusicItem,
            ]}
            onPress={() => setSelectedMusic(track)}
          >
            <View style={styles.musicIcon}>
              <Ionicons name="musical-note" size={22} color="#FF4040" />
            </View>
            <View style={styles.musicInfo}>
              <Text style={styles.musicTitle}>{track.title}</Text>
              <Text style={styles.musicArtist}>{track.artist}</Text>
            </View>
            <Text style={styles.musicDuration}>{track.duration}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  const renderTextTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>添加文字</Text>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textOverlayInput}
          placeholder="输入要显示在视频上的文字..."
          placeholderTextColor="#999"
          value={titleText}
          onChangeText={setTitleText}
          maxLength={50}
        />
        <View style={styles.textControls}>
          <TouchableOpacity 
            style={[styles.textControlButton, { backgroundColor: titleColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' }]}
            onPress={() => setTitleColor('#FFFFFF')}
          >
            <View style={[styles.colorOption, { backgroundColor: '#FFFFFF' }]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.textControlButton, { backgroundColor: titleColor === '#FFD700' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' }]}
            onPress={() => setTitleColor('#FFD700')}
          >
            <View style={[styles.colorOption, { backgroundColor: '#FFD700' }]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.textControlButton, { backgroundColor: titleColor === '#FF4040' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' }]}
            onPress={() => setTitleColor('#FF4040')}
          >
            <View style={[styles.colorOption, { backgroundColor: '#FF4040' }]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.textControlButton}
            onPress={() => setTitleFontSize(prev => Math.min(prev + 2, 28))}
          >
            <Ionicons name="add" size={24} color="#FF4040" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.textControlButton}
            onPress={() => setTitleFontSize(prev => Math.max(prev - 2, 14))}
          >
            <Ionicons name="remove" size={24} color="#FF4040" />
          </TouchableOpacity>
        </View>
        <Text style={styles.dragHintText}>拖动文字可调整位置</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑视频</Text>
        <TouchableOpacity 
          style={styles.publishButton} 
          onPress={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.publishText}>发布</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={[styles.videoContainer, { height: videoContainerHeight }]}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay
          isMuted
        />
        
        {/* 视频上的标题文本 */}
        {titleVisible && (
          <View 
            style={[
              styles.titleContainer, 
              { 
                top: titlePosition.y,
                left: titlePosition.x,
                opacity: isDragging ? 0.7 : 1
              }
            ]}
            {...panResponder.panHandlers}
          >
            <Text 
              style={[
                styles.titleText, 
                { 
                  color: titleColor,
                  fontSize: titleFontSize,
                  textShadowColor: 'rgba(0, 0, 0, 0.8)',
                  textShadowOffset: { width: -1, height: 1 },
                  textShadowRadius: 3
                }
              ]}
              numberOfLines={2}
            >
              {titleText}
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.descriptionContainer, {
        paddingHorizontal: Math.max(10, screenWidth * 0.025),
        paddingVertical: Math.max(8, screenHeight * 0.01)
      }]}>
        <TextInput
          style={[styles.descriptionInput, {
            fontSize: Platform.OS === 'ios' ? 15 : 14,
            paddingVertical: Platform.OS === 'ios' ? 6 : 5,
            minHeight: Math.max(50, screenHeight * 0.05)
          }]}
          placeholder="添加视频描述和话题标签..."
          placeholderTextColor="#999"
          multiline
          maxLength={150}
          value={description}
          onChangeText={setDescription}
        />
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'filters' && styles.activeTabButton]}
          onPress={() => setActiveTab('filters')}
        >
          <Ionicons 
            name="color-filter" 
            size={18} 
            color={activeTab === 'filters' ? '#FF4040' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'filters' && styles.activeTabText]}>
            滤镜
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'music' && styles.activeTabButton]}
          onPress={() => setActiveTab('music')}
        >
          <Ionicons 
            name="musical-notes" 
            size={18} 
            color={activeTab === 'music' ? '#FF4040' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'music' && styles.activeTabText]}>
            音乐
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'text' && styles.activeTabButton]}
          onPress={() => setActiveTab('text')}
        >
          <Ionicons 
            name="text" 
            size={18} 
            color={activeTab === 'text' ? '#FF4040' : '#888'} 
          />
          <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>
            文字
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContentContainer}>
        {activeTab === 'filters' && renderFiltersTab()}
        {activeTab === 'music' && renderMusicTab()}
        {activeTab === 'text' && renderTextTab()}
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
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  publishButton: {
    backgroundColor: '#FF4040',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
  },
  publishText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#111',
    position: 'relative', // 添加相对定位
    overflow: 'hidden', // 防止标题溢出
  },
  video: {
    flex: 1,
  },
  // 添加标题容器样式
  titleContainer: {
    position: 'absolute',
    maxWidth: 200,
    padding: 4,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 添加标题文本样式
  titleText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  descriptionInput: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: 'white',
    textAlignVertical: 'top',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF4040',
  },
  tabText: {
    color: '#888',
    marginLeft: 4,
    fontSize: Platform.OS === 'ios' ? 13 : 12,
  },
  activeTabText: {
    color: '#FF4040',
    fontWeight: 'bold',
  },
  tabContentContainer: {
    flex: 1,
    position: 'relative',
  },
  tabContent: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterItem: {
    alignItems: 'center',
    marginRight: 15,
    opacity: 0.7,
  },
  selectedFilterItem: {
    opacity: 1,
  },
  filterIcon: {
    fontSize: 28,
    marginBottom: 3,
  },
  filterName: {
    color: 'white',
    fontSize: 11,
  },
  musicContainer: {
    flex: 1,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedMusicItem: {
    backgroundColor: 'rgba(255, 64, 64, 0.1)',
  },
  musicIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 64, 64, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  musicInfo: {
    flex: 1,
  },
  musicTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  musicArtist: {
    color: '#999',
    fontSize: 11,
    marginTop: 2,
  },
  musicDuration: {
    color: '#999',
    fontSize: 11,
  },
  textInputContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
  },
  textOverlayInput: {
    color: 'white',
    fontSize: 15,
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  textControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  textControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 添加颜色选项样式
  colorOption: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // 添加拖动提示文本样式
  dragHintText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default VideoEditorScreen;