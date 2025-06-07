import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const HelpScreen = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  // FAQ数据
  const faqData = [
    {
      question: t('help.faq1Question'),
      answer: t('help.faq1Answer')
    },
    {
      question: t('help.faq2Question'),
      answer: t('help.faq2Answer')
    },
    {
      question: t('help.faq3Question'),
      answer: t('help.faq3Answer')
    },
    {
      question: t('help.faq4Question'),
      answer: t('help.faq4Answer')
    },
    {
      question: t('help.faq5Question'),
      answer: t('help.faq5Answer')
    },
    {
      question: t('help.faq6Question'),
      answer: t('help.faq6Answer')
    },
    {
      question: t('help.faq7Question'),
      answer: t('help.faq7Answer')
    },
    {
      question: t('help.faq8Question'),
      answer: t('help.faq8Answer')
    }
  ];

  // 切换FAQ展开/折叠状态
  const toggleFAQ = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  // 联系客服
  const contactSupport = () => {
    Linking.openURL('mailto:support@buzzvideo.com');
  };

  // 打开在线帮助中心
  const openHelpCenter = () => {
    Linking.openURL('https://www.example.com/help');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.help')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.helpOptions}>
          <TouchableOpacity style={styles.helpOptionItem} onPress={contactSupport}>
            <View style={styles.helpOptionIcon}>
              <Ionicons name="mail-outline" size={26} color="white" />
            </View>
            <Text style={styles.helpOptionText}>{t('help.contactSupport')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpOptionItem} onPress={openHelpCenter}>
            <View style={styles.helpOptionIcon}>
              <Ionicons name="globe-outline" size={26} color="white" />
            </View>
            <Text style={styles.helpOptionText}>{t('help.onlineHelp')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpOptionItem}>
            <View style={styles.helpOptionIcon}>
              <Ionicons name="chatbubbles-outline" size={26} color="white" />
            </View>
            <Text style={styles.helpOptionText}>{t('help.liveChat')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('help.frequentlyAskedQuestions')}</Text>
          
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion} 
                onPress={() => toggleFAQ(index)}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <Ionicons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>{t('help.noHelpFound')}</Text>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={contactSupport}
          >
            <Text style={styles.feedbackButtonText}>{t('help.submitFeedback')}</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  helpOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  helpOptionItem: {
    alignItems: 'center',
    flex: 1,
  },
  helpOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpOptionText: {
    color: 'white',
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#111',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    fontSize: 15,
    color: 'white',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
    backgroundColor: '#1a1a1a',
  },
  answerText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  feedbackSection: {
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  feedbackTitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
  },
  feedbackButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  feedbackButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default HelpScreen; 