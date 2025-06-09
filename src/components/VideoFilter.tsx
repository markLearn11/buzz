import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ImageStyle
} from 'react-native';

// 由于React Native不直接支持CSS滤镜，我们使用简单的颜色调整来模拟滤镜效果
export const VIDEO_FILTERS = [
  { id: 'original', name: '原始', style: {} as ImageStyle },
  { id: 'grayscale', name: '黑白', style: { tintColor: '#888', opacity: 0.8 } as ImageStyle },
  { id: 'sepia', name: '复古', style: { tintColor: '#D2B48C', opacity: 0.8 } as ImageStyle },
  { id: 'warm', name: '暖色', style: { tintColor: '#FF9966', opacity: 0.2 } as ImageStyle },
  { id: 'cool', name: '冷色', style: { tintColor: '#66CCFF', opacity: 0.2 } as ImageStyle },
  { id: 'vivid', name: '鲜艳', style: { tintColor: '#FF0000', opacity: 0.1 } as ImageStyle },
  { id: 'fade', name: '褪色', style: { opacity: 0.7 } as ImageStyle },
  { id: 'dramatic', name: '戏剧', style: { tintColor: '#000', opacity: 0.1 } as ImageStyle },
  { id: 'vintage', name: '古典', style: { tintColor: '#A0522D', opacity: 0.3 } as ImageStyle },
  { id: 'bright', name: '明亮', style: { tintColor: '#FFF', opacity: 0.1 } as ImageStyle },
];

interface VideoFilterProps {
  thumbnailUri: string; // 视频缩略图URI，用于预览滤镜效果
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
}

const VideoFilter: React.FC<VideoFilterProps> = ({ 
  thumbnailUri, 
  selectedFilter, 
  onSelectFilter 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>滤镜</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {VIDEO_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterItem,
              selectedFilter === filter.id && styles.filterItemSelected
            ]}
            onPress={() => onSelectFilter(filter.id)}
          >
            <View style={styles.filterPreview}>
              {thumbnailUri ? (
                <Image 
                  source={{ uri: thumbnailUri }} 
                  style={[styles.filterThumbnail, filter.style]} 
                />
              ) : (
                <View style={[styles.filterPlaceholder, filter.style]} />
              )}
            </View>
            <Text style={styles.filterName}>{filter.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filtersContainer: {
    paddingBottom: 5,
  },
  filterItem: {
    alignItems: 'center',
    marginRight: 15,
    opacity: 0.7,
  },
  filterItemSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FF4040',
    borderRadius: 10,
    padding: 2,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    overflow: 'hidden',
    marginBottom: 5,
  },
  filterThumbnail: {
    width: '100%',
    height: '100%',
  },
  filterPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#666',
  },
  filterName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default VideoFilter; 