import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';

// 预设的视频速度选项
export const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '正常' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2x' }
];

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ 
  currentSpeed, 
  onSpeedChange 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>播放速度</Text>
      
      <View style={styles.speedOptions}>
        {SPEED_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value.toString()}
            style={[
              styles.speedOption,
              currentSpeed === option.value && styles.speedOptionSelected
            ]}
            onPress={() => onSpeedChange(option.value)}
          >
            <Text 
              style={[
                styles.speedLabel,
                currentSpeed === option.value && styles.speedLabelSelected
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.description}>
        调整视频播放速度会影响最终导出的视频
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
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  speedOption: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  speedOptionSelected: {
    backgroundColor: '#FF4040',
  },
  speedLabel: {
    color: '#fff',
    fontSize: 14,
  },
  speedLabelSelected: {
    fontWeight: 'bold',
  },
  description: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
});

export default SpeedControl; 