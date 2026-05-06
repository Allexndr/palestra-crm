import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocial } from '../../context/SocialContext';
import { useAdmin } from '../../context/AdminContext';
import { PostCard } from '../../components/social/PostCard';
import { CreatePostModal } from '../../components/social/CreatePostModal';
import { Button } from '../../components/ui/Button';
import { Sparkles, Users, Flame, TrendingUp, Plus } from 'lucide-react';

export const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAdmin();
  const { 
    posts, 
    topics, 
    isLoading, 
    hasMore, 
    feedType, 
    setFeedType,
    loadPosts, 
    loadMore, 
    refreshFeed 
  } = useSocial();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('for-you'); // for-you, following, trending

  useEffect(() => {
    loadPosts();
  }, [feedType]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setFeedType(tab);
  }, [setFeedType]);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 100 && !isLoading && hasMore) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto">
        {/* Header with tabs */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Сообщество</h1>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Создать</span>
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex">
            <TabButton 
              active={activeTab === 'for-you'}
              onClick={() => handleTabChange('for-you')}
              icon={Sparkles}
              label="Для вас"
            />
            <TabButton 
              active={activeTab === 'following'}
              onClick={() => handleTabChange('following')}
              icon={Users}
              label="Подписки"
            />
            <TabButton 
              active={activeTab === 'trending'}
              onClick={() => handleTabChange('trending')}
              icon={Flame}
              label="Тренды"
            />
          </div>
        </div>

        {/* Create post prompt */}
        <div className="bg-white dark:bg-zinc-900 p-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex gap-3">
            <img 
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 text-left px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Что нового?
            </button>
          </div>
        </div>

        {/* Feed */}
        <div 
          className="divide-y divide-slate-200 dark:divide-zinc-800"
          onScroll={handleScroll}
        >
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          
          {!isLoading && posts.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Sparkles size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-zinc-400">Нет постов</p>
              <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">Будьте первым, кто создаст пост!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
      active 
        ? 'text-primary' 
        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
    }`}
  >
    <Icon size={18} />
    <span className="hidden sm:inline">{label}</span>
    {active && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
    )}
  </button>
);

export default Feed;
    if (!replyText.trim()) return;
    addComment(postId, replyText, parentCommentId);
    setReplyText('');
    setActiveReplyId(null);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadBlobFile(file, 'posts');
      setNewPostImage(url);
    } catch (error) {
      showError(error.message || (language === 'ru' ? 'Ошибка загрузки' : 'Жүктеу қатесі'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const shareToSocial = (platform, post) => {
    const text = post.text.substring(0, 50);
    const url = window.location.href;
    const shareUrl = platform === 'wa' 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
      : `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const canPost = ['admin', 'coach', 'student', 'parent'].includes(user?.role);

  return (
    <div className="animate-fade-in max-w-[640px] mx-auto px-4 pb-24">
      <header className="flex flex-col gap-4 py-6 mb-2">
        <div className="flex justify-between items-center">
          <h1 className="h3 m-0 font-black tracking-tight">{t('social.feed')}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreHorizontal size={20} /></button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'ru' ? 'Поиск по ленте...' : 'Желіден іздеу...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />
        </div>
      </header>

      {/* Composer */}
      {canPost && (
        <div className="social-composer mb-8">
          <div className="social-thread-column">
            <div className="social-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="social-thread-line" style={{ opacity: newPostText ? 1 : 0 }} />
          </div>
          <div className="social-post-content">
            <div className="social-post-header">
              <span className="social-post-author">{user?.name}</span>
            </div>
            <textarea 
              className="social-composer-input"
              placeholder={t('social.placeholder')}
              rows={1}
              value={newPostText}
              onChange={(e) => {
                setNewPostText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            
            {newPostImage && (
              <div className="social-post-image-container mt-2 relative group">
                <img src={newPostImage} className="social-post-image" alt="Preview" />
                <button 
                  onClick={() => setNewPostImage('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors border-none"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-primary transition-colors border-none bg-transparent cursor-pointer"
                  disabled={isUploadingImage}
                >
                  <ImageIcon size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handlePost} 
                disabled={(!newPostText.trim() && !newPostImage) || isUploadingImage}
                style={{ borderRadius: '20px', padding: '0 20px', minHeight: '36px' }}
              >
                {t('social.publish')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="flex flex-col">
        {posts.filter(p => !searchQuery || (p.text?.toLowerCase().includes(searchQuery.toLowerCase()) || p.author?.toLowerCase().includes(searchQuery.toLowerCase()))).map((post) => (
          <div key={post.id} className="social-post-card">
            <div className="social-post-container relative">
              <div className="social-thread-column">
                <div className="social-avatar">
                  {post.author[0]}
                </div>
                {post.comments?.length > 0 && <div className="social-thread-line" />}
              </div>
              
              <div className="social-post-content">
                <div className="social-post-header">
                  <div className="social-post-author flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-1">
                      {post.author}
                      {post.authorRole === 'admin' && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"><Plus size={8} className="text-white" /></div>}
                    </div>
                    {post.clubName && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {post.clubName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="social-post-time">{new Date(post.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'kk-KZ', { day: 'numeric', month: 'short' })}</span>
                    {(post.authorId === user?.id || user?.role === 'admin') && (
                      <div className="relative">
                        <button onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                          <MoreHorizontal size={16} />
                        </button>
                        {activeMenuId === post.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                            <button 
                              onClick={() => {
                                if(window.confirm('Удалить этот пост?')) {
                                  removePost(post.id);
                                  setActiveMenuId(null);
                                }
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium border-none cursor-pointer"
                            >
                              <Trash2 size={16} /> Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="social-post-text">{post.text}</p>
                
                {post.image && (
                  <div className="social-post-image-container">
                    <img src={post.image} className="social-post-image" alt="" />
                  </div>
                )}

                <div className="social-actions-row">
                  <button 
                    onClick={() => likePost(post.id)}
                    className={`social-action-btn ${post.likedBy?.includes(user?.id || user?.email) ? 'active' : ''}`}
                  >
                    <Heart size={20} fill={post.likedBy?.includes(user?.id || user?.email) ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => {
                      setActiveReplyId(activeReplyId === post.id ? null : post.id);
                      setReplyText('');
                    }}
                    className="social-action-btn"
                  >
                    <MessageSquare size={20} />
                  </button>
                  <button className="social-action-btn"><Repeat2 size={20} /></button>
                  <button onClick={() => shareToSocial('wa', post)} className="social-action-btn"><Send size={20} /></button>
                </div>

                <div className="social-post-stats">
                  {post.likes > 0 && <span>{post.likes} {t('social.likes')}</span>}
                  {post.comments?.length > 0 && <span>{post.comments.length} {t('social.replies')}</span>}
                </div>

                {/* Inline Reply for Post */}
                {activeReplyId === post.id && (
                  <div className="mt-4 animate-fade-in flex gap-3">
                    <input 
                      autoFocus
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-primary"
                      placeholder={t('social.comment_placeholder')}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                    />
                    <button 
                      onClick={() => handleReply(post.id)}
                      className="text-primary font-bold text-sm px-2"
                    >
                      {t('social.publish')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Threaded Comments */}
            {post.comments?.map((comment, idx) => (
              <div key={comment.id} className="social-comment">
                <div className="social-comment-line" style={{ display: idx === post.comments.length - 1 && activeReplyId !== post.id ? 'none' : 'block' }} />
                <div className="social-thread-column" style={{ width: '48px' }}>
                  <div className="social-comment-avatar">
                    {comment.author[0]}
                  </div>
                </div>
                <div className="social-post-content">
                  <div className="social-post-header">
                    <span className="social-post-author" style={{ fontSize: '0.85rem' }}>{comment.author}</span>
                    <span className="social-post-time" style={{ fontSize: '0.75rem' }}>{new Date(comment.date).toLocaleDateString()}</span>
                  </div>
                  <p className="social-post-text" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-2)' }}>{comment.text}</p>
                  
                  <div className="social-actions-row">
                    <button 
                      onClick={() => likeComment(post.id, comment.id)}
                      className={`social-action-btn ${comment.likedBy?.includes(user?.id || user?.email) ? 'active' : ''}`}
                      style={{ padding: '4px' }}
                    >
                      <Heart size={16} fill={comment.likedBy?.includes(user?.id || user?.email) ? 'currentColor' : 'none'} />
                    </button>
                    <button className="social-action-btn" style={{ padding: '4px' }}><MessageSquare size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold">{t('social.no_posts')}</p>
          </div>
        )}
      </div>
      
      <AlertModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
    </div>
  );
};

