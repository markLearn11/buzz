import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';

export interface MusicItem {
  id: string;
  title: string;
  artist: string;
}

interface MusicSelectorModalProps {
  visible: boolean;
  musics: MusicItem[];
  onSelect: (music: MusicItem) => void;
  onClose: () => void;
}

const MusicSelectorModal: React.FC<MusicSelectorModalProps> = ({ visible, musics, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const filtered = musics.filter(m => m.title.includes(search) || m.artist.includes(search));

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.bg}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>选择音乐</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="搜索音乐/歌手"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            style={{marginTop: 10}}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.musicItem} onPress={() => onSelect(item)}>
                <Text style={styles.musicTitle}>{item.title}</Text>
                <Text style={styles.musicArtist}>{item.artist}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{color:'#888',textAlign:'center',marginTop:20}}>暂无音乐</Text>}
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
    width: 320,
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
  input: {
    backgroundColor: '#333',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 4,
  },
  musicItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  musicTitle: {
    color: '#fff',
    fontSize: 16,
  },
  musicArtist: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
});

export default MusicSelectorModal; 