import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { LeaguePage } from '../pages/admin/lazyAdminPages';

/** /league — только родитель/ученик; админ и тренер — в панель клуба. */
export function LeagueEntry() {
  const { user } = useAdmin();
  if (user && ['admin', 'coach'].includes(user.role)) {
    return <Navigate to="/admin/league" replace />;
  }
  return <LeaguePage />;
}
