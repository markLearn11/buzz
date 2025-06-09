import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

export interface ModeTab {
  id: string;
  label: string;
  badge?: string;
}

interface ModeTabsProps {
  tabs: ModeTab[];
  selectedId: string;
  onTabPress: (id: string) => void;
}

const ModeTabs: React.FC<ModeTabsProps> = ({ tabs, selectedId, onTabPress }) => {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.id} style={styles.tabBtn} onPress={() => onTabPress(tab.id)}>
            <Text style={[styles.tabText, selectedId === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            {tab.badge && <Text style={styles.tabBadge}>{tab.badge}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabBtn: {
    marginHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  tabText: {
    color: '#bbb',
    fontSize: 15,
    paddingVertical: 2,
  },
  tabTextActive: {
    color: '#FF4040',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabBadge: {
    color: '#fff',
    backgroundColor: '#FF4040',
    fontSize: 10,
    borderRadius: 8,
    paddingHorizontal: 5,
    marginLeft: 4,
    overflow: 'hidden',
  },
});

export default ModeTabs; 