import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated as RNAnimated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import BottomSheet from './BottomSheet';
import { Comment as CommentType } from '../store/slices/commentsSlice';
import { formatTime } from '../utils/timeUtils';

// 模拟表情数据
const STATIC_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', 
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'
];

// 模拟动态表情包数据
const ANIMATED_EMOJIS = [
  { id: 'anim1', name: '开心', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
  { id: 'anim2', name: '大笑', url: 'https://media.giphy.com/media/10UUe8ZsLnaqwo/giphy.gif' },
  { id: 'anim3', name: '点赞', url: 'https://media.giphy.com/media/l4HohVwFLzHKcwa6A/giphy.gif' },
  { id: 'anim4', name: '爱心', url: 'https://media.giphy.com/media/JTtdkQGZtPm9t3M68E/giphy.gif' },
  { id: 'anim5', name: '哭泣', url: 'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif' },
  { id: 'anim6', name: '惊讶', url: 'https://media.giphy.com/media/3o7TKs8Sc4hf6slNPa/giphy.gif' },
  { id: 'anim7', name: '愤怒', url: 'https://media.giphy.com/media/l1J9u3TZfpmeDLkD6/giphy.gif' },
  { id: 'anim8', name: '无语', url: 'https://media.giphy.com/media/QUNJfft1y9rsYIVkbi/giphy.gif' },
];

interface CommentsBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  comments: CommentType[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSubmitComment: (data: {
    text?: string;
    images?: any[];
    emojis?: {
      type: 'static' | 'animated' | null;
      id: string | null;
      position: number | null; // 在输入文本中的位置
    }[];
  }) => Promise<void>;
  onLikeComment: (commentId: string, isLiked: boolean) => Promise<void>;
  localCommentLikes: {[commentId: string]: number};
  localCommentIsLiked: {[commentId: string]: boolean};
  processingLikes: {[commentId: string]: boolean};
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
// 底部Tab栏高度 - 使用固定值
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

const CommentsBottomSheet: React.FC<CommentsBottomSheetProps> = ({
  isVisible,
  onClose,
  comments,
  isLoading,
  hasMore,
  onLoadMore,
  onSubmitComment,
  onLikeComment,
  localCommentLikes,
  localCommentIsLiked,
  processingLikes,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // 修改状态，支持多个图片和表情
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAnimatedEmojiPicker, setShowAnimatedEmojiPicker] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState<{
    type: 'static' | 'animated' | null;
    id: string | null;
    position: number | null; // 在输入文本中的位置
  }[]>([]);
  const [selectionStart, setSelectionStart] = useState<number>(0); // 新增：跟踪光标位置
  
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  
  // 监听键盘显示和隐藏
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // 评论点赞动画
  const commentLikeAnimations = useRef<{[commentId: string]: {
    scale: RNAnimated.Value,
    opacity: RNAnimated.Value
  }}>({}).current;
  
  // 获取或创建评论点赞动画
  const getCommentLikeAnimation = (commentId: string) => {
    if (!commentLikeAnimations[commentId]) {
      commentLikeAnimations[commentId] = {
        scale: new RNAnimated.Value(1),
        opacity: new RNAnimated.Value(1)
      };
    }
    return commentLikeAnimations[commentId];
  };
  
  // 播放评论点赞动画
  const animateCommentLike = (commentId: string) => {
    const animation = getCommentLikeAnimation(commentId);
    
    // 重置动画值
    animation.scale.setValue(1);
    animation.opacity.setValue(1);
    
    // 创建动画序列
    RNAnimated.sequence([
      // 先放大
      RNAnimated.timing(animation.scale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      // 再缩小回原大小
      RNAnimated.timing(animation.scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // 添加颜色闪烁效果
    RNAnimated.sequence([
      RNAnimated.timing(animation.opacity, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      RNAnimated.timing(animation.opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 处理图片选择
  const handleImagePick = async () => {
    try {
      // 请求媒体库权限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("需要相册访问权限才能选择图片");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 关闭编辑功能以支持多选
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true, // 启用多选
        selectionLimit: 9 // 最多选择9张图片
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // 合并新选择的图片和已有的图片，但要确保总数不超过9张
        const newImages = [...selectedImages, ...result.assets];
        if (newImages.length > 9) {
          alert("最多只能选择9张图片");
          setSelectedImages(newImages.slice(0, 9));
        } else {
          setSelectedImages(newImages);
        }
        
        // 选择图片后关闭表情选择器
        setShowEmojiPicker(false);
        setShowAnimatedEmojiPicker(false);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      alert('选择图片失败，请重试');
    }
  };
  
  // 处理移除已选图片
  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };
  
  // 处理表情选择
  const handleEmojiSelect = (emoji: string) => {
    // 使用跟踪的光标位置而不是ref的props.selection
    const currentText = commentText;
    const newText = 
      currentText.substring(0, selectionStart) + 
      emoji + 
      currentText.substring(selectionStart);
    
    setCommentText(newText);
    
    // 关闭表情选择器
    setShowEmojiPicker(false);
    
    // 设置光标位置到表情之后
    setTimeout(() => {
      const newPosition = selectionStart + emoji.length;
      setSelectionStart(newPosition);
      inputRef.current?.focus();
    }, 100);
  };
  
  // 处理动态表情包选择
  const handleAnimatedEmojiSelect = (emojiId: string) => {
    // 创建一个包含选中动态表情的临时数组
    const emojiToSend = [{
      type: 'animated' as const,
      id: emojiId,
      position: null
    }];
    
    // 直接提交评论，只发送动态表情，不包含图片和文本
    onSubmitComment({
      text: '',
      images: [],
      emojis: emojiToSend
    }).then(() => {
      // 不清空输入和已选择的图片，只关闭表情选择器
      setShowEmojiPicker(false);
      setShowAnimatedEmojiPicker(false);
      
      // 收起键盘
      Keyboard.dismiss();
    }).catch((error) => {
      console.error('发送动态表情失败:', error);
      alert('发送动态表情失败，请重试');
    });
  };
  
  // 处理切换表情选择器
  const toggleEmojiPicker = () => {
    // 如果动态表情包选择器已经打开，则关闭
    if (showAnimatedEmojiPicker) {
      setShowAnimatedEmojiPicker(false);
    }
    
    setShowEmojiPicker(!showEmojiPicker);
    Keyboard.dismiss(); // 关闭键盘
  };
  
  // 处理切换动态表情包选择器
  const toggleAnimatedEmojiPicker = () => {
    // 如果普通表情选择器已经打开，则关闭
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
    
    setShowAnimatedEmojiPicker(!showAnimatedEmojiPicker);
    Keyboard.dismiss(); // 关闭键盘
  };
  
  // 更新提交评论函数
  const handleSubmitComment = async () => {
    // 验证是否有内容可提交（文本或图片）
    if ((!commentText.trim() && selectedImages.length === 0) || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 收集所有要提交的内容
      await onSubmitComment({
        text: commentText.trim(),
        images: selectedImages,
        emojis: [] // 动态表情现在通过handleAnimatedEmojiSelect直接发送
      });
      
      // 清空输入
      setCommentText('');
      setSelectedImages([]);
      
      // 关闭所有选择器
      setShowEmojiPicker(false);
      setShowAnimatedEmojiPicker(false);
      
      // 收起键盘
      Keyboard.dismiss();
    } catch (error) {
      console.error('提交评论失败:', error);
      alert('提交评论失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理评论点赞
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    // 防止重复点击
    if (processingLikes[commentId]) return;
    
    try {
      // 如果点赞操作，播放动画
      if (!isLiked) {
        animateCommentLike(commentId);
      }
      
      await onLikeComment(commentId, isLiked);
    } catch (error) {
      console.error('评论点赞失败:', error);
    }
  };
  
  // 渲染评论内容
  const renderCommentContent = (item: CommentType | any) => {
    return (
      <View>
        {/* 文本内容 */}
        {item.content ? (
          <Text style={styles.commentText}>{item.content}</Text>
        ) : null}
        
        {/* 图片内容 */}
        {item.imageUrl ? (
          <TouchableOpacity
            style={styles.commentImageContainer}
            onPress={() => {
              // TODO: 实现图片预览功能
            }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.commentImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : null}
        
        {/* 静态表情 */}
        {item.emojiType === 'static' && item.emojiId ? (
          <Text style={styles.commentEmoji}>
            {item.emojiId}
          </Text>
        ) : null}
        
        {/* 动态表情包 */}
        {item.emojiType === 'animated' && item.emojiId ? (
          <View style={styles.commentAnimatedEmojiContainer}>
            <Image
              source={{ 
                uri: ANIMATED_EMOJIS.find(emoji => emoji.id === item.emojiId)?.url || 
                     'https://media.giphy.com/media/VgqtLbNtJEWtVlfMVv/giphy.gif' // 默认动图
              }}
              style={styles.commentAnimatedEmoji}
              resizeMode="contain"
            />
          </View>
        ) : null}
      </View>
    );
  };
  
  // 渲染评论项
  const renderComment = ({ item }: { item: CommentType }) => {
    // 获取本地点赞状态
    const isLiked = localCommentIsLiked[item.id] !== undefined 
      ? localCommentIsLiked[item.id] 
      : item.isLiked;
      
    const likesCount = localCommentLikes[item.id] !== undefined
      ? localCommentLikes[item.id]
      : item.likes;
    
    return (
      <View style={styles.commentContainer}>
        <Image source={{ uri: item.avatar || 'https://via.placeholder.com/50' }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          
          {/* 使用渲染评论内容函数 */}
          {renderCommentContent(item)}
          
          <View style={styles.commentActions}>
            <Text style={styles.commentTime}>
              {formatTime(item.createdAt)}
            </Text>
            <TouchableOpacity 
              style={styles.commentAction}
              onPress={() => handleLikeComment(item.id, isLiked)}
              disabled={processingLikes[item.id]}
            >
              <RNAnimated.View
                style={{
                  transform: [{ scale: getCommentLikeAnimation(item.id).scale }],
                  opacity: getCommentLikeAnimation(item.id).opacity,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isLiked ? "#FF4040" : "#999"} 
                />
              </RNAnimated.View>
              <Text style={[
                styles.actionText,
                isLiked && { color: "#FF4040" }
              ]}>
                {likesCount}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 回复内容 */}
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map(reply => {
                // 使用同样的逻辑获取回复的点赞状态
                const replyIsLiked = localCommentIsLiked[reply.id] !== undefined
                  ? localCommentIsLiked[reply.id]
                  : reply.isLiked;
                
                const replyLikesCount = localCommentLikes[reply.id] !== undefined
                  ? localCommentLikes[reply.id]
                  : reply.likes;
                
                return (
                  <View key={reply.id} style={styles.replyContainer}>
                    <Image source={{ uri: reply.avatar || 'https://via.placeholder.com/50' }} style={styles.replyAvatar} />
                    <View style={styles.replyContent}>
                      <Text style={styles.commentUsername}>{reply.username}</Text>
                      
                      {/* 使用渲染评论内容函数 */}
                      {renderCommentContent(reply)}
                      
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>
                          {formatTime(reply.createdAt)}
                        </Text>
                        <TouchableOpacity 
                          style={styles.commentAction}
                          onPress={() => handleLikeComment(reply.id, replyIsLiked)}
                          disabled={processingLikes[reply.id]}
                        >
                          <RNAnimated.View
                            style={{
                              transform: [{ scale: getCommentLikeAnimation(reply.id).scale }],
                              opacity: getCommentLikeAnimation(reply.id).opacity,
                              width: 20,
                              height: 20,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons 
                              name={replyIsLiked ? "heart" : "heart-outline"} 
                              size={16} 
                              color={replyIsLiked ? "#FF4040" : "#999"} 
                            />
                          </RNAnimated.View>
                          <Text style={[
                            styles.actionText,
                            replyIsLiked && { color: "#FF4040" }
                          ]}>
                            {replyLikesCount}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // 计算底部安全区域高度
  const getBottomPadding = () => {
    // 只考虑安全区域，不加入TAB_BAR_HEIGHT
    return Math.max(insets.bottom, 10);
  };
  
  // 计算弹窗高度，考虑Tab栏的高度
  const getAdjustedHeight = () => {
    // 使用固定的50%高度，同时考虑到Tab栏会占据一部分视图高度
    // 从SCREEN_HEIGHT减去TAB_BAR_HEIGHT，再取这个高度的一半
    const availableHeight = SCREEN_HEIGHT - TAB_BAR_HEIGHT;
    return Math.round(availableHeight * 0.5);
  };
  
  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      height={getAdjustedHeight()}
      backgroundColor="#121212"
      handleColor="#FFFFFF"
      contentContainerStyle={styles.sheetContentContainer}
    >
      <View style={styles.mainContainer}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {comments.length > 0 ? `${comments.length}条评论` : '暂无评论'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* 评论列表区域 */}
        <View style={styles.commentsContainer}>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.commentsList,
              { 
                // 为底部输入框留出空间，确保最后的评论可见
                paddingBottom: 80 + (isKeyboardVisible ? 0 : TAB_BAR_HEIGHT)
              }
            ]}
            showsVerticalScrollIndicator={true}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListFooterComponent={
              isLoading && comments.length > 0 ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color="#FF4040" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.emptyList}>
                  <ActivityIndicator size="large" color="#FF4040" />
                </View>
              ) : (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>暂无评论，快来发表第一条评论吧</Text>
                </View>
              )
            }
          />
        </View>
      </View>

      {/* 输入框部分 - 使用绝对定位，并考虑Tab栏高度 */}
      <View 
        style={[
          styles.inputWrapperContainer,
          { 
            bottom: isKeyboardVisible ? 0 : TAB_BAR_HEIGHT // 当键盘弹出时不需要考虑Tab栏
          }
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          style={styles.keyboardAvoidingView}
        >
          {/* 已选图片预览 */}
          {selectedImages.length > 0 && (
            <View style={styles.selectedImageContainer}>
              <ScrollView 
                horizontal={false} 
                showsVerticalScrollIndicator={true}
                style={{width: '100%'}}
              >
                <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
                  {selectedImages.map((image, index) => (
                    <View key={`image-${index}`} style={styles.selectedImagePreviewContainer}>
                      <Image 
                        source={{ uri: image.uri }} 
                        style={styles.selectedImagePreview} 
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={22} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          
          <View style={[
            styles.inputWrapper,
            { paddingBottom: isKeyboardVisible ? 5 : getBottomPadding() }
          ]}>
            <View style={styles.inputContainer}>
              {/* 表情按钮 */}
              <TouchableOpacity 
                style={styles.inputActionButton}
                onPress={toggleEmojiPicker}
              >
                <Ionicons 
                  name="happy-outline" 
                  size={24} 
                  color={showEmojiPicker ? "#FF4040" : "#999"} 
                />
              </TouchableOpacity>
              
              {/* 动态表情包按钮 */}
              <TouchableOpacity 
                style={styles.inputActionButton}
                onPress={toggleAnimatedEmojiPicker}
              >
                <MaterialIcons 
                  name="gif" 
                  size={24} 
                  color={showAnimatedEmojiPicker ? "#FF4040" : "#999"} 
                />
              </TouchableOpacity>
              
              {/* 图片上传按钮 */}
              <TouchableOpacity 
                style={styles.inputActionButton}
                onPress={handleImagePick}
              >
                <Ionicons name="image-outline" size={24} color="#999" />
              </TouchableOpacity>
              
              {/* 文本输入框 */}
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="添加评论..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                onSelectionChange={(event) => {
                  // 跟踪光标位置
                  setSelectionStart(event.nativeEvent.selection.start);
                }}
                multiline={true}
                maxLength={200}
              />
              
              {/* 发送按钮 */}
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!commentText.trim() && selectedImages.length === 0) || isSubmitting 
                    ? styles.disabledSendButton 
                    : null
                ]}
                onPress={handleSubmitComment}
                disabled={
                  (!commentText.trim() && selectedImages.length === 0) || 
                  isSubmitting
                }
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={
                    (!commentText.trim() && selectedImages.length === 0) || isSubmitting
                      ? "#666" 
                      : "#FF4040"
                  } 
                />
              </TouchableOpacity>
            </View>
            
            {/* 表情选择器 */}
            {showEmojiPicker && (
              <View style={styles.emojiPickerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.emojiGrid}>
                    {STATIC_EMOJIS.map((emoji, index) => (
                      <TouchableOpacity
                        key={`emoji-${index}`}
                        style={styles.emojiItem}
                        onPress={() => handleEmojiSelect(emoji)}
                      >
                        <Text style={styles.emoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
            
            {/* 动态表情包选择器 */}
            {showAnimatedEmojiPicker && (
              <View style={styles.emojiPickerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.animatedEmojiGrid}>
                    {ANIMATED_EMOJIS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji.id}
                        style={styles.animatedEmojiItem}
                        onPress={() => handleAnimatedEmojiSelect(emoji.id)}
                      >
                        <Image 
                          source={{ uri: emoji.url }} 
                          style={styles.animatedEmojiPreview}
                          resizeMode="contain"
                        />
                        <Text style={styles.animatedEmojiName}>{emoji.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContentContainer: {
    padding: 0, // 移除默认的内边距
    paddingBottom: 0, // 确保底部没有内边距
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  commentsContainer: {
    flex: 1,
  },
  commentsList: {
    padding: 16,
    paddingBottom: 80, // 基础padding，会在FlatList的contentContainerStyle中被覆盖
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#F0F0F0',
    marginBottom: 8,
    lineHeight: 18,
  },
  commentImageContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  commentImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  commentEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  commentAnimatedEmojiContainer: {
    width: 120,
    height: 120,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAnimatedEmoji: {
    width: 120,
    height: 120,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  inputWrapperContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 80,
  },
  inputActionButton: {
    marginRight: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  emojiPickerContainer: {
    marginTop: 8,
    height: 150,
    width: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
  },
  emojiItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  animatedEmojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
  },
  animatedEmojiItem: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  animatedEmojiPreview: {
    width: 50,
    height: 50,
  },
  animatedEmojiName: {
    fontSize: 10,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedImageContainer: {
    width: '100%',
    padding: 4,
    backgroundColor: '#1A1A1A',
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxHeight: 300, // 限制最大高度
    overflow: 'hidden', // 修正为React Native支持的值
  },
  selectedImagePreviewContainer: {
    width: '33.33%', // 每行3张图片
    height: 100,
    padding: 4,
    position: 'relative',
  },
  selectedImagePreview: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CommentsBottomSheet; 