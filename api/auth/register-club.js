import { parseJsonBody, sendJson, setSessionCookies } from '../_lib/http.js';
import { ensureClubForRegistration } from '../_lib/appState.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';
import { getAnonClient, getServiceClient, hasSupabaseEnv, hasSupabaseServiceEnv, mapProfileToUser } from '../_lib/supabase.js';
import { parseOrThrow, registerClubSchema } from '../_lib/validation.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!assertSameOrigin(req, res)) return;
  if (!rateLimit(req, res, { key: 'auth-register', limit: 5, windowMs: 60_000 })) {
    return sendJson(res, 429, { error: 'Слишком много регистраций. Попробуйте позже.' });
  }

  try {
    const { formData, password } = parseOrThrow(registerClubSchema, await parseJsonBody(req));

    let authUserId = null;
    let session = null;
    let tgCode = null;

    if (hasSupabaseEnv() && hasSupabaseServiceEnv()) {
      const supabase = getServiceClient();
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          clubName: formData.clubName,
        },
      });

      if (error && !/already/i.test(error.message)) throw error;
      authUserId = data?.user?.id || null;

      if (authUserId) {
        const auth = await getAnonClient().auth.signInWithPassword({ email: formData.email, password });
        session = auth.data?.session || null;
      }
    }

    let club = null;
    let profile = null;

    try {
      const { club: newClub, profile: newProfile, tgCode: newTgCode } = await ensureClubForRegistration({ ...formData, tempPassword: password }, authUserId);
      club = newClub;
      profile = newProfile;
      tgCode = newTgCode;
    } catch (e) {
      console.error('Registration data error:', e);
      club = { id: '00000000-0000-0000-0000-000000000001', name: formData.clubName };
    }

    if (session) setSessionCookies(res, session);

    return sendJson(res, 200, {
      club,
      user: mapProfileToUser(profile) || {
        id: authUserId || 'admin1',
        role: 'admin',
        login: formData.email,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        clubId: club.id,
      },
      credentials: { login: formData.email, password, tgCode }
    });
  } catch (error) {
    if (error.statusCode) return sendJson(res, error.statusCode, { error: error.message });
    return safeError(res, error, 'Unable to register club');
  }
}
