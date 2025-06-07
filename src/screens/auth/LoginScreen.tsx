import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginAsync, clearError } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { loading, error } = useAppSelector(state => state.auth);
  const { t } = useTranslation();
  
  useEffect(() => {
    // 组件挂载时清除错误
    dispatch(clearError());
    
    return () => {
      // 组件卸载时清除错误
      dispatch(clearError());
    };
  }, [dispatch]);
  
  useEffect(() => {
    if (error) {
      Alert.alert(t('auth.loginFailed'), error);
    }
  }, [error, t]);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.inputError'));
      return;
    }
    
    try {
      console.log(t('auth.loginAttempt'), email);
      await dispatch(loginAsync({ email, password })).unwrap();
      console.log(t('auth.loginSuccess'));
      // 登录成功，Redux会自动更新状态，不需要额外处理
    } catch (err) {
      // 错误已经在useEffect中处理
      console.log(t('auth.loginError'), err);
    }
  };
  
  const navigateToRegister = () => {
    // 导航到注册页面前清除错误
    dispatch(clearError());
    navigation.navigate('Register');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Buzz</Text>
          <Text style={styles.tagline}>{t('common.appTagline')}</Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>{t('auth.loggingIn')}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t('auth.login')}</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerText}>{t('auth.register')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF4040',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#ccc',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: 'white',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF4040',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FF4040',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonLoading: {
    backgroundColor: '#FF4040',
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#ccc',
    fontSize: 14,
  },
  registerText: {
    color: '#FF4040',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default LoginScreen; 