import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../../components/ui/Button';
import { uploadBlobFile } from '../../lib/blobClient';
import { Heart, MessageSquare, Repeat2, Send, X, MoreHorizontal, Search, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

export const Feed = () => {
  const { user } = useAdmin();
  const { t, lang: language } = useTranslation();
  const { posts, likePost, deletePost: removePost, createPost, addComment, likeComment } = useSocial();

  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const handlePost = () => {
    if (!newPostText.trim() && !newPostImage) return;
    createPost({ text: newPostText, image: newPostImage });
    setNewPostText('');
    setNewPostImage('');
  };

  const handleReply = (postId, parentCommentId = null) => {
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
      console.error(error.message);
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
      
    </div>
  );
};

