import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Bot } from 'lucide-react';

const WELCOME = {
  role: 'assistant',
  content: 'Привет! Я помогу разобраться с платформой Palestra. Спрашивай — отвечу коротко и по делу 👋',
};

const SUGGESTIONS = [
  'Как добавить ученика?',
  'Как создать расписание?',
  'Как ученик войдёт в кабинет?',
  'Как загрузить логотип клуба?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 8,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>
          <Bot size={14} />
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--color-primary)' : '#f1f5f9',
        color: isUser ? '#fff' : 'var(--color-text)',
        fontSize: 13,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    setInput('');
    setShowSuggestions(false);
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Что-то пошло не так.',
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Не удалось получить ответ. Проверьте соединение.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Помощник"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(49,70,166,0.4)',
          zIndex: 9999,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          width: 340,
          maxWidth: 'calc(100vw - 48px)',
          height: 480,
          maxHeight: 'calc(100vh - 120px)',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Помощник Palestra</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>Задайте любой вопрос о платформе</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 12px 4px',
          }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} />
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '16px 16px 16px 4px', background: '#f1f5f9' }}>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}

            {showSuggestions && !isLoading && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: '5px 10px', borderRadius: 20,
                      border: '1px solid var(--color-border)',
                      background: '#fff', cursor: 'pointer',
                      fontSize: 11, fontWeight: 600,
                      color: 'var(--color-primary)',
                      transition: 'background 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: 8,
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Напишите вопрос..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc',
                color: 'var(--color-text)',
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: input.trim() && !isLoading ? 'var(--color-primary)' : '#e2e8f0',
                color: input.trim() && !isLoading ? '#fff' : '#94a3b8',
                border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.15s',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
