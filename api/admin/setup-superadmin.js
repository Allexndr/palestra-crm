/**
 * ONE-TIME setup endpoint: wipes all data and creates a superadmin account.
 * DELETE THIS FILE after use.
 */
import { sendJson } from '../_lib/http.js';
import { getServiceClient, hasSupabaseServiceEnv } from '../_lib/supabase.js';

const SUPERADMIN_EMAIL = 'murdasoft@gmail.com';
const SUPERADMIN_PASSWORD = 'Palestra2026!';
const SETUP_SECRET = 'palestra-setup-2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'POST only' });
  }

  // Simple secret check so nobody else can call this
  const authHeader = req.headers['x-setup-secret'];
  if (authHeader !== SETUP_SECRET) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }

  if (!hasSupabaseServiceEnv()) {
    return sendJson(res, 500, { error: 'No Supabase service env' });
  }

  const supabase = getServiceClient();
  const log = [];

  try {
    // ── 1. Clean all data tables ──
    const tables = [
      'activities', 'orders', 'products', 'posts', 'member_achievements',
      'achievements', 'leagues', 'events', 'monthly_awards', 'user_preferences',
      'user_roles', 'attendance_records', 'schedule_sessions', 'financial_transactions',
      'plans', 'leads', 'members', 'parents', 'coaches', 'groups', 'locations',
      'app_state', 'tariff_drafts', 'profiles', 'clubs'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        // Some tables use club_id as PK, try that
        const { error: err2 } = await supabase.from(table).delete().neq('club_id', '00000000-0000-0000-0000-000000000000');
        if (err2) {
          log.push(`⚠ ${table}: ${error.message} / ${err2.message}`);
        } else {
          log.push(`✓ ${table} cleared (via club_id)`);
        }
      } else {
        log.push(`✓ ${table} cleared`);
      }
    }

    // ── 2. Delete existing auth users ──
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authUsers?.users?.length) {
      for (const u of authUsers.users) {
        await supabase.auth.admin.deleteUser(u.id);
        log.push(`✓ Deleted auth user: ${u.email}`);
      }
    }

    // ── 3. Create superadmin auth user ──
    const { data: newAuth, error: authError } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
    });

    if (authError) throw new Error(`Auth create failed: ${authError.message}`);
    log.push(`✓ Created auth user: ${SUPERADMIN_EMAIL}`);

    // ── 4. Create a "Platform" club for superadmin ──
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: 'Palestra HQ',
        city: 'Алматы',
        address: 'Платформа',
        logo_blob_url: '/palestra-logo-nav-full.png',
        primary_color: '#3146A6',
      })
      .select('*')
      .single();

    if (clubError) throw new Error(`Club create failed: ${clubError.message}`);
    log.push(`✓ Created club: ${club.name} (${club.id})`);

    // ── 5. Create superadmin profile ──
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: newAuth.user.id,
        club_id: club.id,
        role: 'admin', // DB constraint only allows admin/coach/parent/student
        name: 'Александр (SuperAdmin)',
        email: SUPERADMIN_EMAIL,
        phone: '',
      })
      .select('*')
      .single();

    if (profileError) throw new Error(`Profile create failed: ${profileError.message}`);
    log.push(`✓ Created profile: ${profile.name} (${profile.id})`);

    // ── 6. Seed initial app_state ──
    await supabase.from('app_state').upsert({
      club_id: club.id,
      state: {
        members: [],
        leads: [],
        schedule: [],
        locations: [{ id: '1', name: 'Основной зал', address: 'Платформа', isActive: true }],
        groups: [],
        activities: [],
        leagues: [],
        plans: [],
        posts: [],
        coaches: [],
        events: [],
        attendance: [],
        finances: { revenue: 0, transactions: [] },
        achievements: [],
        monthlyAward: { title: '', description: '', daysLeft: 0 },
        selectedLocationId: 'all',
        clubInfo: { name: 'Palestra HQ', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6' },
        shop: { products: [], orders: [] },
      },
      updated_at: new Date().toISOString(),
    });
    log.push('✓ Seeded app_state');

    return sendJson(res, 200, {
      success: true,
      credentials: {
        email: SUPERADMIN_EMAIL,
        password: SUPERADMIN_PASSWORD,
      },
      club: { id: club.id, name: club.name },
      log,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message,
      log,
    });
  }
}
