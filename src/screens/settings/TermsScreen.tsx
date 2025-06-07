import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const TermsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.terms')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>{t('terms.title')}</Text>
          <Text style={styles.termsDate}>{t('terms.lastUpdated', { date: '2023年7月1日' })}</Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section1Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section1Content')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section2Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section2_1')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section2_2')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section2_3')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section3Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section3_1')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section3_2')}
          </Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_1')}</Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_2')}</Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_3')}</Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_4')}</Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_5')}</Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_6')}</Text>
          <Text style={styles.bulletPoint}>{t('terms.bullet3_7')}</Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section4Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section4_1')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section4_2')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section4_3')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section5Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section5_1')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section6Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section6_1')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section6_2')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section7Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section7_1')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section7_2')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('terms.section8Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section8_1')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section8_2')}
          </Text>
          <Text style={styles.paragraph}>
            {t('terms.section8_3')}
          </Text>
          
          <Text style={styles.contactInfo}>
            {t('terms.contactInfo', { email: 'support@buzzvideo.com' })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  termsContainer: {
    padding: 20,
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  termsDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 25,
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  bulletPoint: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    paddingLeft: 15,
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 14,
    color: '#999',
    marginTop: 30,
    marginBottom: 40,
    textAlign: 'center',
  },
});

export default TermsScreen; 