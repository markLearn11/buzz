import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ScrollView,
  Dimensions,
  Image,
  FlatList,
  Animated
} from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 视频编辑工具选项
const EDIT_TOOLS = [
  { id: 'trim', icon: 'content-cut', label: '剪辑', color: '#FF4040' },
  { id: 'text', icon: 'text-fields', label: '文字', color: '#40A0FF' },
  { id: 'sticker', icon: 'emoji-emotions', label: '贴纸', color: '#FFAA40' },
  { id: 'effect', icon: 'auto-fix-high', label: '特效', color: '#AA40FF' },
  { id: 'filter', icon: 'filter-vintage', label: '滤镜', color: '#40FFAA' },
  { id: 'audio', icon: 'music-note', label: '音乐', color: '#FF40AA' },
  { id: 'speed', icon: 'speed', label: '速度', color: '#AAFF40' },
  { id: 'voice', icon: 'record-voice-over', label: '配音', color: '#40FFFF' },
];

interface VideoEditorProps {
  videoUri: string;
  onSave?: (editedVideo: any) => void;
  onCancel?: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoUri, onSave, onCancel }) => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState({ isPlaying: false, positionMillis: 0, durationMillis: 0 });
  const [trimRange, setTrimRange] = useState({ start: 0, end: 100 });
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [filters, setFilters] = useState<string[]>([]);
  const [texts, setTexts] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  
  const videoRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // 加载视频信息
    if (videoRef.current) {
      videoRef.current.getStatusAsync().then(status => {
        setVideoStatus(prev => ({
          ...prev,
          durationMillis: status.durationMillis || 0
        }));
        setTrimRange({ start: 0, end: status.durationMillis || 100 });
      });
    }
  }, [videoUri]);
  
  const handlePlayPause = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setVideoStatus(prev => ({ ...prev, isPlaying: !status.isPlaying }));
    }
  };
  
  const handleToolSelect = (toolId: string) => {
    setCurrentTool(currentTool === toolId ? null : toolId);
  };
  
  const handleSave = () => {
    // TODO: 实际处理视频编辑逻辑
    if (onSave) {
      onSave({ 
        uri: videoUri,
        trimRange,
        volume,
        speed,
        filters,
        texts,
        stickers
      });
    }
  };
  
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const renderToolPanel = () => {
    switch (currentTool) {
      case 'trim':
        return (
          <View style={styles.toolPanel}>
            <Text style={styles.toolTitle}>视频剪辑</Text>
            <View style={styles.trimContainer}>
              <Slider
                style={styles.trimSlider}
                minimumValue={0}
                maximumValue={videoStatus.durationMillis}
                value={trimRange.start}
                onValueChange={(value) => setTrimRange(prev => ({ ...prev, start: value }))}
                minimumTrackTintColor="#FF4040"
                maximumTrackTintColor="#333"
                thumbTintColor="#FF4040"
              />
              <Text style={styles.timeText}>{formatTime(trimRange.start)} - {formatTime(trimRange.end)}</Text>
              <Slider
                style={styles.trimSlider}
                minimumValue={0}
                maximumValue={videoStatus.durationMillis}
                value={trimRange.end}
                onValueChange={(value) => setTrimRange(prev => ({ ...prev, end: value }))}
                minimumTrackTintColor="#FF4040"
                maximumTrackTintColor="#333"
                thumbTintColor="#FF4040"
              />
            </View>
          </View>
        );
        
      case 'filter':
        return (
          <View style={styles.toolPanel}>
            <Text style={styles.toolTitle}>滤镜</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
              {['原始', '清新', '复古', '黑白', '暖阳', '冷调', '梦幻', '锐化', '柔和', '高对比'].map((filter) => (
                <TouchableOpacity 
                  key={filter} 
                  style={[styles.filterItem, filters.includes(filter) && styles.filterItemActive]}
                  onPress={() => setFilters(filters.includes(filter) ? filters.filter(f => f !== filter) : [...filters, filter])}
                >
                  <View style={styles.filterPreview}>
                    <Text style={styles.filterPreviewText}>A</Text>
                  </View>
                  <Text style={styles.filterName}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      // 可以根据需要添加更多工具面板
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          isLooping
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setVideoStatus({
                isPlaying: status.isPlaying,
                positionMillis: status.positionMillis,
                durationMillis: status.durationMillis || 0
              });
            }
          }}
        />
        
        {/* 视频控制 */}
        <View style={styles.videoControls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons name={videoStatus.isPlaying ? "pause" : "play"} size={32} color="#fff" />
          </TouchableOpacity>
          
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={videoStatus.durationMillis}
            value={videoStatus.positionMillis}
            onValueChange={(value) => {
              if (videoRef.current) {
                videoRef.current.setPositionAsync(value);
              }
            }}
            minimumTrackTintColor="#FF4040"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#FF4040"
          />
          
          <Text style={styles.timeText}>
            {formatTime(videoStatus.positionMillis)} / {formatTime(videoStatus.durationMillis)}
          </Text>
        </View>
      </View>
      
      {/* 编辑工具栏 */}
      <View style={styles.toolsContainer}>
        <FlatList
          data={EDIT_TOOLS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.toolButton, currentTool === item.id && styles.toolButtonActive]} 
              onPress={() => handleToolSelect(item.id)}
            >
              <MaterialIcons name={item.icon} size={24} color={currentTool === item.id ? item.color : '#fff'} />
              <Text style={[styles.toolText, currentTool === item.id && { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* 当前工具面板 */}
      {renderToolPanel()}
      
      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  videoContainer: {
    height: screenWidth * 16/9,
    width: screenWidth,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playButton: {
    marginRight: 10,
  },
  progressSlider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 10,
  },
  toolsContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  toolButton: {
    alignItems: 'center',
    marginHorizontal: 12,
    opacity: 0.8,
  },
  toolButtonActive: {
    opacity: 1,
  },
  toolText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  toolPanel: {
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
    margin: 10,
  },
  toolTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  trimContainer: {
    marginVertical: 10,
  },
  trimSlider: {
    width: '100%',
    height: 40,
  },
  filterList: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  filterItem: {
    alignItems: 'center',
    marginRight: 15,
    opacity: 0.7,
  },
  filterItemActive: {
    opacity: 1,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  filterPreviewText: {
    color: '#fff',
    fontSize: 24,
  },
  filterName: {
    color: '#fff',
    fontSize: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoEditor; 