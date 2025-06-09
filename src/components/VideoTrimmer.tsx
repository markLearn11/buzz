import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  PanResponder,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width: screenWidth } = Dimensions.get('window');

interface VideoTrimmerProps {
  duration: number; // 视频总时长（毫秒）
  thumbnailUri?: string; // 视频缩略图
  startTime: number; // 开始时间（毫秒）
  endTime: number; // 结束时间（毫秒）
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  maxDuration?: number; // 最大允许的视频长度（毫秒）
  minDuration?: number; // 最小允许的视频长度（毫秒）
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  duration,
  thumbnailUri,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  maxDuration = 60000, // 默认最大60秒
  minDuration = 1000 // 默认最小1秒
}) => {
  const [trimWidth, setTrimWidth] = useState(0);
  
  // 计算滑块位置
  const calculatePosition = (time: number) => {
    return (time / duration) * trimWidth;
  };
  
  // 计算时间
  const calculateTime = (position: number) => {
    return (position / trimWidth) * duration;
  };
  
  // 格式化时间显示
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 左侧滑块
  const leftHandle = useRef(new Animated.Value(calculatePosition(startTime))).current;
  
  // 右侧滑块
  const rightHandle = useRef(new Animated.Value(calculatePosition(endTime))).current;
  
  // 更新滑块位置
  useEffect(() => {
    if (trimWidth > 0) {
      leftHandle.setValue(calculatePosition(startTime));
      rightHandle.setValue(calculatePosition(endTime));
    }
  }, [trimWidth, startTime, endTime]);
  
  // 左侧滑块手势
  const leftPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min((rightHandle as any)._value - (minDuration / duration) * trimWidth, gestureState.moveX));
      leftHandle.setValue(newPosition);
    },
    onPanResponderRelease: () => {
      const newStartTime = calculateTime((leftHandle as any)._value);
      onStartTimeChange(newStartTime);
    }
  });
  
  // 右侧滑块手势
  const rightPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.min(trimWidth, Math.max((leftHandle as any)._value + (minDuration / duration) * trimWidth, gestureState.moveX));
      rightHandle.setValue(newPosition);
    },
    onPanResponderRelease: () => {
      const newEndTime = calculateTime((rightHandle as any)._value);
      onEndTimeChange(newEndTime);
    }
  });
  
  // 测量容器宽度
  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTrimWidth(width);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>视频剪辑</Text>
      
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>{formatTime(startTime)}</Text>
        <Text style={styles.timeText}>{formatTime(endTime - startTime)}</Text>
        <Text style={styles.timeText}>{formatTime(endTime)}</Text>
      </View>
      
      <View style={styles.trimmerContainer} onLayout={onLayout}>
        {/* 视频缩略图背景 */}
        {thumbnailUri && (
          <Image 
            source={{ uri: thumbnailUri }} 
            style={styles.thumbnailBackground}
            resizeMode="cover"
          />
        )}
        
        {/* 选中区域 */}
        <Animated.View
          style={[
            styles.selectedArea,
            {
              left: leftHandle,
              right: Animated.subtract(trimWidth, rightHandle)
            }
          ]}
        />
        
        {/* 左侧滑块 */}
        <Animated.View
          style={[styles.handle, styles.leftHandle, { left: leftHandle }]}
          {...leftPanResponder.panHandlers}
        >
          <View style={styles.handleBar} />
        </Animated.View>
        
        {/* 右侧滑块 */}
        <Animated.View
          style={[styles.handle, styles.rightHandle, { left: rightHandle }]}
          {...rightPanResponder.panHandlers}
        >
          <View style={styles.handleBar} />
        </Animated.View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>开始时间</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(0, endTime - minDuration)}
          value={startTime}
          onValueChange={onStartTimeChange}
          minimumTrackTintColor="#FF4040"
          maximumTrackTintColor="#333"
          thumbTintColor="#FF4040"
        />
      </View>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>结束时间</Text>
        <Slider
          style={styles.slider}
          minimumValue={Math.min(duration, startTime + minDuration)}
          maximumValue={duration}
          value={endTime}
          onValueChange={onEndTimeChange}
          minimumTrackTintColor="#FF4040"
          maximumTrackTintColor="#333"
          thumbTintColor="#FF4040"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
  trimmerContainer: {
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnailBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  selectedArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 64, 64, 0.3)',
    borderWidth: 2,
    borderColor: '#FF4040',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftHandle: {
    marginLeft: -10,
  },
  rightHandle: {
    marginLeft: -10,
  },
  handleBar: {
    width: 4,
    height: '80%',
    backgroundColor: '#FF4040',
    borderRadius: 2,
  },
  sliderContainer: {
    marginBottom: 15,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default VideoTrimmer; 