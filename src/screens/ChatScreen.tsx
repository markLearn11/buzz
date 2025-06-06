import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootState } from '../store';
import {
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  markAsRead,
} from '../store/slices/chatSlice';

// 模拟消息数据
const DUMMY_MESSAGES = {
  conv1: [
    {
      id: 'msg1_1',
      senderId: 'user1',
      receiverId: 'currentUser',
      text: '你好，看到你最新发布的视频了，拍得真不错！',
      timestamp: Date.now() - 3600000,
      read: false,
    },
    {
      id: 'msg1_2',
      senderId: 'currentUser',
      receiverId: 'user1',
      text: '谢谢你的支持！我花了很多时间在后期制作上',
      timestamp: Date.now() - 3500000,
      read: true,
    },
    {
      id: 'msg1_3',
      senderId: 'user1',
      receiverId: 'currentUser',
      text: '能分享一下你用的是什么滤镜吗？效果很棒',
      timestamp: Date.now() - 3400000,
      read: false,
    },
  ],
  conv2: [
    {
      id: 'msg2_1',
      senderId: 'currentUser',
      receiverId: 'user2',
      text: '我很喜欢你的旅行视频，拍摄地点在哪里？',
      timestamp: Date.now() - 172800000,
      read: true,
    },
    {
      id: 'msg2_2',
      senderId: 'user2',
      receiverId: 'currentUser',
      text: '谢谢！那是在云南大理拍的，那里的风景真的很美',
      timestamp: Date.now() - 172700000,
      read: true,
    },
    {
      id: 'msg2_3',
      senderId: 'currentUser',
      receiverId: 'user2',
      text: '谢谢关注！我会继续努力创作更多好内容',
      timestamp: Date.now() - 86400000,
      read: true,
    },
  ],
  conv3: [
    {
      id: 'msg3_1',
      senderId: 'user3',
      receiverId: 'currentUser',
      text: '你好，我是美食博主，想请教一下你视频的拍摄技巧',
      timestamp: Date.now() - 259200000,
      read: true,
    },
    {
      id: 'msg3_2',
      senderId: 'currentUser',
      receiverId: 'user3',
      text: '当然可以，你想了解哪方面的？',
      timestamp: Date.now() - 259100000,
      read: true,
    },
    {
      id: 'msg3_3',
      senderId: 'user3',
      receiverId: 'currentUser',
      text: '主要是光线处理，我拍美食总是光线不好',
      timestamp: Date.now() - 172900000,
      read: true,
    },
    {
      id: 'msg3_4',
      senderId: 'user3',
      receiverId: 'currentUser',
      text: '能分享一下你用的是什么滤镜吗？效果很棒！',
      timestamp: Date.now() - 172800000,
      read: false,
    },
  ],
  conv4: [
    {
      id: 'msg4_1',
      senderId: 'user4',
      receiverId: 'currentUser',
      text: '嗨，我是摄影师张三，很喜欢你的创作风格',
      timestamp: Date.now() - 345600000,
      read: true,
    },
    {
      id: 'msg4_2',
      senderId: 'currentUser',
      receiverId: 'user4',
      text: '谢谢！我也很欣赏你的作品',
      timestamp: Date.now() - 345500000,
      read: true,
    },
    {
      id: 'msg4_3',
      senderId: 'user4',
      receiverId: 'currentUser',
      text: '我们可以合作一个视频吗？我觉得会很有趣',
      timestamp: Date.now() - 259200000,
      read: true,
    },
  ],
};

// 模拟用户数据
const DUMMY_USERS = {
  user1: {
    id: 'user1',
    username: '创作者小明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  user2: {
    id: 'user2',
    username: '旅行达人',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  user3: {
    id: 'user3',
    username: '美食博主',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  user4: {
    id: 'user4',
    username: '摄影师张三',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
  },
  currentUser: {
    id: 'currentUser',
    username: '我',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
  },
};

// 定义路由参数类型
type ChatRouteParams = {
  conversationId: string;
  username: string;
  userId: string;
}

const ChatScreen = () => {
  // 简化路由参数的获取方式
  const route = useRoute();
  const params = route.params as ChatRouteParams;
  const { conversationId = '', username = '', userId = '' } = params || {};
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);
  const flatListRef = useRef<FlatList>(null);
  
  const conversationMessages = messages[conversationId] || [];
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取消息
    dispatch(fetchMessagesStart());
    try {
      dispatch(fetchMessagesSuccess({
        conversationId,
        messages: DUMMY_MESSAGES[conversationId] || [],
      }));
      
      // 标记消息为已读
      const unreadMessageIds = DUMMY_MESSAGES[conversationId]
        ?.filter(msg => !msg.read && msg.senderId !== 'currentUser')
        .map(msg => msg.id) || [];
      
      if (unreadMessageIds.length > 0) {
        dispatch(markAsRead({ conversationId, messageIds: unreadMessageIds }));
      }
    } catch (error) {
      dispatch(fetchMessagesFailure((error as Error).message || '获取消息失败'));
    }
  }, [dispatch, conversationId]);
  
  useEffect(() => {
    // 滚动到底部
    if (flatListRef.current && conversationMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [conversationMessages.length]);
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    
    setSending(true);
    dispatch(sendMessageStart());
    
    // 创建新消息
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'currentUser',
      receiverId: userId,
      text: messageText.trim(),
      timestamp: Date.now(),
      read: false,
    };
    
    try {
      // 在实际应用中，这里应该发送消息到API
      setTimeout(() => {
        dispatch(sendMessageSuccess({
          conversationId,
          message: newMessage,
        }));
        
        setMessageText('');
        setSending(false);
        
        // 滚动到底部
        if (flatListRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }, 500);
    } catch (error) {
      dispatch(sendMessageFailure((error as Error).message || '发送消息失败'));
      setSending(false);
    }
  };
  
  const renderMessageItem = ({ item, index }) => {
    const isCurrentUser = item.senderId === 'currentUser';
    const user = DUMMY_USERS[item.senderId];
    const showDate = index === 0 || (
      new Date(item.timestamp).toDateString() !== 
      new Date(conversationMessages[index - 1].timestamp).toDateString()
    );
    
    return (
      <>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          {!isCurrentUser && (
            <Image 
              source={{ uri: user.avatar }}
              style={styles.messageAvatar}
            />
          )}
          
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading && conversationMessages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4040" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={conversationMessages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesContainer}
          />
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="发送消息..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, messageText.trim() === '' && styles.disabledSendButton]}
            onPress={handleSendMessage}
            disabled={messageText.trim() === '' || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    color: '#999',
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: '#FF4040',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: 'white',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#666',
  },
});

export default ChatScreen; 