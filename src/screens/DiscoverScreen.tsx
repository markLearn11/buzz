import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// 模拟分类数据
const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'trending', name: '热门' },
  { id: 'music', name: '音乐' },
  { id: 'dance', name: '舞蹈' },
  { id: 'food', name: '美食' },
  { id: 'travel', name: '旅行' },
  { id: 'comedy', name: '搞笑' },
  { id: 'fashion', name: '时尚' },
  { id: 'gaming', name: '游戏' },
];

// 模拟推荐创作者数据
const CREATORS = [
  { id: '1', name: '舞蹈达人', avatar: 'https://randomuser.me/api/portraits/women/43.jpg', followers: '1.2万', category: '舞蹈' },
  { id: '2', name: '美食家', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', followers: '89.3万', category: '美食' },
  { id: '3', name: '旅行者', avatar: 'https://randomuser.me/api/portraits/women/63.jpg', followers: '45.6万', category: '旅行' },
  { id: '4', name: '游戏玩家', avatar: 'https://randomuser.me/api/portraits/men/91.jpg', followers: '112万', category: '游戏' },
  { id: '5', name: '搞笑博主', avatar: 'https://randomuser.me/api/portraits/men/29.jpg', followers: '78.4万', category: '搞笑' },
];

// 模拟热门话题数据
const TRENDING_TOPICS = [
  { id: '1', name: '#夏日穿搭', posts: '1243.5万', image: 'https://picsum.photos/id/237/300/200' },
  { id: '2', name: '#城市夜景', posts: '892.1万', image: 'https://picsum.photos/id/29/300/200' },
  { id: '3', name: '#家常美食', posts: '567.8万', image: 'https://picsum.photos/id/42/300/200' },
  { id: '4', name: '#旅行日记', posts: '321.4万', image: 'https://picsum.photos/id/87/300/200' },
  { id: '5', name: '#健身打卡', posts: '198.6万', image: 'https://picsum.photos/id/65/300/200' },
];

// 模拟推荐视频数据
const RECOMMENDED_VIDEOS = [
  { id: '1', thumbnail: 'https://picsum.photos/id/1/300/400', duration: '0:42', views: '128.5万', user: { name: '旅行达人', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }, description: '春天来了，花开满树 #春天 #花卉 #自然' },
  { id: '2', thumbnail: 'https://picsum.photos/id/2/300/400', duration: '1:15', views: '89.3万', user: { name: '美食博主', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' }, description: '家常菜教程 - 红烧肉 #美食 #家常菜 #烹饪' },
  { id: '3', thumbnail: 'https://picsum.photos/id/3/300/400', duration: '0:58', views: '45.6万', user: { name: '舞蹈达人', avatar: 'https://randomuser.me/api/portraits/women/28.jpg' }, description: '最新舞蹈教程 #舞蹈 #教程 #流行' },
  { id: '4', thumbnail: 'https://picsum.photos/id/4/300/400', duration: '2:03', views: '32.1万', user: { name: '游戏玩家', avatar: 'https://randomuser.me/api/portraits/men/42.jpg' }, description: '游戏实况 - 最新攻略 #游戏 #攻略 #实况' },
  { id: '5', thumbnail: 'https://picsum.photos/id/5/300/400', duration: '1:47', views: '21.8万', user: { name: '搞笑博主', avatar: 'https://randomuser.me/api/portraits/men/29.jpg' }, description: '生活中的搞笑瞬间 #搞笑 #日常 #幽默' },
  { id: '6', thumbnail: 'https://picsum.photos/id/6/300/400', duration: '0:36', views: '15.4万', user: { name: '时尚博主', avatar: 'https://randomuser.me/api/portraits/women/63.jpg' }, description: '夏季穿搭推荐 #时尚 #穿搭 #夏季' },
];

const DiscoverScreen = () => {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 模拟加载数据
  const loadData = () => {
    setIsLoading(true);
    // 模拟网络请求
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // 首次加载
  useEffect(() => {
    loadData();
  }, []);

  // 下拉刷新
  const onRefresh = () => {
    setRefreshing(true);
    // 模拟刷新
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索:', searchQuery);
    // TODO: 实现搜索功能
  };

  // 渲染分类项
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && {
          backgroundColor: isDark ? colors.accent : colors.accent,
        },
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          {
            color:
              selectedCategory === item.id
                ? colors.white
                : isDark ? colors.text : colors.textSecondary,
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // 渲染创作者项
  const renderCreatorItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.creatorItem,
        { backgroundColor: isDark ? colors.surfaceVariant : colors.secondary },
      ]}
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.creatorAvatar} />
      <Text style={[styles.creatorName, { color: isDark ? colors.text : colors.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.creatorCategory, { color: isDark ? colors.textTertiary : colors.textTertiary }]}>
        {item.category}
      </Text>
      <Text style={[styles.creatorFollowers, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
        {item.followers}粉丝
      </Text>
      <TouchableOpacity
        style={[styles.followButton, { backgroundColor: colors.accent }]}
        onPress={() => console.log('关注:', item.name)}
      >
        <Text style={[styles.followButtonText, { color: colors.white }]}>关注</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // 渲染热门话题项
  const renderTopicItem = ({ item }) => (
    <TouchableOpacity
      style={styles.topicItem}
      onPress={() => console.log('查看话题:', item.name)}
    >
      <Image source={{ uri: item.image }} style={styles.topicImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.topicGradient}
      >
        <Text style={styles.topicName}>{item.name}</Text>
        <Text style={styles.topicPosts}>{item.posts}条内容</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // 渲染推荐视频项
  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => navigation.navigate('VideoDetail', { videoId: item.id })}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={[styles.videoInfo, { backgroundColor: isDark ? colors.surfaceVariant : colors.secondary }]}>
        <View style={styles.videoUserInfo}>
          <Image source={{ uri: item.user.avatar }} style={styles.videoUserAvatar} />
          <Text style={[styles.videoUserName, { color: isDark ? colors.text : colors.text }]} numberOfLines={1}>
            {item.user.name}
          </Text>
          <Text style={[styles.videoViews, { color: isDark ? colors.textTertiary : colors.textTertiary }]}>
            {item.views}次观看
          </Text>
        </View>
        <Text style={[styles.videoDescription, { color: isDark ? colors.textSecondary : colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.primary : colors.white }]}>
      {/* 搜索栏 */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.surfaceVariant : colors.secondary }]}>
        <Ionicons name="search" size={20} color={isDark ? colors.textSecondary : colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? colors.text : colors.text }]}
          placeholder={t('common.search')}
          placeholderTextColor={isDark ? colors.textTertiary : colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={isDark ? colors.textSecondary : colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: isDark ? colors.textSecondary : colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
          }
        >
          {/* 分类导航 */}
          <View style={styles.categoriesContainer}>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* 推荐创作者 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
                推荐创作者
              </Text>
              <TouchableOpacity onPress={() => console.log('查看更多创作者')}>
                <Text style={[styles.seeMoreText, { color: colors.accent }]}>查看更多</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CREATORS}
              renderItem={renderCreatorItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.creatorsList}
            />
          </View>

          {/* 热门话题 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
                热门话题
              </Text>
              <TouchableOpacity onPress={() => console.log('查看更多话题')}>
                <Text style={[styles.seeMoreText, { color: colors.accent }]}>查看更多</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TRENDING_TOPICS}
              renderItem={renderTopicItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicsList}
            />
          </View>

          {/* 推荐视频 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.text : colors.text }]}>
                为您推荐
              </Text>
              <TouchableOpacity onPress={() => console.log('查看更多视频')}>
                <Text style={[styles.seeMoreText, { color: colors.accent }]}>查看更多</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.videoGrid}>
              {RECOMMENDED_VIDEOS.map((video) => (
                <View key={video.id} style={styles.videoGridItem}>
                  {renderVideoItem({ item: video })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  creatorsList: {
    paddingHorizontal: 8,
  },
  creatorItem: {
    width: 150,
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  creatorCategory: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  creatorFollowers: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  topicsList: {
    paddingHorizontal: 8,
  },
  topicItem: {
    width: 200,
    height: 120,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  topicImage: {
    width: '100%',
    height: '100%',
  },
  topicGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  topicName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicPosts: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  videoGridItem: {
    width: '50%',
    padding: 8,
  },
  videoItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  videoUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  videoUserAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  videoUserName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  videoViews: {
    fontSize: 11,
    marginLeft: 4,
  },
  videoDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default DiscoverScreen; 