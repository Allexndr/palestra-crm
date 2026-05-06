import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);

    if (duration !== Infinity) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Modal confirm replacement
  const [confirmState, setConfirmState] = useState(null);
  
  const confirm = useCallback(({ title, message, confirmText, cancelText, variant = 'primary' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        confirmText,
        cancelText,
        variant,
        resolve: (val) => {
          setConfirmState(null);
          resolve(val);
        }
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification, confirm }}>
      {children}
      
      {/* Toast Notifications Overlay */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id}
            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl shadow-2xl animate-slide-in-right min-w-[320px] max-w-[420px] border border-white/20 backdrop-blur-md ${
              n.type === 'success' ? 'bg-emerald-500 text-white' :
              n.type === 'error' ? 'bg-rose-500 text-white' :
              n.type === 'warning' ? 'bg-amber-500 text-white' :
              'bg-slate-800 text-white'
            }`}
          >
            <div className="mt-1">
              {n.type === 'success' && <CheckCircle size={20} />}
              {n.type === 'error' && <XCircle size={20} />}
              {n.type === 'warning' && <AlertCircle size={20} />}
              {n.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              {n.title && <p className="font-black text-sm uppercase tracking-wider mb-1">{n.title}</p>}
              <p className="text-sm font-medium opacity-90">{n.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="mt-1 opacity-50 hover:opacity-100 transition-opacity bg-transparent border-none text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Global Confirm Modal via Portal */}
      {confirmState && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          padding: '16px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '28px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid #f1f5f9',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
              {confirmState.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => confirmState.resolve(false)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '14px', color: '#64748b',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                {confirmState.cancelText || 'Отмена'}
              </button>
              <button
                onClick={() => confirmState.resolve(true)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '14px', color: '#fff',
                  background: confirmState.variant === 'danger' ? '#ef4444' : '#4f46e5',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {confirmState.confirmText || 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};
