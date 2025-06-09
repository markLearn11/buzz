import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 特效类别
type EffectCategory = 'popular' | 'funny' | 'beauty' | 'style' | 'scene' | 'dynamic';

// 特效项
interface EffectItem {
  id: string;
  name: string;
  thumbnail: string; // 实际应用中应该是一个真实的缩略图URL
  category: EffectCategory;
  isNew?: boolean;
  isHot?: boolean;
}

interface SpecialEffectsPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectEffect: (effect: EffectItem) => void;
}

const SpecialEffectsPanel: React.FC<SpecialEffectsPanelProps> = ({
  visible,
  onClose,
  onSelectEffect
}) => {
  // 面板动画值
  const panelHeight = screenHeight * 0.7;
  const translateY = useState(new Animated.Value(panelHeight))[0];
  
  // 当前选择的类别
  const [activeCategory, setActiveCategory] = useState<EffectCategory>('popular');
  
  // 特效数据 (模拟数据)
  const effects: EffectItem[] = [
    // 热门特效
    { id: 'effect1', name: '闪光', thumbnail: 'https://example.com/effect1.jpg', category: 'popular', isHot: true },
    { id: 'effect2', name: '霓虹', thumbnail: 'https://example.com/effect2.jpg', category: 'popular', isNew: true },
    { id: 'effect3', name: '复古', thumbnail: 'https://example.com/effect3.jpg', category: 'popular' },
    { id: 'effect4', name: '梦幻', thumbnail: 'https://example.com/effect4.jpg', category: 'popular' },
    { id: 'effect5', name: '电影感', thumbnail: 'https://example.com/effect5.jpg', category: 'popular', isHot: true },
    { id: 'effect6', name: '黑白', thumbnail: 'https://example.com/effect6.jpg', category: 'popular' },
    
    // 搞笑特效
    { id: 'effect7', name: '变声', thumbnail: 'https://example.com/effect7.jpg', category: 'funny', isNew: true },
    { id: 'effect8', name: '卡通脸', thumbnail: 'https://example.com/effect8.jpg', category: 'funny' },
    { id: 'effect9', name: '大头', thumbnail: 'https://example.com/effect9.jpg', category: 'funny' },
    { id: 'effect10', name: '抖动', thumbnail: 'https://example.com/effect10.jpg', category: 'funny' },
    
    // 美颜特效
    { id: 'effect11', name: '自然美颜', thumbnail: 'https://example.com/effect11.jpg', category: 'beauty' },
    { id: 'effect12', name: '柔光', thumbnail: 'https://example.com/effect12.jpg', category: 'beauty' },
    { id: 'effect13', name: '粉嫩', thumbnail: 'https://example.com/effect13.jpg', category: 'beauty' },
    
    // 风格特效
    { id: 'effect14', name: '赛博朋克', thumbnail: 'https://example.com/effect14.jpg', category: 'style', isNew: true },
    { id: 'effect15', name: '水彩', thumbnail: 'https://example.com/effect15.jpg', category: 'style' },
    { id: 'effect16', name: '油画', thumbnail: 'https://example.com/effect16.jpg', category: 'style' },
    
    // 场景特效
    { id: 'effect17', name: '雨天', thumbnail: 'https://example.com/effect17.jpg', category: 'scene' },
    { id: 'effect18', name: '雪景', thumbnail: 'https://example.com/effect18.jpg', category: 'scene' },
    { id: 'effect19', name: '星空', thumbnail: 'https://example.com/effect19.jpg', category: 'scene', isHot: true },
    
    // 动态特效
    { id: 'effect20', name: '波纹', thumbnail: 'https://example.com/effect20.jpg', category: 'dynamic' },
    { id: 'effect21', name: '粒子', thumbnail: 'https://example.com/effect21.jpg', category: 'dynamic' },
    { id: 'effect22', name: '烟雾', thumbnail: 'https://example.com/effect22.jpg', category: 'dynamic', isNew: true },
  ];
  
  // 类别列表
  const categories: { id: EffectCategory; name: string }[] = [
    { id: 'popular', name: '热门' },
    { id: 'funny', name: '搞笑' },
    { id: 'beauty', name: '美颜' },
    { id: 'style', name: '风格' },
    { id: 'scene', name: '场景' },
    { id: 'dynamic', name: '动态' }
  ];
  
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
  
  // 过滤当前类别的特效
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
          <Text style={styles.panelTitle}>特效</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
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
        
        {/* 特效网格 */}
        <ScrollView style={styles.effectsContainer}>
          <View style={styles.effectsGrid}>
            {currentCategoryEffects.map(effect => (
              <TouchableOpacity 
                key={effect.id} 
                style={styles.effectItem}
                onPress={() => onSelectEffect(effect)}
              >
                <View style={styles.effectThumbnailContainer}>
                  {/* 实际应用中应该使用真实的缩略图 */}
                  <View style={styles.effectThumbnail}>
                    <FontAwesome5 name="magic" size={24} color="#fff" />
                  </View>
                  
                  {/* 新特效标签 */}
                  {effect.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.badgeText}>新</Text>
                    </View>
                  )}
                  
                  {/* 热门特效标签 */}
                  {effect.isHot && (
                    <View style={styles.hotBadge}>
                      <Text style={styles.badgeText}>热</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.effectName}>{effect.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  closeButton: {
    padding: 5,
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
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  effectItem: {
    width: (screenWidth - 60) / 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  effectThumbnailContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  effectThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4040',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hotBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  effectName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SpecialEffectsPanel; 