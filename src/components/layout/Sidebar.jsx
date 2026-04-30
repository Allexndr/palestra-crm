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
  const { user, logout, clubInfo, locations, selectedLocationId, setSelectedLocationId } = useAdmin();
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

      <div className="sidebar-location-switcher" style={{ margin: '0 var(--space-4) var(--space-6)', position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-3)', 
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          cursor: 'pointer'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '10px', 
            backgroundColor: 'var(--color-primary-soft)', 
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={16} strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Филиал</p>
            <select 
              value={selectedLocationId} 
              onChange={(e) => setSelectedLocationId(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none'
              }}
            >
              <option value="all">Все филиалы</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
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
