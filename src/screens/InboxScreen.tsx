import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootState } from '../store';
import {
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
} from '../store/slices/chatSlice';

// 模拟对话数据
const DUMMY_CONVERSATIONS = [
  {
    id: 'conv1',
    participants: ['user1', 'currentUser'],
    lastMessage: {
      id: 'msg1',
      senderId: 'user1',
      receiverId: 'currentUser',
      text: '你好，看到你最新发布的视频了，拍得真不错！',
      timestamp: Date.now() - 3600000,
      read: false,
    },
    unreadCount: 1,
  },
  {
    id: 'conv2',
    participants: ['user2', 'currentUser'],
    lastMessage: {
      id: 'msg2',
      senderId: 'currentUser',
      receiverId: 'user2',
      text: '谢谢关注！我会继续努力创作更多好内容',
      timestamp: Date.now() - 86400000,
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: 'conv3',
    participants: ['user3', 'currentUser'],
    lastMessage: {
      id: 'msg3',
      senderId: 'user3',
      receiverId: 'currentUser',
      text: '能分享一下你用的是什么滤镜吗？效果很棒！',
      timestamp: Date.now() - 172800000,
      read: false,
    },
    unreadCount: 2,
  },
  {
    id: 'conv4',
    participants: ['user4', 'currentUser'],
    lastMessage: {
      id: 'msg4',
      senderId: 'user4',
      receiverId: 'currentUser',
      text: '我们可以合作一个视频吗？我觉得会很有趣',
      timestamp: Date.now() - 259200000,
      read: true,
    },
    unreadCount: 0,
  },
];

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
};

const InboxScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { conversations, isLoading } = useSelector((state: RootState) => state.chat);
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取对话列表
    dispatch(fetchConversationsStart());
    try {
      dispatch(fetchConversationsSuccess(DUMMY_CONVERSATIONS));
    } catch (error) {
      dispatch(fetchConversationsFailure(error instanceof Error ? error.message : '未知错误'));
    }
  }, [dispatch]);
  
  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // 如果是今天的消息，显示时间
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // 如果是昨天的消息，显示"昨天"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return '昨天';
    }
    
    // 其他情况显示日期
    return messageDate.toLocaleDateString();
  };
  
  const getOtherParticipant = (conversation) => {
    const otherUserId = conversation.participants.find(id => id !== 'currentUser');
    return DUMMY_USERS[otherUserId] || { username: '未知用户', avatar: null };
  };
  
  const renderConversationItem = ({ item }) => {
    const otherUser = getOtherParticipant(item);
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item.id,
          username: otherUser.username,
          userId: otherUser.id,
        })}
      >
        <View style={styles.avatarContainer}>
          {otherUser.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.noAvatar]}>
              <Text style={styles.avatarText}>{otherUser.username.charAt(0)}</Text>
            </View>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.username}>{otherUser.username}</Text>
            <Text style={styles.timestamp}>{formatTime(item.lastMessage.timestamp)}</Text>
          </View>
          
          <Text 
            style={[styles.messageText, !item.lastMessage.read && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage.senderId === 'currentUser' ? '我: ' : ''}
            {item.lastMessage.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4040" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>消息</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="create-outline" size={24} color="#FF4040" />
        </TouchableOpacity>
      </View>
      
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="#666" />
          <Text style={styles.emptyText}>暂无消息</Text>
          <Text style={styles.emptySubtext}>
            你的私信和互动通知将会显示在这里
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations.length > 0 ? conversations : DUMMY_CONVERSATIONS}
          renderItem={renderConversationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButton: {
    padding: 8,
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noAvatar: {
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4040',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 14,
    color: '#ccc',
  },
  unreadMessage: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default InboxScreen; 