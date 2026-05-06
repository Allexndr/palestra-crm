import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocial } from '../../context/SocialContext';
import { useAdmin } from '../../context/AdminContext';
import { Heart, MessageCircle, Repeat2, Bookmark, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/date';

export const PostCard = ({ post, variant = 'default', showReplies = false, onReply }) => {
  const navigate = useNavigate();
  const { user } = useAdmin();
  const { likePost, unlikePost, savePost, unsavePost, repostPost } = useSocial();
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});

  const isAuthor = user?.id === post.author_id;
  const hasMedia = post.media_urls && post.media_urls.length > 0;
  const topics = post.post_topics?.map(pt => pt.topic) || [];

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (isLiked) {
      await unlikePost(post.id);
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      await likePost(post.id);
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  }, [isLiked, post.id, likePost, unlikePost]);

  const handleSave = useCallback(async (e) => {
    e.stopPropagation();
    if (isSaved) {
      await unsavePost(post.id);
      setIsSaved(false);
    } else {
      await savePost(post.id);
      setIsSaved(true);
    }
  }, [isSaved, post.id, savePost, unsavePost]);

  const handleRepost = useCallback(async (e) => {
    e.stopPropagation();
    if (!isReposted) {
      await repostPost(post.id);
      setIsReposted(true);
      setRepostsCount(prev => prev + 1);
    }
  }, [isReposted, post.id, repostPost]);

  const handleReply = useCallback((e) => {
    e.stopPropagation();
    if (onReply) {
      onReply(post);
    } else {
      navigate(`/social/thread/${post.thread_id || post.id}`);
    }
  }, [post, onReply, navigate]);

  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/social/post/${post.id}`);
      // Could show toast here
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [post.id]);

  const handleClick = useCallback(() => {
    navigate(`/social/thread/${post.thread_id || post.id}`);
  }, [post, navigate]);

  const handleImageLoad = useCallback((index) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  }, []);

  // Media grid layout
  const renderMedia = () => {
    if (!hasMedia) return null;
    
    const media = post.media_urls;
    const count = media.length;
    
    if (count === 1) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden bg-slate-100">
          {media[0].type?.startsWith('video') ? (
            <video 
              src={media[0].url} 
              className="w-full max-h-[500px] object-cover"
              controls
              poster={media[0].thumbnail}
            />
          ) : (
            <img 
              src={media[0].url} 
              alt="Post media" 
              className="w-full max-h-[500px] object-cover"
              loading="lazy"
              onLoad={() => handleImageLoad(0)}
            />
          )}
        </div>
      );
    }
    
    // Grid layout for multiple images
    const gridClass = count === 2 ? 'grid-cols-2' : 
                      count === 3 ? 'grid-cols-2' : 
                      count === 4 ? 'grid-cols-2' : 'grid-cols-2';
    
    return (
      <div className={`mt-3 grid ${gridClass} gap-1 rounded-2xl overflow-hidden`}>
        {media.slice(0, 4).map((item, index) => (
          <div 
            key={index} 
            className={`relative bg-slate-100 ${count === 3 && index === 0 ? 'row-span-2' : ''}`}
          >
            <img 
              src={item.url} 
              alt={`Post media ${index + 1}`}
              className="w-full h-full object-cover aspect-square"
              loading="lazy"
              onLoad={() => handleImageLoad(index)}
            />
            {count > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-xl">
                +{count - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatContent = (text) => {
    // Highlight hashtags and mentions
    return text.split(/(\s+)/).map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article 
      className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <img 
          src={post.author?.avatar_url || '/default-avatar.png'} 
          alt={post.author?.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {post.author?.name || 'Unknown'}
            </span>
            <span className="text-slate-500 dark:text-zinc-400 text-sm truncate">
              @{post.author?.id?.slice(0, 8)}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-zinc-400 text-sm">
              {formatDistanceToNow(post.created_at)}
            </span>
          </div>
          
          {/* Topics badges */}
          {topics.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {topics.slice(0, 2).map(topic => (
                <span 
                  key={topic.id}
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: topic.color || '#3146A6' }}
                >
                  {topic.name}
                </span>
              ))}
              {topics.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                  +{topics.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* Content */}
          <p className="mt-2 text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {formatContent(post.content)}
          </p>
          
          {/* Media */}
          {renderMedia()}
          
          {/* Actions */}
          <div className="flex items-center gap-6 mt-4">
            <button 
              onClick={handleReply}
              className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors group"
            >
              <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>
            
            <button 
              onClick={handleRepost}
              className={`flex items-center gap-1.5 transition-colors group ${
                isReposted ? 'text-green-500' : 'text-slate-500 dark:text-zinc-400 hover:text-green-500'
              }`}
            >
              <Repeat2 size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">{repostsCount}</span>
            </button>
            
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors group ${
                isLiked ? 'text-red-500' : 'text-slate-500 dark:text-zinc-400 hover:text-red-500'
              }`}
            >
              <Heart 
                size={18} 
                className={`transition-transform ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
              />
              <span className="text-sm">{likesCount}</span>
            </button>
            
            <button 
              onClick={handleSave}
              className={`transition-colors ${isSaved ? 'text-primary' : 'text-slate-500 dark:text-zinc-400 hover:text-primary'}`}
            >
              <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
            </button>
            
            <button 
              onClick={handleShare}
              className="text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors"
            >
              <Share size={18} />
            </button>
            
            {isAuthor && (
              <div className="relative ml-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 shadow-lg rounded-lg border border-slate-100 dark:border-zinc-700 py-1 min-w-[120px] z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* delete logic */ }}
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Preview replies */}
          {showReplies && post.replies && post.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.replies.slice(0, 2).map(reply => (
                <div key={reply.id} className="flex gap-2 text-sm">
                  <img 
                    src={reply.author?.avatar_url || '/default-avatar.png'}
                    alt={reply.author?.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1 bg-slate-50 dark:bg-zinc-800 rounded-lg p-2">
                    <span className="font-medium text-slate-900 dark:text-white">{reply.author?.name}</span>
                    <span className="text-slate-600 dark:text-zinc-400 ml-2">{reply.content.slice(0, 100)}...</span>
                  </div>
                </div>
              ))}
              {post.replies.length > 2 && (
                <button 
                  onClick={handleClick}
                  className="text-primary text-sm hover:underline"
                >
                  Смотреть все {post.replies.length} ответа →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
