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
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 挑战类别
type ChallengeCategory = 'hot' | 'new' | 'dance' | 'comedy' | 'talent' | 'daily';

// 挑战项
interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // 实际应用中应该是一个真实的缩略图URL
  category: ChallengeCategory;
  participants: number;
  views: number;
  duration: number; // 挑战视频的推荐时长（秒）
  isOfficial?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  musicTitle?: string;
  musicArtist?: string;
}

interface ChallengePanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectChallenge: (challenge: ChallengeItem) => void;
}

const ChallengePanel: React.FC<ChallengePanelProps> = ({
  visible,
  onClose,
  onSelectChallenge
}) => {
  // 面板动画值
  const panelHeight = screenHeight * 0.8;
  const translateY = useState(new Animated.Value(panelHeight))[0];
  
  // 当前选择的类别
  const [activeCategory, setActiveCategory] = useState<ChallengeCategory>('hot');
  
  // 挑战数据 (模拟数据)
  const challenges: ChallengeItem[] = [
    // 热门挑战
    { 
      id: 'chal1', 
      title: '#一起摇', 
      description: '跟着节奏一起摇起来，展示你的舞蹈天赋！', 
      thumbnail: 'https://example.com/chal1.jpg', 
      category: 'hot',
      participants: 5200000,
      views: 150000000,
      duration: 15,
      isOfficial: true,
      isHot: true,
      musicTitle: '摇摆舞曲',
      musicArtist: 'DJ小王'
    },
    { 
      id: 'chal2', 
      title: '#三连拍', 
      description: '三连拍挑战，展示三种不同造型！', 
      thumbnail: 'https://example.com/chal2.jpg', 
      category: 'hot',
      participants: 3800000,
      views: 98000000,
      duration: 10,
      isHot: true,
      musicTitle: '变身音乐',
      musicArtist: '电音达人'
    },
    { 
      id: 'chal3', 
      title: '#慢动作', 
      description: '用慢动作记录精彩瞬间！', 
      thumbnail: 'https://example.com/chal3.jpg', 
      category: 'hot',
      participants: 2500000,
      views: 75000000,
      duration: 20,
      isOfficial: true
    },
    
    // 新挑战
    { 
      id: 'chal4', 
      title: '#换装大法', 
      description: '一秒换装，展示你的多面魅力！', 
      thumbnail: 'https://example.com/chal4.jpg', 
      category: 'new',
      participants: 1200000,
      views: 35000000,
      duration: 15,
      isNew: true,
      musicTitle: '变装秀',
      musicArtist: '潮流音乐人'
    },
    { 
      id: 'chal5', 
      title: '#镜面反射', 
      description: '创意镜面效果挑战，让视频更有趣！', 
      thumbnail: 'https://example.com/chal5.jpg', 
      category: 'new',
      participants: 980000,
      views: 28000000,
      duration: 12,
      isNew: true
    },
    
    // 舞蹈挑战
    { 
      id: 'chal6', 
      title: '#流行舞蹈', 
      description: '跟着最新流行歌曲一起舞动！', 
      thumbnail: 'https://example.com/chal6.jpg', 
      category: 'dance',
      participants: 4500000,
      views: 120000000,
      duration: 15,
      isHot: true,
      musicTitle: '热门单曲',
      musicArtist: '国际巨星'
    },
    { 
      id: 'chal7', 
      title: '#街舞挑战', 
      description: '展示你的街舞技巧！', 
      thumbnail: 'https://example.com/chal7.jpg', 
      category: 'dance',
      participants: 2800000,
      views: 85000000,
      duration: 20,
      musicTitle: '街舞节奏',
      musicArtist: '嘻哈团队'
    },
    
    // 搞笑挑战
    { 
      id: 'chal8', 
      title: '#表情包挑战', 
      description: '模仿经典表情包，谁最像？', 
      thumbnail: 'https://example.com/chal8.jpg', 
      category: 'comedy',
      participants: 3200000,
      views: 95000000,
      duration: 10,
      isHot: true
    },
    { 
      id: 'chal9', 
      title: '#配音大师', 
      description: '为经典场景配上搞笑的声音！', 
      thumbnail: 'https://example.com/chal9.jpg', 
      category: 'comedy',
      participants: 1800000,
      views: 55000000,
      duration: 15
    },
    
    // 才艺挑战
    { 
      id: 'chal10', 
      title: '#才艺展示', 
      description: '展示你的独特才艺！', 
      thumbnail: 'https://example.com/chal10.jpg', 
      category: 'talent',
      participants: 2100000,
      views: 65000000,
      duration: 30
    },
    { 
      id: 'chal11', 
      title: '#一分钟技能', 
      description: '在一分钟内展示你的绝技！', 
      thumbnail: 'https://example.com/chal11.jpg', 
      category: 'talent',
      participants: 1500000,
      views: 48000000,
      duration: 60,
      isNew: true
    },
    
    // 日常挑战
    { 
      id: 'chal12', 
      title: '#生活小窍门', 
      description: '分享你的生活小技巧！', 
      thumbnail: 'https://example.com/chal12.jpg', 
      category: 'daily',
      participants: 2900000,
      views: 78000000,
      duration: 30
    },
    { 
      id: 'chal13', 
      title: '#一日Vlog', 
      description: '记录你的一天！', 
      thumbnail: 'https://example.com/chal13.jpg', 
      category: 'daily',
      participants: 1700000,
      views: 52000000,
      duration: 60
    },
  ];
  
  // 类别列表
  const categories: { id: ChallengeCategory; name: string }[] = [
    { id: 'hot', name: '热门' },
    { id: 'new', name: '最新' },
    { id: 'dance', name: '舞蹈' },
    { id: 'comedy', name: '搞笑' },
    { id: 'talent', name: '才艺' },
    { id: 'daily', name: '日常' }
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
  
  // 格式化时长
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  };
  
  // 过滤当前类别的挑战
  const currentCategoryChallenges = challenges.filter(
    challenge => challenge.category === activeCategory
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
          <Text style={styles.panelTitle}>热门挑战</Text>
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
        
        {/* 挑战列表 */}
        <FlatList
          data={currentCategoryChallenges}
          keyExtractor={(item) => item.id}
          style={styles.challengeList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.challengeItem}
              onPress={() => onSelectChallenge(item)}
            >
              <View style={styles.challengeThumbnailContainer}>
                {/* 实际应用中应该使用真实的缩略图 */}
                <View style={styles.challengeThumbnail}>
                  <FontAwesome5 name="fire" size={30} color="#FF4040" />
                </View>
                
                {/* 官方标签 */}
                {item.isOfficial && (
                  <View style={styles.officialBadge}>
                    <Text style={styles.badgeText}>官方</Text>
                  </View>
                )}
                
                {/* 热门标签 */}
                {item.isHot && (
                  <View style={styles.hotBadge}>
                    <Text style={styles.badgeText}>热</Text>
                  </View>
                )}
                
                {/* 新标签 */}
                {item.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.badgeText}>新</Text>
                  </View>
                )}
                
                {/* 时长标签 */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
                </View>
              </View>
              
              <View style={styles.challengeContent}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <Text style={styles.challengeDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.challengeStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={16} color="#aaa" />
                    <Text style={styles.statText}>{formatNumber(item.participants)}人参与</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={16} color="#aaa" />
                    <Text style={styles.statText}>{formatNumber(item.views)}次播放</Text>
                  </View>
                </View>
                
                {item.musicTitle && (
                  <View style={styles.musicInfo}>
                    <Ionicons name="musical-notes" size={14} color="#aaa" />
                    <Text style={styles.musicText} numberOfLines={1}>
                      {item.musicTitle} - {item.musicArtist}
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>参与</Text>
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
  challengeList: {
    flex: 1,
  },
  challengeItem: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    alignItems: 'center',
  },
  challengeThumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  challengeThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officialBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#40A0FF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hotBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF4040',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#40FF40',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
  },
  challengeContent: {
    flex: 1,
    paddingRight: 10,
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  challengeDescription: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 5,
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
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ChallengePanel; 