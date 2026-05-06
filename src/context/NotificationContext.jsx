import React, { createContext, useContext, useState, useCallback } from 'react';
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

      {/* Global Confirm Modal */}
      {confirmState && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scale-up border border-slate-100 relative mx-auto">
            <h3 className="text-2xl font-black text-slate-800 mb-4">{confirmState.title}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed font-medium">{confirmState.message}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => confirmState.resolve(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border-none cursor-pointer"
              >
                {confirmState.cancelText || 'Отмена'}
              </button>
              <button 
                onClick={() => confirmState.resolve(true)}
                className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all border-none cursor-pointer shadow-lg active:scale-95 ${
                  confirmState.variant === 'danger' ? 'bg-rose-500 shadow-rose-100 hover:bg-rose-600' : 'bg-primary shadow-indigo-100 hover:bg-indigo-600'
                }`}
              >
                {confirmState.confirmText || 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
