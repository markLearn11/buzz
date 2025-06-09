import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Sticker } from './StickerSelector';

const { width: screenWidth } = Dimensions.get('window');

export interface StickerItem extends Sticker {
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 创建贴纸项的动画值和手势响应
  const createPanResponder = (id: string) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const lastScale = useRef(1);
    const lastRotation = useRef(0);
    const rotation = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedId(id);
        pan.setOffset({
          x: pan.x as any,
          y: pan.y as any
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
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          
          // 计算两个触摸点之间的距离
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 计算旋转角度
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          // 查找当前贴纸
          const sticker = stickers.find(s => s.id === id);
          if (sticker) {
            // 更新贴纸缩放和旋转
            const updatedStickers = stickers.map(s => {
              if (s.id === id) {
                return {
                  ...s,
                  scale: distance / 100, // 根据实际需求调整缩放比例
                  rotation: angle
                };
              }
              return s;
            });
            
            onStickersChange(updatedStickers);
          }
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        // 更新贴纸位置
        const updatedStickers = stickers.map(s => {
          if (s.id === id) {
            return {
              ...s,
              x: s.x + (pan.x as any)._value,
              y: s.y + (pan.y as any)._value,
            };
          }
          return s;
        });
        
        onStickersChange(updatedStickers);
      }
    });
    
    return { pan, rotation, scale, panResponder };
  };
  
  // 为每个贴纸项创建动画和手势
  const stickerRefs = useRef<{[key: string]: {
    pan: Animated.ValueXY,
    rotation: Animated.Value,
    scale: Animated.Value,
    panResponder: any
  }}>({});
  
  // 确保每个贴纸项都有对应的手势响应器
  stickers.forEach(sticker => {
    if (!stickerRefs.current[sticker.id]) {
      stickerRefs.current[sticker.id] = createPanResponder(sticker.id);
    }
  });
  
  // 删除贴纸
  const deleteSticker = (id: string) => {
    const updatedStickers = stickers.filter(s => s.id !== id);
    onStickersChange(updatedStickers);
    setSelectedId(null);
  };
  
  // 复制贴纸
  const duplicateSticker = (id: string) => {
    const sticker = stickers.find(s => s.id === id);
    if (sticker) {
      const newSticker: StickerItem = {
        ...sticker,
        id: `${sticker.id}_copy_${Date.now()}`,
        x: sticker.x + 20,
        y: sticker.y + 20,
        zIndex: stickers.length + 1
      };
      
      const updatedStickers = [...stickers, newSticker];
      onStickersChange(updatedStickers);
      setSelectedId(newSticker.id);
    }
  };
  
  // 调整贴纸层级
  const adjustZIndex = (id: string, direction: 'up' | 'down') => {
    const updatedStickers = [...stickers];
    const index = updatedStickers.findIndex(s => s.id === id);
    
    if (index !== -1) {
      if (direction === 'up') {
        // 将贴纸层级提高
        updatedStickers[index].zIndex = Math.max(...stickers.map(s => s.zIndex)) + 1;
      } else {
        // 将贴纸层级降低
        updatedStickers[index].zIndex = Math.min(...stickers.map(s => s.zIndex)) - 1;
      }
      
      onStickersChange(updatedStickers);
    }
  };
  
  // 渲染贴纸内容
  const renderStickerContent = (sticker: StickerItem) => {
    if (sticker.emoji) {
      return <Text style={styles.emojiSticker}>{sticker.emoji}</Text>;
    } else if (sticker.text) {
      return <Text style={styles.textSticker}>{sticker.text}</Text>;
    } else if (sticker.uri) {
      return (
        <Image 
          source={{ uri: sticker.uri }} 
          style={styles.imageSticker}
          resizeMode="contain"
        />
      );
    }
    return null;
  };
  
  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      {stickers.sort((a, b) => a.zIndex - b.zIndex).map((sticker) => {
        const ref = stickerRefs.current[sticker.id];
        if (!ref) return null;
        
        return (
          <Animated.View
            key={sticker.id}
            style={[
              styles.stickerContainer,
              {
                transform: [
                  { translateX: ref.pan.x },
                  { translateY: ref.pan.y },
                  { rotate: `${sticker.rotation}deg` },
                  { scale: sticker.scale }
                ],
                left: sticker.x,
                top: sticker.y,
                zIndex: sticker.zIndex,
              }
            ]}
            {...(editable ? ref.panResponder.panHandlers : {})}
          >
            {renderStickerContent(sticker)}
            
            {editable && selectedId === sticker.id && (
              <View style={styles.stickerControls}>
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={() => deleteSticker(sticker.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={() => duplicateSticker(sticker.id)}
                >
                  <MaterialIcons name="content-copy" size={18} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={() => adjustZIndex(sticker.id, 'up')}
                >
                  <MaterialIcons name="arrow-upward" size={18} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={() => adjustZIndex(sticker.id, 'down')}
                >
                  <MaterialIcons name="arrow-downward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  stickerContainer: {
    position: 'absolute',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiSticker: {
    fontSize: 50,
  },
  textSticker: {
    color: '#fff',
    backgroundColor: 'rgba(255,64,64,0.8)',
    padding: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageSticker: {
    width: 100,
    height: 100,
  },
  stickerControls: {
    position: 'absolute',
    top: -30,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 5,
  },
  controlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StickerOverlay; 