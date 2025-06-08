import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../themes/ThemeProvider';

const HelpScreen = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: isDark ? colors.primary : colors.white,
          borderBottomColor: isDark ? '#333' : colors.border 
        }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
          {t('settings.help')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={styles.helpOptions}>
          <TouchableOpacity style={styles.helpOptionItem} onPress={contactSupport}>
            <View style={[
              styles.helpOptionIcon, 
              { backgroundColor: isDark ? '#1e1e1e' : colors.surfaceVariant }
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={26} 
                color={isDark ? 'white' : colors.text} 
              />
            </View>
            <Text style={[styles.helpOptionText, { color: isDark ? colors.text : colors.text }]}>
              {t('help.contactSupport')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpOptionItem} onPress={openHelpCenter}>
            <View style={[
              styles.helpOptionIcon, 
              { backgroundColor: isDark ? '#1e1e1e' : colors.surfaceVariant }
            ]}>
              <Ionicons 
                name="globe-outline" 
                size={26} 
                color={isDark ? 'white' : colors.text} 
              />
            </View>
            <Text style={[styles.helpOptionText, { color: isDark ? colors.text : colors.text }]}>
              {t('help.onlineHelp')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.helpOptionItem}>
            <View style={[
              styles.helpOptionIcon, 
              { backgroundColor: isDark ? '#1e1e1e' : colors.surfaceVariant }
            ]}>
              <Ionicons 
                name="chatbubbles-outline" 
                size={26} 
                color={isDark ? 'white' : colors.text} 
              />
            </View>
            <Text style={[styles.helpOptionText, { color: isDark ? colors.text : colors.text }]}>
              {t('help.liveChat')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.section, 
          { 
            backgroundColor: isDark ? '#111' : colors.secondary,
            borderColor: isDark ? '#222' : colors.border 
          }
        ]}>
          <Text style={[
            styles.sectionTitle, 
            { 
              color: isDark ? '#ccc' : colors.textSecondary,
              borderBottomColor: isDark ? '#222' : colors.border 
            }
          ]}>
            {t('help.frequentlyAskedQuestions')}
          </Text>
          
          {faqData.map((faq, index) => (
            <View key={index} style={[
              styles.faqItem, 
              { borderBottomColor: isDark ? '#222' : colors.border }
            ]}>
              <TouchableOpacity 
                style={styles.faqQuestion} 
                onPress={() => toggleFAQ(index)}
              >
                <Text style={[styles.questionText, { color: isDark ? colors.text : colors.text }]}>
                  {faq.question}
                </Text>
                <Ionicons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={isDark ? "#666" : colors.textTertiary} 
                />
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.answerText, { color: isDark ? '#ccc' : colors.textSecondary }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={[
          styles.feedbackSection, 
          { 
            backgroundColor: isDark ? '#111' : colors.secondary,
            borderColor: isDark ? '#222' : colors.border 
          }
        ]}>
          <Text style={[styles.feedbackTitle, { color: isDark ? colors.text : colors.text }]}>
            {t('help.noHelpFound')}
          </Text>
          <TouchableOpacity 
            style={[styles.feedbackButton, { backgroundColor: colors.accent }]}
            onPress={contactSupport}
          >
            <Text style={styles.feedbackButtonText}>
              {t('help.submitFeedback')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpOptionText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
  },
  faqItem: {
    borderBottomWidth: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    fontSize: 15,
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackSection: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  feedbackTitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  feedbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HelpScreen; 