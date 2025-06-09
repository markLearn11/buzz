import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraPreviewProps {
  onCapture: (uri: string, type: 'photo' | 'video') => void;
  onCancel: () => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ onCapture, onCancel }) => {
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'photo' | 'video'>('photo');
  
  const cameraRef = useRef<Camera>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 设置音频模式
  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };
    
    setupAudio();
    
    return () => {
      // 清除计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  // 切换前后摄像头
  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };
  
  // 切换闪光灯模式
  const toggleFlash = () => {
    setFlash(current => 
      current === FlashMode.off ? 
      FlashMode.on : 
      FlashMode.off
    );
  };
  
  // 拍照
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android',
      });
      
      setPreviewUri(photo.uri);
      setPreviewType('photo');
    } catch (error) {
      Alert.alert('错误', '拍照失败');
      console.error(error);
    }
  };
  
  // 开始录制视频
  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    setIsRecording(true);
    setRecordingTime(0);
    
    // 开始计时
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // 最长60秒
        quality: Camera.Constants.VideoQuality['720p'],
        mute: false,
      });
      
      setPreviewUri(video.uri);
      setPreviewType('video');
      setIsRecording(false);
      
      // 清除计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } catch (error) {
      Alert.alert('错误', '录制视频失败');
      console.error(error);
      setIsRecording(false);
      
      // 清除计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };
  
  // 停止录制视频
  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    
    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
      
      // 清除计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } catch (error) {
      Alert.alert('错误', '停止录制失败');
      console.error(error);
    }
  };
  
  // 格式化录制时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 使用预览的媒体
  const useMedia = () => {
    if (previewUri) {
      onCapture(previewUri, previewType);
    }
  };
  
  // 取消预览，返回相机
  const cancelPreview = () => {
    setPreviewUri(null);
  };
  
  // 渲染媒体预览
  if (previewUri) {
    return (
      <View style={styles.container}>
        {previewType === 'photo' ? (
          <Image source={{ uri: previewUri }} style={styles.preview} />
        ) : (
          <View style={styles.preview}>
            <Text style={styles.videoPreviewText}>视频预览</Text>
          </View>
        )}
        
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.previewButton} onPress={cancelPreview}>
            <Ionicons name="close" size={32} color="#fff" />
            <Text style={styles.previewButtonText}>重拍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.previewButton} onPress={useMedia}>
            <Ionicons name="checkmark" size={32} color="#fff" />
            <Text style={styles.previewButtonText}>使用</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flash}
        ratio="16:9"
      >
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Ionicons 
              name={flash === FlashMode.off ? "flash-off" : "flash"} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTime}>{formatRecordingTime(recordingTime)}</Text>
          </View>
        )}
        
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.captureButton} onPress={isRecording ? stopRecording : (previewType === 'photo' ? takePicture : startRecording)}>
            <View style={[styles.captureCircle, isRecording && styles.recordingCircle]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.typeButton} onPress={toggleCameraType}>
            <MaterialIcons name="flip-camera-ios" size={36} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, previewType === 'video' && styles.modeButtonActive]} 
            onPress={() => setPreviewType('video')}
          >
            <Text style={[styles.modeText, previewType === 'video' && styles.modeTextActive]}>视频</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, previewType === 'photo' && styles.modeButtonActive]} 
            onPress={() => setPreviewType('photo')}
          >
            <Text style={[styles.modeText, previewType === 'photo' && styles.modeTextActive]}>照片</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  captureCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  recordingCircle: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FF4040',
  },
  typeButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 5,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255,64,64,0.8)',
  },
  modeText: {
    color: '#fff',
    fontSize: 14,
  },
  modeTextActive: {
    fontWeight: 'bold',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4040',
    marginRight: 5,
  },
  recordingTime: {
    color: '#fff',
    fontSize: 14,
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 20,
  },
  previewButton: {
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#fff',
    marginTop: 5,
  },
});

export default CameraPreview; 