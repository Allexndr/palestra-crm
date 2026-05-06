import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';

// ONE-TIME fix: restore murdasoft@gmail.com as superadmin with no club_id
// DELETE THIS FILE after running once.
export default async function handler(req, res) {
  if (!hasSupabaseServiceEnv()) return sendJson(res, 500, { error: 'No service env' });

  const supabase = getServiceClient();

  // 1. Find the profile by email
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'murdasoft@gmail.com')
    .maybeSingle();

  if (fetchError) return sendJson(res, 500, { error: fetchError.message });
  if (!profile) return sendJson(res, 404, { error: 'Profile not found' });

  // 2. Update role to superadmin and clear club_id
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'superadmin', club_id: null })
    .eq('id', profile.id);

  if (updateError) return sendJson(res, 500, { error: updateError.message });

  return sendJson(res, 200, {
    ok: true,
    message: 'murdasoft@gmail.com restored as superadmin with no club_id',
    before: { role: profile.role, club_id: profile.club_id },
    after: { role: 'superadmin', club_id: null },
  });
}
