import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 音乐分类
const MUSIC_CATEGORIES = [
  { id: 'trending', name: '热门' },
  { id: 'new', name: '最新' },
  { id: 'recommend', name: '推荐' },
  { id: 'favorite', name: '收藏' },
  { id: 'local', name: '本地' }
];

// 示例音乐数据
const SAMPLE_MUSICS = [
  { id: 'music1', title: '热门BGM', artist: '抖音热歌', duration: 30, isHot: true },
  { id: 'music2', title: '轻快节奏', artist: '流行音乐', duration: 45, isNew: true },
  { id: 'music3', title: '舒缓钢琴曲', artist: '古典音乐', duration: 60 },
  { id: 'music4', title: '电子舞曲', artist: 'DJ混音', duration: 50, isHot: true },
  { id: 'music5', title: '欢快民谣', artist: '民谣歌手', duration: 40 },
  { id: 'music6', title: '流行热曲', artist: '热门歌手', duration: 35, isNew: true },
  { id: 'music7', title: '动感节拍', artist: '电音制作人', duration: 55, isHot: true },
  { id: 'music8', title: '悠扬旋律', artist: '器乐演奏家', duration: 65 },
];

export interface Music {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uri?: string;
  isHot?: boolean;
  isNew?: boolean;
}

interface MusicSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMusic: (music: Music) => void;
}

const MusicSelectorModal: React.FC<MusicSelectorModalProps> = ({
  visible,
  onClose,
  onSelectMusic
}) => {
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 处理音乐选择
  const handleSelectMusic = (music: Music) => {
    onSelectMusic(music);
    onClose();
  };
  
  // 播放/暂停音乐预览
  const handleTogglePlay = (musicId: string) => {
    // 实际应用中，这里应该实现音乐预览播放功能
    // 这里仅做状态切换演示
    if (isPlaying === musicId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(musicId);
    }
  };
  
  // 格式化时长
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 过滤音乐
  const filteredMusic = SAMPLE_MUSICS.filter(music => {
    if (searchQuery) {
      return music.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             music.artist.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });
  
  // 渲染音乐项
  const renderMusicItem = ({ item }: { item: Music }) => (
    <View style={styles.musicItem}>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => handleTogglePlay(item.id)}
      >
        <Ionicons 
          name={isPlaying === item.id ? 'pause-circle' : 'play-circle'} 
          size={36} 
          color="#FF4040" 
        />
      </TouchableOpacity>
      
      <View style={styles.musicInfo}>
        <View style={styles.musicTitleContainer}>
          <Text style={styles.musicTitle} numberOfLines={1}>{item.title}</Text>
          {item.isHot && <View style={styles.hotBadge}><Text style={styles.badgeText}>热</Text></View>}
          {item.isNew && <View style={styles.newBadge}><Text style={styles.badgeText}>新</Text></View>}
        </View>
        <Text style={styles.musicArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.musicDuration}>{formatDuration(item.duration)}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => handleSelectMusic(item)}
      >
        <Text style={styles.selectButtonText}>使用</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>选择音乐</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="搜索音乐"
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.categoryContainer}>
          <FlatList
            data={MUSIC_CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextActive
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4040" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMusic}
            keyExtractor={(item) => item.id}
            renderItem={renderMusicItem}
            contentContainerStyle={styles.musicList}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  categoryContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333',
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
  musicList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  musicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playButton: {
    marginRight: 15,
  },
  musicInfo: {
    flex: 1,
  },
  musicTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  musicTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  hotBadge: {
    backgroundColor: '#FF4040',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 5,
  },
  newBadge: {
    backgroundColor: '#40FFAA',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  musicArtist: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 3,
  },
  musicDuration: {
    color: '#777',
    fontSize: 12,
  },
  selectButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default MusicSelectorModal; 