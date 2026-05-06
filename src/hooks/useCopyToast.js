import { useState, useCallback } from 'react';

/**
 * Хук для показа уведомлений при копировании
 * Автоматически скрывает сообщение через 2 секунды
 */
export const useCopyToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: ''
  });

  const showToast = useCallback((message = 'Данные скопированы') => {
    setToast({ show: true, message });
    
    // Автоматически скрыть через 2 секунды
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2000);
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '' });
  }, []);

  const copyWithToast = useCallback(async (text, customMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(customMessage || 'Данные скопированы');
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    copyWithToast
  };
};

export default useCopyToast;
