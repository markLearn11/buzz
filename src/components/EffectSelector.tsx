import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 特效分类
const EFFECT_CATEGORIES = [
  { id: 'popular', name: '热门' },
  { id: 'funny', name: '搞笑' },
  { id: 'beauty', name: '美颜' },
  { id: 'style', name: '风格' },
  { id: 'scene', name: '场景' },
  { id: 'dynamic', name: '动态' }
];

// 特效项
export interface Effect {
  id: string;
  name: string;
  category: string;
  icon: string;
  isNew?: boolean;
  isHot?: boolean;
}

// 示例特效数据
const SAMPLE_EFFECTS: Effect[] = [
  { id: 'effect1', name: '闪光', category: 'popular', icon: 'bolt', isHot: true },
  { id: 'effect2', name: '霓虹', category: 'popular', icon: 'lightbulb', isNew: true },
  { id: 'effect3', name: '复古', category: 'style', icon: 'film' },
  { id: 'effect4', name: '梦幻', category: 'beauty', icon: 'cloud' },
  { id: 'effect5', name: '电影感', category: 'style', icon: 'video', isHot: true },
  { id: 'effect6', name: '黑白', category: 'style', icon: 'adjust' },
  { id: 'effect7', name: '变声', category: 'funny', icon: 'microphone', isNew: true },
  { id: 'effect8', name: '卡通脸', category: 'funny', icon: 'smile' },
  { id: 'effect9', name: '大头', category: 'funny', icon: 'user' },
  { id: 'effect10', name: '抖动', category: 'dynamic', icon: 'spinner' },
  { id: 'effect11', name: '自然美颜', category: 'beauty', icon: 'magic' },
  { id: 'effect12', name: '柔光', category: 'beauty', icon: 'sun' },
  { id: 'effect13', name: '粉嫩', category: 'beauty', icon: 'heart' },
  { id: 'effect14', name: '赛博朋克', category: 'style', icon: 'robot', isNew: true },
  { id: 'effect15', name: '水彩', category: 'style', icon: 'palette' },
  { id: 'effect16', name: '油画', category: 'style', icon: 'paint-brush' },
  { id: 'effect17', name: '雨天', category: 'scene', icon: 'cloud-rain' },
  { id: 'effect18', name: '雪景', category: 'scene', icon: 'snowflake' },
  { id: 'effect19', name: '星空', category: 'scene', icon: 'star', isHot: true },
  { id: 'effect20', name: '波纹', category: 'dynamic', icon: 'water' },
  { id: 'effect21', name: '粒子', category: 'dynamic', icon: 'atom' },
  { id: 'effect22', name: '烟雾', category: 'dynamic', icon: 'smoke', isNew: true },
];

interface EffectSelectorProps {
  onSelectEffect: (effect: Effect) => void;
  selectedEffect?: string;
}

const EffectSelector: React.FC<EffectSelectorProps> = ({
  onSelectEffect,
  selectedEffect
}) => {
  const [activeCategory, setActiveCategory] = useState('popular');
  
  // 过滤当前类别的特效
  const currentCategoryEffects = SAMPLE_EFFECTS.filter(
    effect => effect.category === activeCategory
  );
  
  // 渲染特效项
  const renderEffectItem = ({ item }: { item: Effect }) => (
    <TouchableOpacity 
      style={[
        styles.effectItem,
        selectedEffect === item.id && styles.effectItemSelected
      ]}
      onPress={() => onSelectEffect(item)}
    >
      <View style={styles.effectIconContainer}>
        <FontAwesome5 
          name={item.icon} 
          size={24} 
          color={selectedEffect === item.id ? '#FF4040' : '#fff'} 
        />
        
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>新</Text>
          </View>
        )}
        
        {item.isHot && (
          <View style={styles.hotBadge}>
            <Text style={styles.badgeText}>热</Text>
          </View>
        )}
      </View>
      <Text 
        style={[
          styles.effectName,
          selectedEffect === item.id && styles.effectNameSelected
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* 类别切换 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {EFFECT_CATEGORIES.map(category => (
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
      <FlatList
        data={currentCategoryEffects}
        keyExtractor={(item) => item.id}
        numColumns={4}
        renderItem={renderEffectItem}
        contentContainerStyle={styles.effectsGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 10,
  },
  categoryContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  effectsGrid: {
    paddingHorizontal: 15,
  },
  effectItem: {
    width: (screenWidth - 60) / 4,
    marginBottom: 15,
    alignItems: 'center',
  },
  effectItemSelected: {
    opacity: 1,
  },
  effectIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#40FFAA',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hotBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4040',
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
  effectNameSelected: {
    color: '#FF4040',
    fontWeight: 'bold',
  }
});

export default EffectSelector; 