import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAdmin } from '../../context/AdminContext';
import { Home, Users, Calendar, Target, ShoppingBag, MessageSquare, Shield } from 'lucide-react';

export const AdminLayout = () => {
  const { user, clubInfo } = useAdmin();
  const isAdmin = user?.role === 'admin';

  const isImpersonating = !!sessionStorage.getItem('palestra-impersonate-club-id');

  const handleExitImpersonation = () => {
    sessionStorage.removeItem('palestra-impersonate-club-id');
    window.location.href = '/superadmin';
  };

  return (
    <div className="member-app-shell" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Sidebar />
      
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
          <div>
            <p className="member-kicker">Управление клубом</p>
            <h1 className="desktop-only">{clubInfo?.name || 'Palestra'}</h1>
          </div>
          <div className="member-header-pill desktop-only">
            <span>{user?.email || `${user?.role || 'admin'}@palestra.fit`}</span>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="member-page-frame"
          style={{ paddingBottom: 'calc(5.5rem + var(--safe-area-inset-bottom))' }}
        >
          <div className="admin-container" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '0 16px' }}>
            <Outlet />
          </div>
        </main>
      </section>

      <div className="mobile-only">
        <BottomNavAdmin />
      </div>
    </div>
  );
};

const BottomNavAdmin = () => {
  const { user } = useAdmin();
  const location = useLocation();
  
  const links = [
    { to: '/admin', icon: Home, label: 'Главная', end: true, roles: ['admin', 'coach'] },
    { to: '/admin/members', icon: Users, label: 'Ученики', roles: ['admin', 'coach'] },
    { to: '/admin/leads', icon: Target, label: 'Лиды', roles: ['admin'] },
    { to: '/admin/schedule', icon: Calendar, label: 'Расписание', roles: ['admin', 'coach'] },
    { to: '/admin/shop', icon: ShoppingBag, label: 'Магазин', roles: ['admin', 'coach'] },
    { to: '/feed', icon: MessageSquare, label: 'Лента', roles: ['admin', 'coach', 'parent', 'student'] },
  ];

  const filteredLinks = links.filter(l => l.roles.includes(user?.role || 'admin'));

  return (
    <div className="member-bottom-nav-outer" role="presentation">
      <nav
        aria-label="Основная навигация"
        className="bottom-nav"
        style={{
          paddingBottom: 'calc(var(--space-2) + var(--safe-area-inset-bottom))',
          minHeight: 'calc(64px + var(--safe-area-inset-bottom))'
        }}
      >
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          const active = location.pathname.startsWith(link.to) && (!link.end || location.pathname === link.to);
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.end}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: '10px',
                fontWeight: active ? '700' : '500',
                textDecoration: 'none',
                flex: 1,
                minHeight: '48px'
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
