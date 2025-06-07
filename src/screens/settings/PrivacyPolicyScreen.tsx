import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.privacyPolicy')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.policyContainer}>
          <Text style={styles.policyTitle}>{t('privacy.title')}</Text>
          <Text style={styles.policyDate}>{t('privacy.lastUpdated', { date: '2023-07-01' })}</Text>
          
          <Text style={styles.introduction}>
            {t('privacy.introduction')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section1Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section1Intro')}
          </Text>
          <Text style={styles.sectionSubtitle}>{t('privacy.section1_1Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.accountInfoBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.profileInfoBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.contentDataBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.socialDataBullet')}
          </Text>
          
          <Text style={styles.sectionSubtitle}>{t('privacy.section1_2Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.deviceInfoBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.logInfoBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.locationInfoBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.cookiesInfoBullet')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section2Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section2Intro')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.usageProvideServicesBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.usageDevelopFeaturesBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.usageAnalyzePatternsBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.usageSendNotificationsBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.usageMarketingBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.usagePreventFraudBullet')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section3Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section3Intro')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.sharingByRequestBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.sharingWithPartnersBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.sharingLegalBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.sharingBusinessTransferBullet')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section4Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section4Content')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section5Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section5Intro')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.rightsAccessBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.rightsWithdrawBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.rightsOptOutBullet')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.rightsExercise')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section6Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section6Content')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section7Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section7Content')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section8Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section8Content')}
          </Text>
          
          <Text style={styles.sectionTitle}>{t('privacy.section9Title')}</Text>
          <Text style={styles.paragraph}>
            {t('privacy.section9Intro')}
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.contactEmail')}: privacy@buzzvideo.com
          </Text>
          <Text style={styles.paragraph}>
            {t('privacy.contactAddress')}: {t('privacy.officeAddress')}
          </Text>
          
          <Text style={styles.consentNote}>
            {t('privacy.consentNote')}
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
  policyContainer: {
    padding: 20,
  },
  policyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  policyDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 25,
    textAlign: 'center',
  },
  introduction: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
    marginBottom: 25,
    fontStyle: 'italic',
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ddd',
    marginTop: 15,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  consentNote: {
    fontSize: 15,
    color: '#FF4040',
    marginTop: 30,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PrivacyPolicyScreen;