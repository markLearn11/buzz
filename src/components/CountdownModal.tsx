import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CountdownModalProps {
  visible: boolean;
  onSelect: (seconds: number) => void;
  onCancel: () => void;
}

const CountdownModal: React.FC<CountdownModalProps> = ({ visible, onSelect, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.bg}>
        <View style={styles.card}>
          <Text style={styles.title}>选择倒计时</Text>
          {[3, 5, 10].map(val => (
            <TouchableOpacity key={val} style={styles.option} onPress={() => onSelect(val)}>
              <Text style={styles.optionText}>{val} 秒</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancel} onPress={onCancel}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    width: 220,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  option: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginVertical: 6,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  cancel: {
    marginTop: 16,
  },
  cancelText: {
    color: '#FF4040',
    fontSize: 15,
  },
});

export default CountdownModal; 