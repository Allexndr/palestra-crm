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
  MessageSquare,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ClubLogo } from '../ui/ClubLogo';

import { ADMIN_NAV_LINKS } from '../../constants/adminNavigation';

export const Sidebar = () => {
  const { user, logout, clubInfo, locations, selectedLocationId, setSelectedLocationId } = useAdmin();
  const navigate = useNavigate();
  const [isLocOpen, setIsLocOpen] = React.useState(false);

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

      <div className="sidebar-location-switcher" style={{ margin: 'var(--space-4) 0', position: 'relative' }}>
        <div 
          onClick={() => setIsLocOpen(!isLocOpen)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            padding: 'var(--space-4)',
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: isLocOpen ? '0 10px 25px -5px rgba(0,0,0,0.1)' : 'none'
          }}
          className="hover:border-primary/30"
        >
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '14px', 
            backgroundColor: 'var(--color-primary-soft)', 
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={20} strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>Филиал</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedLocationId === 'all' ? 'Все филиалы' : locations.find(l => l.id === selectedLocationId)?.name || 'Выбрать...'}
            </p>
          </div>
          <ChevronDown size={18} className={`transition-transform duration-300 ${isLocOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        {isLocOpen && (
          <>
            <div 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} 
              onClick={() => setIsLocOpen(false)} 
            />
            <div style={{ 
              position: 'absolute', 
              top: 'calc(100% + 8px)', 
              left: 0, 
              right: 0, 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
              border: '1px solid var(--color-border)',
              padding: '8px',
              zIndex: 50,
              maxHeight: '300px',
              overflowY: 'auto'
            }} className="animate-up">
              <div 
                onClick={() => { setSelectedLocationId('all'); setIsLocOpen(false); }}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: selectedLocationId === 'all' ? 'var(--color-primary-soft)' : 'transparent',
                  color: selectedLocationId === 'all' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
                className="hover:bg-slate-50"
              >
                Все филиалы
                {selectedLocationId === 'all' && <Check size={16} />}
              </div>
              {locations.map(loc => (
                <div 
                  key={loc.id}
                  onClick={() => { setSelectedLocationId(loc.id); setIsLocOpen(false); }}
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: selectedLocationId === loc.id ? 'var(--color-primary-soft)' : 'transparent',
                    color: selectedLocationId === loc.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                  className="hover:bg-slate-50"
                >
                  {loc.name}
                  {selectedLocationId === loc.id && <Check size={16} />}
                </div>
              ))}
            </div>
          </>
        )}
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
