import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerAsync, clearError } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
      console.log('注册错误详情:', error);
      Alert.alert('注册失败', `${error}\n请检查您的网络连接和输入信息`);
    }
  }, [error]);
  
  const validateInputs = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('输入错误', '请填写所有字段');
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      Alert.alert('用户名错误', '用户名长度必须在3-20个字符之间');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('邮箱错误', '请输入有效的邮箱地址');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('密码错误', '密码长度至少为6个字符');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('密码错误', '两次输入的密码不一致');
      return false;
    }
    
    return true;
  };
  
  const handleRegister = async () => {
    if (!validateInputs()) return;
    
    try {
      console.log('开始注册，用户信息:', { username, email });
      await dispatch(registerAsync({ username, email, password })).unwrap();
      console.log('注册成功');
      // 注册成功，Redux会自动更新状态，不需要额外处理
    } catch (err: any) {
      // 错误已经在useEffect中处理
      console.log('注册出错:', err);
    }
  };
  
  const navigateToLogin = () => {
    // 导航到登录页面前清除错误
    dispatch(clearError());
    navigation.navigate('Login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>创建账号</Text>
            <Text style={styles.subheaderText}>加入Buzz，展示你的创造力</Text>
          </View>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="用户名"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            
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
            
            <TextInput
              style={styles.input}
              placeholder="确认密码"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>注册</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>已有账号？</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginText}>立即登录</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.termsText}>
            注册即表示您同意我们的服务条款和隐私政策
          </Text>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subheaderText: {
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
  button: {
    backgroundColor: '#FF4040',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  loginText: {
    color: '#FF4040',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  termsText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RegisterScreen; 