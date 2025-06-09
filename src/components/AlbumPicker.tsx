import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';

export interface AlbumMediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
}

interface AlbumPickerProps {
  visible: boolean;
  medias: AlbumMediaItem[];
  selectedIds?: string[];
  onSelect: (selected: AlbumMediaItem[]) => void;
  onClose: () => void;
  maxSelect?: number;
}

const AlbumPicker: React.FC<AlbumPickerProps> = ({ visible, medias, selectedIds = [], onSelect, onClose, maxSelect = 9 }) => {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < maxSelect
        ? [...prev, id]
        : prev
    );
  };

  const handleConfirm = () => {
    onSelect(medias.filter(m => selected.includes(m.id)));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.bg}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>选择图片/视频</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <FlatList
            data={medias}
            keyExtractor={item => item.id}
            numColumns={4}
            renderItem={({ item }) => {
              const isSel = selected.includes(item.id);
              return (
                <TouchableOpacity
                  style={[styles.mediaItem, isSel && styles.mediaItemActive]}
                  onPress={() => toggleSelect(item.id)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
                  {item.type === 'video' && <Text style={styles.mediaType}>🎬</Text>}
                  {isSel && <View style={styles.selectedMark}><Text style={styles.selectedMarkText}>✓</Text></View>}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={{color:'#888',textAlign:'center',marginTop:20}}>暂无媒体</Text>}
            contentContainerStyle={styles.mediaList}
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>确定（{selected.length}）</Text>
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
  mediaList: {
    alignItems: 'flex-start',
  },
  mediaItem: {
    width: 68,
    alignItems: 'center',
    margin: 6,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(40,40,40,0.7)',
    position: 'relative',
  },
  mediaItemActive: {
    borderWidth: 2,
    borderColor: '#FF4040',
    backgroundColor: 'rgba(255,64,64,0.15)',
  },
  mediaThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#333',
  },
  mediaType: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    paddingHorizontal: 2,
  },
  selectedMark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4040',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMarkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: '#FF4040',
    borderRadius: 16,
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlbumPicker; 