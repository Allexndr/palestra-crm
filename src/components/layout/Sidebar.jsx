import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useTranslation } from '../../context/LanguageContext';
import { ClubLogo } from '../ui/ClubLogo';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

import { ADMIN_NAV_LINKS } from '../../constants/adminNavigation';

const SIDEBAR_MIN = 60;
const SIDEBAR_MAX = 420;
const SIDEBAR_DEFAULT = 260;

export const Sidebar = () => {
  const { user, logout, clubInfo, locations, selectedLocationId, setSelectedLocationId } = useAdmin();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('palestra_sidebar_width');
    return saved ? Number(saved) : SIDEBAR_DEFAULT;
  });
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const currentWidth = useRef(sidebarWidth);

  const collapsed = sidebarWidth <= SIDEBAR_MIN + 20;

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = currentWidth.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth.current + delta));
      currentWidth.current = newWidth;
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('palestra_sidebar_width', String(currentWidth.current));
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth + 'px');
  }, [sidebarWidth]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const filteredLinks = ADMIN_NAV_LINKS.filter(link => link.roles.includes(user?.role || 'admin'));
  const roleLabel = user?.role === 'admin' ? t('roles.admin') : t('roles.coach');

  return (
    <aside className="member-desktop-sidebar desktop-only" style={{ width: sidebarWidth, minWidth: sidebarWidth, overflow: collapsed ? 'hidden' : undefined }}>
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '6px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Потяните чтобы изменить ширину"
      >
        <div style={{
          width: '3px',
          height: '40px',
          borderRadius: '99px',
          backgroundColor: 'var(--color-border)',
          transition: 'background-color 0.2s',
        }}
          className="sidebar-drag-indicator"
        />
      </div>

      <NavLink to="/" className="member-sidebar-brand" style={{ textDecoration: 'none', padding: 0, marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={collapsed ? 40 : 100} />
      </NavLink>

      {!collapsed && (
      <NavLink to="/admin/settings" className="member-user-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <div className="member-user-avatar">{user?.name?.charAt(0) || 'U'}</div>
        <div>
          <p>{user?.name || roleLabel}</p>
          <span>{roleLabel}</span>
        </div>
      </NavLink>
      )}

      {!collapsed && <div className="sidebar-location-switcher" style={{ margin: 'var(--space-4) 0', position: 'relative' }}>
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
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>{t('common.branch')}</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedLocationId === 'all' ? t('common.all_branches') : locations.find(l => l.id === selectedLocationId)?.name || t('common.select')}
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
              {t('common.all_branches')}
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
      </div>}

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
              style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : undefined}
              title={collapsed ? t(link.labelKey) : undefined}
            >
              <Icon size={18} strokeWidth={2} />
              {!collapsed && <span>{t(link.labelKey)}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
        {!collapsed && <LanguageSwitcher variant="sidebar" />}
        <button type="button" className="member-logout" onClick={handleLogout}
          style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : undefined}
          title={collapsed ? t('nav.logout') : undefined}
        >
          <LogOut size={18} />
          {!collapsed && t('nav.logout')}
        </button>
      </div>
    </aside>
  );
};
