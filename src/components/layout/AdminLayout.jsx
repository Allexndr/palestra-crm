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

  const isImpersonating = !!localStorage.getItem('palestra-impersonate-club-id');

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleExitImpersonation = () => {
    localStorage.removeItem('palestra-impersonate-club-id');
    window.location.href = '/superadmin';
  };

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
        
        {/* Header (Desktop/Mobile) */}
        <header style={{ 
          padding: '0 var(--space-8)', 
          backgroundColor: 'white', 
          borderBottom: '1px solid var(--color-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          height: '80px'
        }}>
          <div className="mobile-only">
             <NavLink to="/" style={{ textDecoration: 'none' }}>
               <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={44} />
             </NavLink>
          </div>
          
          <div className="flex items-center gap-6 desktop-only">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
              {isAdmin ? 'Панель Администратора' : 'Кабинет Тренера'}
            </span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 shadow-sm hover:bg-slate-100 transition-colors cursor-pointer">
              <div style={{ 
                width: 28, height: 28, borderRadius: '50%', 
                backgroundColor: isAdmin ? 'var(--color-primary)' : 'var(--color-success)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '12px', fontWeight: 'bold' 
              }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="desktop-only" style={{ lineHeight: '1.2' }}>
                <p className="text-[12px] font-bold text-slate-800">{user?.name || (isAdmin ? 'Администратор' : 'Тренер')}</p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{user?.role || 'role'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-muted hover:text-danger transition-colors mobile-only"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="admin-main"
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
        .admin-container {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
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
      padding: 'var(--space-2) 0', zIndex: 100,
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
              fontSize: '10px', textDecoration: 'none', fontWeight: isActive ? '600' : '400'
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
