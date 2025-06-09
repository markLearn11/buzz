import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  SafeAreaView,
  Alert,
  Platform,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  Animated
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 创建内容类型
const CONTENT_TYPES = [
  { id: 'video', title: '视频', icon: 'videocam' },
  { id: 'image', title: '图片', icon: 'image' },
  { id: 'post', title: '图文', icon: 'images' },
  { id: 'gif', title: 'GIF', icon: 'gift-outline' },
  { id: 'question', title: '问题', icon: 'help-circle' },
  { id: 'sticker', title: '贴图', icon: 'happy-outline' },
  { id: 'text', title: '文本', icon: 'text' },
];

const TAB_ICONS = [
  { id: 'video', icon: 'videocam' },
  { id: 'image', icon: 'image' },
  { id: 'post', icon: 'images' },
  { id: 'gif', icon: 'gift-outline' },
  { id: 'question', icon: 'help-circle' },
  { id: 'sticker', icon: 'happy-outline' },
  { id: 'text', icon: 'text' },
];

// 右侧工具栏按钮配置
const SIDE_TOOLS = [
  { id: 'flip', icon: 'camera-reverse', label: '翻转', onPress: () => {} },
  { id: 'timer', icon: 'timer-outline', label: '倒计时', onPress: () => {} },
  { id: 'challenge', icon: 'flame-outline', label: '挑战', onPress: () => {} },
  { id: 'inspiration', icon: 'eye-outline', label: '灵感', onPress: () => {} },
  { id: 'beauty', icon: 'color-palette-outline', label: '美化', onPress: () => {} },
  { id: 'more', icon: 'chevron-down', label: '更多', onPress: () => {} },
];

// 底部内容类型Tab
const CONTENT_TABS = [
  { id: 'quick', label: '连拍' },
  { id: 'photo', label: '拍照' },
  { id: 'video', label: '视频' },
  { id: 'text', label: '文字' },
];

// 底部模式Tab
const MODE_TABS = [
  { id: 'ai', label: 'AI' },
  { id: 'post', label: '图文' },
  { id: 'multi', label: '多段拍' },
  { id: 'quickshot', label: '随手拍' },
  { id: 'template', label: '模板' },
  { id: 'live', label: '直播', badge: 'LIVE' },
];

const CreateScreen = () => {
  // 基础状态
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // 新增的功能状态
  const [selectedContentType, setSelectedContentType] = useState('video');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [recordingSpeed, setRecordingSpeed] = useState('1x');
  const [beautifyEnabled, setBeautifyEnabled] = useState(true);
  
  // 多媒体选择状态
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  
  // Tab动画状态
  const tabScales = TAB_ICONS.map((_, i) => useRef(new Animated.Value(i === 0 ? 1.2 : 1)).current);

  // Tab切换动画
  useEffect(() => {
    TAB_ICONS.forEach((_, i) => {
      Animated.spring(tabScales[i], {
        toValue: selectedContentType === TAB_ICONS[i].id ? 1.2 : 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 8,
      }).start();
    });
  }, [selectedContentType]);
  
  // 请求必要的权限
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      const { status: libraryStatus } = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && 
        audioStatus === 'granted' && 
        libraryStatus === 'granted'
      );
      
      // 获取最近的媒体库项目
      if (libraryStatus === 'granted') {
        fetchRecentMedia();
      }
    })();
  }, []);
  
  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);
  
  // 获取最近的媒体文件
  const fetchRecentMedia = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        first: 20,
        mediaType: ['photo', 'video'],
        sortBy: ['creationTime'],
      });
      setGalleryItems(media.assets);
    } catch (error) {
      console.error('获取媒体库失败:', error);
    }
  };
  
  // 开始录制
  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        
        // 开始计时
        const interval = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        
        // 录制参数根据速度调整
        const speedMultiplier = parseFloat(recordingSpeed.replace('x', ''));
        const maxDuration = 60 / speedMultiplier; // 根据速度调整最大时长
        
        const video = await cameraRef.current.recordAsync({
          maxDuration: maxDuration,
          quality: '720p',
          mute: false,
          // 添加更多录制参数，如果支持的话
        });
        
        clearInterval(interval);
        setTimerInterval(null);
        setRecordingDuration(0);
        setIsRecording(false);
        
        navigation.navigate('VideoEditor', { 
          videoUri: video.uri,
          speed: recordingSpeed,
          beautify: beautifyEnabled
        });
      } catch (error) {
        console.error('录制视频失败:', error);
        setIsRecording(false);
        clearInterval(timerInterval);
        setTimerInterval(null);
        setRecordingDuration(0);
        Alert.alert('错误', '录制视频失败，请重试。');
      }
    }
  };
  
  // 停止录制
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      clearInterval(timerInterval);
      setTimerInterval(null);
      setRecordingDuration(0);
      setIsRecording(false);
    }
  };
  
  // 从相册选择视频
  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('VideoEditor', { videoUri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('选择视频失败:', error);
      Alert.alert('错误', '选择视频失败，请重试。');
    }
  };
  
  // 从相册选择图片
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 9,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (result.assets.length === 1) {
          // 单张图片直接进入编辑
          navigation.navigate('ImageEditor', { imageUri: result.assets[0].uri });
        } else {
          // 多张图片创建图文动态
          navigation.navigate('PostEditor', { images: result.assets.map(asset => asset.uri) });
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败，请重试。');
    }
  };
  
  // 选择媒体类型
  const handleContentTypeChange = (type) => {
    setSelectedContentType(type);
    setShowTypeSelector(false);
    
    // 根据类型执行不同操作
    if (type === 'image') {
      pickImage();
    } else if (type === 'question') {
      navigation.navigate('QuestionCreator');
    } else if (type === 'gif') {
      navigation.navigate('GifPicker');
    } else if (type === 'live') {
      navigation.navigate('LiveStreamSetup');
    }
  };
  
  // 切换摄像头
  const toggleCameraType = () => {
    setCameraType(
      cameraType === CameraType.back
        ? CameraType.front
        : CameraType.back
    );
  };
  
  // 切换闪光灯
  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === FlashMode.off
        ? FlashMode.on
        : FlashMode.off
    );
  };
  
  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 渲染录制速度选择器
  const renderSpeedSelector = () => (
    <View style={styles.speedSelector}>
      {['0.5x', '1x', '2x', '3x'].map(speed => (
        <TouchableOpacity
          key={speed}
          style={[styles.speedOption, recordingSpeed === speed && styles.selectedSpeedOption]}
          onPress={() => {
            setRecordingSpeed(speed);
            setShowSpeedOptions(false);
          }}
        >
          <Text style={[styles.speedText, recordingSpeed === speed && styles.selectedSpeedText]}>
            {speed}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // 顶部栏
  const renderTopBar = () => (
    <View style={styles.topBarWrap}>
      <TouchableOpacity style={styles.topBackBtn} onPress={() => navigation.navigate('Home')}>
        <View style={styles.topBackCircle}><Ionicons name="close" size={28} color="#fff" /></View>
      </TouchableOpacity>
      <View style={styles.topMusicWrap}>
        <TouchableOpacity style={styles.topMusicBtn}>
          <Ionicons name="musical-notes-outline" size={18} color="#fff" />
          <Text style={styles.topMusicText}>选择音乐</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.topRightBtns}>
        <TouchableOpacity style={styles.topRightBtn}><Ionicons name="settings-outline" size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.topRightBtn}><Ionicons name="flash-outline" size={22} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );
  
  // 右侧工具栏
  const renderSideTools = () => (
    <View style={styles.sideToolsWrap2}>
      {SIDE_TOOLS.map((tool, idx) => (
        <TouchableOpacity key={tool.id} style={[styles.sideToolBtn2, idx === 2 && { marginBottom: 18 }]} onPress={tool.onPress} activeOpacity={0.85}>
          <View style={styles.sideToolCircle2}>
            <Ionicons name={tool.icon} size={24} color="#fff" />
          </View>
          <Text style={styles.sideToolLabel2}>{tool.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // 内容类型Tab
  const renderContentTabs = () => (
    <View style={styles.contentTabsWrap}>
      {CONTENT_TABS.map(tab => (
        <TouchableOpacity key={tab.id} style={styles.contentTabBtn} onPress={() => setSelectedContentType(tab.id)}>
          <Text style={[styles.contentTabText, selectedContentType === tab.id && styles.contentTabTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // 底部模式Tab
  const renderModeTabs = () => (
    <View style={styles.modeTabsWrap}>
      {MODE_TABS.map(tab => (
        <TouchableOpacity key={tab.id} style={styles.modeTabBtn} onPress={() => setSelectedContentType(tab.id)}>
          <Text style={[styles.modeTabText, selectedContentType === tab.id && styles.modeTabTextActive]}>{tab.label}</Text>
          {tab.badge && <Text style={styles.modeTabBadge}>{tab.badge}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // 内容区（全屏Camera/图片/视频）
  const renderContentPreview = () => (
    <View style={styles.previewWrap}>
      {/* 这里可放Camera或图片/视频预览 */}
      <View style={styles.previewPlaceholder} />
      {renderSideTools()}
    </View>
  );
  
  // 底部操作区
  const renderBottomBar = () => (
    <View style={styles.bottomBarWrap3}>
      <TouchableOpacity style={styles.bottomBarBtn3}>
        <View style={styles.bottomBarIconCircle}><Ionicons name="sparkles-outline" size={28} color="#fff" /></View>
        <Text style={styles.bottomBarBtnText}>特效</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.mainActionBtn3}>
        <LinearGradient colors={["#FF4040", "#FF7B7B"]} style={styles.mainActionBtnBg3}>
          <Ionicons name={selectedContentType === 'photo' ? 'camera' : 'videocam'} size={38} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomBarBtn3}>
        <View style={styles.bottomBarIconCircle}><Ionicons name="images" size={28} color="#fff" /></View>
        <Text style={styles.bottomBarBtnText}>相册</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>需要相机和麦克风权限才能录制视频</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderTopBar()}
      {renderContentPreview()}
      {renderContentTabs()}
      {renderBottomBar()}
      {renderModeTabs()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FF4040',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 5,
  },
  closeButton: {
    padding: 8,
  },
  cameraOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraOption: {
    marginLeft: 15,
  },
  speedButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  speedSelector: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 80 : 40,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 5,
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  selectedSpeedOption: {
    backgroundColor: 'rgba(255, 64, 64, 0.5)',
  },
  speedText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  selectedSpeedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 30,
    paddingHorizontal: 30,
  },
  recordButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentTypeButton: {
    alignItems: 'center',
  },
  galleryButton: {
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF4040',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordingButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FF4040',
  },
  thumbnailImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  smallText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4040',
    marginRight: 8,
  },
  recordingTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sideControls: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -100 }],
  },
  sideButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  contentTypeModal: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    paddingBottom: 30,
  },
  contentTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentTypeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  contentTypeItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentTypeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 64, 64, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentTypeText: {
    color: 'white',
    fontSize: 14,
  },
  tabBarWrap: {
    backgroundColor: 'rgba(24,24,24,0.95)',
    paddingTop: 8,
    paddingBottom: 2,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  tabBarContent: {
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  tabItem2: {
    alignItems: 'center',
    marginHorizontal: 14,
  },
  tabItem2Active: {
    // nothing, icon高亮由iconCircleActive控制
  },
  tabIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#FF4040',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabIconCircleActive: {
    backgroundColor: '#FF4040',
    shadowColor: '#FF4040',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  tabText2: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 0,
  },
  tabText2Active: {
    color: '#FF4040',
    fontWeight: 'bold',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardShadow: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(30,30,30,0.98)',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 38,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 22,
    textAlign: 'center',
  },
  cardBtn: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
    shadowColor: '#FF4040',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bottomBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 32,
  },
  mainActionBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: 18,
  },
  bottomBarBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(40,40,40,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  backBtn: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 30,
  },
  backBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30,30,30,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarWrap2: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 18,
    zIndex: 20,
  },
  tabBarContent2: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18,18,18,0.85)',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },
  tabIconBtn: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconBtnActive: {},
  tabIconCircle2: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  tabIconCircle2Inactive: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(40,40,40,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  centerContentWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(24,24,24,0.98)',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  centerIconWrap: {
    marginBottom: 18,
  },
  centerIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  centerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  centerDesc: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  centerMainBtn: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  centerMainBtnBg: {
    width: 180,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  centerMainBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabBarWrap3: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 18,
    zIndex: 20,
  },
  tabBarContent3: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18,18,18,0.85)',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem3: {
    alignItems: 'center',
    marginHorizontal: 18,
  },
  tabItem3Active: {},
  tabIconCircle3: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(40,40,40,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabIconCircle3Active: {
    backgroundColor: '#FF4040',
    shadowColor: '#FF4040',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  tabText3: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 0,
  },
  tabText3Active: {
    color: '#FF4040',
    fontWeight: 'bold',
  },
  editorContainer3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    position: 'relative',
  },
  centerContentWrap2: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    minHeight: 320,
  },
  centerCard2: {
    width: '80%',
    maxWidth: 340,
    backgroundColor: 'rgba(24,24,24,0.98)',
    borderRadius: 32,
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  centerIconWrap2: {
    marginBottom: 18,
  },
  centerIconCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  centerTitle2: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  centerDesc2: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  sideToolsWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
    zIndex: 10,
  },
  sideToolBtn: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sideToolCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  sideToolLabel: {
    color: '#bbb',
    fontSize: 12,
  },
  bottomBarWrap2: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 32,
    zIndex: 20,
  },
  mainActionBtn2: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  mainActionBtnBg2: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomBarBtn2: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(40,40,40,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  topBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    height: 56,
    position: 'relative',
    zIndex: 30,
  },
  topBackBtn: {
    position: 'absolute',
    left: 0,
    top: 10,
    zIndex: 31,
  },
  topBackCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30,30,30,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topMusicWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMusicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  topMusicText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 10,
  },
  topRightBtn: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30,30,30,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  sideToolsWrap2: {
    position: 'absolute',
    right: 12,
    top: 80,
    zIndex: 20,
    alignItems: 'center',
  },
  sideToolBtn2: {
    alignItems: 'center',
    marginVertical: 8,
  },
  sideToolCircle2: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(40,40,40,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  sideToolLabel2: {
    color: '#fff',
    fontSize: 12,
  },
  contentTabsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  contentTabBtn: {
    marginHorizontal: 18,
    paddingVertical: 4,
  },
  contentTabText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
  },
  contentTabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    opacity: 1,
    borderBottomWidth: 3,
    borderBottomColor: '#FF4040',
    paddingBottom: 2,
  },
  bottomBarWrap3: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 18,
    paddingHorizontal: 32,
    zIndex: 20,
  },
  mainActionBtn3: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  mainActionBtnBg3: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4040',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  bottomBarBtn3: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(40,40,40,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBarBtnText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  modeTabsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modeTabBtn: {
    marginHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  modeTabText: {
    color: '#bbb',
    fontSize: 15,
    paddingVertical: 2,
  },
  modeTabTextActive: {
    color: '#FF4040',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modeTabBadge: {
    color: '#fff',
    backgroundColor: '#FF4040',
    fontSize: 10,
    borderRadius: 8,
    paddingHorizontal: 5,
    marginLeft: 4,
    overflow: 'hidden',
  },
});

export default CreateScreen; 