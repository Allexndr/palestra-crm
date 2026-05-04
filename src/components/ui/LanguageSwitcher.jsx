import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

export const LanguageSwitcher = ({ variant = 'default' }) => {
  const { lang, toggleLanguage } = useTranslation();

  const isDark = variant === 'dark';

  return (
    <div 
      className={`lang-switcher lang-switcher--${variant}`} 
      onClick={toggleLanguage}
      title={lang === 'ru' ? 'Қазақ тіліне ауысу' : 'Переключить на русский'}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: isDark ? 'rgba(0,0,0,0.2)' : 'var(--color-ice-200)',
        borderRadius: '10px',
        padding: '2px',
        cursor: 'pointer',
        width: '52px',
        height: '26px',
        position: 'relative',
        transition: 'all 0.3s ease',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid var(--color-border)',
        boxSizing: 'content-box',
        userSelect: 'none'
      }}
    >
      <div 
        className="lang-switcher-handle"
        style={{
          width: '26px',
          height: '22px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : 'white',
          borderRadius: '8px',
          position: 'absolute',
          left: lang === 'ru' ? '2px' : '24px',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1
        }}
      />
      <div style={{ 
        flex: 1, 
        textAlign: 'center', 
        fontSize: '9px', 
        fontWeight: 900, 
        zIndex: 2, 
        transition: 'color 0.3s',
        color: lang === 'ru' ? 'var(--color-primary)' : (isDark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)') 
      }}>RU</div>
      <div style={{ 
        flex: 1, 
        textAlign: 'center', 
        fontSize: '9px', 
        fontWeight: 900, 
        zIndex: 2, 
        transition: 'color 0.3s',
        color: lang === 'kk' ? 'var(--color-primary)' : (isDark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)') 
      }}>KK</div>
    </div>
  );
};
