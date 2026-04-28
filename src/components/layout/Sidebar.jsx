import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Trophy, Settings, Target, CreditCard, LogOut, ShoppingBag, MessageSquare } from 'lucide-react';
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
    { to: '/admin', icon: Home, label: 'Дашборд', end: true, roles: ['admin', 'coach'] },
    { to: '/admin/members', icon: Users, label: 'Ученики', roles: ['admin', 'coach'] },
    { to: '/admin/groups', icon: Users, label: 'Группы', roles: ['admin', 'coach'] },
    { to: '/admin/coaches', icon: Users, label: 'Тренеры', roles: ['admin'] },
    { to: '/admin/leads', icon: Target, label: 'Лиды', roles: ['admin'] },
    { to: '/admin/schedule', icon: Calendar, label: 'Расписание', roles: ['admin', 'coach'] },
    { to: '/admin/events', icon: Calendar, label: 'События', roles: ['admin', 'coach'] },
    { to: '/admin/league', icon: Trophy, label: 'Лига', roles: ['admin', 'coach'] },
    { to: '/admin/billing', icon: CreditCard, label: 'Финансы', roles: ['admin'] },
    { to: '/admin/shop', icon: ShoppingBag, label: 'Магазин', roles: ['admin', 'coach'] },
    { to: '/feed', icon: MessageSquare, label: 'Лента', roles: ['admin', 'coach', 'parent', 'student'] },
    { to: '/admin/settings', icon: Settings, label: 'Настройки', roles: ['admin'] },
  ];

  const filteredLinks = allLinks.filter(link => link.roles.includes(user?.role || 'admin'));

  return (
    <aside className="desktop-only" style={{
      width: '240px',
      flexShrink: 0,
      backgroundColor: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10
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
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s',
                textDecoration: 'none',
                fontSize: '0.875rem'
              })}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={18} />
              {link.label}
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
