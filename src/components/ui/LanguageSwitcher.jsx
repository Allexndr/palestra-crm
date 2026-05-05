import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

export const LanguageSwitcher = ({ variant = 'circle' }) => {
  const { lang, toggleLanguage } = useTranslation();

  if (variant === 'sidebar') {
    return (
      <div 
        onClick={toggleLanguage}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '4px',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          width: '100%',
          marginBottom: 'var(--space-4)',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          width: 'calc(50% - 4px)',
          height: 'calc(100% - 8px)',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '12px',
          left: lang === 'ru' ? '4px' : 'calc(50%)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 0
        }} />
        <div style={{ 
          flex: 1, 
          textAlign: 'center', 
          fontSize: '11px', 
          fontWeight: 800, 
          zIndex: 1, 
          color: lang === 'ru' ? 'white' : 'var(--color-text-muted)',
          padding: '8px 0',
          transition: 'color 0.3s'
        }}>RU</div>
        <div style={{ 
          flex: 1, 
          textAlign: 'center', 
          fontSize: '11px', 
          fontWeight: 800, 
          zIndex: 1, 
          color: lang === 'kk' ? 'white' : 'var(--color-text-muted)',
          padding: '8px 0',
          transition: 'color 0.3s'
        }}>KZ</div>
      </div>
    );
  }

  return (
    <div 
      className="lang-switcher-circle" 
      onClick={toggleLanguage}
      title={lang === 'ru' ? 'Қазақ тіліне ауысу' : 'Переключить на русский'}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid var(--color-border)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
      }}
    >
      <div style={{
        fontSize: '14px',
        fontWeight: 900,
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-family-display)',
        position: 'relative',
        width: '100%',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ 
          position: 'absolute',
          transition: 'all 0.3s ease',
          opacity: lang === 'ru' ? 1 : 0,
          transform: lang === 'ru' ? 'scale(1)' : 'scale(0.8)',
          pointerEvents: lang === 'ru' ? 'auto' : 'none'
        }}>RU</span>
        <span style={{ 
          position: 'absolute',
          transition: 'all 0.3s ease',
          opacity: lang === 'kk' ? 1 : 0,
          transform: lang === 'kk' ? 'scale(1)' : 'scale(0.8)',
          pointerEvents: lang === 'kk' ? 'auto' : 'none'
        }}>KZ</span>
      </div>
    </div>
  );
};
