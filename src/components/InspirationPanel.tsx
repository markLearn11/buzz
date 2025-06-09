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
  PanResponder,
  FlatList
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 灵感类别
type InspirationCategory = 'trending' | 'challenge' | 'dance' | 'comedy' | 'food' | 'travel' | 'fashion';

// 灵感项
interface InspirationItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // 实际应用中应该是一个真实的缩略图URL
  category: InspirationCategory;
  views: number;
  likes: number;
}

interface InspirationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectInspiration: (inspiration: InspirationItem) => void;
}

const InspirationPanel: React.FC<InspirationPanelProps> = ({
  visible,
  onClose,
  onSelectInspiration
}) => {
  // 面板动画值
  const panelHeight = screenHeight * 0.8;
  const translateY = useState(new Animated.Value(panelHeight))[0];
  
  // 当前选择的类别
  const [activeCategory, setActiveCategory] = useState<InspirationCategory>('trending');
  
  // 灵感数据 (模拟数据)
  const inspirations: InspirationItem[] = [
    // 热门趋势
    { 
      id: 'insp1', 
      title: '2023最火舞蹈', 
      description: '跟着节拍一起来跳最火的舞蹈吧！', 
      thumbnail: 'https://example.com/insp1.jpg', 
      category: 'trending',
      views: 1500000,
      likes: 280000
    },
    { 
      id: 'insp2', 
      title: '创意转场特辑', 
      description: '学习这些创意转场，让你的视频更专业！', 
      thumbnail: 'https://example.com/insp2.jpg', 
      category: 'trending',
      views: 980000,
      likes: 156000
    },
    { 
      id: 'insp3', 
      title: '日常Vlog拍摄技巧', 
      description: '简单几步，拍出高质量Vlog', 
      thumbnail: 'https://example.com/insp3.jpg', 
      category: 'trending',
      views: 750000,
      likes: 120000
    },
    
    // 挑战
    { 
      id: 'insp4', 
      title: '#三连拍挑战', 
      description: '参与最新的三连拍挑战，展示你的创意！', 
      thumbnail: 'https://example.com/insp4.jpg', 
      category: 'challenge',
      views: 2500000,
      likes: 450000
    },
    { 
      id: 'insp5', 
      title: '#换装挑战', 
      description: '一秒变装，展示你的多面魅力', 
      thumbnail: 'https://example.com/insp5.jpg', 
      category: 'challenge',
      views: 1800000,
      likes: 320000
    },
    
    // 舞蹈
    { 
      id: 'insp6', 
      title: '简单街舞教学', 
      description: '零基础也能学会的街舞动作', 
      thumbnail: 'https://example.com/insp6.jpg', 
      category: 'dance',
      views: 1200000,
      likes: 230000
    },
    { 
      id: 'insp7', 
      title: '流行歌曲舞蹈', 
      description: '最新流行歌曲的舞蹈教程', 
      thumbnail: 'https://example.com/insp7.jpg', 
      category: 'dance',
      views: 950000,
      likes: 180000
    },
    
    // 搞笑
    { 
      id: 'insp8', 
      title: '生活中的尴尬瞬间', 
      description: '搞笑演绎生活中的尴尬场景', 
      thumbnail: 'https://example.com/insp8.jpg', 
      category: 'comedy',
      views: 1600000,
      likes: 350000
    },
    { 
      id: 'insp9', 
      title: '创意配音', 
      description: '为经典场景配上搞笑的声音', 
      thumbnail: 'https://example.com/insp9.jpg', 
      category: 'comedy',
      views: 1100000,
      likes: 220000
    },
    
    // 美食
    { 
      id: 'insp10', 
      title: '一分钟快手菜', 
      description: '简单快速的美食制作教程', 
      thumbnail: 'https://example.com/insp10.jpg', 
      category: 'food',
      views: 890000,
      likes: 165000
    },
    { 
      id: 'insp11', 
      title: '创意甜点', 
      description: '在家就能做的精美甜点', 
      thumbnail: 'https://example.com/insp11.jpg', 
      category: 'food',
      views: 760000,
      likes: 140000
    },
    
    // 旅行
    { 
      id: 'insp12', 
      title: '小众旅行地推荐', 
      description: '不为人知的美丽旅行目的地', 
      thumbnail: 'https://example.com/insp12.jpg', 
      category: 'travel',
      views: 850000,
      likes: 160000
    },
    { 
      id: 'insp13', 
      title: '城市一日游', 
      description: '如何在一天内玩转一座城市', 
      thumbnail: 'https://example.com/insp13.jpg', 
      category: 'travel',
      views: 720000,
      likes: 130000
    },
    
    // 时尚
    { 
      id: 'insp14', 
      title: '日常穿搭技巧', 
      description: '简单几件单品，穿出时尚感', 
      thumbnail: 'https://example.com/insp14.jpg', 
      category: 'fashion',
      views: 930000,
      likes: 175000
    },
    { 
      id: 'insp15', 
      title: '季节穿搭指南', 
      description: '适合当季的穿搭灵感', 
      thumbnail: 'https://example.com/insp15.jpg', 
      category: 'fashion',
      views: 800000,
      likes: 150000
    },
  ];
  
  // 类别列表
  const categories: { id: InspirationCategory; name: string }[] = [
    { id: 'trending', name: '热门' },
    { id: 'challenge', name: '挑战' },
    { id: 'dance', name: '舞蹈' },
    { id: 'comedy', name: '搞笑' },
    { id: 'food', name: '美食' },
    { id: 'travel', name: '旅行' },
    { id: 'fashion', name: '时尚' }
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
  
  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // 过滤当前类别的灵感
  const currentCategoryInspirations = inspirations.filter(
    inspiration => inspiration.category === activeCategory
  );
  
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
          <Text style={styles.panelTitle}>创作灵感</Text>
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
        
        {/* 灵感列表 */}
        <FlatList
          data={currentCategoryInspirations}
          keyExtractor={(item) => item.id}
          style={styles.inspirationList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.inspirationItem}
              onPress={() => onSelectInspiration(item)}
            >
              <View style={styles.inspirationThumbnailContainer}>
                {/* 实际应用中应该使用真实的缩略图 */}
                <View style={styles.inspirationThumbnail}>
                  <Ionicons name="bulb-outline" size={30} color="#fff" />
                </View>
              </View>
              
              <View style={styles.inspirationContent}>
                <Text style={styles.inspirationTitle}>{item.title}</Text>
                <Text style={styles.inspirationDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.inspirationStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={16} color="#aaa" />
                    <Text style={styles.statText}>{formatNumber(item.views)}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Ionicons name="heart-outline" size={16} color="#aaa" />
                    <Text style={styles.statText}>{formatNumber(item.likes)}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity style={styles.useButton}>
                <Text style={styles.useButtonText}>使用</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
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
  inspirationList: {
    flex: 1,
  },
  inspirationItem: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
  },
  inspirationThumbnailContainer: {
    marginRight: 12,
  },
  inspirationThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inspirationContent: {
    flex: 1,
    paddingRight: 10,
  },
  inspirationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inspirationDescription: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  inspirationStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
  },
  useButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default InspirationPanel; 