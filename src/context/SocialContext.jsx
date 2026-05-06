import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { socialService } from '../services/socialService';
import { useAdmin } from './AdminContext';

const SocialContext = createContext();

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within SocialProvider');
  }
  return context;
};

export const SocialProvider = ({ children }) => {
  const { user } = useAdmin();
  
  // State
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState('for-you'); // for-you, following, club, trending
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentThread, setCurrentThread] = useState(null);

  // Load initial data
  useEffect(() => {
    loadTopics();
    if (user) {
      loadPosts();
      loadNotifications();
    }
  }, [user]);

  // Posts
  const loadPosts = useCallback(async ({ type = feedType, offset = 0, append = false } = {}) => {
    if (!user && type === 'following') return;
    
    setIsLoading(true);
    try {
      const params = {
        type,
        offset,
        limit: 20,
        userId: user?.id,
        clubId: user?.clubId,
        topicId: selectedTopic?.id
      };

      const { posts: newPosts } = await socialService.getPosts(params);
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setHasMore(newPosts.length === 20);
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, feedType, selectedTopic]);

  const refreshFeed = useCallback(() => {
    setPosts([]);
    loadPosts({ offset: 0, append: false });
  }, [loadPosts]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPosts({ offset: posts.length, append: true });
    }
  }, [isLoading, hasMore, posts.length, loadPosts]);

  const createPost = useCallback(async (data) => {
    try {
      const { post } = await socialService.createPost({
        ...data,
        clubId: user?.clubId
      });
      
      // Add to feed if appropriate
      if (feedType === 'for-you' || feedType === 'club') {
        setPosts(prev => [post, ...prev]);
      }
      
      return { success: true, post };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: error.message };
    }
  }, [user, feedType]);

  const deletePost = useCallback(async (postId) => {
    try {
      await socialService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      return { success: true };
    } catch (error) {
      console.error('Delete post error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const loadThread = useCallback(async (threadId) => {
    setIsLoading(true);
    try {
      const { rootPost, replies } = await socialService.getThread(threadId);
      setCurrentThread({ rootPost, replies });
      return { rootPost, replies };
    } catch (error) {
      console.error('Load thread error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Interactions
  const likePost = useCallback(async (postId) => {
    try {
      await socialService.likePost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1, isLiked: true } : p
      ));
    } catch (error) {
      console.error('Like post error:', error);
    }
  }, []);

  const unlikePost = useCallback(async (postId) => {
    try {
      await socialService.unlikePost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1), isLiked: false } : p
      ));
    } catch (error) {
      console.error('Unlike post error:', error);
    }
  }, []);

  const savePost = useCallback(async (postId) => {
    try {
      await socialService.savePost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isSaved: true } : p
      ));
    } catch (error) {
      console.error('Save post error:', error);
    }
  }, []);

  const unsavePost = useCallback(async (postId) => {
    try {
      await socialService.unsavePost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isSaved: false } : p
      ));
    } catch (error) {
      console.error('Unsave post error:', error);
    }
  }, []);

  const repostPost = useCallback(async (postId, quoteText) => {
    try {
      await socialService.repostPost(postId, quoteText);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, reposts_count: (p.reposts_count || 0) + 1, isReposted: true } : p
      ));
    } catch (error) {
      console.error('Repost error:', error);
    }
  }, []);

  // Topics
  const loadTopics = useCallback(async () => {
    try {
      const { topics: data } = await socialService.getTopics({ featured: true });
      setTopics(data);
    } catch (error) {
      console.error('Load topics error:', error);
    }
  }, []);

  // Follow
  const followUser = useCallback(async (userId) => {
    try {
      await socialService.followUser(userId);
    } catch (error) {
      console.error('Follow error:', error);
    }
  }, []);

  const unfollowUser = useCallback(async (userId) => {
    try {
      await socialService.unfollowUser(userId);
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  }, []);

  // Notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { notifications: data } = await socialService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Load notifications error:', error);
    }
  }, [user]);

  const markNotificationsRead = useCallback(async () => {
    try {
      await socialService.markNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Mark notifications read error:', error);
    }
  }, []);

  // Search
  const search = useCallback(async (query, type = 'all') => {
    try {
      return await socialService.search({ q: query, type });
    } catch (error) {
      console.error('Search error:', error);
      return { posts: [], users: [], topics: [] };
    }
  }, []);

  const getTrending = useCallback(async (type = 'all') => {
    try {
      return await socialService.getTrending({ type });
    } catch (error) {
      console.error('Get trending error:', error);
      return {};
    }
  }, []);

  const value = {
    // State
    posts,
    topics,
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    feedType,
    selectedTopic,
    currentThread,
    
    // Setters
    setFeedType,
    setSelectedTopic,
    setCurrentThread,
    
    // Actions
    loadPosts,
    refreshFeed,
    loadMore,
    createPost,
    deletePost,
    loadThread,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    repostPost,
    followUser,
    unfollowUser,
    loadNotifications,
    markNotificationsRead,
    search,
    getTrending
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};
