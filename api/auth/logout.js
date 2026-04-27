import { clearSessionCookies, sendJson } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin } from '../_lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'auth-logout', limit: 30, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Too many requests' });
  }
  clearSessionCookies(res);
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', [
    ...(Array.isArray(res.getHeader('Set-Cookie')) ? res.getHeader('Set-Cookie') : []),
    `palestra-demo-role=; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=0`,
  ]);
  return sendJson(res, 200, { ok: true });
}
