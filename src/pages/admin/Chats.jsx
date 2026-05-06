import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertModal } from '../../components/ui/AlertModal';
import { useAlertModal } from '../../hooks/useModal';
import { useTranslation } from '../../context/LanguageContext';
import { Send, Paperclip, MoreVertical, Users, User, Hash, MessageSquare, Filter, X, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { uploadBlobFile } from '../../lib/blobClient';

export const Chats = () => {
  const { messages, sendMessage, user, groups, coaches, members } = useAdmin();
  const { t, language } = useTranslation();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, group, direct
  const messagesEndRef = useRef(null);
  const { isOpen, modalProps, closeModal, error: showError } = useAlertModal();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChatId]);

  // Derive chats from groups, coaches, and members (for admin monitoring)
  const availableChats = [
    ...groups.map(g => ({
      id: `group-${g.id}`,
      type: 'group',
      name: g.name,
      icon: <Users size={18} />,
      participants: members.filter(m => m.groupId === g.id).length + 1,
      coachId: g.coachId,
      groupId: g.id,
      coachName: coaches.find(c => c.id === g.coachId)?.firstName || t('chats.no_coach')
    })),
    ...coaches.map(c => ({
      id: `direct-${user?.id}-${c.id}`,
      type: 'direct',
      name: `${c.firstName} ${c.lastName}`,
      icon: <User size={18} />,
      role: t('roles.coach'),
      userId: c.id
    })),
    ...(user?.role === 'admin' ? members.map(m => ({
      id: `direct-monitor-${m.id}`,
      type: 'direct',
      name: `${m.firstName} ${m.lastName}`,
      icon: <User size={18} />,
      role: t('roles.student') || 'Ученик',
      userId: m.id,
      groupId: m.groupId
    })) : [])
  ];

  const filteredChats = availableChats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || chat.type === filterType;
    
    // Role based visibility
    if (user?.role === 'admin') {
      return matchesSearch && matchesType;
    }
    
    if (user?.role === 'coach') {
      if (chat.type === 'group') return chat.coachId === user.id && matchesSearch && matchesType;
      return matchesSearch && matchesType;
    }

    return matchesSearch && matchesType;
  });

  const currentChat = availableChats.find(c => c.id === selectedChatId);
  const currentMessages = messages.filter(m => m.chatId === selectedChatId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;
    sendMessage(selectedChatId, inputText);
    setInputText('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChatId) return;

    setIsUploading(true);
    try {
      const url = await uploadBlobFile(file, 'chat-attachments');
      sendMessage(selectedChatId, '', [{ url, type: file.type, name: file.name }]);
    } catch (error) {
      showError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
        <div className="p-6">
          <h2 className="h4 mb-6">{t('chats.title')}</h2>
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder={t('chats.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-2xl border-none shadow-sm text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'all', label: t('chats.filter_all') },
              { id: 'group', label: t('chats.filter_groups') },
              { id: 'direct', label: t('chats.filter_direct') }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-none cursor-pointer ${filterType === f.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-1">
            {filteredChats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-none transition-all cursor-pointer text-left ${selectedChatId === chat.id ? 'bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100' : 'bg-transparent hover:bg-white/50 text-slate-600'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedChatId === chat.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {chat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className={`font-bold truncate ${selectedChatId === chat.id ? 'text-slate-900' : 'text-slate-700'}`}>{chat.name}</p>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {chat.type === 'group' ? t('chats.participants', { count: chat.participants }) : chat.role}
                  </p>
                </div>
              </button>
            ))}
            {filteredChats.length === 0 && (
              <div className="text-center py-12 px-4">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-slate-400 text-sm font-medium">{t('chats.no_chats')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-primary rounded-xl flex items-center justify-center">
                  {currentChat?.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-none mb-1">{currentChat?.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('chats.online')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-slate-50 rounded-xl border-none bg-transparent cursor-pointer text-slate-400 transition-all"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-slate-50/20">
              {currentMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                   <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6"><MessageSquare size={48} /></div>
                   <p className="font-bold text-slate-500">{t('chats.start_chat')}</p>
                   <p className="text-sm text-slate-400 mt-2">{t('chats.secure_msg')}</p>
                </div>
              )}
              {currentMessages.map((msg, i) => {
                const isOwn = msg.senderId === user?.id;
                const prevMsg = currentMessages[i-1];
                const showAuthor = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[80%] ${isOwn ? 'ml-auto' : ''}`}>
                    {showAuthor && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{msg.senderName}</p>}
                    <div className={`p-4 rounded-2xl shadow-sm ${isOwn ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                      {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                      {msg.attachments?.map((att, j) => (
                        <div key={j} className={`mt-2 ${msg.text ? 'pt-2 border-t' : ''} ${isOwn ? 'border-white/10' : 'border-slate-100'}`}>
                          {att.type.startsWith('image/') ? (
                            <img src={att.url} alt="attachment" className="max-w-full rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-all" onClick={() => window.open(att.url, '_blank')} />
                          ) : (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${isOwn ? 'bg-white/10' : 'bg-slate-50'}`}>
                              <FileIcon size={16} />
                              <span className="text-xs font-medium truncate">{att.name}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className={`text-[9px] font-bold text-slate-400 mt-1.5 px-1`}>
                      {new Date(msg.date).toLocaleTimeString(language === 'kk' ? 'kk-KZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-50">
              <form onSubmit={handleSend} className="flex items-center gap-4 bg-slate-50 p-2 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <div className="flex items-center">
                  <label className="p-3 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 cursor-pointer transition-all">
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    <Paperclip size={20} className={isUploading ? 'animate-spin' : ''} />
                  </label>
                </div>
                  <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('chats.input_placeholder')} 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 py-3"
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isUploading}
                  className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={18} fill="currentColor" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/10">
            <div className="w-32 h-32 bg-white shadow-2xl shadow-slate-200 rounded-[48px] flex items-center justify-center mb-10 animate-bounce-slow">
              <MessageSquare size={56} className="text-primary" />
            </div>
            <h3 className="h3 mb-4">{t('chats.welcome_title')}</h3>
            <p className="text-slate-400 text-center max-w-sm font-medium leading-relaxed">
              {t('chats.welcome_desc')}
            </p>
            
            <div className="mt-16 grid grid-cols-2 gap-6 max-w-md">
               <div className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                  <Users className="text-primary mb-4" size={24} />
                  <p className="text-xs font-bold text-slate-800 mb-1">{t('chats.group_feature_title')}</p>
                  <p className="text-[10px] text-slate-400 leading-normal">{t('chats.group_feature_desc')}</p>
               </div>
               <div className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                  <User className="text-emerald-500 mb-4" size={24} />
                  <p className="text-xs font-bold text-slate-800 mb-1">{t('chats.direct_feature_title')}</p>
                  <p className="text-[10px] text-slate-400 leading-normal">{t('chats.direct_feature_desc')}</p>
               </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
      
      <AlertModal isOpen={isOpen} onClose={closeModal} {...modalProps} />
    </div>
  );
};
