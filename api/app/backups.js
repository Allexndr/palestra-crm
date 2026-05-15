import { sendJson, parseJsonBody } from '../_lib/http.js';
import { requireUser, assertSameOrigin, safeError } from '../_lib/security.js';
import { getServiceClient } from '../_lib/supabase.js';
import { saveAppState } from '../_lib/appState.js';
import { rateLimit } from '../_lib/rateLimit.js';

export default async function handler(req, res) {
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'app-backups', limit: 20, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  const requestUser = await requireUser(req, res);
  if (!requestUser) return;

  // Only admins can manage backups
  if (!['admin', 'superadmin'].includes(requestUser.profile?.role)) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }

  const clubId = requestUser.profile.club_id;
  if (!clubId) return sendJson(res, 400, { error: 'No club_id' });

  const supabase = getServiceClient();

  try {
    // GET /api/app/backups — list last 30 backups
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_state_backups')
        .select('id, created_at, hour_bucket')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return sendJson(res, 200, { backups: data || [] });
    }

    // POST /api/app/backups/restore — restore a specific backup
    if (req.method === 'POST') {
      const { backupId } = await parseJsonBody(req);
      if (!backupId) return sendJson(res, 400, { error: 'backupId required' });

      const { data, error } = await supabase
        .from('app_state_backups')
        .select('state')
        .eq('id', backupId)
        .eq('club_id', clubId)
        .single();

      if (error || !data) return sendJson(res, 404, { error: 'Backup not found' });

      const restored = await saveAppState(requestUser, data.state);
      return sendJson(res, 200, { state: restored });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return safeError(res, error, 'Backup operation failed');
  }
}
