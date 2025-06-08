import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../themes/ThemeProvider';

const PasswordChangeScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSavePassword = async () => {
    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }

    // 模拟密码修改请求
    setIsLoading(true);
    try {
      // 这里应该调用实际的API
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(t('common.success'), t('auth.passwordChangeSuccess'), [
        { text: t('common.confirm'), onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.passwordChangeFailed'));
    } finally {
      setIsLoading(false);
    }
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
          {t('auth.changePassword')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.content, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
            {t('auth.currentPassword')}
          </Text>
          <View style={[
            styles.passwordInputContainer, 
            { borderBottomColor: isDark ? '#444' : colors.border }
          ]}>
            <TextInput
              style={[styles.input, { color: isDark ? colors.text : colors.text }]}
              placeholder={t('auth.enterCurrentPassword')}
              placeholderTextColor={isDark ? '#666' : colors.textTertiary}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Ionicons 
                name={showCurrentPassword ? "eye-off" : "eye"} 
                size={22} 
                color={isDark ? '#666' : colors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
            {t('auth.newPassword')}
          </Text>
          <View style={[
            styles.passwordInputContainer, 
            { borderBottomColor: isDark ? '#444' : colors.border }
          ]}>
            <TextInput
              style={[styles.input, { color: isDark ? colors.text : colors.text }]}
              placeholder={t('auth.enterNewPassword')}
              placeholderTextColor={isDark ? '#666' : colors.textTertiary}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons 
                name={showNewPassword ? "eye-off" : "eye"} 
                size={22} 
                color={isDark ? '#666' : colors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
            {t('auth.confirmNewPassword')}
          </Text>
          <View style={[
            styles.passwordInputContainer, 
            { borderBottomColor: isDark ? '#444' : colors.border }
          ]}>
            <TextInput
              style={[styles.input, { color: isDark ? colors.text : colors.text }]}
              placeholder={t('auth.reenterNewPassword')}
              placeholderTextColor={isDark ? '#666' : colors.textTertiary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={22} 
                color={isDark ? '#666' : colors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!currentPassword || !newPassword || !confirmPassword) && styles.disabledButton
          ]} 
          onPress={handleSavePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>{t('auth.saveNewPassword')}</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.tip, { color: isDark ? '#888' : colors.textTertiary }]}>
          {t('auth.passwordTip')}
        </Text>
      </View>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tip: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  }
});

export default PasswordChangeScreen; 