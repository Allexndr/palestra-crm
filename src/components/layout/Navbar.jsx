import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const getNavLinks = (t) => [
  { label: t('nav.features') || 'Возможности', href: '#features' },
  { label: t('nav.roles') || 'Роли', href: '#roles' },
  { label: t('nav.security') || 'Безопасность', href: '#security' },
  { label: t('nav.launch') || 'Запуск', href: '#implementation' },
  { label: t('nav.pricing') || 'Тариф', href: '#pricing' },
  { label: t('nav.faq') || 'FAQ', href: '#faq' },
];

export const Navbar = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const NAV_LINKS = getNavLinks(t);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: 'var(--space-4) 0', transition: 'all 0.3s ease' }}>
      <header className="container">
        <div
          className="glass navbar-landing-bar"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            minHeight: '90px',
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
                style={{ height: '50px', width: 'auto' }}
                decoding="async"
              />
            </Link>
          </div>

          <nav className="mobile-hidden navbar-desktop-nav" aria-label="Навигация по лендингу" style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {NAV_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="nav-link"
                style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family-display)',
                  transition: 'all 0.2s ease'
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          <div className="navbar-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="mobile-hidden">
              <LanguageSwitcher />
            </div>

            <Link to="/auth/login" style={{ textDecoration: 'none' }} className="mobile-hidden">
              <Button variant="ghost" className="font-display" style={{ fontWeight: 700, fontSize: '0.8rem' }}>{t('nav.login') || 'Войти'}</Button>
            </Link>
            
            <Link to="/auth/register" style={{ textDecoration: 'none' }} onClick={closeMenu}>
              <Button variant="primary" size="sm" className="font-display" style={{ paddingLeft: 'var(--space-5)', paddingRight: 'var(--space-5)', fontWeight: 800, fontSize: '0.8rem' }}>
                {t('nav.register_free') || 'Подключить'}
              </Button>
            </Link>
            <button
              type="button"
              className="navbar-burger mobile-only"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
              aria-controls="landing-mobile-menu"
              onClick={() => setIsMenuOpen((value) => !value)}
              style={{ zIndex: 110, position: 'relative', background: 'none', border: 'none', padding: 'var(--space-2)' }}
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
            <Button variant="ghost" className="w-full h-14 font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('nav.login') || 'Войти'}</Button>
          </Link>
          <Link to="/auth/register" onClick={closeMenu} style={{ textDecoration: 'none' }}>
            <Button variant="primary" className="w-full h-14 font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {t('nav.register_free') || 'Подключить'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
