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
              gap: '4px',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '10px',
              fontWeight: active ? '500' : '400'
            }}
          >
            <Icon size={24} color={active ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
            {link.label}
          </Link>
        );
      })}
    </nav>
    </div>
  );
};
