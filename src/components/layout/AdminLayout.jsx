import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAdmin } from '../../context/AdminContext';
import { ClubLogo } from '../ui/ClubLogo';
import { Home, Users, Calendar, Trophy, Settings, Target, CreditCard, Menu, LogOut, User as UserIcon, Shield, ShoppingBag, MessageSquare } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout, clubInfo } = useAdmin();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const isImpersonating = !!sessionStorage.getItem('palestra-impersonate-club-id');

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleExitImpersonation = () => {
    sessionStorage.removeItem('palestra-impersonate-club-id');
    window.location.href = '/superadmin';
  };

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column'
      }} className="admin-layout-content">
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
        
        {/* Header - Transparent & Subtle */}
        <header style={{ 
          padding: '0 var(--space-12)', 
          backgroundColor: 'rgba(250, 250, 250, 0.5)', 
          backdropFilter: 'blur(10px)',
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          height: '64px',
          border: 'none'
        }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 hover:bg-white rounded-full transition-all cursor-pointer">
              <div style={{ 
                width: 32, height: 32, borderRadius: '12px', 
                backgroundColor: 'var(--color-primary)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '12px', fontWeight: '900' 
              }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="desktop-only">
                <p className="text-[12px] font-black leading-none" style={{ color: 'var(--color-text-primary)' }}>{user?.name || (isAdmin ? 'Admin' : 'Coach')}</p>
              </div>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="admin-main"
          style={{ paddingBottom: 'calc(5.5rem + var(--safe-area-inset-bottom))' }}
        >
          <div className="admin-container">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="mobile-only">
        <BottomNavAdmin />
      </div>

      <style>{`
        .admin-layout {
          flex-direction: row;
        }
        .admin-layout-content {
          padding-left: 100px;
        }
        .admin-container {
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 1024px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-layout-content {
            padding-left: 0;
          }
          .admin-container {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

const BottomNavAdmin = () => {
  const { user } = useAdmin();
  
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
    <nav
      aria-label="Основная навигация"
      style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid var(--color-border)',
      display: 'flex', justifyContent: 'space-around',
      padding: 'var(--space-2) 0 calc(var(--space-2) + var(--safe-area-inset-bottom))', zIndex: 100,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
    }}>
      {filteredLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink 
            key={link.to} 
            to={link.to} 
            end={link.end}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '10px', textDecoration: 'none', fontWeight: isActive ? '700' : '500',
              flex: 1, minHeight: '48px', justifyContent: 'center'
            })}
          >
            <Icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
