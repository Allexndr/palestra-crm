import { clearSessionCookies, parseJsonBody, sendJson, setSessionCookies } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';
import { createDemoProfile, getAnonClient, getProfileByAuthUserId, hasSupabaseEnv, mapProfileToUser } from '../_lib/supabase.js';
import { loginSchema, parseOrThrow } from '../_lib/validation.js';

function setDemoCookie(res, role) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `palestra-demo-role=${encodeURIComponent(role)}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'auth-login', limit: 8, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Слишком много попыток входа. Попробуйте позже.' });
  }

  try {
    const { email, password, role } = parseOrThrow(loginSchema, await parseJsonBody(req));
    const allowDemo = process.env.ALLOW_DEMO_AUTH !== 'false';

    if (email && password && hasSupabaseEnv()) {
      const { data, error } = await getAnonClient().auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        const profile = await getProfileByAuthUserId(data.user.id);
        setSessionCookies(res, data.session);
        return sendJson(res, 200, { user: mapProfileToUser(profile) || { id: data.user.id, role: 'admin', email: data.user.email, name: data.user.email } });
      }
    }

    if (!allowDemo) {
      clearSessionCookies(res);
      return sendJson(res, 401, { error: 'Неверный логин или пароль' });
    }

    const demoRole = role || String(email || '').split('@')[0] || 'admin';
    const profile = createDemoProfile(['admin', 'coach', 'parent', 'student'].includes(demoRole) ? demoRole : 'admin');
    setDemoCookie(res, profile.role);
    return sendJson(res, 200, { user: mapProfileToUser(profile) });
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Login failed');
  }
}
