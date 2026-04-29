import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Network, 
  ShieldCheck, 
  Target, 
  Calendar, 
  Clock, 
  Trophy, 
  Wallet, 
  ShoppingBag, 
  LayoutList, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ClubLogo } from '../ui/ClubLogo';

export const Sidebar = () => {
  const { user, logout, locations, selectedLocationId, setSelectedLocationId, clubInfo } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Filter links based on role
  const allLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Дашборд', end: true, roles: ['admin', 'coach'], color: '#6366f1' },
    { to: '/admin/members', icon: UserCircle, label: 'Ученики', roles: ['admin', 'coach'], color: '#3b82f6' },
    { to: '/admin/groups', icon: Network, label: 'Группы', roles: ['admin', 'coach'], color: '#8b5cf6' },
    { to: '/admin/coaches', icon: ShieldCheck, label: 'Тренеры', roles: ['admin'], color: '#ec4899' },
    { to: '/admin/leads', icon: Target, label: 'Лиды', roles: ['admin'], color: '#f59e0b' },
    { to: '/admin/schedule', icon: Calendar, label: 'Расписание', roles: ['admin', 'coach'], color: '#10b981' },
    { to: '/admin/events', icon: Clock, label: 'События', roles: ['admin', 'coach'], color: '#06b6d4' },
    { to: '/admin/league', icon: Trophy, label: 'Лига', roles: ['admin', 'coach'], color: '#f43f5e' },
    { to: '/admin/billing', icon: Wallet, label: 'Финансы', roles: ['admin'], color: '#14b8a6' },
    { to: '/admin/shop', icon: ShoppingBag, label: 'Магазин', roles: ['admin', 'coach'], color: '#8b5cf6' },
    { to: '/feed', icon: LayoutList, label: 'Лента', roles: ['admin', 'coach', 'parent', 'student'], color: '#64748b' },
    { to: '/admin/settings', icon: Settings, label: 'Настройки', roles: ['admin'], color: '#475569' },
  ];

  const filteredLinks = allLinks.filter(link => link.roles.includes(user?.role || 'admin'));

  return (
    <aside className="desktop-only" style={{
      width: '240px',
      flexShrink: 0,
      backgroundColor: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflowY: 'auto'
    }}>
      <div className="mb-6">
        <NavLink
          to="/"
          className="flex items-center justify-start mb-6 w-full"
          style={{ textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3 min-w-0 w-full" style={{ width: '100%' }}>
            <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={44} />
          </div>
        </NavLink>
        
        {/* Location Switcher */}
        {user?.role === 'admin' && (
          <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-2">Филиал</p>
            <select 
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Все локации</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink 
              key={link.to} 
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '10px 12px',
                borderRadius: '14px',
                backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                margin: '0 4px'
              })}
              className={({ isActive }) => isActive ? 'sidebar-link-active group' : 'sidebar-link group'}
            >
              {({ isActive }) => (
                <>
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      color: link.color,
                      transition: 'transform 0.2s'
                    }}
                    className="group-hover:scale-110"
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {link.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div
        className="pt-4 mt-4 w-full"
        style={{ borderTop: '1px solid var(--color-border)', width: '100%', flexShrink: 0, alignSelf: 'stretch' }}
      >
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--color-error)',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'opacity 0.2s'
          }}
          className="hover:bg-red-50"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
};
