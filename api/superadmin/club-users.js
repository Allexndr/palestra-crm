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

    // GET: List all users in a club
    if (req.method === 'GET') {
      const { clubId } = req.query;
      if (!clubId) return sendJson(res, 400, { error: 'clubId is required' });

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('club_id', clubId)
        .order('role', { ascending: true }); // admin first, then coach, parent, student

      if (error) throw error;
      return sendJson(res, 200, { users: profiles });
    }

    // POST: Create a new user for the club
    if (req.method === 'POST') {
      const { clubId, email, password, name, role, phone } = await parseJsonBody(req);
      if (!clubId || !email || !password || !name || !role) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }

      // 1. Create in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, clubId }
      });
      if (authError) throw authError;

      // 2. Create in profiles (trigger might do this, but we force it)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          auth_user_id: authData.user.id,
          club_id: clubId,
          role,
          name,
          email,
          phone: phone || null,
        })
        .select()
        .single();
      
      if (profileError) throw profileError;

      return sendJson(res, 201, { user: profile });
    }

    // PUT: Update user (role, password)
    if (req.method === 'PUT') {
      const { userId, authUserId, role, password, name, is_blocked } = await parseJsonBody(req);
      if (!userId) return sendJson(res, 400, { error: 'userId is required' });

      // Update auth user if password or blocked status provided
      if (authUserId && (password || is_blocked !== undefined)) {
        const updateData = {};
        if (password) updateData.password = password;
        if (is_blocked !== undefined) updateData.ban_duration = is_blocked ? '876000h' : 'none'; // 100 years or unban

        const { error: authError } = await supabase.auth.admin.updateUserById(authUserId, updateData);
        if (authError) throw authError;
      }

      // Update profile
      const profileData = {};
      if (role) profileData.role = role;
      if (name) profileData.name = name;

      if (Object.keys(profileData).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);
        if (profileError) throw profileError;
      }

      return sendJson(res, 200, { success: true });
    }

    // DELETE: Delete user
    if (req.method === 'DELETE') {
      const { userId, authUserId } = await parseJsonBody(req);
      if (!userId) return sendJson(res, 400, { error: 'userId is required' });

      // Delete from auth (cascades to profile)
      if (authUserId) {
        const { error } = await supabase.auth.admin.deleteUser(authUserId);
        if (error) throw error;
      } else {
        // If no auth user, just delete profile
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
      }

      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Superadmin club users error:', error);
    return sendJson(res, 500, { error: error.message || 'Failed to manage users' });
  }
}
