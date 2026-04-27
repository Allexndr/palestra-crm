import { sendJson } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { safeError } from '../_lib/security.js';
import { getRequestUser, mapProfileToUser } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!rateLimit(req, res, { key: 'auth-me', limit: 120, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }

  try {
    const requestUser = await getRequestUser(req);
    return sendJson(res, 200, { user: mapProfileToUser(requestUser?.profile) });
  } catch (error) {
    return safeError(res, error, 'Unable to read session');
  }
}
