import React, { useState } from 'react';

/**
 * Логотип клуба: если путь битый или файла нет — текстовый значок.
 */
export function ClubLogo({ src, name = 'Palestra', alt = '', height = 48, className = '' }) {
  const [failed, setFailed] = useState(false);
  const safeSrc = (typeof src === 'string' && src.trim()) ? src.trim() : null;
  const useFallback = !safeSrc || failed;
  const initial = (name && name[0]) ? name[0].toUpperCase() : 'P';

  if (useFallback) {
    return (
      <div
        className={className}
        style={{
          height: `${height}px`,
          minWidth: `${Math.round(height * 2.2)}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e1b4b 100%)',
          color: '#fff',
          fontWeight: 800,
          fontSize: `${Math.round(height * 0.45)}px`,
          letterSpacing: '-0.02em',
        }}
        aria-hidden={!name}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={safeSrc}
      alt={alt || name}
      style={{ height: `${height}px`, width: 'auto', maxWidth: '220px', objectFit: 'contain' }}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

