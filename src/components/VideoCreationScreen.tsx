import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

// 导入自定义组件
import CameraControls from './CameraControls';
import CameraModeSwitcher, { CameraMode } from './CameraModeSwitcher';
import BeautyEffectsPanel from './BeautyEffectsPanel';
import SpecialEffectsPanel from './SpecialEffectsPanel';
import InspirationPanel from './InspirationPanel';
import ChallengePanel from './ChallengePanel';
import VideoPreview from './VideoPreview';
import VideoEditor from './VideoEditor';
import CountdownModal from './CountdownModal';
import MusicSelectorModal, { Music } from './MusicSelectorModal';

interface VideoCreationScreenProps {
  navigation: any;
}

const VideoCreationScreen: React.FC<VideoCreationScreenProps> = ({ navigation }) => {
  // 相机相关状态
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('video');
  const [cameraReady, setCameraReady] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // 面板显示状态
  const [showBeautyPanel, setShowBeautyPanel] = useState(false);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showInspirationPanel, setShowInspirationPanel] = useState(false);
  const [showChallengePanel, setShowChallengePanel] = useState(false);
  
  // 新增状态
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  
  // 特效相关状态
  const [currentEffect, setCurrentEffect] = useState<any>(null);
  
  // 参考
  const cameraRef = useRef<Camera | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFocused = useIsFocused();
  
  // 获取相机和媒体库权限
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && 
        audioStatus === 'granted' && 
        mediaLibraryStatus === 'granted'
      );
    })();
  }, []);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);
  
  // 切换相机
  const handleFlipCamera = () => {
    setCameraType(
      cameraType === CameraType.back
        ? CameraType.front
        : CameraType.back
    );
  };
  
  // 切换闪光灯
  const handleFlashToggle = () => {
    setFlashMode(
      flashMode === FlashMode.off
        ? FlashMode.on
        : FlashMode.off
    );
  };
  
  // 开始录制视频
  const startRecording = async () => {
    if (!cameraReady || !cameraRef.current) return;
    
    setIsRecording(true);
    setRecordingProgress(0);
    setRecordingDuration(0);
    
    // 开始录制
    try {
      const videoRecordPromise = cameraRef.current.recordAsync({
        maxDuration: 60, // 最大录制时长60秒
        quality: '720p',
        mute: false,
      });
      
      // 更新进度条
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 0.1;
          // 计算进度百分比 (0-100)
          setRecordingProgress((newDuration / 60) * 100);
          return newDuration;
        });
      }, 100);
      
      // 等待录制完成
      const video = await videoRecordPromise;
      setVideoUri(video.uri);
      
      // 清除定时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } catch (error) {
      console.error('录制视频失败:', error);
      Alert.alert('错误', '录制视频失败，请重试');
      setIsRecording(false);
    }
  };
  
  // 停止录制视频
  const stopRecording = async () => {
    if (!isRecording || !cameraRef.current) return;
    
    try {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      
      // 清除定时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } catch (error) {
      console.error('停止录制失败:', error);
    }
  };
  
  // 拍照
  const takePicture = async () => {
    if (!cameraReady || !cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync();
      // 处理拍照结果
      console.log('拍照成功:', photo.uri);
      // 这里可以导航到图片编辑页面
      Alert.alert('拍照成功', '图片已保存');
    } catch (error) {
      console.error('拍照失败:', error);
      Alert.alert('错误', '拍照失败，请重试');
    }
  };
  
  // 从相册选择媒体
  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.type === 'video') {
          setVideoUri(asset.uri);
        } else {
          // 处理图片
          console.log('选择了图片:', asset.uri);
          Alert.alert('已选择图片', '图片编辑功能将在后续版本中提供');
        }
      }
    } catch (error) {
      console.error('选择媒体失败:', error);
      Alert.alert('错误', '选择媒体失败，请重试');
    }
  };
  
  // 处理拍摄模式切换
  const handleModeChange = (mode: CameraMode) => {
    setCameraMode(mode);
  };
  
  // 处理视频编辑完成
  const handleVideoEditComplete = (editedVideo: any) => {
    console.log('视频编辑完成:', editedVideo);
    // 这里可以处理编辑后的视频，如上传到服务器等
    setVideoUri(null); // 清除视频，返回相机界面
    Alert.alert('成功', '视频已保存到相册');
  };
  
  // 取消视频编辑
  const handleCancelEdit = () => {
    setVideoUri(null); // 清除视频，返回相机界面
  };
  
  // 新增：处理倒计时
  const handleCountdownSelect = (seconds: number) => {
    setShowCountdownModal(false);
    setIsCountingDown(true);
    setCountdownValue(seconds);
    
    // 启动倒计时
    countdownTimerRef.current = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          // 倒计时结束，清除定时器并开始录制
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          setIsCountingDown(false);
          
          // 根据当前模式执行相应操作
          if (cameraMode === 'photo') {
            takePicture();
          } else if (cameraMode === 'video' || cameraMode === 'burst') {
            startRecording();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // 新增：处理音乐选择
  const handleMusicSelect = (music: Music) => {
    setSelectedMusic(music);
    setShowMusicSelector(false);
    Alert.alert('音乐已选择', `已选择"${music.title}"作为背景音乐`);
  };
  
  // 新增：处理特效选择
  const handleEffectSelect = (effect: any) => {
    setCurrentEffect(effect);
    setShowEffectsPanel(false);
    Alert.alert('特效已应用', `已应用"${effect.name}"特效`);
  };
  
  // 渲染录制按钮
  const renderRecordButton = () => {
    if (cameraMode === 'photo') {
      // 拍照按钮
      return (
        <TouchableOpacity 
          style={styles.captureButton} 
          onPress={takePicture}
          disabled={isCountingDown}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      );
    } else if (cameraMode === 'video') {
      // 录制视频按钮
      return (
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingButton]} 
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isCountingDown}
        >
          {isRecording && <View style={styles.recordingIndicator} />}
        </TouchableOpacity>
      );
    } else if (cameraMode === 'burst') {
      // 连拍按钮
      return (
        <TouchableOpacity 
          style={[styles.burstButton, isRecording && styles.burstActiveButton]} 
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isCountingDown}
        >
          <View style={styles.burstButtonInner}>
            <View style={styles.burstIcon} />
            <View style={styles.burstIcon} />
            <View style={styles.burstIcon} />
          </View>
        </TouchableOpacity>
      );
    } else {
      // 文字模式或其他模式
      return (
        <TouchableOpacity 
          style={styles.textModeButton} 
          onPress={pickMedia}
          disabled={isCountingDown}
        >
          <Text style={styles.textModeButtonText}>选择媒体</Text>
        </TouchableOpacity>
      );
    }
  };
  
  // 如果没有权限
  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>请求权限中...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>没有相机或麦克风权限</Text></View>;
  }
  
  // 如果有视频，显示视频编辑界面
  if (videoUri) {
    return (
      <VideoEditor
        videoUri={videoUri}
        onSave={handleVideoEditComplete}
        onCancel={handleCancelEdit}
        selectedMusic={selectedMusic}
      />
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* 相机预览 */}
      {isFocused && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          onCameraReady={() => setCameraReady(true)}
          ratio="16:9"
        />
      )}
      
      {/* 倒计时显示 */}
      {isCountingDown && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdownValue}</Text>
        </View>
      )}
      
      {/* 录制进度条 */}
      {isRecording && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${recordingProgress}%` }]} />
          <Text style={styles.durationText}>{recordingDuration.toFixed(1)}s</Text>
        </View>
      )}
      
      {/* 当前特效显示 */}
      {currentEffect && (
        <View style={styles.currentEffectContainer}>
          <View style={styles.currentEffectInner}>
            <FontAwesome5 name={currentEffect.icon || "magic"} size={16} color="#fff" />
            <Text style={styles.currentEffectText}>{currentEffect.name}</Text>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setCurrentEffect(null)}
            >
              <Ionicons name="close-circle" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* 当前音乐显示 */}
      {selectedMusic && (
        <View style={styles.currentMusicContainer}>
          <View style={styles.currentMusicInner}>
            <Ionicons name="musical-note" size={16} color="#fff" />
            <Text style={styles.currentMusicText}>{selectedMusic.title} - {selectedMusic.artist}</Text>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSelectedMusic(null)}
            >
              <Ionicons name="close-circle" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* 相机控制按钮 */}
      <CameraControls
        onFlipCamera={handleFlipCamera}
        onBeautyPress={() => setShowBeautyPanel(true)}
        onChallengePress={() => setShowChallengePanel(true)}
        onInspirationPress={() => setShowInspirationPanel(true)}
        onSettingsPress={() => {}}
        onEffectsPress={() => setShowEffectsPanel(true)}
        onMusicPress={() => setShowMusicSelector(true)}
        onFlashPress={handleFlashToggle}
        onCountdownSelect={handleCountdownSelect}
        flashMode={flashMode === FlashMode.on ? 'on' : 'off'}
        isRecording={isRecording}
      />
      
      {/* 底部模式切换和录制按钮 */}
      <View style={styles.bottomControls}>
        {/* 相册按钮 */}
        <TouchableOpacity style={styles.galleryButton} onPress={pickMedia}>
          <View style={styles.galleryButtonInner} />
        </TouchableOpacity>
        
        {/* 录制按钮 */}
        {renderRecordButton()}
        
        {/* 模式切换器 */}
        <CameraModeSwitcher
          currentMode={cameraMode}
          onModeChange={handleModeChange}
        />
      </View>
      
      {/* 美颜面板 */}
      <BeautyEffectsPanel
        visible={showBeautyPanel}
        onClose={() => setShowBeautyPanel(false)}
        onEffectChange={() => {}}
      />
      
      {/* 特效面板 */}
      <SpecialEffectsPanel
        visible={showEffectsPanel}
        onClose={() => setShowEffectsPanel(false)}
        onSelectEffect={handleEffectSelect}
      />
      
      {/* 灵感面板 */}
      <InspirationPanel
        visible={showInspirationPanel}
        onClose={() => setShowInspirationPanel(false)}
        onSelectInspiration={() => {}}
      />
      
      {/* 挑战面板 */}
      <ChallengePanel
        visible={showChallengePanel}
        onClose={() => setShowChallengePanel(false)}
        onSelectChallenge={() => {}}
      />
      
      {/* 倒计时模态框 */}
      <CountdownModal
        visible={showCountdownModal}
        onSelect={handleCountdownSelect}
        onCancel={() => setShowCountdownModal(false)}
      />
      
      {/* 音乐选择器模态框 */}
      <MusicSelectorModal
        visible={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        onSelectMusic={handleMusicSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordingButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FF4040',
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  burstButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  burstActiveButton: {
    backgroundColor: '#FFA040',
  },
  burstButtonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burstIcon: {
    width: 10,
    height: 20,
    backgroundColor: '#fff',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  textModeButton: {
    width: 80,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#40A0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textModeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  galleryButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  progressBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF4040',
  },
  durationText: {
    position: 'absolute',
    right: 10,
    top: 10,
    color: '#fff',
    fontSize: 14,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  countdownText: {
    fontSize: 120,
    color: '#fff',
    fontWeight: 'bold',
  },
  currentEffectContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    zIndex: 10,
  },
  currentEffectInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  currentEffectText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    marginRight: 8,
  },
  currentMusicContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 85 : 65,
    left: 10,
    zIndex: 10,
  },
  currentMusicInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  currentMusicText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    marginRight: 8,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoCreationScreen; 