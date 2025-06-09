import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';

export interface EffectItem {
  id: string;
  name: string;
  thumbnail: string;
}

interface EffectSelectorProps {
  visible: boolean;
  effects: EffectItem[];
  selectedId?: string;
  onSelect: (effect: EffectItem) => void;
  onClose: () => void;
}

const EffectSelector: React.FC<EffectSelectorProps> = ({ visible, effects, selectedId, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.bg}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>选择特效</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <FlatList
            data={effects}
            keyExtractor={item => item.id}
            numColumns={4}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.effectItem, selectedId === item.id && styles.effectItemActive]}
                onPress={() => onSelect(item)}
              >
                <Image source={{ uri: item.thumbnail }} style={styles.effectThumb} />
                <Text style={styles.effectName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{color:'#888',textAlign:'center',marginTop:20}}>暂无特效</Text>}
            contentContainerStyle={styles.effectList}
          />
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
    padding: 18,
    width: 340,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  close: {
    color: '#fff',
    fontSize: 22,
    padding: 4,
  },
  effectList: {
    alignItems: 'flex-start',
  },
  effectItem: {
    width: 68,
    alignItems: 'center',
    margin: 6,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(40,40,40,0.7)',
  },
  effectItemActive: {
    borderWidth: 2,
    borderColor: '#FF4040',
    backgroundColor: 'rgba(255,64,64,0.15)',
  },
  effectThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#333',
  },
  effectName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default EffectSelector; 