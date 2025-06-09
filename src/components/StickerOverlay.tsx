import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export interface StickerItem {
  id: string;
  uri?: string;
  emoji?: string;
  text?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface StickerOverlayProps {
  stickers: StickerItem[];
  onStickersChange: (stickers: StickerItem[]) => void;
  containerWidth: number;
  containerHeight: number;
  editable?: boolean;
}

const StickerOverlay: React.FC<StickerOverlayProps> = ({
  stickers,
  onStickersChange,
  containerWidth,
  containerHeight,
  editable = true
}) => {
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  
  // 选择贴纸
  const handleSelectSticker = (stickerId: string) => {
    if (!editable) return;
    
    setSelectedStickerId(stickerId);
  };
  
  // 删除贴纸
  const handleDeleteSticker = (stickerId: string) => {
    if (!editable) return;
    
    const updatedStickers = stickers.filter(sticker => sticker.id !== stickerId);
    onStickersChange(updatedStickers);
    setSelectedStickerId(null);
  };
  
  // 渲染贴纸项
  const renderStickerItem = (sticker: StickerItem) => {
    // 创建拖动、缩放、旋转手势
    const pan = useRef(new Animated.ValueXY({ x: sticker.x, y: sticker.y })).current;
    const scale = useRef(new Animated.Value(sticker.scale)).current;
    const rotation = useRef(new Animated.Value(sticker.rotation)).current;
    
    // 上一次的缩放和旋转值
    const lastScale = useRef(sticker.scale);
    const lastRotation = useRef(sticker.rotation);
    
    // 创建手势响应器
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onPanResponderGrant: () => {
        handleSelectSticker(sticker.id);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        // 单指拖动
        if (evt.nativeEvent.touches.length === 1) {
          Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          )(evt, gestureState);
        } 
        // 双指缩放和旋转
        else if (evt.nativeEvent.touches.length === 2) {
          // 这里简化处理，实际应用中应该计算两个触摸点之间的距离和角度变化
          const newScale = Math.max(0.5, Math.min(3, lastScale.current + gestureState.dy * -0.01));
          scale.setValue(newScale);
          
          const newRotation = lastRotation.current + gestureState.dx * 0.1;
          rotation.setValue(newRotation);
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        // 更新贴纸位置、缩放和旋转
        const updatedStickers = stickers.map(item => {
          if (item.id === sticker.id) {
            return { 
              ...item, 
              x: pan.x._value, 
              y: pan.y._value,
              scale: scale._value,
              rotation: rotation._value
            };
          }
          return item;
        });
        
        // 保存最后的缩放和旋转值
        lastScale.current = scale._value;
        lastRotation.current = rotation._value;
        
        onStickersChange(updatedStickers);
      }
    });
    
    // 渲染贴纸内容
    const renderStickerContent = () => {
      if (sticker.uri) {
        return (
          <Image 
            source={{ uri: sticker.uri }} 
            style={styles.stickerImage} 
            resizeMode="contain"
          />
        );
      } else if (sticker.emoji) {
        return (
          <Text style={styles.emojiSticker}>{sticker.emoji}</Text>
        );
      } else if (sticker.text) {
        return (
          <View style={styles.textStickerContainer}>
            <Text style={styles.textSticker}>{sticker.text}</Text>
          </View>
        );
      }
      
      // 默认占位
      return (
        <View style={styles.placeholderSticker}>
          <Ionicons name="image" size={24} color="#fff" />
        </View>
      );
    };
    
    return (
      <Animated.View
        key={sticker.id}
        style={[
          styles.stickerContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale },
              { rotate: rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              }) }
            ],
            zIndex: sticker.zIndex
          }
        ]}
        {...panResponder.panHandlers}
      >
        {renderStickerContent()}
        
        {editable && selectedStickerId === sticker.id && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteSticker(sticker.id)}
          >
            <Ionicons name="close-circle" size={24} color="#FF4040" />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };
  
  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      {stickers.map(renderStickerItem)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  stickerContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  emojiSticker: {
    fontSize: 50,
  },
  textStickerContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 8,
  },
  textSticker: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderSticker: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(100,100,100,0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});

export default StickerOverlay; 