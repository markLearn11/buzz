import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Dimensions,
  TextStyle
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 文本样式预设
const TEXT_STYLES = [
  { id: 'default', name: '默认', fontFamily: 'System', fontSize: 24, color: '#FFFFFF', backgroundColor: 'transparent' },
  { id: 'bold', name: '粗体', fontFamily: 'System', fontSize: 24, fontWeight: 'bold' as 'bold', color: '#FFFFFF', backgroundColor: 'transparent' },
  { id: 'shadow', name: '阴影', fontFamily: 'System', fontSize: 24, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3, backgroundColor: 'transparent' },
  { id: 'outline', name: '描边', fontFamily: 'System', fontSize: 24, color: '#FFFFFF', borderColor: '#000', borderWidth: 1, backgroundColor: 'transparent' },
  { id: 'neon', name: '霓虹', fontFamily: 'System', fontSize: 24, color: '#00FFFF', textShadowColor: '#00FFFF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10, backgroundColor: 'transparent' },
  { id: 'bubble', name: '气泡', fontFamily: 'System', fontSize: 24, color: '#000000', backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 12 },
  { id: 'marker', name: '标记', fontFamily: 'System', fontSize: 24, color: '#FFFFFF', backgroundColor: 'rgba(255,64,64,0.8)', padding: 8, borderRadius: 4 },
];

// 文本颜色选项
const TEXT_COLORS = [
  '#FFFFFF', '#000000', '#FF4040', '#40A0FF', '#FFAA40', 
  '#AA40FF', '#40FFAA', '#FF40AA', '#AAFF40', '#40FFFF'
];

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  styleId: string;
  color: string;
  fontSize: number;
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [tempStyleId, setTempStyleId] = useState('default');
  const [tempColor, setTempColor] = useState('#FFFFFF');
  const [tempFontSize, setTempFontSize] = useState(24);
  
  // 创建文本项的动画值和手势响应
  const createPanResponder = (id: string) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const lastScale = useRef(1);
    const lastRotation = useRef(0);
    const rotation = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedId(id);
        pan.setOffset({
          x: pan.x as any,
          y: pan.y as any
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
        const updatedTexts = texts.map(t => {
          if (t.id === id) {
            return {
              ...t,
              x: t.x + (pan.x as any)._value,
              y: t.y + (pan.y as any)._value,
            };
          }
          return t;
        });
        
        onTextChange(updatedTexts);
      }
    });
    
    return { pan, rotation, scale, panResponder };
  };
  
  // 为每个文本项创建动画和手势
  const textRefs = useRef<{[key: string]: {
    pan: Animated.ValueXY,
    rotation: Animated.Value,
    scale: Animated.Value,
    panResponder: any
  }}>({});
  
  // 确保每个文本项都有对应的手势响应器
  texts.forEach(text => {
    if (!textRefs.current[text.id]) {
      textRefs.current[text.id] = createPanResponder(text.id);
    }
  });
  
  // 添加新文本
  const addNewText = () => {
    const newId = `text_${Date.now()}`;
    const newText: TextItem = {
      id: newId,
      text: '点击编辑文本',
      x: containerWidth / 2 - 50,
      y: containerHeight / 2 - 20,
      rotation: 0,
      scale: 1,
      styleId: 'default',
      color: '#FFFFFF',
      fontSize: 24,
      zIndex: texts.length + 1
    };
    
    const updatedTexts = [...texts, newText];
    onTextChange(updatedTexts);
    setSelectedId(newId);
    setEditingId(newId);
    setEditText('点击编辑文本');
  };
  
  // 删除文本
  const deleteText = (id: string) => {
    const updatedTexts = texts.filter(t => t.id !== id);
    onTextChange(updatedTexts);
    setSelectedId(null);
  };
  
  // 编辑文本
  const startEditing = (id: string) => {
    const text = texts.find(t => t.id === id);
    if (text) {
      setEditingId(id);
      setEditText(text.text);
    }
  };
  
  // 保存编辑后的文本
  const saveEditText = () => {
    if (!editingId) return;
    
    const updatedTexts = texts.map(t => {
      if (t.id === editingId) {
        return { ...t, text: editText };
      }
      return t;
    });
    
    onTextChange(updatedTexts);
    setEditingId(null);
  };
  
  // 打开样式编辑器
  const openStyleEditor = (id: string) => {
    const text = texts.find(t => t.id === id);
    if (text) {
      setSelectedId(id);
      setTempStyleId(text.styleId);
      setTempColor(text.color);
      setTempFontSize(text.fontSize);
      setShowStyleModal(true);
    }
  };
  
  // 应用样式
  const applyStyle = () => {
    if (!selectedId) return;
    
    const updatedTexts = texts.map(t => {
      if (t.id === selectedId) {
        return { 
          ...t, 
          styleId: tempStyleId,
          color: tempColor,
          fontSize: tempFontSize
        };
      }
      return t;
    });
    
    onTextChange(updatedTexts);
    setShowStyleModal(false);
  };
  
  // 获取文本样式
  const getTextStyle = (text: TextItem): TextStyle => {
    const baseStyle = TEXT_STYLES.find(s => s.id === text.styleId) || TEXT_STYLES[0];
    const { id, name, ...styleProps } = baseStyle;
    return {
      ...styleProps,
      color: text.color,
      fontSize: text.fontSize,
    } as TextStyle;
  };
  
  // 渲染文本编辑器
  const renderTextEditor = () => {
    if (!editingId) return null;
    
    return (
      <Modal
        transparent
        animationType="fade"
        visible={!!editingId}
        onRequestClose={() => saveEditText()}
      >
        <View style={styles.modalContainer}>
          <View style={styles.editorContainer}>
            <Text style={styles.editorTitle}>编辑文本</Text>
            
            <TextInput
              style={styles.textInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              placeholderTextColor="#999"
            />
            
            <View style={styles.editorButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingId(null)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveEditText}>
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  // 渲染样式编辑器
  const renderStyleEditor = () => {
    return (
      <Modal
        transparent
        animationType="slide"
        visible={showStyleModal}
        onRequestClose={() => setShowStyleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.styleEditorContainer}>
            <Text style={styles.editorTitle}>文本样式</Text>
            
            <Text style={styles.sectionTitle}>预设样式</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleList}>
              {TEXT_STYLES.map((style) => {
                const { id, name, ...styleProps } = style;
                return (
                  <TouchableOpacity 
                    key={style.id} 
                    style={[styles.styleItem, tempStyleId === style.id && styles.styleItemActive]}
                    onPress={() => setTempStyleId(style.id)}
                  >
                    <Text style={[styles.stylePreview, styleProps as TextStyle]}>{style.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>文本颜色</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorList}>
              {TEXT_COLORS.map((color) => (
                <TouchableOpacity 
                  key={color} 
                  style={[styles.colorItem, { backgroundColor: color }, tempColor === color && styles.colorItemActive]}
                  onPress={() => setTempColor(color)}
                />
              ))}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>字体大小: {tempFontSize}</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity onPress={() => setTempFontSize(Math.max(12, tempFontSize - 2))}>
                <Ionicons name="remove-circle" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.sizePreview}>
                <Text style={{ fontSize: tempFontSize * 0.5, color: '#fff' }}>A</Text>
              </View>
              
              <TouchableOpacity onPress={() => setTempFontSize(Math.min(72, tempFontSize + 2))}>
                <Ionicons name="add-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.editorButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowStyleModal(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={applyStyle}>
                <Text style={styles.saveText}>应用</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]}>
      {texts.map((text) => {
        const ref = textRefs.current[text.id];
        if (!ref) return null;
        
        const textStyle = getTextStyle(text);
        
        return (
          <Animated.View
            key={text.id}
            style={[
              styles.textContainer,
              {
                transform: [
                  { translateX: ref.pan.x },
                  { translateY: ref.pan.y },
                  { rotate: `${text.rotation}deg` },
                  { scale: text.scale }
                ],
                left: text.x,
                top: text.y,
                zIndex: text.zIndex,
              }
            ]}
            {...(editable ? ref.panResponder.panHandlers : {})}
          >
            <Text style={[styles.text, textStyle]}>{text.text}</Text>
            
            {editable && selectedId === text.id && (
              <View style={styles.textControls}>
                <TouchableOpacity style={styles.controlButton} onPress={() => startEditing(text.id)}>
                  <MaterialIcons name="edit" size={18} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} onPress={() => openStyleEditor(text.id)}>
                  <MaterialIcons name="format-color-text" size={18} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} onPress={() => deleteText(text.id)}>
                  <MaterialIcons name="delete" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );
      })}
      
      {editable && (
        <TouchableOpacity style={styles.addButton} onPress={addNewText}>
          <Ionicons name="add-circle" size={24} color="#FF4040" />
          <Text style={styles.addButtonText}>添加文字</Text>
        </TouchableOpacity>
      )}
      
      {renderTextEditor()}
      {renderStyleEditor()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  textContainer: {
    position: 'absolute',
    minWidth: 30,
    minHeight: 30,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    padding: 5,
  },
  textControls: {
    position: 'absolute',
    top: -30,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 5,
  },
  controlButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer: {
    width: screenWidth * 0.8,
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
  },
  styleEditorContainer: {
    width: screenWidth * 0.9,
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  editorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  editorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  styleList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  styleItem: {
    marginRight: 15,
    alignItems: 'center',
    opacity: 0.7,
  },
  styleItemActive: {
    opacity: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#FF4040',
  },
  stylePreview: {
    fontSize: 16,
    padding: 8,
  },
  colorList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  colorItem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  colorItemActive: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  sizePreview: {
    width: 50,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TextOverlay; 