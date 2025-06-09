import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import ImageEditor from './ImageEditor';

const { width: screenWidth } = Dimensions.get('window');

interface PostEditorProps {
  images: string[];
  onSave?: (post: any) => void;
  onCancel?: () => void;
}

interface PostImage {
  uri: string;
  filter?: string;
  texts?: any[];
  stickers?: any[];
}

const PostEditor: React.FC<PostEditorProps> = ({ images, onSave, onCancel }) => {
  const [postImages, setPostImages] = useState<PostImage[]>(
    images.map(uri => ({ uri }))
  );
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowComment, setAllowComment] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // 热门话题示例
  const HOT_TOPICS = [
    '旅行', '美食', '时尚', '运动', '科技', '音乐', '电影', '摄影', '宠物', '生活'
  ];
  
  // 处理图片编辑
  const handleEditImage = (index: number) => {
    setEditingImageIndex(index);
  };
  
  // 保存编辑后的图片
  const handleSaveEditedImage = (editedImage: any) => {
    if (editingImageIndex !== null) {
      const newImages = [...postImages];
      newImages[editingImageIndex] = {
        ...newImages[editingImageIndex],
        ...editedImage
      };
      setPostImages(newImages);
      setEditingImageIndex(null);
    }
  };
  
  // 删除图片
  const handleDeleteImage = (index: number) => {
    Alert.alert(
      '删除图片',
      '确定要删除这张图片吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            const newImages = [...postImages];
            newImages.splice(index, 1);
            setPostImages(newImages);
          }
        }
      ]
    );
  };
  
  // 调整图片顺序
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === postImages.length - 1)
    ) {
      return;
    }
    
    const newImages = [...postImages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // 交换位置
    const temp = newImages[index];
    newImages[index] = newImages[newIndex];
    newImages[newIndex] = temp;
    
    setPostImages(newImages);
  };
  
  // 切换话题选择
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      if (selectedTopics.length < 3) {
        setSelectedTopics([...selectedTopics, topic]);
      } else {
        Alert.alert('提示', '最多只能选择3个话题');
      }
    }
  };
  
  // 保存图文动态
  const handleSavePost = () => {
    if (postImages.length === 0) {
      Alert.alert('提示', '请至少添加一张图片');
      return;
    }
    
    if (content.trim() === '') {
      Alert.alert('提示', '请输入动态内容');
      return;
    }
    
    if (onSave) {
      onSave({
        images: postImages,
        content,
        topic: selectedTopics,
        location,
        isPrivate,
        allowComment
      });
    }
  };
  
  // 渲染图片编辑器
  if (editingImageIndex !== null) {
    return (
      <ImageEditor
        imageUri={postImages[editingImageIndex].uri}
        onSave={handleSaveEditedImage}
        onCancel={() => setEditingImageIndex(null)}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 图片列表 */}
        <View style={styles.imagesContainer}>
          <Text style={styles.sectionTitle}>图片</Text>
          <FlatList
            data={postImages}
            keyExtractor={(item, index) => `image-${index}`}
            horizontal={false}
            renderItem={({ item, index }) => (
              <View style={styles.imageItem}>
                <Image source={{ uri: item.uri }} style={styles.image} />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={styles.imageAction} 
                    onPress={() => handleEditImage(index)}
                  >
                    <MaterialIcons name="edit" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.imageAction} 
                    onPress={() => handleDeleteImage(index)}
                  >
                    <MaterialIcons name="delete" size={24} color="#fff" />
                  </TouchableOpacity>
                  {index > 0 && (
                    <TouchableOpacity 
                      style={styles.imageAction} 
                      onPress={() => handleMoveImage(index, 'up')}
                    >
                      <MaterialIcons name="arrow-upward" size={24} color="#fff" />
                    </TouchableOpacity>
                  )}
                  {index < postImages.length - 1 && (
                    <TouchableOpacity 
                      style={styles.imageAction} 
                      onPress={() => handleMoveImage(index, 'down')}
                    >
                      <MaterialIcons name="arrow-downward" size={24} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        </View>
        
        {/* 内容输入 */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>内容</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="分享你的想法..."
            placeholderTextColor="#999"
            multiline
            maxLength={2000}
          />
          <Text style={styles.wordCount}>{content.length}/2000</Text>
        </View>
        
        {/* 话题选择 */}
        <View style={styles.topicContainer}>
          <Text style={styles.sectionTitle}>话题</Text>
          <View style={styles.selectedTopics}>
            {selectedTopics.map((topic) => (
              <TouchableOpacity 
                key={topic} 
                style={styles.selectedTopic}
                onPress={() => toggleTopic(topic)}
              >
                <Text style={styles.selectedTopicText}>#{topic}</Text>
                <AntDesign name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
            {HOT_TOPICS.filter(t => !selectedTopics.includes(t)).map((topic) => (
              <TouchableOpacity 
                key={topic} 
                style={styles.topicItem}
                onPress={() => toggleTopic(topic)}
              >
                <Text style={styles.topicText}>#{topic}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* 位置信息 */}
        <View style={styles.locationContainer}>
          <Text style={styles.sectionTitle}>位置</Text>
          <View style={styles.locationInput}>
            <Ionicons name="location-outline" size={24} color="#999" />
            <TextInput
              style={styles.locationTextInput}
              value={location}
              onChangeText={setLocation}
              placeholder="添加位置"
              placeholderTextColor="#999"
            />
          </View>
        </View>
        
        {/* 隐私设置 */}
        <View style={styles.privacyContainer}>
          <Text style={styles.sectionTitle}>隐私设置</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>私密发布</Text>
            <TouchableOpacity 
              style={[styles.toggle, isPrivate && styles.toggleActive]}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View style={[styles.toggleHandle, isPrivate && styles.toggleHandleActive]} />
            </TouchableOpacity>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>允许评论</Text>
            <TouchableOpacity 
              style={[styles.toggle, allowComment && styles.toggleActive]}
              onPress={() => setAllowComment(!allowComment)}
            >
              <View style={[styles.toggleHandle, allowComment && styles.toggleHandleActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePost}>
          <Text style={styles.saveText}>发布</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  imagesContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  imageItem: {
    marginBottom: 15,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  imageActions: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
  imageAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  contentInput: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  wordCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  topicContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectedTopic: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4040',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTopicText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  topicScroll: {
    flexDirection: 'row',
  },
  topicItem: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  topicText: {
    color: '#fff',
    fontSize: 14,
  },
  locationContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 10,
  },
  locationTextInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  privacyContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#FF4040',
  },
  toggleHandle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleHandleActive: {
    transform: [{ translateX: 20 }],
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

export default PostEditor; 