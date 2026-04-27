import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';
import { assertSameOrigin, safeError } from '../_lib/security.js';

export default async function handler(req, res) {
  if (!assertSameOrigin(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    
    if (!email) {
      return sendJson(res, 400, { error: 'Email is required' });
    }

    if (!hasSupabaseServiceEnv()) {
      // Allow if no DB environment (demo mode)
      return sendJson(res, 200, { exists: false });
    }

    const supabase = getServiceClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      throw error;
    }

    return sendJson(res, 200, { exists: !!data });
  } catch (error) {
    return safeError(res, error, 'Unable to check email');
  }
}
