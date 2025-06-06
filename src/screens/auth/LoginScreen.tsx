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

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { loading, error } = useAppSelector(state => state.auth);
  
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
      Alert.alert('登录失败', error);
    }
  }, [error]);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('输入错误', '请填写邮箱和密码');
      return;
    }
    
    try {
      console.log('尝试登录:', email);
      await dispatch(loginAsync({ email, password })).unwrap();
      console.log('登录成功');
      // 登录成功，Redux会自动更新状态，不需要额外处理
    } catch (err) {
      // 错误已经在useEffect中处理
      console.log('登录出错:', err);
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
          <Text style={styles.tagline}>创作、分享、交流</Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="邮箱"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={styles.input}
            placeholder="密码"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>忘记密码？</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>登录中...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>登录</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>还没有账号？</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerText}>立即注册</Text>
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