import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface CountdownModalProps {
  visible: boolean;
  onSelect: (seconds: number) => void;
  onCancel: () => void;
}

const CountdownModal: React.FC<CountdownModalProps> = ({
  visible,
  onSelect,
  onCancel
}) => {
  // 倒计时选项（秒）
  const countdownOptions = [3, 5, 10];
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.container}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>设置倒计时</Text>
              
              <View style={styles.optionsContainer}>
                {countdownOptions.map((seconds) => (
                  <TouchableOpacity
                    key={seconds}
                    style={styles.optionButton}
                    onPress={() => onSelect(seconds)}
                  >
                    <View style={styles.optionInner}>
                      <Ionicons name="timer-outline" size={24} color="#fff" />
                      <Text style={styles.optionText}>{seconds}秒</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modal: {
    width: screenWidth * 0.8,
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    alignItems: 'center',
  },
  optionInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CountdownModal; 