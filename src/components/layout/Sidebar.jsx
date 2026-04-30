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
  MapPin,
  Zap,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ClubLogo } from '../ui/ClubLogo';

import { ADMIN_NAV_LINKS } from '../../constants/adminNavigation';

export const Sidebar = () => {
  const { user, logout, clubInfo } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const filteredLinks = ADMIN_NAV_LINKS.filter(link => link.roles.includes(user?.role || 'admin'));
  const roleLabel = user?.role === 'admin' ? 'Администратор' : 'Тренер';

  return (
    <aside className="member-desktop-sidebar desktop-only">
      <NavLink to="/" className="member-sidebar-brand" style={{ textDecoration: 'none' }}>
        <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={64} />
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
