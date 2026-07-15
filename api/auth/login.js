import { clearSessionCookies, parseJsonBody, sendJson, setSessionCookies } from '../_lib/http.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';
import { createDemoProfile, getAnonClient, getProfileByAuthUserId, hasSupabaseEnv, hasSupabaseServiceEnv, mapProfileToUser, getServiceClient } from '../_lib/supabase.js';
import { loginSchema, parseOrThrow } from '../_lib/validation.js';

function setDemoCookie(res, role) {
  res.setHeader('Set-Cookie', `palestra-demo-role=${encodeURIComponent(role)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
}

function setMemberCookies(res, user) {
  const maxAge = 60 * 60 * 24 * 7;
  res.setHeader('Set-Cookie', [
    `palestra-demo-role=${encodeURIComponent(user.role)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAge}`,
    `palestra-member-data=${encodeURIComponent(JSON.stringify(user))}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${maxAge}`,
  ]);
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

    // Hardcoded test manager account — works without Supabase
    if (email === 'manager@palestra.test' && password === 'Palestra2026!') {
      const managerUser = {
        id: 'test-manager-001',
        role: 'admin',
        login: 'manager@palestra.test',
        name: 'Тестовый Менеджер',
        email: 'manager@palestra.test',
        clubId: '00000000-0000-0000-0000-000000000001',
      };
      setMemberCookies(res, managerUser);
      return sendJson(res, 200, { user: managerUser });
    }

    // Member login (no @) — look up by login+password in appState.members/coaches
    if (email && password && !email.includes('@') && hasSupabaseServiceEnv()) {
      const supabase = getServiceClient();
      const { data: rows } = await supabase.from('app_state').select('club_id, state');
      if (rows) {
        for (const row of rows) {
          const state = row.state || {};
          const allMembers = [
            ...(Array.isArray(state.members) ? state.members : []),
            ...(Array.isArray(state.coaches) ? state.coaches : []),
          ];
          const found = allMembers.find(
            m => m.login === email && m.password === password
          );
          if (found) {
            const memberRole = found.role || (state.coaches?.some(c => c.login === email) ? 'coach' : 'student');
            const fakeUser = {
              id: found.id || `member-${found.login}`,
              role: memberRole,
              login: found.login,
              name: found.name || found.login,
              email: found.login,
              clubId: row.club_id,
            };
            // Store full member identity in cookie for correct club context
            setMemberCookies(res, fakeUser);
            return sendJson(res, 200, { user: fakeUser });
          }
        }
      }
      return sendJson(res, 401, { error: 'Авторизация не удалась' });
    }

    if (email && password && hasSupabaseEnv() && email.includes('@')) {
      const { data, error } = await getAnonClient().auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        let profile = await getProfileByAuthUserId(data.user.id);
        
        // Fallback: try to find profile by email if auth_user_id lookup failed
        if (!profile && hasSupabaseServiceEnv()) {
          const { getServiceClient } = await import('../_lib/supabase.js');
          const supabase = getServiceClient();
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email.toLowerCase())
            .maybeSingle();
          
          if (profileByEmail) {
            // Update the profile with auth_user_id for future lookups
            await supabase.from('profiles').update({ auth_user_id: data.user.id }).eq('id', profileByEmail.id);
            profile = { ...profileByEmail, auth_user_id: data.user.id };
          }
        }
        
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
