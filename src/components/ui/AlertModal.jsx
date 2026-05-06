import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Info, AlertCircle, CheckCircle, X } from 'lucide-react';

const icons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
  error: AlertCircle,
};

const colors = {
  info: { bg: 'bg-blue-50', text: 'text-blue-600', icon: '#2563eb' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: '#d97706' },
  success: { bg: 'bg-green-50', text: 'text-green-600', icon: '#16a34a' },
  error: { bg: 'bg-red-50', text: 'text-red-600', icon: '#dc2626' },
};

export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = 'Сообщение', 
  message = '',
  confirmText = 'OK',
  variant = 'info'
}) => {
  if (!isOpen) return null;

  const Icon = icons[variant] || icons.info;
  const color = colors[variant] || colors.info;

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
            <div className={`mb-4 w-12 h-12 rounded-full flex items-center justify-center ${color.bg} ${color.text}`}>
              <Icon size={24} style={{ color: color.icon }} />
            </div>
            <h3 className="h4 mb-2">{title}</h3>
            <p className="text-secondary text-sm mb-8 whitespace-pre-wrap">{message}</p>
            
            <div className="flex justify-center w-full">
              <Button 
                variant="primary" 
                onClick={onClose} 
                style={{ minWidth: '120px' }}
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
