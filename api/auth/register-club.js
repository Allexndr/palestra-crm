import { getServiceClient, hasSupabaseEnv, hasSupabaseServiceEnv, getAnonClient } from '../_lib/supabase.js';
import { sendJson, parseJsonBody } from '../_lib/http.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';
import { rateLimit } from '../_lib/rateLimit.js';
import { registerClubSchema, parseOrThrow } from '../_lib/validation.js';
import { ensureClubForRegistration } from '../_lib/appState.js';
import { mapProfileToUser } from '../_lib/supabase.js';

function setSessionCookies(res, session) {
  const expires = new Date(Date.now() + (session.expires_in || 3600) * 1000);
  res.setHeader('Set-Cookie', [
    `sb-access-token=${session.access_token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`,
    `sb-refresh-token=${session.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`
  ]);
}

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
      
      // 1. Check for duplicates
      const { normalizePhone } = await import('../_lib/utils.js');
      const normalizedPhone = normalizePhone(formData.phone);
      
      const { data: existingP } = await supabase.from('profiles').select('id').eq('phone', normalizedPhone).maybeSingle();
      const { data: existingC } = await supabase.from('clubs').select('id').ilike('name', formData.clubName).maybeSingle();
      
      if (existingP || existingC) {
        return sendJson(res, 400, { 
          error: 'Club or Phone already registered',
          details: { 
            fieldErrors: {
              phone: existingP ? ['Уже зарегистрирован'] : undefined,
              clubName: existingC ? ['Уже зарегистрировано'] : undefined
            }
          }
        });
      }

      // 1.1 Check: existing student/coach/parent cannot register as admin
      const { data: existingByEmail } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', formData.email)
        .in('role', ['student', 'coach', 'parent'])
        .maybeSingle();
      
      const { data: existingByPhone } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('phone', normalizedPhone)
        .in('role', ['student', 'coach', 'parent'])
        .maybeSingle();

      const existingNonAdmin = existingByEmail || existingByPhone;
      if (existingNonAdmin) {
        return sendJson(res, 400, {
          error: 'Пользователь уже существует как ученик, тренер или родитель',
          details: {
            fieldErrors: {
              email: existingByEmail ? ['Этот email уже используется как ' + existingByEmail.role] : undefined,
              phone: existingByPhone ? ['Этот телефон уже используется как ' + existingByPhone.role] : undefined
            }
          }
        });
      }

      // 2. Create Auth User
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          clubName: formData.clubName,
        },
      });

      if (createError) {
        if (/already/i.test(createError.message)) {
          const { data: list } = await supabase.auth.admin.listUsers();
          authUserId = list.users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())?.id;
        } else {
          throw createError;
        }
      } else {
        authUserId = newUser?.user?.id;
      }

      if (authUserId) {
        try {
          const auth = await getAnonClient().auth.signInWithPassword({ email: formData.email, password });
          session = auth.data?.session || null;
        } catch (e) {
          console.warn('Auto-login failed after registration:', e);
        }
      }
    }

    let club = null;
    let profile = null;

    try {
      const result = await ensureClubForRegistration({ ...formData, tempPassword: password }, authUserId);
      club = result.club;
      profile = result.profile;
      tgCode = result.tgCode;
    } catch (e) {
      console.error('Registration data error:', e);
      throw e;
    }

    if (session) setSessionCookies(res, session);

    return sendJson(res, 200, {
      club,
      user: mapProfileToUser(profile) || {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: 'admin'
      },
      credentials: { login: formData.email, password, tgCode }
    });
  } catch (error) {
    if (error.statusCode === 400) {
      console.error('Validation Error Details:', JSON.stringify(error.details, null, 2));
      return sendJson(res, 400, { error: error.message, details: error.details });
    }
    return safeError(res, error, 'Unable to register club');
  }
}
