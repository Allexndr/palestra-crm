import { getServiceClient } from '../_lib/supabase.js';
import { requireUser } from '../_lib/security.js';
import { sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const user = await requireUser(req, res);
    if (!user) return; // requireUser already sent 401
    
    // Safety check - although the guard stops them on frontend, we must protect the API
    if (user.profile.role !== 'superadmin' && user.profile.email !== 'murdasoft@gmail.com') {
      return sendJson(res, 403, { error: 'Forbidden. Superadmin access required.' });
    }

    const supabase = getServiceClient();

    const [{ data: clubs, error: clubsError }, { data: states, error: statesError }] = await Promise.all([
      supabase.from('clubs').select('*').order('created_at', { ascending: false }),
      supabase.from('app_state').select('club_id, state, updated_at'),
    ]);

    if (clubsError) throw clubsError;
    if (statesError) throw statesError;

    // Combine data
    const clubsWithStats = clubs.map(club => {
      const clubStateRow = states.find(s => s.club_id === club.id);
      const appState = clubStateRow?.state || {};
      const lastUpdated = clubStateRow?.updated_at;

      const members = Array.isArray(appState.members) ? appState.members : [];
      const coaches = Array.isArray(appState.coaches) ? appState.coaches : [];
      const groups = Array.isArray(appState.groups) ? appState.groups : [];
      const leads = Array.isArray(appState.leads) ? appState.leads : [];
      const schedule = Array.isArray(appState.schedule) ? appState.schedule : [];
      const finances = appState.finances || {};
      const transactions = Array.isArray(finances.transactions) ? finances.transactions : [];
      const subscription = appState.subscription || {};

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthlyRevenue = transactions
        .filter(t => t.type === 'income' && t.date >= monthStart)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const isActive = lastUpdated
        ? (Date.now() - new Date(lastUpdated).getTime()) < 7 * 24 * 60 * 60 * 1000
        : false;

      const clubInfoName = appState.clubInfo?.name;
      const displayName = clubInfoName || club.name || 'Без названия';

      return {
        ...club,
        name: displayName,
        lastActivity: lastUpdated,
        isActive,
        stats: {
          studentsCount: members.length,
          coachesCount: coaches.length,
          groupsCount: groups.length,
          leadsCount: leads.length,
          sessionsCount: schedule.length,
          monthlyRevenue,
          totalRevenue,
          tariff: subscription.plan || 'Starter',
          tariffDetails: subscription,
          adminEmail: appState.admin_email || '',
          locations: Array.isArray(appState.locations) ? appState.locations : [],
          recentTransactions: transactions.slice(0, 5),
        }
      };
    });

    return sendJson(res, 200, { clubs: clubsWithStats });
  } catch (error) {
    console.error('Superadmin clubs fetch error:', error);
    return sendJson(res, 500, { error: 'Failed to fetch clubs' });
  }
}
