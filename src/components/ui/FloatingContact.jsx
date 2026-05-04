import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export const FloatingContact = () => {
  return (
    <div 
      className="floating-contact"
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999
      }}
    >
      <a 
        href="tel:+77002579004" 
        className="floating-btn floating-btn--phone"
        title="Позвонить"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'white',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: '1px solid var(--color-border)',
          textDecoration: 'none'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        }}
      >
        <Phone size={24} />
      </a>
      <a 
        href="https://wa.me/77051112240" 
        target="_blank" 
        rel="noreferrer" 
        className="floating-btn floating-btn--whatsapp"
        title="WhatsApp"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(37, 211, 102, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: 'none',
          textDecoration: 'none'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(37, 211, 102, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(37, 211, 102, 0.3)';
        }}
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};
