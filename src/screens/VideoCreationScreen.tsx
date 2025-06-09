import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import CameraPreview from '../components/CameraPreview';
import VideoEditor from '../components/VideoEditor';
import ImageEditor from '../components/ImageEditor';
import PostEditor from '../components/PostEditor';

type CreationMode = 'camera' | 'video' | 'photo' | 'post' | null;
type EditorMode = 'video' | 'image' | 'post' | null;

const VideoCreationScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // 请求相机和媒体库权限
  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestPermissionsAsync();
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
  };
  
  // 组件挂载时请求权限
  React.useEffect(() => {
    requestPermissions();
  }, []);
  
  // 处理拍照或录制视频完成
  const handleMediaCaptured = (uri: string, type: 'photo' | 'video') => {
    setMediaUri(uri);
    setEditorMode(type === 'photo' ? 'image' : 'video');
    setCreationMode(null);
  };
  
  // 从相册选择媒体
  const pickMedia = async (mediaType: 'photo' | 'video' | 'mixed') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'photo' ? ImagePicker.MediaTypeOptions.Images : 
                   mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : 
                   ImagePicker.MediaTypeOptions.All,
        allowsEditing: mediaType !== 'mixed',
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: mediaType === 'mixed',
      });
      
      if (!result.canceled) {
        if (mediaType === 'mixed') {
          // 多选图片用于图文动态
          const uris = result.assets.map(asset => asset.uri);
          setSelectedImages(uris);
          setEditorMode('post');
        } else {
          // 单选图片或视频用于编辑
          setMediaUri(result.assets[0].uri);
          const isVideo = result.assets[0].uri.endsWith('.mp4') || 
                         result.assets[0].uri.includes('video');
          setEditorMode(isVideo ? 'video' : 'image');
        }
        setCreationMode(null);
      }
    } catch (error) {
      Alert.alert('错误', '选择媒体失败');
      console.error(error);
    }
  };
  
  // 保存编辑后的媒体
  const handleSaveMedia = async (editedMedia: any) => {
    try {
      // 实际应用中，这里应该将编辑后的媒体保存到服务器或本地
      Alert.alert('成功', '媒体已保存');
      
      // 重置状态
      setMediaUri(null);
      setEditorMode(null);
      setSelectedImages([]);
    } catch (error) {
      Alert.alert('错误', '保存失败');
      console.error(error);
    }
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setMediaUri(null);
    setEditorMode(null);
    setSelectedImages([]);
  };
  
  // 渲染相机界面
  const renderCameraMode = () => {
    if (creationMode === 'camera') {
      return (
        <CameraPreview
          onCapture={handleMediaCaptured}
          onCancel={() => setCreationMode(null)}
        />
      );
    }
    return null;
  };
  
  // 渲染编辑器界面
  const renderEditorMode = () => {
    if (!editorMode) return null;
    
    switch (editorMode) {
      case 'video':
        return mediaUri ? (
          <VideoEditor
            videoUri={mediaUri}
            onSave={handleSaveMedia}
            onCancel={handleCancelEdit}
          />
        ) : null;
        
      case 'image':
        return mediaUri ? (
          <ImageEditor
            imageUri={mediaUri}
            onSave={handleSaveMedia}
            onCancel={handleCancelEdit}
          />
        ) : null;
        
      case 'post':
        return selectedImages.length > 0 ? (
          <PostEditor
            images={selectedImages}
            onSave={handleSaveMedia}
            onCancel={handleCancelEdit}
          />
        ) : null;
        
      default:
        return null;
    }
  };
  
  // 渲染创建选项界面
  const renderCreationOptions = () => {
    if (creationMode !== null || editorMode !== null) return null;
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>创建</Text>
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => setCreationMode('camera')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#FF4040' }]}>
              <Ionicons name="camera" size={32} color="#fff" />
            </View>
            <Text style={styles.optionText}>拍摄</Text>
            <Text style={styles.optionDescription}>拍照或录制视频</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => pickMedia('video')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#40A0FF' }]}>
              <MaterialIcons name="video-library" size={32} color="#fff" />
            </View>
            <Text style={styles.optionText}>视频</Text>
            <Text style={styles.optionDescription}>从相册选择视频编辑</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => pickMedia('photo')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#FFAA40' }]}>
              <MaterialIcons name="photo" size={32} color="#fff" />
            </View>
            <Text style={styles.optionText}>图片</Text>
            <Text style={styles.optionDescription}>从相册选择图片编辑</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => pickMedia('mixed')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#AA40FF' }]}>
              <MaterialIcons name="post-add" size={32} color="#fff" />
            </View>
            <Text style={styles.optionText}>图文</Text>
            <Text style={styles.optionDescription}>创建图文动态</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  
  // 权限检查
  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.messageText}>请求相机权限中...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.messageText}>没有相机和媒体库权限</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
          <Text style={styles.permissionButtonText}>请求权限</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {renderCameraMode()}
      {renderEditorMode()}
      {renderCreationOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 15,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: '#999',
    fontSize: 14,
    marginLeft: 'auto',
  },
});

export default VideoCreationScreen; 