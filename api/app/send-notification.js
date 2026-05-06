import { sendJson, parseJsonBody } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';
import { getServiceClient, getRequestUser } from '../_lib/supabase.js';
import { notifySubscriptionExpiring, notifySubscriptionExpired, logNotification } from '../_lib/telegram.js';

/**
 * API endpoint to send subscription notifications to users
 * POST /api/app/send-notification
 * 
 * Body: {
 *   type: 'subscription_expiring' | 'subscription_expired',
 *   userId: string,
 *   daysLeft?: number,
 *   planName?: string
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!assertSameOrigin(req, res)) return;
  
  if (!rateLimit(req, res, { key: 'send-notification', limit: 30, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  try {
    // Verify the requester is authenticated and is admin/coach
    const requestUser = await getRequestUser(req);
    if (!requestUser || !['admin', 'coach', 'superadmin'].includes(requestUser.profile?.role)) {
      return sendJson(res, 403, { error: 'Forbidden' });
    }

    const { type, userId, daysLeft, planName } = await parseJsonBody(req);

    if (!type || !userId) {
      return sendJson(res, 400, { error: 'Missing required fields: type, userId' });
    }

    const supabase = getServiceClient();

    // Get target user's profile with tg_chat_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, first_name, last_name, email, role, tg_chat_id, club_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return sendJson(res, 404, { error: 'User not found' });
    }

    if (!profile.tg_chat_id) {
      return sendJson(res, 200, { 
        success: false, 
        reason: 'no_telegram_linked',
        message: 'User has not linked Telegram account' 
      });
    }

    let notificationSent = false;

    switch (type) {
      case 'subscription_expiring':
        if (typeof daysLeft !== 'number') {
          return sendJson(res, 400, { error: 'daysLeft is required for subscription_expiring' });
        }
        notificationSent = await notifySubscriptionExpiring(
          profile.tg_chat_id,
          { firstName: profile.first_name || profile.name, name: profile.name, email: profile.email },
          daysLeft,
          planName || 'Абонемент'
        );
        break;

      case 'subscription_expired':
        notificationSent = await notifySubscriptionExpired(
          profile.tg_chat_id,
          { firstName: profile.first_name || profile.name, name: profile.name, email: profile.email },
          planName || 'Абонемент'
        );
        break;

      default:
        return sendJson(res, 400, { error: 'Unknown notification type' });
    }

    // Log the notification
    await logNotification(supabase, {
      userId: profile.id,
      type,
      status: notificationSent ? 'sent' : 'failed',
      content: `${type} notification ${notificationSent ? 'sent' : 'failed'} via Telegram`
    });

    return sendJson(res, 200, {
      success: notificationSent,
      type,
      userId,
      telegramChatId: profile.tg_chat_id,
      message: notificationSent ? 'Notification sent successfully' : 'Failed to send notification'
    });

  } catch (error) {
    return safeError(res, error, 'Failed to send notification');
  }
}
