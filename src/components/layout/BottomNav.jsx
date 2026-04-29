import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, User } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const links = [
    { to: '/feed', icon: Home, label: 'Лента' },
    { to: '/schedule', icon: Calendar, label: 'Расписание' },
    { to: '/league', icon: Trophy, label: 'Лига' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <div className="member-bottom-nav-outer" role="presentation">
    <nav
      aria-label="Основная навигация"
      className="bottom-nav"
      style={{
        paddingBottom: 'calc(var(--space-2) + var(--safe-area-inset-bottom))',
        minHeight: 'calc(64px + var(--safe-area-inset-bottom))'
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        const active = location.pathname.startsWith(link.to);
        return (
          <Link 
            key={link.to} 
            to={link.to} 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '10px',
              fontWeight: active ? '700' : '500',
              textDecoration: 'none',
              flex: 1,
              minHeight: '48px'
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
    </div>
  );
};
