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
import { API_BASE_URL } from '../config/env';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../themes/ThemeProvider';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
  
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [localAvatarUri, setLocalAvatarUri] = useState(''); // 保存用户选择的本地头像URI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // 选择图片
  const pickImage = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.permissionDenied'), t('profile.galleryPermissionNeeded'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setAvatar(selectedImageUri);
        setLocalAvatarUri(selectedImageUri); // 保存本地头像URI
        // 重置加载错误状态，确保显示新选择的头像
        setAvatarLoadError(false);
      }
    } catch (error) {
      console.error(t('profile.imagePickFailed'), error);
      Alert.alert(t('common.error'), t('profile.imagePickFailed'));
    }
  };

  // 渲染头像
  const renderAvatar = () => {
    // 始终优先显示本地选择的图片，即使在保存过程中也不变
    if (localAvatarUri) {
      return (
        <Image 
          source={{ uri: localAvatarUri }} 
          style={styles.avatarImage}
          // 完全禁用错误处理，避免任何可能导致头像变为默认的代码执行
        />
      );
    } else if (avatar && !avatarLoadError) {
      // 远程图片需要缓存刷新
      const avatarUri = getImageUrlWithCacheBuster(avatar);
      
      return (
        <Image 
          source={{ uri: avatarUri }} 
          style={styles.avatarImage} 
          onError={(e) => {
            console.error(t('profile.avatarLoadFailed'), avatarUri, e.nativeEvent.error);
            // 不要设置错误状态，这会导致显示默认头像
            // setAvatarLoadError(true);
          }}
        />
      );
    } else {
      return <Text style={styles.avatarText}>{username[0] || t('profile.defaultAvatarText')}</Text>;
    }
  };

  // 保存用户资料
  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert(t('common.error'), t('profile.usernameRequired'));
      return;
    }

    // 记录当前的头像状态，以便在任何情况下都能保持显示
    const currentLocalAvatar = localAvatarUri;

    try {
      setIsSubmitting(true);
      console.log(t('profile.updatingProfile'), { username, bio });
      
      if (user?._id) {
        // 如果有本地头像，则需要上传
        if (currentLocalAvatar) {
          console.log(t('profile.uploadingAvatar'));
          try {
            // 准备FormData
            const formData = new FormData();
            
            // 从URI中获取文件名
            const uriParts = currentLocalAvatar.split('/');
            const fileName = uriParts[uriParts.length - 1];
            
            // 确定文件类型
            const fileType = fileName.split('.').pop() || 'jpeg';
            
            // 添加文件到FormData
            formData.append('avatar', {
              uri: currentLocalAvatar,
              name: fileName,
              type: `image/${fileType}`
            } as any);
            
            console.log(t('profile.avatarFormDataReady'));
            
            // 上传头像 - 但不修改任何本地状态，确保头像显示不变
            const updatedUserData = await dispatch(updateAvatarAsync({
              userId: user._id,
              formData
            })).unwrap();
            
            console.log(t('profile.avatarUploadSuccess'), updatedUserData);
            
            // 注意：这里不设置avatar或清除localAvatarUri，确保视觉上保持一致
          } catch (error) {
            console.error(t('profile.avatarUploadFailed'), error);
            // 不显示警告提示，静默处理
            console.log(t('profile.continuingWithProfileUpdate'));
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
        
        console.log(t('profile.profileUpdateSuccess'));
        
        // 静默获取最新用户数据，但不影响UI显示
        try {
          await dispatch(getCurrentUserAsync()).unwrap();
          console.log(t('profile.userDataSyncComplete'));
        } catch (error) {
          console.error(t('profile.fetchUserDataFailed'), error);
        }
        
        // 成功提示并返回上一页
        Alert.alert(t('common.success'), t('profile.profileUpdateSuccess'), [
          { 
            text: t('common.confirm'), 
            onPress: () => {
              // 直接返回，不修改任何状态
              navigation.goBack();
            }
          }
        ]);
      } else {
        console.error(t('profile.userIdMissing'));
        Alert.alert(t('common.error'), t('profile.incompleteUserInfo'));
      }
    } catch (error) {
      console.error(t('profile.profileUpdateFailed'), error);
      Alert.alert(t('common.error'), t('profile.profileUpdateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 初始化和清理
  useEffect(() => {
    // 组件挂载时，确保状态正确
    if (user?.avatar) {
      setAvatar(user.avatar);
      setAvatarLoadError(false);
    }
    
    // 当用户离开页面时，清除本地头像状态
    return () => {
      // 清理不再需要的资源
      setLocalAvatarUri('');
    };
  }, [user]);

  // 监听本地头像的变化
  useEffect(() => {
    // 当有新的本地头像时，重置错误状态
    if (localAvatarUri) {
      setAvatarLoadError(false);
    }
  }, [localAvatarUri]);

  // 组件初始化时，如果有头像，重置错误状态
  useEffect(() => {
    setAvatarLoadError(false);
  }, []);

  // 确保组件卸载时不会改变状态
  useEffect(() => {
    return () => {
      // 不清除任何状态
    };
  }, []);

  // 阻止头像加载错误
  useEffect(() => {
    // 禁用错误状态
    setAvatarLoadError(false);
  }, [localAvatarUri, avatar]);

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
          <Ionicons name="close" size={24} color={isDark ? colors.text : colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.text : colors.text }]}>
          {t('profile.editProfile')}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.accent }]}>
              {t('common.save')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: isDark ? colors.primary : colors.white }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {renderAvatar()}
            <TouchableOpacity style={styles.avatarEditButton} onPress={pickImage}>
              <View style={styles.avatarEditIconContainer}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoText, { color: colors.accent }]}>
            {t('profile.changePhoto')}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
            {t('profile.username')}
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                color: isDark ? colors.text : colors.text
              }
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder={t('profile.enterUsername')}
            placeholderTextColor={isDark ? '#666' : colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
            {t('profile.bio')}
          </Text>
          <TextInput
            style={[
              styles.input, 
              styles.bioInput, 
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                color: isDark ? colors.text : colors.text
              }
            ]}
            value={bio}
            onChangeText={setBio}
            placeholder={t('profile.introduceYourself')}
            placeholderTextColor={isDark ? '#666' : colors.textTertiary}
            multiline
            maxLength={100}
          />
          <Text style={[
            styles.characterCount, 
            { color: isDark ? colors.textTertiary : colors.textTertiary }
          ]}>
            {bio.length}/{t('profile.maxLength')}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: isDark ? colors.text : colors.text }]}>
            {t('profile.email')}
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#222' : colors.surfaceVariant,
                color: isDark ? colors.text : colors.text
              }
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder={t('profile.enterEmail')}
            placeholderTextColor={isDark ? '#666' : colors.textTertiary}
            keyboardType="email-address"
            editable={false} // 邮箱通常不允许直接修改
          />
          <Text style={[
            styles.inputNote, 
            { color: isDark ? colors.textTertiary : colors.textTertiary }
          ]}>
            {t('profile.emailNote')}
          </Text>
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
  saveButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  avatarEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  avatarEditIconContainer: {
    backgroundColor: '#FF4040',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  changePhotoText: {
    fontSize: 16,
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    minHeight: 100,
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
  },
});

export default EditProfileScreen; 