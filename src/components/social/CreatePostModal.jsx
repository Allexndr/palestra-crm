import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAdmin } from '../../context/AdminContext';
import { X, Image, Video, Smile, Hash, AtSign, Globe, Users, Lock, ChevronDown, Loader2 } from 'lucide-react';
import { AlertModal } from '../ui/AlertModal';
import { useAlertModal } from '../../hooks/useModal';

export const CreatePostModal = ({ isOpen, onClose, replyTo = null, threadId = null }) => {
  const { user } = useAdmin();
  const { createPost, topics } = useSocial();
  const { isOpen: isAlertOpen, modalProps, closeModal, error: showError, warning: showWarning } = useAlertModal();
  
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [charCount, setCharCount] = useState(0);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const maxChars = 500;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 10) {
      showWarning('Максимум 10 файлов');
      return;
    }
    
    const newFiles = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image'
    }));
    
    setMediaFiles(prev => [...prev, ...newFiles]);
  }, [mediaFiles.length, showWarning]);

  const removeMedia = useCallback((id) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleTopicToggle = useCallback((topicId) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      }
      if (prev.length >= 3) {
        showWarning('Максимум 3 темы');
        return prev;
      }
      return [...prev, topicId];
    });
  }, [showWarning]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      showWarning('Добавьте текст или медиа');
      return;
    }
    
    if (content.length > maxChars) {
      showWarning(`Максимум ${maxChars} символов`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload media first (mock for now)
      const uploadedUrls = mediaFiles.map(file => ({
        url: file.preview, // Replace with actual upload
        type: file.type,
        name: file.file.name
      }));

      const result = await createPost({
        content: content.trim(),
        mediaUrls: uploadedUrls,
        visibility,
        topicIds: selectedTopics,
        threadId,
        parentId: replyTo?.id
      });

      if (result.success) {
        // Cleanup
        mediaFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setContent('');
        setMediaFiles([]);
        setSelectedTopics([]);
        setVisibility('public');
        onClose();
      } else {
        showError(result.error || 'Ошибка при создании поста');
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, mediaFiles, visibility, selectedTopics, threadId, replyTo, createPost, onClose, showError, showWarning]);

  const visibilityOptions = [
    { value: 'public', label: 'Всем', icon: Globe, description: 'Видно всем в сети' },
    { value: 'club_only', label: 'Только клуб', icon: Users, description: 'Только члены вашего клуба' },
    { value: 'followers', label: 'Подписчики', icon: Users, description: 'Только ваши подписчики' },
    { value: 'private', label: 'Только я', icon: Lock, description: 'Только вы' }
  ];

  const currentVisibility = visibilityOptions.find(v => v.value === visibility);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-zinc-400" />
          </button>
          
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {replyTo ? 'Ответить' : threadId ? 'Добавить в ветку' : 'Новая ветка'}
          </h2>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
            className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Публикация...
              </>
            ) : (
              'Опубликовать'
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Reply preview */}
          {replyTo && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Ответ на:</p>
              <p className="text-slate-800 dark:text-zinc-200 line-clamp-2">{replyTo.content}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <img 
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? 'Напишите ответ...' : 'Что нового?'}
                className="w-full min-h-[120px] resize-none border-0 outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent"
                maxLength={maxChars}
              />
              
              {/* Character counter */}
              <div className={`text-xs text-right mt-1 ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                {charCount}/{maxChars}
              </div>
            </div>
          </div>
          
          {/* Selected topics */}
          {selectedTopics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTopics.map(topicId => {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return null;
                return (
                  <span 
                    key={topic.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: topic.color || '#3146A6' }}
                  >
                    {topic.name}
                    <button 
                      onClick={() => handleTopicToggle(topic.id)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Media previews */}
          {mediaFiles.length > 0 && (
            <div className={`grid gap-2 mt-4 ${mediaFiles.length === 1 ? 'grid-cols-1' : mediaFiles.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {mediaFiles.map((file, index) => (
                <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  {file.type === 'video' ? (
                    <video src={file.preview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={file.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(file.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                  {index === 3 && mediaFiles.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-xl">
                      +{mediaFiles.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Добавить фото/видео"
            >
              <Image size={20} />
            </button>
            <button 
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Добавить эмодзи"
            >
              <Smile size={20} />
            </button>
            <button 
              onClick={() => setShowTopicDropdown(!showTopicDropdown)}
              className={`p-2 rounded-full transition-colors ${showTopicDropdown ? 'bg-primary/10 text-primary' : 'text-primary hover:bg-primary/10'}`}
              title="Добавить тему"
            >
              <Hash size={20} />
            </button>
            <button 
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Упомянуть"
            >
              <AtSign size={20} />
            </button>
          </div>
          
          {/* Topic dropdown */}
          {showTopicDropdown && (
            <div className="mb-3 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl max-h-40 overflow-y-auto">
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">Выберите темы (макс. 3):</p>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedTopics.includes(topic.id)
                        ? 'text-white'
                        : 'bg-white dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-600'
                    }`}
                    style={selectedTopics.includes(topic.id) ? { backgroundColor: topic.color || '#3146A6' } : undefined}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Visibility selector */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <currentVisibility.icon size={16} />
              {currentVisibility.label}
              <ChevronDown size={14} />
            </button>
            
            {showVisibilityDropdown && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-900 shadow-lg rounded-xl border border-slate-100 dark:border-zinc-800 py-2 min-w-[200px] z-10">
                {visibilityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setVisibility(option.value); setShowVisibilityDropdown(false); }}
                    className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors ${
                      visibility === option.value ? 'text-primary' : 'text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <option.icon size={18} />
                    <div className="text-left">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-slate-400">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertModal isOpen={isAlertOpen} onClose={closeModal} {...modalProps} />
    </div>
  );
};
