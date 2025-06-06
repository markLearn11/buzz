import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// 模拟用户数据
const DUMMY_USERS = {
  user1: {
    id: 'user1',
    username: '创作者小明',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: '热爱生活，记录美好瞬间',
    followers: 1243,
    following: 356,
    videos: [
      {
        id: 'v1',
        thumbnail: 'https://picsum.photos/id/1/300/400',
        views: 2540
      },
      {
        id: 'v2',
        thumbnail: 'https://picsum.photos/id/2/300/400',
        views: 1879
      },
      {
        id: 'v3',
        thumbnail: 'https://picsum.photos/id/3/300/400',
        views: 3241
      },
      {
        id: 'v4',
        thumbnail: 'https://picsum.photos/id/4/300/400',
        views: 953
      },
    ]
  },
  user2: {
    id: 'user2',
    username: '旅行达人',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: '足迹遍布30个国家，分享旅行日常',
    followers: 8743,
    following: 521,
    videos: [
      {
        id: 'v5',
        thumbnail: 'https://picsum.photos/id/11/300/400',
        views: 12540
      },
      {
        id: 'v6',
        thumbnail: 'https://picsum.photos/id/12/300/400',
        views: 8723
      },
      {
        id: 'v7',
        thumbnail: 'https://picsum.photos/id/13/300/400',
        views: 9421
      },
    ]
  },
  user3: {
    id: 'user3',
    username: '美食博主',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    bio: '生活美食分享，每天都有新菜谱',
    followers: 5643,
    following: 246,
    videos: [
      {
        id: 'v8',
        thumbnail: 'https://picsum.photos/id/21/300/400',
        views: 4532
      },
      {
        id: 'v9',
        thumbnail: 'https://picsum.photos/id/22/300/400',
        views: 6748
      },
    ]
  },
};

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = (width - 3) / 3;

const UserProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params || {};
  const [isFollowing, setIsFollowing] = useState(false);
  
  const user = DUMMY_USERS[userId] || null;
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>用户资料</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>未找到用户</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };
  
  const renderVideoItem = ({ item }) => (
    <TouchableOpacity style={styles.videoItem}>
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoInfo}>
        <Ionicons name="play" size={12} color="white" />
        <Text style={styles.videoViews}>{formatCount(item.views)}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const formatCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{user.username}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.videos.length}</Text>
            <Text style={styles.statLabel}>作品</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatCount(user.followers)}</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatCount(user.following)}</Text>
            <Text style={styles.statLabel}>关注</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.bio}>{user.bio}</Text>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={handleFollow}
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? '已关注' : '关注'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <FlatList
        data={user.videos}
        renderItem={renderVideoItem}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.videoRow}
      />
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: '#999',
    fontSize: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: 'white',
    padding: 16,
    paddingTop: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#FF4040',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageButton: {
    width: 50,
    height: 38,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginBottom: 2,
  },
  videoRow: {
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  videoItem: {
    width: VIDEO_WIDTH,
    height: VIDEO_WIDTH * 1.3,
    position: 'relative',
    marginBottom: 1,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoViews: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default UserProfileScreen; 