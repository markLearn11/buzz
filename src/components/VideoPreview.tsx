import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface VideoPreviewProps {
  uri: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
  style?: any;
  resizeMode?: 'stretch' | 'contain' | 'cover';
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  uri,
  autoPlay = false,
  loop = true,
  muted = false,
  showControls = true,
  onPlaybackStatusUpdate,
  style,
  resizeMode = 'contain'
}) => {
  const videoRef = useRef<any>(null);
  const [status, setStatus] = useState<any>({
    isLoaded: false,
    isPlaying: false,
    isBuffering: false,
    positionMillis: 0,
    durationMillis: 0,
    shouldPlay: autoPlay,
    volume: muted ? 0 : 1,
  });
  const [showingControls, setShowingControls] = useState(true);
  const [controlsTimer, setControlsTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 自动隐藏控制栏
  useEffect(() => {
    if (showingControls && status.isPlaying) {
      const timer = setTimeout(() => {
        setShowingControls(false);
      }, 3000);
      
      setControlsTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [showingControls, status.isPlaying]);
  
  // 处理播放状态更新
  const handlePlaybackStatusUpdate = (playbackStatus: any) => {
    if (!playbackStatus.isLoaded) return;
    
    setStatus({
      isLoaded: playbackStatus.isLoaded,
      isPlaying: playbackStatus.isPlaying,
      isBuffering: playbackStatus.isBuffering,
      positionMillis: playbackStatus.positionMillis,
      durationMillis: playbackStatus.durationMillis,
      shouldPlay: playbackStatus.shouldPlay,
      volume: playbackStatus.volume,
    });
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(playbackStatus);
    }
  };
  
  // 播放/暂停
  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    
    // 重置控制栏显示计时器
    if (controlsTimer) {
      clearTimeout(controlsTimer);
      setControlsTimer(null);
    }
  };
  
  // 切换静音
  const toggleMute = async () => {
    if (!videoRef.current) return;
    
    const newVolume = status.volume > 0 ? 0 : 1;
    await videoRef.current.setVolumeAsync(newVolume);
  };
  
  // 跳转到指定位置
  const seekTo = async (millis: number) => {
    if (!videoRef.current) return;
    
    await videoRef.current.setPositionAsync(millis);
  };
  
  // 格式化时间显示
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 显示/隐藏控制栏
  const toggleControls = () => {
    if (controlsTimer) {
      clearTimeout(controlsTimer);
      setControlsTimer(null);
    }
    
    setShowingControls(!showingControls);
  };
  
  // 渲染加载指示器
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
  
  // 渲染视频控制栏
  const renderControls = () => {
    if (!showControls || !showingControls) return null;
    
    return (
      <View style={styles.controlsContainer}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
            <Ionicons 
              name={status.volume > 0 ? 'volume-high' : 'volume-mute'} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerControls}>
          <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
            <Ionicons 
              name={status.isPlaying ? 'pause' : 'play'} 
              size={40} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomControls}>
          <Text style={styles.timeText}>
            {formatTime(status.positionMillis)}
          </Text>
          
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={status.durationMillis || 1}
            value={status.positionMillis || 0}
            onValueChange={(value) => seekTo(value)}
            minimumTrackTintColor="#FF4040"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#FF4040"
          />
          
          <Text style={styles.timeText}>
            {formatTime(status.durationMillis)}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.videoContainer}
        onPress={toggleControls}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={resizeMode}
          isLooping={loop}
          shouldPlay={autoPlay}
          isMuted={muted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
        
        {status.isBuffering && renderLoading()}
        {renderControls()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  centerControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default VideoPreview; 