import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { SchedulePage } from '../pages/admin/lazyAdminPages';

/** /schedule — только родитель/ученик; админ и тренер — в панель клуба. */
export function ScheduleEntry() {
  const { user } = useAdmin();
  if (user && ['admin', 'coach'].includes(user.role)) {
    return <Navigate to="/admin/schedule" replace />;
  }
  return <SchedulePage />;
}
