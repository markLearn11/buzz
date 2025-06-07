import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeProvider';

interface SettingsScreenBaseProps {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  scrollEnabled?: boolean;
}

/**
 * 设置屏幕的基础组件，提供标准化的头部和布局，支持暗黑模式和亮色模式
 */
const SettingsScreenBase: React.FC<SettingsScreenBaseProps> = ({
  title,
  children,
  showBackButton = true,
  scrollEnabled = true,
}) => {
  const navigation = useNavigation();
  const { isDark, colors } = useTheme();

  const contentComponent = scrollEnabled ? (
    <ScrollView 
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.contentContainer]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? colors.primary : colors.white }
      ]}
      edges={['top', 'right', 'left']}
    >
      <View 
        style={[
          styles.header, 
          { borderBottomColor: isDark ? colors.border : colors.divider }
        ]}
      >
        {showBackButton ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? colors.text : colors.textSecondary} 
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        
        <Text 
          style={[
            styles.headerTitle, 
            { color: isDark ? colors.text : colors.textSecondary }
          ]}
        >
          {title}
        </Text>
        
        <View style={styles.spacer} />
      </View>

      {contentComponent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default SettingsScreenBase; 