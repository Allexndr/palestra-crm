import { getServiceClient } from '../_lib/supabase.js';
import { requireUser } from '../_lib/security.js';
import { sendJson, parseJsonBody } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (user.profile.role !== 'superadmin' && user.profile.email !== 'murdasoft@gmail.com') {
      return sendJson(res, 403, { error: 'Forbidden. Superadmin access required.' });
    }

    const supabase = getServiceClient();

    // PUT: Update club info
    if (req.method === 'PUT') {
      const { clubId, name, city, address, primary_color, admin_email } = await parseJsonBody(req);
      if (!clubId) return sendJson(res, 400, { error: 'clubId is required' });

      // 1. Update in clubs table
      const { error: clubError } = await supabase
        .from('clubs')
        .update({ name, city, address, primary_color })
        .eq('id', clubId);
      
      if (clubError) throw clubError;

      // 2. Update app_state (clubInfo and admin_email)
      const { data: stateData } = await supabase.from('app_state').select('state').eq('club_id', clubId).single();
      if (stateData?.state) {
        const newState = {
          ...stateData.state,
          admin_email: admin_email || stateData.state.admin_email,
          clubInfo: {
            ...stateData.state.clubInfo,
            name, city, address, primaryColor: primary_color
          }
        };
        await supabase.from('app_state').update({ state: newState }).eq('club_id', clubId);
      }

      return sendJson(res, 200, { success: true });
    }

    // DELETE: Delete club entirely
    if (req.method === 'DELETE') {
      const { clubId } = await parseJsonBody(req);
      if (!clubId) return sendJson(res, 400, { error: 'clubId is required' });

      // This will cascade delete profiles, locations, app_state, etc.
      const { error } = await supabase.from('clubs').delete().eq('id', clubId);
      if (error) throw error;

      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Superadmin club error:', error);
    return sendJson(res, 500, { error: error.message || 'Failed to process club request' });
  }
}
