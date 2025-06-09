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
  Animated,
  Alert
} from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import TextOverlay, { TextItem } from './TextOverlay';
import StickerOverlay, { StickerItem } from './StickerOverlay';
import StickerSelector from './StickerSelector';
import VideoFilter, { VIDEO_FILTERS } from './VideoFilter';
import SpeedControl, { SPEED_OPTIONS } from './SpeedControl';
import VideoTrimmer from './VideoTrimmer';
import AudioVolumeControl from './AudioVolumeControl';
import MusicSelectorModal, { Music } from './MusicSelectorModal';
import VideoExportModal, { VideoExportOptions } from './VideoExportModal';

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
  { id: 'volume', icon: 'volume-up', label: '音量', color: '#40FFFF' },
];

// 示例音乐数据
const SAMPLE_MUSICS = [
  { id: 'music1', title: '热门BGM', artist: '抖音热歌' },
  { id: 'music2', title: '轻快节奏', artist: '流行音乐' },
  { id: 'music3', title: '舒缓钢琴曲', artist: '古典音乐' },
  { id: 'music4', title: '电子舞曲', artist: 'DJ混音' },
  { id: 'music5', title: '欢快民谣', artist: '民谣歌手' },
];

interface VideoEditorProps {
  videoUri: string;
  onSave?: (editedVideo: any) => void;
  onCancel?: () => void;
  selectedMusic?: Music | null;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ 
  videoUri, 
  onSave, 
  onCancel,
  selectedMusic: initialMusic = null
}) => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState({ 
    isPlaying: false, 
    positionMillis: 0, 
    durationMillis: 0,
    isLoaded: false
  });
  const [trimRange, setTrimRange] = useState({ start: 0, end: 100 });
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [showStickerSelector, setShowStickerSelector] = useState(false);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(initialMusic);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const videoRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // 加载视频信息
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.getStatusAsync().then(status => {
        setVideoStatus(prev => ({
          ...prev,
          durationMillis: status.durationMillis || 0,
          isLoaded: true
        }));
        setTrimRange({ start: 0, end: status.durationMillis || 100 });
      });
      
      // 在实际应用中，这里应该生成视频缩略图
      // 这里简单模拟一个缩略图URL
      setVideoThumbnail(videoUri);
    }
    
    // 如果传入了初始音乐，显示提示
    if (initialMusic) {
      Alert.alert('已添加背景音乐', `"${initialMusic.title}" - ${initialMusic.artist}`);
    }
  }, [videoUri, initialMusic]);
  
  // 播放/暂停视频
  const handlePlayPause = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        // 如果在剪辑范围外，先跳转到开始位置
        if (videoStatus.positionMillis < trimRange.start || videoStatus.positionMillis > trimRange.end) {
          videoRef.current.setPositionAsync(trimRange.start);
        }
        videoRef.current.playAsync();
      }
      setVideoStatus(prev => ({ ...prev, isPlaying: !status.isPlaying }));
    }
  };
  
  // 选择工具
  const handleToolSelect = (toolId: string) => {
    setCurrentTool(currentTool === toolId ? null : toolId);
    
    if (toolId === 'sticker') {
      setShowStickerSelector(true);
    } else if (toolId === 'audio') {
      setShowMusicSelector(true);
    }
  };
  
  // 处理贴纸选择
  const handleStickerSelect = (sticker: any) => {
    const newSticker: StickerItem = {
      ...sticker,
      x: screenWidth / 2 - 50,
      y: screenWidth * 9/16 / 2 - 50,
      scale: 1,
      rotation: 0,
      zIndex: stickers.length + 1
    };
    setStickers([...stickers, newSticker]);
  };
  
  // 处理音乐选择
  const handleMusicSelect = (music: Music) => {
    setSelectedMusic(music);
    setShowMusicSelector(false);
    Alert.alert('已选择音乐', `"${music.title}" - ${music.artist}`);
  };
  
  // 设置剪辑范围
  const handleSetTrimRange = (start: number, end: number) => {
    setTrimRange({ start, end });
    // 如果正在播放，跳转到开始位置
    if (videoStatus.isPlaying) {
      videoRef.current?.setPositionAsync(start);
    }
  };
  
  // 处理导出选项
  const handleExport = (options: VideoExportOptions) => {
    setIsExporting(true);
    
    // 模拟导出进度
    const interval = setInterval(() => {
      setExportProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setShowExportModal(false);
            
            // 导出完成，调用保存回调
            if (onSave) {
              onSave({ 
                uri: videoUri,
                trimRange,
                volume,
                speed,
                filter: selectedFilter,
                texts,
                stickers,
                music: selectedMusic,
                exportOptions: options
              });
            }
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };
  
  // 保存编辑后的视频
  const handleSave = () => {
    setShowExportModal(true);
  };
  
  // 格式化时间显示
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 获取当前滤镜样式
  const getCurrentFilterStyle = () => {
    const filter = VIDEO_FILTERS.find(f => f.id === selectedFilter);
    return filter ? filter.style : {};
  };
  
  // 渲染工具面板
  const renderToolPanel = () => {
    switch (currentTool) {
      case 'trim':
        return (
          <VideoTrimmer
            duration={videoStatus.durationMillis}
            thumbnailUri={videoThumbnail}
            startTime={trimRange.start}
            endTime={trimRange.end}
            onStartTimeChange={(time) => setTrimRange(prev => ({ ...prev, start: time }))}
            onEndTimeChange={(time) => setTrimRange(prev => ({ ...prev, end: time }))}
          />
        );
        
      case 'filter':
        return (
          <VideoFilter
            thumbnailUri={videoThumbnail}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        );
        
      case 'speed':
        return (
          <SpeedControl
            currentSpeed={speed}
            onSpeedChange={setSpeed}
          />
        );
        
      case 'volume':
        return (
          <AudioVolumeControl
            volume={volume}
            onVolumeChange={setVolume}
          />
        );
        
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
          style={[styles.video, getCurrentFilterStyle()]}
          resizeMode="contain"
          isLooping
          rate={speed}
          volume={volume}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              // 如果位置超出剪辑范围，跳回开始位置
              if (status.positionMillis > trimRange.end && status.isPlaying) {
                videoRef.current?.setPositionAsync(trimRange.start);
                return;
              }
              
              setVideoStatus({
                isPlaying: status.isPlaying,
                positionMillis: status.positionMillis,
                durationMillis: status.durationMillis || 0,
                isLoaded: true
              });
            }
          }}
        />
        
        {/* 文本叠加层 */}
        <TextOverlay
          texts={texts}
          onTextChange={setTexts}
          containerWidth={screenWidth}
          containerHeight={screenWidth * 16/9}
          editable={currentTool === 'text'}
        />
        
        {/* 贴纸叠加层 */}
        <StickerOverlay
          stickers={stickers}
          onStickersChange={setStickers}
          containerWidth={screenWidth}
          containerHeight={screenWidth * 16/9}
          editable={currentTool === 'sticker'}
        />
        
        {/* 视频控制 */}
        <View style={styles.videoControls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons name={videoStatus.isPlaying ? "pause" : "play"} size={32} color="#fff" />
          </TouchableOpacity>
          
          <Slider
            style={styles.progressSlider}
            minimumValue={trimRange.start}
            maximumValue={trimRange.end}
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
            {formatTime(videoStatus.positionMillis - trimRange.start)} / {formatTime(trimRange.end - trimRange.start)}
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
          <Text style={styles.saveText}>导出</Text>
        </TouchableOpacity>
      </View>
      
      {/* 贴纸选择器 */}
      <StickerSelector
        visible={showStickerSelector}
        onClose={() => setShowStickerSelector(false)}
        onSelectSticker={handleStickerSelect}
      />
      
      {/* 音乐选择器 */}
      <MusicSelectorModal
        visible={showMusicSelector}
        onSelectMusic={handleMusicSelect}
        onClose={() => setShowMusicSelector(false)}
      />
      
      {/* 导出选项模态框 */}
      <VideoExportModal
        visible={showExportModal}
        onClose={() => {
          if (!isExporting) setShowExportModal(false);
        }}
        onExport={handleExport}
        progress={exportProgress}
        isExporting={isExporting}
      />
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