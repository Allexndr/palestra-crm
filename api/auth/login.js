import { clearSessionCookies, parseJsonBody, sendJson, setSessionCookies } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';
import { createDemoProfile, getAnonClient, getProfileByAuthUserId, hasSupabaseEnv, mapProfileToUser } from '../_lib/supabase.js';
import { loginSchema, parseOrThrow } from '../_lib/validation.js';

function setDemoCookie(res, role) {
  res.setHeader('Set-Cookie', `palestra-demo-role=${encodeURIComponent(role)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
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

    if (email && password && hasSupabaseEnv() && email.includes('@')) {
      const { data, error } = await getAnonClient().auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        const profile = await getProfileByAuthUserId(data.user.id);
        if (!profile) {
          // Account was deleted — deny access
          await getAnonClient().auth.signOut();
          return sendJson(res, 401, { error: 'Аккаунт не найден или был удалён' });
        }
        setSessionCookies(res, data.session);
        return sendJson(res, 200, { user: mapProfileToUser(profile) });
      }
    }

    if (!allowDemo) return sendJson(res, 401, { error: 'Авторизация не удалась' });

    let demoRole = role || String(email || '').split('@')[0] || 'admin';
    
    // Explicit suffix-based role detection for demo/mock logins
    if (demoRole.endsWith('.student')) {
      demoRole = 'student';
    } else if (demoRole.endsWith('.coach')) {
      demoRole = 'coach';
    } else if (demoRole.endsWith('.parent')) {
      demoRole = 'parent';
    } else if (demoRole.endsWith('.admin') || demoRole === 'admin') {
      demoRole = 'admin';
    }

    const profile = createDemoProfile(['admin', 'coach', 'parent', 'student'].includes(demoRole) ? demoRole : 'admin');
    setDemoCookie(res, profile.role);
    return sendJson(res, 200, { user: mapProfileToUser(profile) });
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Login failed');
  }
}
