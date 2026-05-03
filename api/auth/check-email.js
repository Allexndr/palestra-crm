import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';

export default async function handler(req, res) {
  if (!assertSameOrigin(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { email, phone, clubName } = req.body || {};
    
    if (!hasSupabaseServiceEnv()) {
      return sendJson(res, 200, { exists: false });
    }

    const supabase = getServiceClient();
    
    // Check Profiles (Phone) - Email check is relaxed as per user request
    if (phone) {
      const { normalizePhone } = await import('../_lib/utils.js');
      const normalizedPhone = normalizePhone(phone);
      const { data } = await supabase.from('profiles').select('id').eq('phone', normalizedPhone).maybeSingle();
      if (data) return sendJson(res, 200, { exists: true, field: 'phone' });
    }

    // Check Clubs (Name)
    if (clubName) {
      const { data } = await supabase.from('clubs').select('id').ilike('name', clubName.trim()).maybeSingle();
      if (data) return sendJson(res, 200, { exists: true, field: 'clubName' });
    }

    return sendJson(res, 200, { exists: false });
  } catch (error) {
    return safeError(res, error, 'Unable to check email');
  }
}
