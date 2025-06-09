import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import CountdownModal from './CountdownModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraControlsProps {
  onFlipCamera: () => void;
  onBeautyPress: () => void;
  onChallengePress: () => void;
  onInspirationPress: () => void;
  onSettingsPress: () => void;
  onEffectsPress: () => void;
  onMusicPress: () => void;
  onFlashPress?: () => void;
  onCountdownSelect?: (seconds: number) => void;
  flashMode?: 'on' | 'off' | 'auto';
  isRecording?: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  onFlipCamera,
  onBeautyPress,
  onChallengePress,
  onInspirationPress,
  onSettingsPress,
  onEffectsPress,
  onMusicPress,
  onFlashPress,
  onCountdownSelect,
  flashMode = 'off',
  isRecording = false
}) => {
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  
  // 处理倒计时选择
  const handleCountdownSelect = (seconds: number) => {
    setShowCountdownModal(false);
    // 调用父组件提供的回调函数
    if (onCountdownSelect) {
      onCountdownSelect(seconds);
    } else {
      // 如果没有提供回调，仅记录日志
      console.log(`倒计时 ${seconds} 秒`);
    }
  };
  
  // 获取闪光灯图标
  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on': return 'flash';
      case 'auto': return 'flash-auto';
      default: return 'flash-off';
    }
  };
  
  return (
    <View style={styles.container}>
      {/* 顶部控制栏 */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.topButton} onPress={() => {}}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.musicButton} onPress={onMusicPress}>
          <Ionicons name="musical-notes" size={20} color="#fff" />
          <Text style={styles.musicButtonText}>选择音乐</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.topButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* 右侧控制栏 */}
      <View style={styles.rightControls}>
        <TouchableOpacity style={styles.rightButton} onPress={onFlipCamera}>
          <View style={styles.rightButtonInner}>
            <Ionicons name="camera-reverse" size={28} color="#fff" />
          </View>
          <Text style={styles.rightButtonText}>翻转</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rightButton} onPress={() => setShowCountdownModal(true)}>
          <View style={styles.rightButtonInner}>
            <Ionicons name="timer-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.rightButtonText}>倒计时</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rightButton} onPress={onChallengePress}>
          <View style={styles.rightButtonInner}>
            <FontAwesome5 name="fire" size={24} color="#fff" />
          </View>
          <Text style={styles.rightButtonText}>挑战</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rightButton} onPress={onInspirationPress}>
          <View style={styles.rightButtonInner}>
            <Ionicons name="eye-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.rightButtonText}>灵感</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rightButton} onPress={onBeautyPress}>
          <View style={styles.rightButtonInner}>
            <Feather name="edit-3" size={24} color="#fff" />
          </View>
          <Text style={styles.rightButtonText}>美化</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rightButton} onPress={() => {}}>
          <View style={styles.rightButtonInner}>
            <MaterialIcons name="keyboard-arrow-down" size={28} color="#fff" />
          </View>
          <Text style={styles.rightButtonText}>更多</Text>
        </TouchableOpacity>
      </View>
      
      {/* 底部控制栏 - 这里只是占位，实际内容通常在父组件中 */}
      <View style={styles.bottomControls}>
        {/* 底部控制按钮通常在父组件中实现 */}
      </View>
      
      {/* 倒计时模态框 */}
      <CountdownModal
        visible={showCountdownModal}
        onSelect={handleCountdownSelect}
        onCancel={() => setShowCountdownModal(false)}
      />
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
    zIndex: 10,
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  musicButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  rightControls: {
    position: 'absolute',
    top: screenHeight * 0.2,
    right: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  rightButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rightButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  rightButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default CameraControls; 