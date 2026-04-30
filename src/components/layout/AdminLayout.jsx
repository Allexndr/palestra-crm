import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAdmin } from '../../context/AdminContext';
import { Menu, X, LogOut, Shield } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '../../constants/adminNavigation';
import { ClubLogo } from '../ui/ClubLogo';

export const AdminLayout = () => {
  const { user, clubInfo, logout, locations, selectedLocationId, setSelectedLocationId } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isImpersonating = !!sessionStorage.getItem('palestra-impersonate-club-id');

  const handleExitImpersonation = () => {
    sessionStorage.removeItem('palestra-impersonate-club-id');
    window.location.href = '/superadmin';
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const filteredLinks = ADMIN_NAV_LINKS.filter(link => link.roles.includes(user?.role || 'admin'));

  return (
    <div className="member-app-shell">
      <Sidebar />
      
      {/* Mobile Burger Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'is-open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <aside className="mobile-menu-sidebar" onClick={e => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={40} />
            <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '0 var(--space-6) var(--space-4)' }}>
            <div style={{ 
              backgroundColor: 'var(--color-bg)',
              borderRadius: '16px',
              padding: '12px 16px',
              border: '1px solid var(--color-border)'
            }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Филиал</p>
              <select 
                value={selectedLocationId} 
                onChange={(e) => setSelectedLocationId(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  padding: '4px 0',
                  outline: 'none'
                }}
              >
                <option value="all">Все филиалы</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <nav className="mobile-menu-nav">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink 
                  key={link.to} 
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? 'mobile-menu-link is-active' : 'mobile-menu-link'
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button type="button" className="mobile-menu-logout" onClick={handleLogout}>
            <LogOut size={20} />
            Выйти
          </button>
        </aside>
      </div>

      <section className="member-main-region">
        {isImpersonating && (
          <div style={{
            backgroundColor: 'var(--color-danger)', color: 'white', padding: '12px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <Shield size={18} />
              <span>Режим Супер Админа: вы просматриваете клуб {clubInfo?.name}</span>
            </div>
            <button onClick={handleExitImpersonation} style={{
              backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
              padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Выйти в Дашборд
            </button>
          </div>
        )}
        
        <header className="member-desktop-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-only burger-btn" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <p className="member-kicker">Управление клубом</p>
              <h1 className="desktop-only">{clubInfo?.name || 'Palestra'}</h1>
              <h1 className="mobile-only" style={{ fontSize: '1.2rem' }}>{clubInfo?.name || 'Palestra'}</h1>
            </div>
          </div>
          <div className="member-header-pill desktop-only">
            <span>{user?.email || `${user?.role || 'admin'}@palestra.fit`}</span>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="member-page-frame"
        >
          <div className="admin-container" style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 var(--space-8)' }}>
            <Outlet />
          </div>
        </main>
      </section>
    </div>
  );
};


