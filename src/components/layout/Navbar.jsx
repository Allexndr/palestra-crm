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

          <div className="navbar-actions">
            <nav className="mobile-hidden navbar-desktop-nav" aria-label="Навигация по лендингу">
              {NAV_LINKS.map((link) => (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="nav-link"
                  style={{ 
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
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
                  Запустить Palestra
                </Button>
              </Link>
              <button
                type="button"
                className="navbar-burger mobile-only"
                aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                aria-expanded={isMenuOpen}
                aria-controls="landing-mobile-menu"
                onClick={() => setIsMenuOpen((value) => !value)}
              >
                {isMenuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
              </button>
            </div>
          </div>

          <div
            id="landing-mobile-menu"
            className={`navbar-mobile-menu ${isMenuOpen ? 'navbar-mobile-menu--open' : ''}`}
            hidden={!isMenuOpen}
          >
            <nav aria-label="Мобильная навигация по лендингу">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="navbar-mobile-menu__actions">
              <Link to="/auth/login" onClick={closeMenu}>Войти</Link>
              <Link to="/auth/register" onClick={closeMenu}>Запустить клуб</Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
