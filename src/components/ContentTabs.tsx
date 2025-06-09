import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

export interface ContentTab {
  id: string;
  label: string;
}

interface ContentTabsProps {
  tabs: ContentTab[];
  selectedId: string;
  onTabPress: (id: string) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ tabs, selectedId, onTabPress }) => {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.id} style={styles.tabBtn} onPress={() => onTabPress(tab.id)}>
            <Text style={[styles.tabText, selectedId === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabBtn: {
    marginHorizontal: 18,
    paddingVertical: 4,
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    opacity: 1,
    borderBottomWidth: 3,
    borderBottomColor: '#FF4040',
    paddingBottom: 2,
  },
});

export default ContentTabs; 