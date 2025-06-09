import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  PanResponder,
  Animated,
  Modal,
  Dimensions,
  ColorValue
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 文本样式选项
const TEXT_COLORS: ColorValue[] = [
  '#FFFFFF', '#000000', '#FF4040', '#40A0FF', '#40FF40', 
  '#FFFF40', '#FF40FF', '#40FFFF', '#FF8000', '#8000FF'
];

const TEXT_FONTS = [
  { id: 'default', name: '默认' },
  { id: 'bold', name: '粗体' },
  { id: 'italic', name: '斜体' },
  { id: 'serif', name: '衬线' },
  { id: 'monospace', name: '等宽' }
];

const TEXT_STYLES = [
  { id: 'normal', name: '普通', icon: 'text-fields' },
  { id: 'shadow', name: '阴影', icon: 'format-color-fill' },
  { id: 'outline', name: '描边', icon: 'format-color-text' },
  { id: 'highlight', name: '高亮', icon: 'highlight' }
];

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: ColorValue;
  font: string;
  style: string;
  zIndex: number;
}

interface TextOverlayProps {
  texts: TextItem[];
  onTextChange: (texts: TextItem[]) => void;
  containerWidth: number;
  containerHeight: number;
  editable?: boolean;
}

const TextOverlay: React.FC<TextOverlayProps> = ({
  texts,
  onTextChange,
  containerWidth,
  containerHeight,
  editable = true
}) => {
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingText, setEditingText] = useState<TextItem | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  
  // 添加新文本
  const handleAddText = () => {
    const newText: TextItem = {
      id: `text_${Date.now()}`,
      text: '点击编辑文字',
      x: containerWidth / 2 - 50,
      y: containerHeight / 2 - 20,
      scale: 1,
      rotation: 0,
      color: '#FFFFFF',
      font: 'default',
      style: 'normal',
      zIndex: texts.length + 1
    };
    
    const updatedTexts = [...texts, newText];
    onTextChange(updatedTexts);
    setSelectedTextId(newText.id);
    setEditingText(newText);
    setTextInputValue(newText.text);
    setShowTextEditor(true);
  };
  
  // 选择文本
  const handleSelectText = (textId: string) => {
    if (!editable) return;
    
    setSelectedTextId(textId);
    const text = texts.find(t => t.id === textId);
    if (text) {
      setEditingText(text);
      setTextInputValue(text.text);
    }
  };
  
  // 编辑文本
  const handleEditText = () => {
    if (selectedTextId && editingText) {
      setShowTextEditor(true);
    }
  };
  
  // 删除文本
  const handleDeleteText = () => {
    if (selectedTextId) {
      const updatedTexts = texts.filter(text => text.id !== selectedTextId);
      onTextChange(updatedTexts);
      setSelectedTextId(null);
      setEditingText(null);
    }
  };
  
  // 保存文本编辑
  const handleSaveTextEdit = () => {
    if (editingText) {
      const updatedTexts = texts.map(text => 
        text.id === editingText.id ? { ...editingText, text: textInputValue } : text
      );
      onTextChange(updatedTexts);
      setShowTextEditor(false);
    }
  };
  
  // 更新文本颜色
  const handleUpdateTextColor = (color: ColorValue) => {
    if (editingText) {
      const updatedText = { ...editingText, color };
      setEditingText(updatedText);
      
      const updatedTexts = texts.map(text => 
        text.id === updatedText.id ? updatedText : text
      );
      onTextChange(updatedTexts);
    }
  };
  
  // 更新文本字体
  const handleUpdateTextFont = (font: string) => {
    if (editingText) {
      const updatedText = { ...editingText, font };
      setEditingText(updatedText);
      
      const updatedTexts = texts.map(text => 
        text.id === updatedText.id ? updatedText : text
      );
      onTextChange(updatedTexts);
    }
  };
  
  // 更新文本样式
  const handleUpdateTextStyle = (style: string) => {
    if (editingText) {
      const updatedText = { ...editingText, style };
      setEditingText(updatedText);
      
      const updatedTexts = texts.map(text => 
        text.id === updatedText.id ? updatedText : text
      );
      onTextChange(updatedTexts);
    }
  };
  
  // 渲染文本项
  const renderTextItem = (text: TextItem) => {
    // 创建拖动手势
    const pan = useRef(new Animated.ValueXY({ x: text.x, y: text.y })).current;
    
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onPanResponderGrant: () => {
        handleSelectText(text.id);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // 更新文本位置
        const updatedTexts = texts.map(item => 
          item.id === text.id ? { ...item, x: pan.x._value, y: pan.y._value } : item
        );
        onTextChange(updatedTexts);
      }
    });
    
    // 获取文本样式
    const getTextStyle = () => {
      const baseStyle = {
        color: text.color,
        fontWeight: text.font === 'bold' ? 'bold' : 'normal',
        fontStyle: text.font === 'italic' ? 'italic' : 'normal',
        fontFamily: 
          text.font === 'serif' ? 'serif' : 
          text.font === 'monospace' ? 'monospace' : undefined
      };
      
      switch (text.style) {
        case 'shadow':
          return {
            ...baseStyle,
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 3
          };
        case 'outline':
          return {
            ...baseStyle,
            textShadowColor: '#000',
            textShadowOffset: { width: -1, height: -1 },
            textShadowRadius: 1
          };
        case 'highlight':
          return {
            ...baseStyle,
            backgroundColor: 'rgba(255, 255, 0, 0.3)',
            padding: 2
          };
        default:
          return baseStyle;
      }
    };
    
    return (
      <Animated.View
        key={text.id}
        style={[
          styles.textContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: text.scale },
              { rotate: `${text.rotation}deg` }
            ],
            zIndex: text.zIndex
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Text 
          style={[
            styles.textItem, 
            getTextStyle(),
            selectedTextId === text.id && styles.selectedText
          ]}
        >
          {text.text}
        </Text>
      </Animated.View>
    );
  };
  
  // 渲染文本编辑器
  const renderTextEditor = () => {
    if (!editingText) return null;
    
    return (
      <Modal
        visible={showTextEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTextEditor(false)}
      >
        <View style={styles.editorContainer}>
          <View style={styles.editorContent}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorTitle}>编辑文字</Text>
              <TouchableOpacity onPress={() => setShowTextEditor(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textInput}
              value={textInputValue}
              onChangeText={setTextInputValue}
              multiline
              placeholder="输入文字内容"
              placeholderTextColor="#999"
              autoFocus
            />
            
            <Text style={styles.sectionTitle}>文字颜色</Text>
            <View style={styles.colorOptions}>
              {TEXT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.toString()}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editingText.color === color && styles.selectedColorOption
                  ]}
                  onPress={() => handleUpdateTextColor(color)}
                />
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>字体</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.fontOptions}
            >
              {TEXT_FONTS.map((font) => (
                <TouchableOpacity
                  key={font.id}
                  style={[
                    styles.fontOption,
                    editingText.font === font.id && styles.selectedFontOption
                  ]}
                  onPress={() => handleUpdateTextFont(font.id)}
                >
                  <Text 
                    style={[
                      styles.fontOptionText,
                      editingText.font === font.id && styles.selectedFontOptionText
                    ]}
                  >
                    {font.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>文字样式</Text>
            <View style={styles.styleOptions}>
              {TEXT_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleOption,
                    editingText.style === style.id && styles.selectedStyleOption
                  ]}
                  onPress={() => handleUpdateTextStyle(style.id)}
                >
                  <MaterialIcons 
                    name={style.icon} 
                    size={24} 
                    color={editingText.style === style.id ? '#FF4040' : '#fff'} 
                  />
                  <Text 
                    style={[
                      styles.styleOptionText,
                      editingText.style === style.id && styles.selectedStyleOptionText
                    ]}
                  >
                    {style.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.editorButtons}>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDeleteText}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>删除</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveTextEdit}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      {/* 文本项 */}
      {texts.map(renderTextItem)}
      
      {/* 添加文本按钮 */}
      {editable && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddText}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>添加文字</Text>
          </TouchableOpacity>
          
          {selectedTextId && (
            <TouchableOpacity style={styles.editButton} onPress={handleEditText}>
              <Ionicons name="create" size={24} color="#fff" />
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* 文本编辑器 */}
      {renderTextEditor()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textContainer: {
    position: 'absolute',
    minWidth: 30,
    minHeight: 20,
  },
  textItem: {
    fontSize: 20,
    textAlign: 'center',
  },
  selectedText: {
    borderWidth: 1,
    borderColor: '#FF4040',
    padding: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  editorContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  editorContent: {
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#FF4040',
  },
  fontOptions: {
    marginBottom: 15,
  },
  fontOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 15,
    marginRight: 10,
  },
  selectedFontOption: {
    backgroundColor: '#FF4040',
  },
  fontOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedFontOptionText: {
    fontWeight: 'bold',
  },
  styleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  styleOption: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  selectedStyleOption: {
    backgroundColor: 'rgba(255,64,64,0.2)',
    borderWidth: 1,
    borderColor: '#FF4040',
  },
  styleOptionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  selectedStyleOptionText: {
    color: '#FF4040',
  },
  editorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TextOverlay; 