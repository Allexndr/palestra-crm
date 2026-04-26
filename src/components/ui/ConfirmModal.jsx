import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Подтверждение действия', 
  message = 'Вы уверены, что хотите выполнить это действие?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)'
    }}>
      <Card className="animate-up" style={{ width: '100%', maxWidth: '400px', padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className={`mb-4 w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-primary-soft text-primary'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="h4 mb-2">{title}</h3>
            <p className="text-secondary text-sm mb-8">{message}</p>
            
            <div className="flex gap-3 w-100 justify-center w-full">
              <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>{cancelText}</Button>
              <Button 
                variant={variant === 'danger' ? 'primary' : 'primary'} 
                onClick={() => { onConfirm(); onClose(); }} 
                style={{ flex: 1, backgroundColor: variant === 'danger' ? 'var(--color-danger)' : undefined }}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
