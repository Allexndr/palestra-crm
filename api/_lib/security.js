import { sendJson, parseCookies } from './http.js';
import { getRequestUser } from './supabase.js';

const allowedMethodsWithoutOrigin = new Set(['GET', 'HEAD', 'OPTIONS']);

export function assertSameOrigin(req, res) {
  if (allowedMethodsWithoutOrigin.has(req.method)) return true;

  const origin = req.headers.origin;
  if (!origin) return true;

  const host = req.headers.host;
  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return true;
    // Allow all Vercel preview/deployment URLs for the same project
    const isVercel = (h) => h === 'palestra-beta.vercel.app' || h.endsWith('.vercel.app');
    if (isVercel(originHost) && isVercel(host)) return true;
    // Allow localhost in any environment
    if (originHost.startsWith('localhost') || originHost.startsWith('127.0.0.1')) return true;
  } catch {
    return false;
  }

  sendJson(res, 403, { error: 'Forbidden origin' });
  return false;
}

export async function requireUser(req, res, { allowDemo = false } = {}) {
  const requestUser = await getRequestUser(req);
  if (requestUser?.profile && (allowDemo || !requestUser.isDemo)) {
    // SuperAdmin Impersonation: override club_id if header is present
    const targetClubId = req.headers['x-palestra-club-id'];
    if ((requestUser.profile.role === 'superadmin' || requestUser.profile.email === 'murdasoft@gmail.com') && targetClubId) {
      requestUser.profile.club_id = targetClubId;
    }
    return requestUser;
  }

  sendJson(res, 401, { error: 'Unauthorized' });
  return null;
}

export function safeError(res, error, fallback = 'Request failed') {
  if (process.env.NODE_ENV !== 'production') {
    return sendJson(res, 500, { error: error.message || fallback });
  }
  return sendJson(res, 500, { error: fallback });
}
