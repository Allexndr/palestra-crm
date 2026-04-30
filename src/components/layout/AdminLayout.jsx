import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAdmin } from '../../context/AdminContext';
import { Menu, X, LogOut, Shield, ChevronDown, Check, MapPin } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '../../constants/adminNavigation';
import { ClubLogo } from '../ui/ClubLogo';

export const AdminLayout = () => {
  const { user, clubInfo, logout, locations, selectedLocationId, setSelectedLocationId } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocOpen, setIsLocOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentLink = ADMIN_NAV_LINKS.find(link => 
    link.to === location.pathname || (location.pathname.startsWith(link.to) && link.to !== '/admin')
  );
  const pageTitle = currentLink ? currentLink.label : 'Панель';

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
            <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={50} />
            <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '0 var(--space-6) var(--space-4)' }}>
            <div 
              onClick={() => setIsLocOpen(!isLocOpen)}
              style={{ 
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Филиал</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {selectedLocationId === 'all' ? 'Все филиалы' : locations.find(l => l.id === selectedLocationId)?.name || 'Выбрать...'}
                    </p>
                  </div>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isLocOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {isLocOpen && (
                <div style={{ 
                  marginTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); setSelectedLocationId('all'); setIsLocOpen(false); }}
                    style={{ 
                      padding: '10px 12px', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      backgroundColor: selectedLocationId === 'all' ? 'var(--color-primary-soft)' : 'transparent',
                      color: selectedLocationId === 'all' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: 700,
                      fontSize: '13px'
                    }}
                  >
                    Все филиалы
                    {selectedLocationId === 'all' && <Check size={14} />}
                  </div>
                  {locations.map(loc => (
                    <div 
                      key={loc.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedLocationId(loc.id); setIsLocOpen(false); }}
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        backgroundColor: selectedLocationId === loc.id ? 'var(--color-primary-soft)' : 'transparent',
                        color: selectedLocationId === loc.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}
                    >
                      {loc.name}
                      {selectedLocationId === loc.id && <Check size={14} />}
                    </div>
                  ))}
                </div>
              )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
            <button className="mobile-only burger-btn" onClick={() => setIsMenuOpen(true)} style={{ flexShrink: 0, padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Menu size={24} />
            </button>
            
            <Link to="/admin" className="mobile-only" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
               <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={42} />
            </Link>

            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="member-kicker">{clubInfo?.name || 'Palestra'}</p>
              <h1 className="desktop-only">{clubInfo?.name || 'Palestra'}</h1>
              <h1 className="mobile-only" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 800 }}>{pageTitle}</h1>
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


