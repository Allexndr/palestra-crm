import { getServiceClient } from '../_lib/supabase.js';
import { requireUser } from '../_lib/security.js';
import { sendJson, parseJsonBody } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (user.profile.role !== 'superadmin' && user.profile.email !== 'murdasoft@gmail.com') {
      return sendJson(res, 403, { error: 'Forbidden. Superadmin access required.' });
    }

    const { clubId, subscription } = await parseJsonBody(req);
    if (!clubId || !subscription) return sendJson(res, 400, { error: 'Missing required fields' });

    const supabase = getServiceClient();

    // 1. Get current state
    const { data: stateRow, error: stateError } = await supabase
      .from('app_state')
      .select('state')
      .eq('club_id', clubId)
      .single();

    if (stateError) throw stateError;

    // 2. Update subscription in state
    const newState = {
      ...stateRow.state,
      subscription: {
        ...(stateRow.state.subscription || {}),
        ...subscription,
        superadmin_override: true,
        updated_by: 'superadmin',
        updated_at: new Date().toISOString(),
      }
    };

    // 3. Save state
    const { error: updateError } = await supabase
      .from('app_state')
      .update({ state: newState })
      .eq('club_id', clubId);

    if (updateError) throw updateError;

    return sendJson(res, 200, { success: true, subscription: newState.subscription });
  } catch (error) {
    console.error('Superadmin club tariff update error:', error);
    return sendJson(res, 500, { error: 'Failed to update club tariff' });
  }
}
