import React from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * Компонент для отображения уведомления о копировании
 * Появляется внизу экрана и автоматически исчезает
 */
export const CopyToast = ({ show, message = 'Данные скопированы', onClose }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
      onClick={onClose}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-2xl">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-sm font-medium whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};

export default CopyToast;
