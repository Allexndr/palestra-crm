import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/public/Landing';
import { RegisterClub } from './pages/auth/RegisterClub';
import { Login } from './pages/auth/Login';
import { Feed } from './pages/social/Feed';
import { Profile } from './pages/profile/Profile';
import { AdminProvider } from './context/AdminContext';
import { ShopProvider } from './context/ShopContext';
import { PageLoader } from './components/ui/PageLoader';
import { SkipToMain } from './components/layout/SkipToMain';
import { AdminRoleGuard, SuperAdminRoleGuard, RequireAuth, MemberLayout } from './components/auth/Access';
import { ScheduleEntry } from './routes/ScheduleEntry';
import { LeagueEntry } from './routes/LeagueEntry';

const AdminLayout = lazy(() => import('./components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const SuperDashboard = lazy(() => import('./pages/superadmin/SuperDashboard').then((m) => ({ default: m.SuperDashboard })));
const ClubDetail = lazy(() => import('./pages/superadmin/ClubDetail').then((m) => ({ default: m.ClubDetail })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })));
const Members = lazy(() => import('./pages/admin/Members').then((m) => ({ default: m.Members })));
const Leads = lazy(() => import('./pages/admin/Leads').then((m) => ({ default: m.Leads })));
import { SchedulePage, LeaguePage } from './pages/admin/lazyAdminPages';
const Events = lazy(() => import('./pages/admin/Events').then((m) => ({ default: m.Events })));
const Groups = lazy(() => import('./pages/admin/Groups').then((m) => ({ default: m.Groups })));
const Billing = lazy(() => import('./pages/admin/Billing').then((m) => ({ default: m.Billing })));
const Settings = lazy(() => import('./pages/admin/Settings').then((m) => ({ default: m.Settings })));
const Coaches = lazy(() => import('./pages/admin/Coaches').then((m) => ({ default: m.Coaches })));
const MemberForm = lazy(() => import('./pages/admin/MemberForm').then((m) => ({ default: m.MemberForm })));
const MemberDetail = lazy(() => import('./pages/admin/MemberDetail').then((m) => ({ default: m.MemberDetail })));
const GroupForm = lazy(() => import('./pages/admin/GroupForm').then((m) => ({ default: m.GroupForm })));
const GroupDetail = lazy(() => import('./pages/admin/GroupDetail').then((m) => ({ default: m.GroupDetail })));
const Shop = lazy(() => import('./pages/admin/Shop').then((m) => ({ default: m.Shop })));
const BillingSuccess = lazy(() => import('./pages/admin/BillingSuccess').then((m) => ({ default: m.BillingSuccess })));
const BillingFailure = lazy(() => import('./pages/admin/BillingFailure').then((m) => ({ default: m.BillingFailure })));

function App() {
  return (
    <AdminProvider>
      <ShopProvider>
        <BrowserRouter>
          <SkipToMain />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<RegisterClub />} />
              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/billing/failure" element={<BillingFailure />} />

              <Route path="/admin" element={<AdminRoleGuard />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="members" element={<Members />} />
                  <Route path="members/new" element={<MemberForm />} />
                  <Route path="members/:id" element={<MemberDetail />} />
                  <Route path="members/:id/edit" element={<MemberForm />} />
                  <Route path="groups" element={<Groups />} />
                  <Route path="groups/new" element={<GroupForm />} />
                  <Route path="groups/:id" element={<GroupDetail />} />
                  <Route path="groups/:id/edit" element={<GroupForm />} />
                  <Route path="coaches" element={<Coaches />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  <Route path="events" element={<Events />} />
                  <Route path="league" element={<LeaguePage />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              <Route path="/superadmin" element={<SuperAdminRoleGuard />}>
                <Route index element={<SuperDashboard />} />
                <Route path="club/:clubId" element={<ClubDetail />} />
              </Route>

              <Route element={<RequireAuth />}>
                <Route element={<MemberLayout />}>
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/schedule" element={<ScheduleEntry />} />
                  <Route path="/league" element={<LeagueEntry />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ShopProvider>
    </AdminProvider>
  );
}

export default App;
