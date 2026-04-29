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
  LogOut,
  MapPin
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
    { to: '/admin/locations', icon: MapPin, label: 'Филиалы', roles: ['admin'], color: '#8b5cf6' },
    { to: '/admin/billing', icon: Wallet, label: 'Финансы', roles: ['admin'], color: '#14b8a6' },
    { to: '/admin/shop', icon: ShoppingBag, label: 'Магазин', roles: ['admin', 'coach'], color: '#8b5cf6' },
    { to: '/feed', icon: LayoutList, label: 'Лента', roles: ['admin', 'coach', 'parent', 'student'], color: '#64748b' },
    { to: '/admin/settings', icon: Settings, label: 'Настройки', roles: ['admin'], color: '#475569' },
  ];

  const filteredLinks = allLinks.filter(link => link.roles.includes(user?.role || 'admin'));

  return (
    <aside className="desktop-only" style={{
      width: '100px',
      flexShrink: 0,
      backgroundColor: '#fff',
      borderRight: '1px solid #f0f0f0',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: 'var(--space-6) var(--space-2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 100,
      overflowY: 'auto'
    }}>
      <div className="mb-12">
        <NavLink
          to="/"
          className="flex items-center justify-center"
          style={{ textDecoration: 'none' }}
        >
          <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={36} />
        </NavLink>
      </div>

      <nav className="flex flex-col gap-6 flex-1 items-center">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink 
              key={link.to} 
              to={link.to}
              end={link.end}
              title={link.label}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                backgroundColor: isActive ? '#000' : 'transparent',
                color: isActive ? '#fff' : '#888',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                position: 'relative'
              })}
              className="group"
            >
              <Icon size={22} strokeWidth={2} />
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[200]">
                {link.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-8 mt-auto flex flex-col items-center gap-6">
        {user?.role === 'admin' && (
           <button 
             onClick={() => navigate('/admin/locations')}
             className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-black transition-colors"
             title="Филиалы"
           >
             <MapPin size={22} />
           </button>
        )}
        <button 
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-danger transition-colors"
          title="Выйти"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
};
