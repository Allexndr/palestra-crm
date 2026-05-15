import { createSeedState } from './seedState.js';
import { getNormalizedState, syncNormalizedState } from './repositories.js';
import { getServiceClient, hasSupabaseServiceEnv } from './supabase.js';

const DEMO_CLUB_ID = '00000000-0000-0000-0000-000000000001';
let memoryState = createSeedState();

function getClubId(user) {
  if (user?.profile?.club_id && user.profile.club_id !== DEMO_CLUB_ID) {
    return user.profile.club_id;
  }
  // For demo users, create a stable club ID based on their user ID or email
  if (user?.isDemo && user?.profile?.id) {
    const seed = user.profile.email || user.profile.id;
    // Generate a stable pseudo-UUID
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(12, '0');
    return `00000000-0000-4000-8000-${hex.substring(0, 12)}`;
  }
  return DEMO_CLUB_ID;
}

export async function getAppState(user) {
  try {
    // Superadmin has no club — return seed state without persisting
    if (user?.profile?.role === 'superadmin' && !user?.profile?.club_id) {
      return createSeedState();
    }

    const clubId = getClubId(user);

    if (!hasSupabaseServiceEnv()) {
      return memoryState;
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('app_state')
      .select('state')
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) {
      console.error('[getAppState] Supabase error:', error.message);
      return getNormalizedState(user, memoryState);
    }
    
    if (data?.state) return getNormalizedState(user, data.state);

    // Real clubs get empty state (no mock data); demo users get seed with examples
    const seeded = createSeedState();
    await saveAppState(user, seeded);
    return getNormalizedState(user, seeded);
  } catch (err) {
    console.error('[getAppState] Crash:', err.message);
    return getNormalizedState(user, memoryState);
  }
}

export async function saveAppState(user, state) {
  try {
    // Superadmin has no club — nothing to save
    if (user?.profile?.role === 'superadmin' && !user?.profile?.club_id) {
      return state;
    }

    const clubId = getClubId(user);

    if (!hasSupabaseServiceEnv()) {
      memoryState = { ...memoryState, ...state };
      return memoryState;
    }

    const supabase = getServiceClient();
    const { data: existing, error: readError } = await supabase
      .from('app_state')
      .select('state')
      .eq('club_id', clubId)
      .maybeSingle();

    if (readError) {
      console.error('[saveAppState] Read error:', readError.message);
    }

    const mergedState = { ...(existing?.state || {}), ...state };
    
    // Safety check: ensure club still exists before upserting state
    const { data: clubCheck } = await supabase.from('clubs').select('id').eq('id', clubId).maybeSingle();
    if (!clubCheck) {
      console.warn('[saveAppState] Club no longer exists, skipping state save');
      return mergedState;
    }

    const { error } = await supabase
      .from('app_state')
      .upsert({ club_id: clubId, state: mergedState, updated_at: new Date().toISOString() }, { onConflict: 'club_id' });

    if (error) {
      console.error('[saveAppState] Upsert error:', error.message);
      throw error;
    }
    
    try {
      await syncNormalizedState(user, mergedState);
    } catch (syncError) {
      console.error('Failed to sync normalized state, but app_state was saved:', syncError);
    }

    // Hourly backup: upsert into app_state_backups (unique per club+hour)
    try {
      await supabase
        .from('app_state_backups')
        .upsert(
          { club_id: clubId, state: mergedState, created_at: new Date().toISOString() },
          { onConflict: 'club_id,hour_bucket', ignoreDuplicates: false }
        );
    } catch (backupError) {
      // Backup failure is non-critical — log and continue
      console.warn('[saveAppState] Backup failed (non-critical):', backupError.message);
    }
    
    return mergedState;
  } catch (err) {
    console.error('[saveAppState] Crash:', err.message);
    return state;
  }
}

export async function ensureClubForRegistration(formData, ownerAuthUserId = null) {
  if (!hasSupabaseServiceEnv()) {
    return {
      club: { id: DEMO_CLUB_ID, name: formData.clubName || 'Palestra Fight Club' },
      profile: null,
    };
  }

  const supabase = getServiceClient();
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .insert({
      name: formData.clubName,
      city: formData.city,
      address: formData.address,
      logo_blob_url: '/palestra-logo-nav-full.png',
      primary_color: '#3146A6',
    })
    .select('*')
    .single();

  if (clubError) throw clubError;

  let profile = null;
    const { normalizePhone } = await import('./utils.js');
    const normalizedPhone = normalizePhone(formData.phone);

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: ownerAuthUserId,
        club_id: club.id,
        role: 'admin', // Use admin role to avoid DB constraint violation. Superadmin status is handled via email check in app logic.
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: normalizedPhone,
      })
      .select('*')
      .single();

    if (error) throw error;
    profile = data;

  const tgCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const createUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  const locationUuid = createUuid();

  await supabase.from('app_state').upsert({
    club_id: club.id,
    state: {
      ...createSeedState(),
      clubInfo: { 
        name: club.name, 
        logo: '/palestra-logo-nav-full.png', 
        primaryColor: '#3146A6',
        estimatedStudents: formData.studentsCount 
      },
      tg_reg_code: tgCode,
      admin_email: formData.email,
      admin_auth_id: ownerAuthUserId,
      temp_password: formData.tempPassword,
      locations: [{ id: locationUuid, name: formData.clubName || 'Основной зал', address: formData.address, isActive: true }],
    },
    updated_at: new Date().toISOString(),
  });

  return { club, profile, tgCode };
}
