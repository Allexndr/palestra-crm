import { sendJson, clearSessionCookies } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { safeError } from '../_lib/security.js';
import { getRequestUser, mapProfileToUser } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'DELETE') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!rateLimit(req, res, { key: 'auth-me', limit: 120, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  try {
    const requestUser = await getRequestUser(req);
    
    if (req.method === 'DELETE') {
      if (!requestUser || requestUser.isDemo) {
        return sendJson(res, 401, { error: 'Unauthorized or demo account' });
      }

      const clubId = requestUser.profile?.club_id;
      if (clubId && clubId !== '00000000-0000-0000-0000-000000000001') {
        const { deleteClubCompletely } = await import('../_lib/repositories.js');
        await deleteClubCompletely(clubId);
      }

      // Delete the Supabase Auth user so they can't log in again
      const authUserId = requestUser.authUser?.id;
      if (authUserId) {
        const { getServiceClient, hasSupabaseServiceEnv } = await import('../_lib/supabase.js');
        if (hasSupabaseServiceEnv()) {
          await getServiceClient().auth.admin.deleteUser(authUserId);
        }
      }

      clearSessionCookies(res);
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 200, { user: mapProfileToUser(requestUser?.profile) });
  } catch (error) {
    return safeError(res, error, 'Unable to read session');
  }
}
