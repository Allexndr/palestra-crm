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
  const { user, logout, clubInfo } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Filter links based on role
  const allLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Дашборд', end: true, roles: ['admin', 'coach'] },
    { to: '/admin/members', icon: UserCircle, label: 'Ученики', roles: ['admin', 'coach'] },
    { to: '/admin/groups', icon: Network, label: 'Группы', roles: ['admin', 'coach'] },
    { to: '/admin/coaches', icon: ShieldCheck, label: 'Тренеры', roles: ['admin'] },
    { to: '/admin/leads', icon: Target, label: 'Лиды', roles: ['admin'] },
    { to: '/admin/schedule', icon: Calendar, label: 'Расписание', roles: ['admin', 'coach'] },
    { to: '/admin/events', icon: Clock, label: 'События', roles: ['admin', 'coach'] },
    { to: '/admin/league', icon: Trophy, label: 'Лига', roles: ['admin', 'coach'] },
    { to: '/admin/locations', icon: MapPin, label: 'Филиалы', roles: ['admin'] },
    { to: '/admin/billing', icon: Wallet, label: 'Финансы', roles: ['admin'] },
    { to: '/admin/shop', icon: ShoppingBag, label: 'Магазин', roles: ['admin', 'coach'] },
    { to: '/feed', icon: LayoutList, label: 'Лента', roles: ['admin', 'coach', 'parent', 'student'] },
    { to: '/admin/settings', icon: Settings, label: 'Настройки', roles: ['admin'] },
  ];

  const filteredLinks = allLinks.filter(link => link.roles.includes(user?.role || 'admin'));
  const roleLabel = user?.role === 'admin' ? 'Администратор' : 'Тренер';

  return (
    <aside className="member-desktop-sidebar desktop-only">
      <NavLink to="/" className="member-sidebar-brand" style={{ textDecoration: 'none' }}>
        <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={44} />
      </NavLink>

      <div className="member-user-card">
        <div className="member-user-avatar">{user?.name?.charAt(0) || 'U'}</div>
        <div>
          <p>{user?.name || roleLabel}</p>
          <span>{roleLabel}</span>
        </div>
      </div>

      <nav className="member-desktop-nav" aria-label="Основное меню" style={{ overflowY: 'auto', paddingRight: '4px' }}>
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink 
              key={link.to} 
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'member-desktop-nav__link is-active' : 'member-desktop-nav__link'
              }
            >
              <Icon size={18} strokeWidth={2} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button type="button" className="member-logout" onClick={handleLogout}>
        <LogOut size={18} />
        Выйти
      </button>
    </aside>
  );
};
