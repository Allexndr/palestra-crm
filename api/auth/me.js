import { sendJson, clearSessionCookies } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { safeError } from '../_lib/security.js';
import { getRequestUser, mapProfileToUser, getServiceClient } from '../_lib/supabase.js';
import { notifyAccountDeleted, logNotification } from '../_lib/telegram.js';

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

      // Get user data for notification before deletion
      const userData = mapProfileToUser(requestUser?.profile);
      const tgChatId = requestUser?.profile?.tg_chat_id;

      // Delete the Supabase Auth user so they can't log in again
      const authUserId = requestUser.authUser?.id;
      const supabase = getServiceClient();
      
      if (authUserId) {
        const { hasSupabaseServiceEnv } = await import('../_lib/supabase.js');
        if (hasSupabaseServiceEnv()) {
          await supabase.auth.admin.deleteUser(authUserId);
        }
      }

      // Send Telegram notification if user has linked Telegram
      if (tgChatId && userData) {
        await notifyAccountDeleted(tgChatId, userData, new Date().toISOString());
        await logNotification(supabase, {
          userId: requestUser.profile.id,
          type: 'account_deleted',
          status: 'sent',
          content: 'Account deleted notification sent via Telegram'
        });
      }

      clearSessionCookies(res);
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 200, { user: mapProfileToUser(requestUser?.profile) });
  } catch (error) {
    return safeError(res, error, 'Unable to read session');
  }
}
