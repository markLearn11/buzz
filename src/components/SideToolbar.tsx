import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SideTool {
  id: string;
  icon: string;
  label: string;
}

interface SideToolbarProps {
  tools: SideTool[];
  onToolPress: (id: string) => void;
  beautifyEnabled?: boolean;
}

const SideToolbar: React.FC<SideToolbarProps> = ({ tools, onToolPress, beautifyEnabled }) => {
  return (
    <View style={styles.wrap}>
      {tools.map((tool, idx) => (
        <TouchableOpacity
          key={tool.id}
          style={[styles.btn, idx === 2 && { marginBottom: 18 }]}
          onPress={() => onToolPress(tool.id)}
          activeOpacity={0.85}
        >
          <View style={styles.circle}>
            <Ionicons name={tool.icon as any} size={24} color={tool.id === 'beauty' && beautifyEnabled ? '#FF4040' : '#fff'} />
          </View>
          <Text style={styles.label}>{tool.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  btn: {
    alignItems: 'center',
    marginVertical: 8,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(40,40,40,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    color: '#fff',
    fontSize: 12,
  },
});

export default SideToolbar; 