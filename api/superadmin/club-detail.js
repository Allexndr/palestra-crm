import { getServiceClient } from '../_lib/supabase.js';
import { requireUser } from '../_lib/security.js';
import { sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (user.profile.role !== 'superadmin' && user.profile.email !== 'murdasoft@gmail.com') {
      return sendJson(res, 403, { error: 'Forbidden.' });
    }

    const { clubId } = req.query;
    if (!clubId) return sendJson(res, 400, { error: 'clubId is required' });

    const supabase = getServiceClient();

    const [
      { data: club, error: clubError },
      { data: stateRow, error: stateError },
    ] = await Promise.all([
      supabase.from('clubs').select('*').eq('id', clubId).single(),
      supabase.from('app_state').select('state, updated_at').eq('club_id', clubId).maybeSingle(),
    ]);

    if (clubError) throw clubError;
    if (stateError) throw stateError;
    if (!club) return sendJson(res, 404, { error: 'Club not found' });

    const appState = stateRow?.state || {};

    return sendJson(res, 200, {
      club,
      lastActivity: stateRow?.updated_at,
      appState, // full raw state — all members, coaches, schedule, finances, groups etc.
    });
  } catch (error) {
    console.error('Superadmin club detail error:', error);
    return sendJson(res, 500, { error: 'Failed to fetch club details' });
  }
}
