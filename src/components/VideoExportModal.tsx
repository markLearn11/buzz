import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// 导出质量选项
export const EXPORT_QUALITY_OPTIONS = [
  { id: 'low', label: '流畅', description: '480p, 较小文件', value: 480 },
  { id: 'medium', label: '标清', description: '720p, 推荐', value: 720 },
  { id: 'high', label: '高清', description: '1080p, 较大文件', value: 1080 }
];

interface VideoExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (options: VideoExportOptions) => void;
  progress?: number; // 0-100
  isExporting?: boolean;
}

export interface VideoExportOptions {
  quality: number;
  saveToGallery: boolean;
  includeAudio: boolean;
  includeWatermark: boolean;
}

const VideoExportModal: React.FC<VideoExportModalProps> = ({
  visible,
  onClose,
  onExport,
  progress = 0,
  isExporting = false
}) => {
  const [quality, setQuality] = useState('medium');
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  
  // 处理导出
  const handleExport = () => {
    const selectedQuality = EXPORT_QUALITY_OPTIONS.find(q => q.id === quality);
    
    onExport({
      quality: selectedQuality ? selectedQuality.value : 720,
      saveToGallery,
      includeAudio,
      includeWatermark
    });
  };
  
  // 渲染导出进度
  const renderExportProgress = () => {
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>正在导出视频...</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        
        <Text style={styles.progressDescription}>
          请勿关闭应用，导出完成后视频将自动保存
        </Text>
      </View>
    );
  };
  
  // 渲染导出选项
  const renderExportOptions = () => {
    return (
      <View style={styles.optionsContainer}>
        <Text style={styles.title}>导出视频</Text>
        
        <Text style={styles.sectionTitle}>选择质量</Text>
        <View style={styles.qualityOptions}>
          {EXPORT_QUALITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.qualityOption,
                quality === option.id && styles.qualityOptionSelected
              ]}
              onPress={() => setQuality(option.id)}
            >
              <Text style={[
                styles.qualityLabel,
                quality === option.id && styles.qualityLabelSelected
              ]}>
                {option.label}
              </Text>
              <Text style={styles.qualityDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="photo-library" size={20} color="#fff" />
              <Text style={styles.settingText}>保存到相册</Text>
            </View>
            <Switch
              value={saveToGallery}
              onValueChange={setSaveToGallery}
              trackColor={{ false: '#444', true: '#FF4040' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="music-note" size={20} color="#fff" />
              <Text style={styles.settingText}>包含音频</Text>
            </View>
            <Switch
              value={includeAudio}
              onValueChange={setIncludeAudio}
              trackColor={{ false: '#444', true: '#FF4040' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="branding-watermark" size={20} color="#fff" />
              <Text style={styles.settingText}>添加水印</Text>
            </View>
            <Switch
              value={includeWatermark}
              onValueChange={setIncludeWatermark}
              trackColor={{ false: '#444', true: '#FF4040' }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportText}>导出</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {isExporting ? renderExportProgress() : renderExportOptions()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: screenWidth * 0.85,
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  qualityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  qualityOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  qualityOptionSelected: {
    backgroundColor: 'rgba(255,64,64,0.2)',
    borderWidth: 1,
    borderColor: '#FF4040',
  },
  qualityLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  qualityLabelSelected: {
    fontWeight: 'bold',
    color: '#FF4040',
  },
  qualityDescription: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  settingsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  exportButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  exportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF4040',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  progressDescription: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
});

export default VideoExportModal; 