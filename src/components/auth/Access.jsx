import { Navigate, NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, Home, LogOut, Trophy, User, Zap } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from '../../context/LanguageContext';
import { BottomNav } from '../layout/BottomNav';
import { ClubLogo } from '../ui/ClubLogo';
import { PageLoader } from '../ui/PageLoader';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

/** Только авторизованные пользователи (любая роль). */
export function RequireAuth() {
  const { user, isStateReady } = useAdmin();
  const loc = useLocation();

  if (!isStateReady) return <PageLoader />;

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}

/** Лента, расписание, лига, профиль: нижняя навигация одним блоком. */
export function MemberLayout() {
  const { user, logout, clubInfo, members, activeChildId, setActiveChildId } = useAdmin();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const children = user?.role === 'parent' ? members.filter(m => m.parentId === user.id) : [];
  
  const links = [
    { to: '/feed', icon: Home, label: t('nav.feed') },
    { to: '/schedule', icon: Calendar, label: t('nav.schedule') },
    { to: '/quests', icon: Zap, label: t('nav.quests') },
    { to: '/league', icon: Trophy, label: t('nav.league') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];
  
  const getRoleLabel = (role) => {
    if (role === 'parent') return t('roles.parent');
    if (role === 'student') return t('roles.student');
    return role;
  };

  const roleLabel = getRoleLabel(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div
      className="member-app-shell"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <aside className="member-desktop-sidebar desktop-only">
        <NavLink to="/" className="member-sidebar-brand" style={{ textDecoration: 'none' }}>
          <ClubLogo src={clubInfo?.logo} name={clubInfo?.name} height={44} />
        </NavLink>

        <NavLink to="/profile" className="member-user-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="member-user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div>
            <p>{user?.name || roleLabel}</p>
            <span>{roleLabel}</span>
          </div>
        </NavLink>

        <nav className="member-desktop-nav" aria-label={t('nav.cabinet')}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'member-desktop-nav__link is-active' : 'member-desktop-nav__link'
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
          <LanguageSwitcher variant="sidebar" />
          <button type="button" className="member-logout" onClick={handleLogout}>
            <LogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <section className="member-main-region">
        <header className="member-desktop-header">
          <div>
            <p className="member-kicker">{t('nav.cabinet')}</p>
            <h1 className="desktop-only">{roleLabel}</h1>
            
            {user?.role === 'parent' && children.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-md">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setActiveChildId(child.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-none cursor-pointer ${
                      activeChildId === child.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {child.firstName} {child.lastName}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/profile" className="member-header-pill desktop-only" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <span>{user?.email || `${user?.role || 'user'}@palestra.fit`}</span>
          </Link>
        </header>
        <div className="member-page-frame" style={{ paddingTop: (user?.role === 'parent' && children.length > 0) ? '16px' : '0' }}>
          <Outlet />
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

/**
 * Только владелец/тренер. Остальные — в личный кабинет.
 * Используется как обёртка над AdminLayout (см. App.jsx).
 */
export function AdminRoleGuard() {
  const { user, isStateReady } = useAdmin();
  const loc = useLocation();

  if (!isStateReady) return <PageLoader />;

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  if (!['admin', 'coach', 'superadmin'].includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
}

/**
 * Только для Супер Админа (владельца платформы).
 */
export function SuperAdminRoleGuard() {
  const { user, isStateReady } = useAdmin();
  const loc = useLocation();

  if (!isStateReady) return <PageLoader />;

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  if (user.role !== 'superadmin' && user.email !== 'murdasoft@gmail.com') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
