import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

const NAV_LINKS = [
  { label: 'Возможности', href: '#features' },
  { label: 'Роли', href: '#roles' },
  { label: 'Безопасность', href: '#security' },
  { label: 'Тариф', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: 'var(--space-6) 0' }}>
      <header className="container">
        <div
          className="glass navbar-landing-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            minHeight: '80px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(255,255,255,0.4)',
            overflow: 'visible',
          }}
        >
          <div className="navbar-logo-wrap">
            <Link to="/" className="navbar-logo-link" aria-label="Palestra — на главную" onClick={closeMenu}>
              <img
                src="/palestra-logo-nav-full.png"
                alt=""
                className="navbar-brand-logo"
                decoding="async"
              />
            </Link>
          </div>

          <nav className="mobile-hidden navbar-desktop-nav" aria-label="Навигация по лендингу">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="nav-link"
                style={{ 
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family-display)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          <div className="navbar-auth-actions">
            <Link to="/auth/login" style={{ textDecoration: 'none' }} className="mobile-hidden">
              <Button variant="ghost" className="font-display" style={{ fontWeight: 700 }}>Войти</Button>
            </Link>
            <Link to="/auth/register" style={{ textDecoration: 'none' }} onClick={closeMenu}>
              <Button variant="primary" size="md" className="font-display" style={{ paddingLeft: 'var(--space-8)', paddingRight: 'var(--space-8)' }}>
                Подключить бесплатно
              </Button>
            </Link>
            <button
              type="button"
              className="navbar-burger mobile-only"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
              aria-controls="landing-mobile-menu"
              onClick={() => setIsMenuOpen((value) => !value)}
              style={{ zIndex: 110, position: 'relative' }}
            >
              {isMenuOpen ? <X size={26} aria-hidden /> : <Menu size={26} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Portal-like placement */}
      <div
        id="landing-mobile-menu"
        className={`navbar-mobile-menu ${isMenuOpen ? 'navbar-mobile-menu--open' : ''}`}
        hidden={!isMenuOpen}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-bg)',
          zIndex: 105,
          display: isMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          padding: 'calc(var(--space-16) + var(--safe-area-inset-top)) var(--space-8) var(--space-8)',
          gap: 'var(--space-8)',
          overflowY: 'auto'
        }}
      >
        <nav 
          aria-label="Мобильная навигация по лендингу"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)'
          }}
        >
          {NAV_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={closeMenu}
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div 
          className="navbar-mobile-menu__actions"
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <Link to="/auth/login" onClick={closeMenu} style={{ textDecoration: 'none' }}>
            <Button variant="ghost" className="w-full h-14 font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Войти</Button>
          </Link>
          <Link to="/auth/register" onClick={closeMenu} style={{ textDecoration: 'none' }}>
            <Button variant="primary" className="w-full h-14 font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Подключить бесплатно
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
