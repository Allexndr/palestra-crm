import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, LogOut, Trophy, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { BottomNav } from '../layout/BottomNav';
import { ClubLogo } from '../ui/ClubLogo';

/** Только авторизованные пользователи (любая роль). */
export function RequireAuth() {
  const { user } = useAdmin();
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}

/** Лента, расписание, лига, профиль: нижняя навигация одним блоком. */
export function MemberLayout() {
  const { user, logout, clubInfo } = useAdmin();
  const navigate = useNavigate();
  const links = [
    { to: '/feed', icon: Home, label: 'Лента' },
    { to: '/schedule', icon: Calendar, label: 'Расписание' },
    { to: '/league', icon: Trophy, label: 'Лига' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ];
  const roleLabel = user?.role === 'parent' ? 'Родитель' : 'Ученик';

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
          <span>{clubInfo?.name || 'Palestra Fight Club'}</span>
        </NavLink>

        <div className="member-user-card">
          <div className="member-user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div>
            <p>{user?.name || roleLabel}</p>
            <span>{roleLabel}</span>
          </div>
        </div>

        <nav className="member-desktop-nav" aria-label="Навигация личного кабинета">
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

        <button type="button" className="member-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Выйти
        </button>
      </aside>

      <section className="member-main-region">
        <header className="member-desktop-header desktop-only">
          <div>
            <p className="member-kicker">Личный кабинет</p>
            <h1>{roleLabel}</h1>
          </div>
          <div className="member-header-pill">
            <span>{user?.email || `${user?.role || 'user'}@palestra.fit`}</span>
          </div>
        </header>
        <div className="member-page-frame">
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
  const { user } = useAdmin();
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: loc.pathname }} />;
  }
  if (!['admin', 'coach'].includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
}
