import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface AudioVolumeControlProps {
  volume: number; // 0-1之间
  onVolumeChange: (volume: number) => void;
  showMuteButton?: boolean;
}

const AudioVolumeControl: React.FC<AudioVolumeControlProps> = ({ 
  volume, 
  onVolumeChange,
  showMuteButton = true
}) => {
  // 获取音量图标
  const getVolumeIcon = () => {
    if (volume === 0) return 'volume-mute';
    if (volume < 0.3) return 'volume-low';
    if (volume < 0.7) return 'volume-medium';
    return 'volume-high';
  };
  
  // 静音/取消静音
  const toggleMute = () => {
    if (volume > 0) {
      // 存储当前音量，然后静音
      onVolumeChange(0);
    } else {
      // 恢复到默认音量
      onVolumeChange(1.0);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>音量控制</Text>
      
      <View style={styles.volumeControl}>
        {showMuteButton && (
          <TouchableOpacity 
            style={styles.muteButton} 
            onPress={toggleMute}
          >
            <Ionicons 
              name={getVolumeIcon()} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        )}
        
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor="#FF4040"
          maximumTrackTintColor="#333"
          thumbTintColor="#FF4040"
        />
        
        <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
      </View>
      
      <Text style={styles.description}>
        调整视频音量会影响最终导出的视频
      </Text>
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
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  muteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  volumeValue: {
    color: '#fff',
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  description: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AudioVolumeControl; 