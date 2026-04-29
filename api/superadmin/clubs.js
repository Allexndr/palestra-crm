import { getServiceClient } from '../_lib/supabase.js';
import { requireUser } from '../_lib/security.js';
import { sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const user = await requireUser(req, res);
    if (!user) return; // requireUser already sent 401
    
    // Safety check - although the guard stops them on frontend, we must protect the API
    if (user.profile.role !== 'superadmin') {
      return sendJson(res, 403, { error: 'Forbidden. Superadmin access required.' });
    }

    const supabase = getServiceClient();

    // 1. Fetch all clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (clubsError) throw clubsError;

    // 2. Fetch all app states to get stats (tariffs, members)
    const { data: states, error: statesError } = await supabase
      .from('app_state')
      .select('club_id, state');

    if (statesError) throw statesError;

    // Combine data
    const clubsWithStats = clubs.map(club => {
      const clubStateRow = states.find(s => s.club_id === club.id);
      const appState = clubStateRow?.state || {};
      
      const members = Array.isArray(appState.members) ? appState.members : [];
      const coaches = Array.isArray(appState.coaches) ? appState.coaches : [];
      const tariff = appState.subscription?.plan || 'Starter';
      const adminEmail = appState.admin_email || 'Нет данных';

      return {
        ...club,
        stats: {
          studentsCount: members.length,
          coachesCount: coaches.length,
          tariff: tariff,
          adminEmail: adminEmail
        }
      };
    });

    return sendJson(res, 200, { clubs: clubsWithStats });
  } catch (error) {
    console.error('Superadmin clubs fetch error:', error);
    return sendJson(res, 500, { error: 'Failed to fetch clubs' });
  }
}
