import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 美颜效果类别
type BeautyCategory = 'face' | 'skin' | 'makeup' | 'filter' | 'body';

// 美颜效果项
interface BeautyEffectItem {
  id: string;
  name: string;
  icon: string;
  value: number;
  category: BeautyCategory;
}

interface BeautyEffectsPanelProps {
  visible: boolean;
  onClose: () => void;
  onEffectChange: (effects: BeautyEffectItem[]) => void;
}

const BeautyEffectsPanel: React.FC<BeautyEffectsPanelProps> = ({
  visible,
  onClose,
  onEffectChange
}) => {
  // 面板动画值
  const panelHeight = screenHeight * 0.6;
  const translateY = useState(new Animated.Value(panelHeight))[0];
  
  // 当前选择的类别
  const [activeCategory, setActiveCategory] = useState<BeautyCategory>('face');
  
  // 美颜效果数据
  const [effects, setEffects] = useState<BeautyEffectItem[]>([
    // 脸部
    { id: 'face_thin', name: '瘦脸', icon: 'face', value: 30, category: 'face' },
    { id: 'face_small', name: '小脸', icon: 'face', value: 20, category: 'face' },
    { id: 'face_v', name: 'V脸', icon: 'face', value: 25, category: 'face' },
    { id: 'chin', name: '下巴', icon: 'face', value: 0, category: 'face' },
    { id: 'forehead', name: '额头', icon: 'face', value: 0, category: 'face' },
    { id: 'eye_big', name: '大眼', icon: 'visibility', value: 30, category: 'face' },
    { id: 'eye_distance', name: '眼距', icon: 'visibility', value: 0, category: 'face' },
    { id: 'eye_corner', name: '眼角', icon: 'visibility', value: 0, category: 'face' },
    { id: 'nose_thin', name: '瘦鼻', icon: 'face', value: 20, category: 'face' },
    { id: 'mouth_size', name: '嘴型', icon: 'face', value: 0, category: 'face' },
    
    // 皮肤
    { id: 'smooth', name: '磨皮', icon: 'healing', value: 70, category: 'skin' },
    { id: 'whiten', name: '美白', icon: 'wb-sunny', value: 30, category: 'skin' },
    { id: 'sharpen', name: '锐化', icon: 'texture', value: 20, category: 'skin' },
    { id: 'clarity', name: '清晰度', icon: 'grain', value: 10, category: 'skin' },
    { id: 'blemish', name: '祛斑', icon: 'healing', value: 50, category: 'skin' },
    { id: 'dark_circle', name: '黑眼圈', icon: 'remove-red-eye', value: 50, category: 'skin' },
    { id: 'wrinkle', name: '祛皱', icon: 'healing', value: 40, category: 'skin' },
    
    // 妆容
    { id: 'lipstick', name: '口红', icon: 'brush', value: 50, category: 'makeup' },
    { id: 'blush', name: '腮红', icon: 'brush', value: 30, category: 'makeup' },
    { id: 'eyebrow', name: '眉毛', icon: 'brush', value: 20, category: 'makeup' },
    { id: 'eyeshadow', name: '眼影', icon: 'brush', value: 30, category: 'makeup' },
    { id: 'eyeliner', name: '眼线', icon: 'brush', value: 20, category: 'makeup' },
    { id: 'eyelash', name: '睫毛', icon: 'brush', value: 40, category: 'makeup' },
    
    // 滤镜
    { id: 'filter_fresh', name: '清新', icon: 'filter', value: 100, category: 'filter' },
    { id: 'filter_warm', name: '暖色', icon: 'filter', value: 0, category: 'filter' },
    { id: 'filter_cool', name: '冷色', icon: 'filter', value: 0, category: 'filter' },
    { id: 'filter_gray', name: '灰度', icon: 'filter', value: 0, category: 'filter' },
    { id: 'filter_dramatic', name: '戏剧', icon: 'filter', value: 0, category: 'filter' },
    { id: 'filter_vintage', name: '复古', icon: 'filter', value: 0, category: 'filter' },
    
    // 身材
    { id: 'body_thin', name: '瘦身', icon: 'accessibility-new', value: 20, category: 'body' },
    { id: 'leg_thin', name: '美腿', icon: 'accessibility-new', value: 30, category: 'body' },
    { id: 'waist_thin', name: '细腰', icon: 'accessibility-new', value: 20, category: 'body' },
    { id: 'hip_enhance', name: '提臀', icon: 'accessibility-new', value: 10, category: 'body' },
  ]);
  
  // 类别列表
  const categories: { id: BeautyCategory; name: string }[] = [
    { id: 'face', name: '脸型' },
    { id: 'skin', name: '美肤' },
    { id: 'makeup', name: '妆容' },
    { id: 'filter', name: '滤镜' },
    { id: 'body', name: '身材' }
  ];
  
  // 处理效果值变化
  const handleEffectValueChange = (id: string, value: number) => {
    const updatedEffects = effects.map(effect => 
      effect.id === id ? { ...effect, value } : effect
    );
    setEffects(updatedEffects);
    onEffectChange(updatedEffects);
  };
  
  // 重置当前类别的效果
  const resetCategoryEffects = () => {
    const updatedEffects = effects.map(effect => 
      effect.category === activeCategory ? { ...effect, value: 0 } : effect
    );
    setEffects(updatedEffects);
    onEffectChange(updatedEffects);
  };
  
  // 面板手势处理
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > panelHeight / 3) {
        // 关闭面板
        Animated.timing(translateY, {
          toValue: panelHeight,
          duration: 300,
          useNativeDriver: true
        }).start(onClose);
      } else {
        // 恢复面板
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    }
  });
  
  // 显示面板动画
  React.useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: panelHeight,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);
  
  // 过滤当前类别的效果
  const currentCategoryEffects = effects.filter(effect => effect.category === activeCategory);
  
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
      
      <Animated.View 
        style={[
          styles.panel, 
          { height: panelHeight, transform: [{ translateY }] }
        ]}
        {...panResponder.panHandlers}
      >
        {/* 面板标题栏 */}
        <View style={styles.panelHeader}>
          <View style={styles.panelHandle} />
          <Text style={styles.panelTitle}>美颜</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetCategoryEffects}>
            <Text style={styles.resetText}>重置</Text>
          </TouchableOpacity>
        </View>
        
        {/* 类别切换 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* 效果列表 */}
        <ScrollView style={styles.effectsContainer}>
          {currentCategoryEffects.map(effect => (
            <View key={effect.id} style={styles.effectItem}>
              <View style={styles.effectHeader}>
                <MaterialIcons name={effect.icon} size={18} color="#fff" />
                <Text style={styles.effectName}>{effect.name}</Text>
                <Text style={styles.effectValue}>{effect.value}</Text>
              </View>
              
              <Slider
                style={styles.effectSlider}
                minimumValue={0}
                maximumValue={100}
                value={effect.value}
                onValueChange={(value) => handleEffectValueChange(effect.id, Math.round(value))}
                minimumTrackTintColor="#FF4040"
                maximumTrackTintColor="#333"
                thumbTintColor="#FF4040"
              />
            </View>
          ))}
        </ScrollView>
        
        {/* 底部按钮 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyText}>应用</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#666',
    borderRadius: 3,
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -20,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  resetButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  resetText: {
    color: '#FF4040',
    fontSize: 14,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 10,
  },
  categoryContainer: {
    paddingVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#FF4040',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  categoryTextActive: {
    fontWeight: 'bold',
  },
  effectsContainer: {
    flex: 1,
  },
  effectItem: {
    marginBottom: 15,
  },
  effectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  effectName: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  effectValue: {
    color: '#FF4040',
    fontSize: 14,
    width: 30,
    textAlign: 'right',
  },
  effectSlider: {
    width: '100%',
    height: 40,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BeautyEffectsPanel; 