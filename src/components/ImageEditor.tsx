import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  ImageStyle
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TextItem } from './TextOverlay';
import { StickerItem } from './StickerOverlay';
import TextOverlay from './TextOverlay';
import StickerOverlay from './StickerOverlay';
import StickerSelector from './StickerSelector';

const { width: screenWidth } = Dimensions.get('window');

// 图片编辑工具选项
const EDIT_TOOLS = [
  { id: 'crop', icon: 'crop', label: '裁剪', color: '#FF4040' },
  { id: 'text', icon: 'text-fields', label: '文字', color: '#40A0FF' },
  { id: 'sticker', icon: 'emoji-emotions', label: '贴纸', color: '#FFAA40' },
  { id: 'filter', icon: 'filter-vintage', label: '滤镜', color: '#40FFAA' },
  { id: 'adjust', icon: 'tune', label: '调整', color: '#AA40FF' },
  { id: 'draw', icon: 'brush', label: '绘制', color: '#FF40AA' },
  { id: 'blur', icon: 'blur-on', label: '模糊', color: '#40FFFF' },
];

// 由于 React Native 不直接支持 CSS filter，这里我们使用简单的透明度和颜色调整来模拟滤镜效果
const FILTERS = [
  { id: 'original', name: '原图', style: {} as ImageStyle },
  { id: 'grayscale', name: '黑白', style: { tintColor: '#888', opacity: 0.8 } as ImageStyle },
  { id: 'sepia', name: '复古', style: { tintColor: '#D2B48C', opacity: 0.8 } as ImageStyle },
  { id: 'warm', name: '暖色', style: { tintColor: '#FF9966', opacity: 0.2 } as ImageStyle },
  { id: 'cool', name: '冷色', style: { tintColor: '#66CCFF', opacity: 0.2 } as ImageStyle },
  { id: 'vivid', name: '鲜艳', style: { tintColor: '#FF0000', opacity: 0.1 } as ImageStyle },
  { id: 'fade', name: '褪色', style: { opacity: 0.7 } as ImageStyle },
  { id: 'dramatic', name: '戏剧', style: { tintColor: '#000', opacity: 0.1 } as ImageStyle },
];

interface ImageEditorProps {
  imageUri: string;
  onSave?: (editedImage: any) => void;
  onCancel?: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUri, onSave, onCancel }) => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('original');
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [showStickerSelector, setShowStickerSelector] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef<Image>(null);
  
  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    if (currentTool === toolId) {
      setCurrentTool(null);
    } else {
      setCurrentTool(toolId);
      
      if (toolId === 'sticker') {
        setShowStickerSelector(true);
      }
    }
  };
  
  // 处理滤镜选择
  const handleFilterSelect = (filterId: string) => {
    setCurrentFilter(filterId);
  };
  
  // 处理贴纸选择
  const handleStickerSelect = (sticker: any) => {
    const newSticker: StickerItem = {
      ...sticker,
      x: imageSize.width / 2 - 50,
      y: imageSize.height / 2 - 50,
      scale: 1,
      rotation: 0,
      zIndex: stickers.length + 1
    };
    setStickers([...stickers, newSticker]);
  };
  
  // 保存编辑后的图片
  const handleSave = () => {
    if (onSave) {
      // 实际应用中这里需要将所有编辑应用到图片上
      // 可能需要使用第三方库如 react-native-view-shot 来捕获视图
      onSave({
        uri: imageUri,
        filter: currentFilter,
        texts,
        stickers
      });
    }
  };
  
  // 获取当前滤镜样式
  const getCurrentFilterStyle = (): ImageStyle => {
    const filter = FILTERS.find(f => f.id === currentFilter);
    return filter ? filter.style : {};
  };
  
  // 渲染编辑工具面板
  const renderToolPanel = () => {
    switch (currentTool) {
      case 'filter':
        return (
          <View style={styles.toolPanel}>
            <Text style={styles.toolTitle}>滤镜</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.filterItem, currentFilter === filter.id && styles.filterItemActive]}
                  onPress={() => handleFilterSelect(filter.id)}
                >
                  <View style={styles.filterPreview}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={[styles.filterPreviewImage, filter.style]} 
                    />
                  </View>
                  <Text style={styles.filterName}>{filter.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
        
      case 'crop':
        return (
          <View style={styles.toolPanel}>
            <Text style={styles.toolTitle}>裁剪</Text>
            <View style={styles.cropOptions}>
              <TouchableOpacity style={styles.cropOption}>
                <MaterialIcons name="crop-free" size={24} color="#fff" />
                <Text style={styles.cropOptionText}>自由</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropOption}>
                <MaterialIcons name="crop-square" size={24} color="#fff" />
                <Text style={styles.cropOptionText}>1:1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropOption}>
                <MaterialIcons name="crop-16-9" size={24} color="#fff" />
                <Text style={styles.cropOptionText}>16:9</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cropOption}>
                <MaterialIcons name="crop-3-2" size={24} color="#fff" />
                <Text style={styles.cropOptionText}>3:2</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'adjust':
        return (
          <View style={styles.toolPanel}>
            <Text style={styles.toolTitle}>调整</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.adjustOption}>
                <MaterialIcons name="brightness-6" size={24} color="#fff" />
                <Text style={styles.adjustOptionText}>亮度</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustOption}>
                <MaterialIcons name="contrast" size={24} color="#fff" />
                <Text style={styles.adjustOptionText}>对比度</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustOption}>
                <MaterialIcons name="tonality" size={24} color="#fff" />
                <Text style={styles.adjustOptionText}>饱和度</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustOption}>
                <MaterialIcons name="exposure" size={24} color="#fff" />
                <Text style={styles.adjustOptionText}>曝光</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustOption}>
                <MaterialIcons name="flip" size={24} color="#fff" />
                <Text style={styles.adjustOptionText}>翻转</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustOption}>
                <MaterialIcons name="rotate-right" size={24} color="#fff" />
                <Text style={styles.adjustOptionText}>旋转</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  // 获取图片尺寸
  const onImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setImageSize({ width, height });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          ref={imageRef}
          source={{ uri: imageUri }}
          style={[styles.image, getCurrentFilterStyle()]}
          resizeMode="contain"
          onLayout={onImageLayout}
        />
        
        {/* 文本叠加层 */}
        <TextOverlay
          texts={texts}
          onTextChange={setTexts}
          containerWidth={imageSize.width}
          containerHeight={imageSize.height}
          editable={currentTool === 'text'}
        />
        
        {/* 贴纸叠加层 */}
        <StickerOverlay
          stickers={stickers}
          onStickersChange={setStickers}
          containerWidth={imageSize.width}
          containerHeight={imageSize.height}
          editable={currentTool === 'sticker'}
        />
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
      
      {/* 贴纸选择器 */}
      <StickerSelector
        visible={showStickerSelector}
        onClose={() => setShowStickerSelector(false)}
        onSelectSticker={handleStickerSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  imageContainer: {
    height: screenWidth,
    width: screenWidth,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
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
  filterItem: {
    alignItems: 'center',
    marginRight: 15,
    opacity: 0.7,
  },
  filterItemActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FF4040',
    borderRadius: 10,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    overflow: 'hidden',
    marginBottom: 5,
  },
  filterPreviewImage: {
    width: '100%',
    height: '100%',
  },
  filterName: {
    color: '#fff',
    fontSize: 12,
  },
  cropOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  cropOption: {
    alignItems: 'center',
    padding: 10,
  },
  cropOptionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  adjustOption: {
    alignItems: 'center',
    marginRight: 20,
  },
  adjustOptionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
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

export default ImageEditor; 