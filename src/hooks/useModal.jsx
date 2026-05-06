import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: '',
    message: '',
    variant: 'info',
    confirmText: 'OK',
    onConfirm: null,
  });

  const openModal = useCallback((props) => {
    setModalProps({
      title: props.title || 'Сообщение',
      message: props.message || '',
      variant: props.variant || 'info',
      confirmText: props.confirmText || 'OK',
      onConfirm: props.onConfirm || null,
    });
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalProps.onConfirm) {
      modalProps.onConfirm();
    }
    closeModal();
  }, [modalProps.onConfirm, closeModal]);

  return {
    isOpen,
    modalProps,
    openModal,
    closeModal,
    handleConfirm,
  };
};

// Helper for alert-style modals (info, warning, error)
export const useAlertModal = () => {
  const { isOpen, modalProps, openModal, closeModal } = useModal();

  const alert = useCallback((message, options = {}) => {
    openModal({
      title: options.title || 'Сообщение',
      message,
      variant: options.variant || 'info',
      confirmText: options.confirmText || 'OK',
    });
  }, [openModal]);

  const error = useCallback((message, options = {}) => {
    openModal({
      title: options.title || 'Ошибка',
      message,
      variant: 'error',
      confirmText: options.confirmText || 'OK',
    });
  }, [openModal]);

  const success = useCallback((message, options = {}) => {
    openModal({
      title: options.title || 'Успех',
      message,
      variant: 'success',
      confirmText: options.confirmText || 'OK',
    });
  }, [openModal]);

  const warning = useCallback((message, options = {}) => {
    openModal({
      title: options.title || 'Внимание',
      message,
      variant: 'warning',
      confirmText: options.confirmText || 'OK',
    });
  }, [openModal]);

  return {
    isOpen,
    modalProps,
    closeModal,
    alert,
    error,
    success,
    warning,
  };
};
