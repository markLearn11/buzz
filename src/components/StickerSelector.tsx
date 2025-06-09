import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 贴纸分类
const STICKER_CATEGORIES = [
  { id: 'emoji', name: '表情', icon: 'emoji-emotions' },
  { id: 'animals', name: '动物', icon: 'pets' },
  { id: 'food', name: '美食', icon: 'fastfood' },
  { id: 'love', name: '爱心', icon: 'favorite' },
  { id: 'text', name: '文字', icon: 'text-fields' },
  { id: 'effects', name: '特效', icon: 'auto-fix-high' },
  { id: 'custom', name: '自定义', icon: 'add-photo-alternate' },
];

// 示例贴纸数据（实际项目中应该从API获取或本地存储）
const SAMPLE_STICKERS = {
  emoji: [
    { id: 'emoji_1', uri: 'https://example.com/stickers/emoji_1.png' },
    { id: 'emoji_2', uri: 'https://example.com/stickers/emoji_2.png' },
    // 更多表情贴纸...
  ],
  animals: [
    { id: 'animal_1', uri: 'https://example.com/stickers/animal_1.png' },
    { id: 'animal_2', uri: 'https://example.com/stickers/animal_2.png' },
    // 更多动物贴纸...
  ],
  // 其他分类的贴纸...
};

// 示例贴纸数据（使用emoji代替图片，实际应用中应使用真实贴纸图片）
const EMOJI_STICKERS = [
  '😀', '😂', '😍', '🥰', '😎', '🤩', '😇', '🤔', '😴', '😷',
  '👍', '👎', '👏', '🙌', '🤝', '👊', '✌️', '🤞', '🤟', '🤙',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💯', '💢',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑',
];

// 文字贴纸预设
const TEXT_STICKERS = [
  '哈哈哈', '666', 'OMG', 'WOW', '爱你', '棒棒哒', 
  '笑死我了', '厉害了', '太帅了', '美美哒'
];

export interface Sticker {
  id: string;
  uri?: string;
  emoji?: string;
  text?: string;
  width?: number;
  height?: number;
}

interface StickerSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: Sticker) => void;
}

const StickerSelector: React.FC<StickerSelectorProps> = ({ visible, onClose, onSelectSticker }) => {
  const [selectedCategory, setSelectedCategory] = useState('emoji');
  const [customText, setCustomText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSelectSticker = (sticker: Sticker) => {
    onSelectSticker(sticker);
    // 选择后不关闭，允许用户继续选择多个贴纸
  };
  
  const handleSelectEmoji = (emoji: string) => {
    handleSelectSticker({
      id: `emoji_${Date.now()}`,
      emoji
    });
  };
  
  const handleSelectTextSticker = (text: string) => {
    handleSelectSticker({
      id: `text_${Date.now()}`,
      text
    });
  };
  
  const handleAddCustomText = () => {
    if (customText.trim()) {
      handleSelectTextSticker(customText.trim());
      setCustomText('');
      setShowTextInput(false);
    }
  };
  
  const renderStickerItem = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity 
        style={styles.stickerItem} 
        onPress={() => handleSelectEmoji(item)}
      >
        <Text style={styles.emojiText}>{item}</Text>
      </TouchableOpacity>
    );
  };
  
  const renderTextStickerItem = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity 
        style={styles.textStickerItem} 
        onPress={() => handleSelectTextSticker(item)}
      >
        <Text style={styles.textStickerText}>{item}</Text>
      </TouchableOpacity>
    );
  };
  
  const renderContent = () => {
    switch (selectedCategory) {
      case 'emoji':
        return (
          <FlatList
            data={EMOJI_STICKERS.filter(emoji => 
              searchQuery ? emoji.includes(searchQuery) : true
            )}
            renderItem={renderStickerItem}
            keyExtractor={(item, index) => `emoji_${index}`}
            numColumns={5}
            contentContainerStyle={styles.stickerGrid}
          />
        );
        
      case 'text':
        return (
          <>
            <FlatList
              data={TEXT_STICKERS.filter(text => 
                searchQuery ? text.toLowerCase().includes(searchQuery.toLowerCase()) : true
              )}
              renderItem={renderTextStickerItem}
              keyExtractor={(item, index) => `text_${index}`}
              numColumns={2}
              contentContainerStyle={styles.textStickerGrid}
              ListHeaderComponent={
                <TouchableOpacity 
                  style={styles.addCustomTextBtn}
                  onPress={() => setShowTextInput(true)}
                >
                  <Ionicons name="add-circle" size={24} color="#FF4040" />
                  <Text style={styles.addCustomTextLabel}>添加自定义文字贴纸</Text>
                </TouchableOpacity>
              }
            />
            
            {showTextInput && (
              <View style={styles.customTextInputContainer}>
                <TextInput
                  style={styles.customTextInput}
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder="输入文字内容"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <View style={styles.customTextButtons}>
                  <TouchableOpacity onPress={() => setShowTextInput(false)}>
                    <Text style={styles.cancelText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={handleAddCustomText}
                  >
                    <Text style={styles.addButtonText}>添加</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        );
        
      // 其他分类可以根据需要添加
      default:
        return (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="construct-outline" size={48} color="#666" />
            <Text style={styles.comingSoonText}>更多贴纸即将上线</Text>
          </View>
        );
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>选择贴纸</Text>
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
            placeholder="搜索贴纸"
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
          {STICKER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialIcons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#FF4040' : '#fff'} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
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
    margin: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    height: 40,
  },
  categoryBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255,64,64,0.2)',
  },
  categoryText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FF4040',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  stickerGrid: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  stickerItem: {
    width: screenWidth / 5 - 20,
    height: screenWidth / 5 - 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
  },
  emojiText: {
    fontSize: 32,
  },
  textStickerGrid: {
    paddingBottom: 20,
  },
  textStickerItem: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,64,64,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addCustomTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FF4040',
  },
  addCustomTextLabel: {
    color: '#FF4040',
    marginLeft: 8,
    fontSize: 14,
  },
  customTextInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  customTextInput: {
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  customTextButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelText: {
    color: '#fff',
    padding: 8,
    marginRight: 15,
  },
  addButton: {
    backgroundColor: '#FF4040',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
});

export default StickerSelector; 