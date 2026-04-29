import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdmin } from '../../context/AdminContext';
import { MessageSquare, Heart, Share2, Send, Plus, Image as ImageIcon, X, SendHorizonal, MoreHorizontal } from 'lucide-react';
import { uploadBlobFile } from '../../lib/blobClient';

export const Feed = () => {
  const { posts, addPost, likePost, addComment, user } = useAdmin();
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeComments, setActiveComments] = useState({}); // postId -> bool
  const [commentText, setCommentText] = useState({}); // postId -> text

  const handlePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    addPost({ text: newPostText, image: newPostImage });
    setNewPostText('');
    setNewPostImage('');
    setIsPosting(false);
  };

  const handleComment = (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    addComment(postId, text);
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handlePostImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadBlobFile(file, 'posts');
      setNewPostImage(url);
    } catch (error) {
      alert(error.message || 'Не удалось загрузить фото');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const shareToSocial = (platform, post) => {
    const text = `Посмотрите новости Palestra: ${post.text.substring(0, 50)}...`;
    const url = window.location.href;
    const shareUrl = platform === 'wa' 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
      : `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const canPost = ['admin', 'coach'].includes(user?.role);

  return (
    <div className="animate-fade-in max-w-[680px] mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="h2 m-0">Лента</h1>
        {canPost && (
          <button 
            onClick={() => setIsPosting(true)} 
            className="w-10 h-10 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus size={20} />
          </button>
        )}
      </div>

        <div className="member-feed-layout">
          <section className="member-feed-main">
        {isPosting && (
          <Card className="mb-10 animate-up shadow-2xl border-2 border-primary overflow-hidden p-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="font-bold">Новая публикация</h4>
                 <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer"><X size={20}/></button>
              </div>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-2xl p-6 text-lg outline-none focus:ring-2 ring-indigo-100 transition-all mb-4" 
                placeholder="Что нового в клубе?" 
                rows={4} 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                style={{ resize: 'none' }}
              />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <ImageIcon size={20} className="text-slate-400" />
                   <input 
                     type="file" 
                     accept="image/*"
                     className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
                     onChange={handlePostImageUpload}
                   />
                </div>
                {isUploadingImage && <p className="text-xs text-muted">Загрузка фото в Blob...</p>}
                {newPostImage && <p className="text-xs text-primary">Фото загружено</p>}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end">
               <Button variant="primary" onClick={handlePost} disabled={!newPostText.trim()} style={{ borderRadius: '14px', padding: '12px 32px' }}>
                 Опубликовать
               </Button>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-10">
          {posts.map((post) => (
            <Card key={post.id} style={{ padding: 0 }} className="card-hover border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white animate-up">
              {/* Post Header */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div style={{ 
                    width: 48, height: 48, borderRadius: '16px', 
                    backgroundColor: post.authorRole === 'admin' ? 'var(--color-primary)' : 'var(--color-success)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 'bold'
                  }}>
                    {post.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{post.author}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-indigo-50 px-2 py-0.5 rounded">
                        {post.authorRole === 'admin' ? 'Админ' : 'Тренер'}
                      </span>
                      <span className="text-[10px] text-muted font-medium">{new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"><MoreHorizontal size={20} /></button>
              </div>
              
              {/* Post Content */}
              <div className="px-6 pb-4">
                <p className="text-slate-800 leading-relaxed mb-6 font-medium" style={{ fontSize: '1.05rem' }}>
                  {post.text}
                </p>
              </div>

              {post.image && (
                <div className="mb-4">
                  <img src={post.image} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} alt="Post" />
                </div>
              )}

              {/* Post Stats & Actions */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => likePost(post.id)}
                    className={`flex items-center gap-2 border-none bg-transparent cursor-pointer font-bold text-sm transition-all ${post.likedBy?.includes(user?.id || user?.email) ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                  >
                    <Heart size={20} fill={post.likedBy?.includes(user?.id || user?.email) ? "currentColor" : "none"} /> {post.likes || 0}
                  </button>
                  <button 
                    onClick={() => setActiveComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors border-none bg-transparent cursor-pointer font-bold text-sm"
                  >
                    <MessageSquare size={20} /> {post.comments?.length || 0}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => shareToSocial('wa', post)}
                    className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all border-none cursor-pointer"
                   >
                     <Send size={18} />
                   </button>
                   <button 
                    onClick={() => shareToSocial('tg', post)}
                    className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 transition-all border-none cursor-pointer"
                   >
                     <Share2 size={18} />
                   </button>
                </div>
              </div>

              {/* Comments Section */}
              {activeComments[post.id] && (
                <div className="bg-slate-50 p-6 border-t border-slate-100 animate-fade-in">
                   <div className="flex flex-col gap-4 mb-6">
                     {post.comments?.map(comment => (
                       <div key={comment.id} className="flex gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                           {comment.author[0]}
                         </div>
                         <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-xs font-bold text-slate-900">{comment.author}</p>
                               <span className="text-[9px] text-muted">{new Date(comment.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-700">{comment.text}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <input 
                        type="text" 
                        placeholder="Напишите комментарий..." 
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                     />
                     <button 
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText[post.id]?.trim()}
                        className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                     >
                       <SendHorizonal size={18} />
                     </button>
                   </div>
                </div>
              )}
            </Card>
          ))}
          {posts.length === 0 && (
            <div className="py-20 text-center">
               <ImageIcon size={64} className="mx-auto text-slate-100 mb-6" />
               <p className="text-slate-400 font-bold">Лента пока пуста</p>
            </div>
          )}
        </div>
      </section>
    </div>
  </div>
);
};
