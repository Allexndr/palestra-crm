import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    // no-op: posts are managed locally
  }, [user]);

  const loadPosts = useCallback(() => {}, []);
  const refreshFeed = useCallback(() => setPosts([]), []);
  const loadMore = useCallback(() => {}, []);
  const loadTopics = useCallback(() => {}, []);

  const createPost = useCallback((data) => {
    const post = {
      id: Date.now().toString(),
      text: data.text || '',
      image: data.image || null,
      author: user?.name || 'User',
      authorId: user?.id,
      authorRole: user?.role,
      clubName: data.clubName || null,
      date: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
    };
    setPosts(prev => [post, ...prev]);
    return { success: true, post };
  }, [user]);

  const deletePost = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    return { success: true };
  }, []);

  const loadThread = useCallback(() => {}, []);

  const likePost = useCallback((postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            likes: p.likedBy?.includes(user?.id || user?.email)
              ? p.likes - 1
              : p.likes + 1,
            likedBy: p.likedBy?.includes(user?.id || user?.email)
              ? p.likedBy.filter(id => id !== (user?.id || user?.email))
              : [...(p.likedBy || []), user?.id || user?.email],
          }
        : p
    ));
  }, [user]);

  const unlikePost = useCallback((postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1), isLiked: false } : p
    ));
  }, []);

  const savePost = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: true } : p));
  }, []);

  const unsavePost = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: false } : p));
  }, []);

  const repostPost = useCallback((postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, reposts_count: (p.reposts_count || 0) + 1 } : p
    ));
  }, []);

  const addComment = useCallback((postId, text, parentId = null) => {
    const comment = {
      id: Date.now().toString(),
      text,
      author: user?.name || 'User',
      authorId: user?.id,
      parentId,
      date: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
    ));
  }, [user]);

  const likeComment = useCallback((postId, commentId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: (p.comments || []).map(c =>
              c.id === commentId
                ? {
                    ...c,
                    likes: c.likedBy?.includes(user?.id || user?.email) ? c.likes - 1 : c.likes + 1,
                    likedBy: c.likedBy?.includes(user?.id || user?.email)
                      ? c.likedBy.filter(id => id !== (user?.id || user?.email))
                      : [...(c.likedBy || []), user?.id || user?.email],
                  }
                : c
            ),
          }
        : p
    ));
  }, [user]);

  const followUser = useCallback(() => {}, []);
  const unfollowUser = useCallback(() => {}, []);
  const loadNotifications = useCallback(() => {}, []);
  const markNotificationsRead = useCallback(() => { setUnreadCount(0); }, []);
  const search = useCallback(() => ({ posts: [], users: [], topics: [] }), []);
  const getTrending = useCallback(() => ({}), []);

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
    addComment,
    likeComment,
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
