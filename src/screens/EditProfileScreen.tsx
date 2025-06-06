import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { updateProfileAsync, getCurrentUserAsync, updateAvatarAsync } from '../store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import { getImageUrlWithCacheBuster } from '../services/api';
import { env } from '../config/env';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // 选择图片
  const pickImage = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限被拒绝', '需要访问相册权限才能选择头像');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  // 保存用户资料
  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('错误', '用户名不能为空');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('尝试更新用户资料:', { username, bio });
      
      if (user?._id) {
        // 检查头像是否已更改
        const isAvatarChanged = avatar !== user.avatar;
        console.log('头像是否已更改:', isAvatarChanged);
        
        // 如果头像已更改，先上传新头像
        if (isAvatarChanged && avatar) {
          console.log('开始上传新头像...');
          try {
            // 准备FormData
            const formData = new FormData();
            
            // 从URI中获取文件名
            const uriParts = avatar.split('/');
            const fileName = uriParts[uriParts.length - 1];
            
            // 确定文件类型
            const fileType = fileName.split('.').pop() || 'jpeg';
            
            // 添加文件到FormData
            formData.append('avatar', {
              uri: avatar,
              name: fileName,
              type: `image/${fileType}`
            } as any);
            
            console.log('上传头像FormData准备完成');
            
            // 上传头像
            const updatedUserData = await dispatch(updateAvatarAsync({
              userId: user._id,
              formData
            })).unwrap();
            
            console.log('头像上传成功', updatedUserData);
            
            // 检查返回的头像URL并更新本地状态
            if (updatedUserData && updatedUserData.avatar) {
              let newAvatarUrl = updatedUserData.avatar;
              
              // 如果返回的是相对路径，转换为完整URL
              if (newAvatarUrl.startsWith('/')) {
                newAvatarUrl = `${env.API_BASE_URL}${newAvatarUrl}`;
                console.log('转换头像相对路径为完整URL:', updatedUserData.avatar, '=>', newAvatarUrl);
              }
              
              // 更新本地头像状态
              setAvatar(newAvatarUrl);
              setAvatarLoadError(false);
            } else {
              console.log('服务器返回的头像URL不完整，立即同步用户数据');
              await dispatch(getCurrentUserAsync()).unwrap();
            }
          } catch (error) {
            console.error('头像上传失败:', error);
            Alert.alert('警告', '头像上传失败，但将继续更新其他资料');
          }
        }
        
        // 更新用户基本资料
        await dispatch(updateProfileAsync({
          userId: user._id,
          userData: {
            username,
            bio,
          }
        })).unwrap();
        
        console.log('资料更新成功，正在获取最新用户数据...');
        
        // 立即获取最新的用户数据以确保同步
        await dispatch(getCurrentUserAsync()).unwrap();
        
        console.log('用户数据同步完成');
        Alert.alert('成功', '资料更新成功', [
          { text: '确定', onPress: () => navigation.goBack() }
        ]);
      } else {
        console.error('用户ID不存在');
        Alert.alert('错误', '用户信息不完整，请重新登录');
      }
    } catch (error) {
      console.error('更新资料失败:', error);
      Alert.alert('错误', '更新资料失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染头像
  const renderAvatar = () => {
    if (avatar && !avatarLoadError) {
      const isLocalImage = avatar.startsWith('file:') || avatar.startsWith('content:');
      const avatarUri = isLocalImage ? avatar : getImageUrlWithCacheBuster(avatar);
      
      return (
        <Image 
          source={{ uri: avatarUri }} 
          style={styles.avatarImage} 
          onError={(e) => {
            console.error('头像加载失败:', avatarUri, e.nativeEvent.error);
            if (!isLocalImage) {
              setAvatarLoadError(true);
            }
          }}
        />
      );
    } else {
      return <Text style={styles.avatarText}>{username[0] || '用'}</Text>;
    }
  };

  useEffect(() => {
    setAvatarLoadError(false);
  }, [avatar]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑资料</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatar} onPress={pickImage}>
            {renderAvatar()}
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>更换头像</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="输入用户名"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>个人简介</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="介绍一下自己吧"
            placeholderTextColor="#666"
            multiline
            maxLength={100}
          />
          <Text style={styles.characterCount}>{bio.length}/100</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>邮箱</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="输入邮箱"
            placeholderTextColor="#666"
            keyboardType="email-address"
            editable={false} // 邮箱通常不允许直接修改
          />
          <Text style={styles.inputNote}>邮箱不可修改</Text>
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    color: '#FF4040',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#FF4040',
    fontSize: 14,
    marginTop: 12,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  inputNote: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  }
});

export default EditProfileScreen; 