import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/public/Landing';
import { RegisterClub } from './pages/auth/RegisterClub';
import { Login } from './pages/auth/Login';
import { Feed } from './pages/social/Feed';
import { QuestsMember } from './pages/social/QuestsMember';
import { Profile } from './pages/profile/Profile';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ShopProvider } from './context/ShopContext';
import { LanguageProvider } from './context/LanguageContext';
import { SocialProvider } from './context/SocialContext';
import { NotificationProvider } from './context/NotificationContext';
import { PageLoader } from './components/ui/PageLoader';
import { SkipToMain } from './components/layout/SkipToMain';
import { AdminRoleGuard, SuperAdminRoleGuard, RequireAuth, MemberLayout } from './components/auth/Access';
import { ScheduleEntry } from './routes/ScheduleEntry';
import { LeagueEntry } from './routes/LeagueEntry';

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Return an empty component while reloading
        return { default: () => null };
      }
      throw error;
    }
  });

const AdminLayout = lazyWithRetry(() => import('./components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const SuperDashboard = lazyWithRetry(() => import('./pages/superadmin/SuperDashboard').then((m) => ({ default: m.SuperDashboard })));
const ClubDetail = lazyWithRetry(() => import('./pages/superadmin/ClubDetail').then((m) => ({ default: m.ClubDetail })));
const Dashboard = lazyWithRetry(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })));
const Members = lazyWithRetry(() => import('./pages/admin/Members').then((m) => ({ default: m.Members })));
const Leads = lazyWithRetry(() => import('./pages/admin/Leads').then((m) => ({ default: m.Leads })));
const Quests = lazyWithRetry(() => import('./pages/admin/Quests').then((m) => ({ default: m.Quests })));
import { SchedulePage, LeaguePage } from './pages/admin/lazyAdminPages';
const Events = lazyWithRetry(() => import('./pages/admin/Events').then((m) => ({ default: m.Events })));
const Groups = lazyWithRetry(() => import('./pages/admin/Groups').then((m) => ({ default: m.Groups })));
const Billing = lazyWithRetry(() => import('./pages/admin/Billing').then((m) => ({ default: m.Billing })));
const Settings = lazyWithRetry(() => import('./pages/admin/Settings').then((m) => ({ default: m.Settings })));
const Coaches = lazyWithRetry(() => import('./pages/admin/Coaches').then((m) => ({ default: m.Coaches })));
const Payroll = lazyWithRetry(() => import('./pages/admin/Payroll').then((m) => ({ default: m.Payroll })));
const Locations = lazyWithRetry(() => import('./pages/admin/Locations').then((m) => ({ default: m.Locations })));
const LocationForm = lazyWithRetry(() => import('./pages/admin/LocationForm').then((m) => ({ default: m.LocationForm })));
const MemberForm = lazyWithRetry(() => import('./pages/admin/MemberForm').then((m) => ({ default: m.MemberForm })));
const MemberDetail = lazyWithRetry(() => import('./pages/admin/MemberDetail').then((m) => ({ default: m.MemberDetail })));
const GroupForm = lazyWithRetry(() => import('./pages/admin/GroupForm').then((m) => ({ default: m.GroupForm })));
const GroupDetail = lazyWithRetry(() => import('./pages/admin/GroupDetail').then((m) => ({ default: m.GroupDetail })));
const Chats = lazyWithRetry(() => import('./pages/admin/Chats').then((m) => ({ default: m.Chats })));
const Shop = lazyWithRetry(() => import('./pages/admin/Shop').then((m) => ({ default: m.Shop })));
const BillingSuccess = lazyWithRetry(() => import('./pages/admin/BillingSuccess').then((m) => ({ default: m.BillingSuccess })));
const BillingFailure = lazyWithRetry(() => import('./pages/admin/BillingFailure').then((m) => ({ default: m.BillingFailure })));

const FeedRedirect = () => {
  const { user } = useAdmin();
  if (user?.role === 'admin' || user?.role === 'coach') {
    return <Navigate to="/admin/feed" replace />;
  }
  return <Feed />;
};

const ProfileRedirect = () => {
  const { user } = useAdmin();
  if (user?.role === 'admin' || user?.role === 'coach') {
    return <Navigate to="/admin" replace />;
  }
  return <Profile />;
};

const QuestsRedirect = () => {
  const { user } = useAdmin();
  if (user?.role === 'admin' || user?.role === 'coach') {
    return <Navigate to="/admin/quests" replace />;
  }
  return <QuestsMember />;
};

const ScheduleRedirect = () => {
  const { user } = useAdmin();
  if (user?.role === 'admin' || user?.role === 'coach') {
    return <Navigate to="/admin/schedule" replace />;
  }
  return <ScheduleEntry />;
};

const LeagueRedirect = () => {
  const { user } = useAdmin();
  if (user?.role === 'admin' || user?.role === 'coach') {
    return <Navigate to="/admin/league" replace />;
  }
  return <LeagueEntry />;
};

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AdminProvider>
          <SocialProvider>
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
                    <Route path="quests" element={<Quests />} />
                    <Route path="coaches" element={<Coaches />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="locations" element={<Locations />} />
                    <Route path="locations/new" element={<LocationForm />} />
                    <Route path="locations/:id/edit" element={<LocationForm />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="schedule" element={<SchedulePage />} />
                    <Route path="events" element={<Events />} />
                    <Route path="league" element={<LeaguePage />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="chats" element={<Chats />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="feed" element={<Feed />} />
                  </Route>
                </Route>
  
                <Route path="/superadmin" element={<SuperAdminRoleGuard />}>
                  <Route index element={<SuperDashboard />} />
                  <Route path="club/:clubId" element={<ClubDetail />} />
                </Route>
  
                <Route element={<RequireAuth />}>
                  <Route element={<MemberLayout />}>
                    <Route path="/feed" element={<FeedRedirect />} />
                    <Route path="/schedule" element={<ScheduleRedirect />} />
                    <Route path="/quests" element={<QuestsRedirect />} />
                    <Route path="/league" element={<LeagueRedirect />} />
                    <Route path="/profile" element={<ProfileRedirect />} />
                  </Route>
                </Route>
  
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </ShopProvider>
          </SocialProvider>
        </AdminProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
