import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';

const DiscoverScreen = () => {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
      <Text style={[styles.title, { color: isDark ? colors.text : colors.textSecondary }]}>
        {t('discover.title')}
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? colors.textTertiary : colors.textTertiary }]}>
        {t('discover.subtitle')}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DiscoverScreen; 