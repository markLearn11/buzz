import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export type CameraMode = 'photo' | 'video' | 'text' | 'burst' | 'template' | 'live';

interface CameraModeSwitcherProps {
  currentMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
}

const CameraModeSwitcher: React.FC<CameraModeSwitcherProps> = ({
  currentMode,
  onModeChange
}) => {
  // 定义可用的模式
  const modes: { id: CameraMode; label: string }[] = [
    { id: 'burst', label: '连拍' },
    { id: 'photo', label: '拍照' },
    { id: 'video', label: '视频' },
    { id: 'text', label: '文字' }
  ];
  
  // 底部额外模式
  const extraModes: { id: CameraMode; label: string; icon: string }[] = [
    { id: 'template', label: '模板', icon: 'grid' },
    { id: 'live', label: '直播', icon: 'radio' }
  ];
  
  return (
    <View style={styles.container}>
      {/* 主要模式切换器 */}
      <View style={styles.modesContainer}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              currentMode === mode.id && styles.modeButtonActive
            ]}
            onPress={() => onModeChange(mode.id)}
          >
            <Text
              style={[
                styles.modeText,
                currentMode === mode.id && styles.modeTextActive
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* 录制按钮 - 这里只是占位，实际内容通常在父组件中 */}
      <View style={styles.recordButtonContainer}>
        {/* 录制按钮通常在父组件中实现 */}
      </View>
      
      {/* 底部额外功能 */}
      <View style={styles.extraModesContainer}>
        {extraModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={styles.extraModeButton}
            onPress={() => onModeChange(mode.id)}
          >
            <View style={styles.extraModeIcon}>
              <Ionicons name={mode.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.extraModeText}>{mode.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* AI、图文、多段拍、随手拍等小功能按钮 */}
      <View style={styles.miniModesContainer}>
        <TouchableOpacity style={styles.miniModeButton}>
          <Text style={styles.miniModeText}>AI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.miniModeButton}>
          <Text style={styles.miniModeText}>图文</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.miniModeButton}>
          <Text style={styles.miniModeText}>多段拍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.miniModeButton}>
          <Text style={styles.miniModeText}>随手拍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30,
    alignItems: 'center',
  },
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modeButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  modeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recordButtonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  extraModesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 20,
  },
  extraModeButton: {
    alignItems: 'center',
  },
  extraModeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  extraModeText: {
    color: '#fff',
    fontSize: 12,
  },
  miniModesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  miniModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    marginHorizontal: 5,
  },
  miniModeText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default CameraModeSwitcher; 