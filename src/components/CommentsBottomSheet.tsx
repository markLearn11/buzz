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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from './BottomSheet';
import { Comment as CommentType } from '../store/slices/commentsSlice';
import { formatTime } from '../utils/timeUtils';

interface CommentsBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  comments: CommentType[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSubmitComment: (text: string) => Promise<void>;
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
  const insets = useSafeAreaInsets();
  
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
  
  // 处理评论提交
  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSubmitComment(commentText);
      setCommentText('');
      
      // 收起键盘
      Keyboard.dismiss();
    } catch (error) {
      console.error('评论提交失败:', error);
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
          <Text style={styles.commentText}>{item.content}</Text>
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
            <TouchableOpacity style={styles.commentAction}>
              <Text style={styles.actionText}>回复</Text>
            </TouchableOpacity>
          </View>
          
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map(reply => {
                // 获取回复的本地点赞状态
                const replyIsLiked = localCommentIsLiked[reply.id] !== undefined 
                  ? localCommentIsLiked[reply.id] 
                  : reply.isLiked;
                  
                const replyLikesCount = localCommentLikes[reply.id] !== undefined
                  ? localCommentLikes[reply.id]
                  : reply.likes;
                
                return (
                  <View key={reply.id} style={styles.replyContainer}>
                    <Image source={{ uri: reply.avatar || 'https://via.placeholder.com/40' }} style={styles.replyAvatar} />
                    <View style={styles.replyContent}>
                      <Text style={styles.commentUsername}>{reply.username}</Text>
                      <Text style={styles.commentText}>{reply.content}</Text>
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
          <View style={[
            styles.inputWrapper,
            { paddingBottom: isKeyboardVisible ? 5 : getBottomPadding() }
          ]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="添加评论..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline={true}
                maxLength={200}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!commentText.trim() || isSubmitting) && styles.disabledSendButton
                ]}
                onPress={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={isSubmitting || !commentText.trim() ? "#666" : "#FF4040"} 
                />
              </TouchableOpacity>
            </View>
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
    width: '100%',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 80,
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