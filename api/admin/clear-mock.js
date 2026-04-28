import { getServiceClient } from '../_lib/supabase.js';
import { sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  const email = req.query.email;
  if (!email) return sendJson(res, 400, { error: 'Email is required' });

  try {
    const supabase = getServiceClient();

    // Find profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, club_id')
      .eq('email', email);

    if (profileError || !profiles || profiles.length === 0) {
      return sendJson(res, 404, { error: 'Profile not found' });
    }

    const profile = profiles[0];

    // Find state
    const { data: states, error: stateError } = await supabase
      .from('app_state')
      .select('state')
      .eq('club_id', profile.club_id);

    if (stateError || !states || states.length === 0) {
      return sendJson(res, 404, { error: 'App state not found' });
    }

    const currentState = states[0].state;

    // Wipe state
    currentState.members = [];
    currentState.schedule = [];
    currentState.leads = [];
    currentState.groups = [];
    currentState.activities = [];
    currentState.attendance = [];
    currentState.achievements = [];
    currentState.shop = { products: [], orders: [] };
    currentState.locations = [{ id: '1', name: 'Основной зал', address: 'Адрес клуба', isActive: true }];

    // Update state
    const { error: updateError } = await supabase
      .from('app_state')
      .update({ state: currentState })
      .eq('club_id', profile.club_id);

    if (updateError) {
      return sendJson(res, 500, { error: 'Failed to update state' });
    }

    return sendJson(res, 200, { success: true, message: `Account data wiped for ${email}` });
  } catch (err) {
    return sendJson(res, 500, { error: err.message });
  }
}
