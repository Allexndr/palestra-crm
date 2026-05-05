import { createSeedState } from './seedState.js';
import { getNormalizedState, syncNormalizedState } from './repositories.js';
import { getServiceClient, hasSupabaseServiceEnv } from './supabase.js';

const DEMO_CLUB_ID = '00000000-0000-0000-0000-000000000001';
let memoryState = createSeedState();

function getClubId(user) {
  return user?.profile?.club_id || DEMO_CLUB_ID;
}

export async function getAppState(user) {
  const clubId = getClubId(user);

  if (!hasSupabaseServiceEnv() || user?.isDemo) {
    return memoryState;
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('app_state')
    .select('state')
    .eq('club_id', clubId)
    .maybeSingle();

  if (error) throw error;
  if (data?.state) return getNormalizedState(user, data.state);

  const seeded = createSeedState();
  await saveAppState(user, seeded);
  return getNormalizedState(user, seeded);
}

export async function saveAppState(user, state) {
  const clubId = getClubId(user);

  if (!hasSupabaseServiceEnv() || user?.isDemo) {
    memoryState = { ...memoryState, ...state };
    return memoryState;
  }

  const supabase = getServiceClient();
  const { data: existing, error: readError } = await supabase
    .from('app_state')
    .select('state')
    .eq('club_id', clubId)
    .maybeSingle();

  if (readError) throw readError;

  const mergedState = { ...(existing?.state || {}), ...state };
  const { error } = await supabase
    .from('app_state')
    .upsert({ club_id: clubId, state: mergedState, updated_at: new Date().toISOString() }, { onConflict: 'club_id' });

  if (error) throw error;
  
  try {
    await syncNormalizedState(user, mergedState);
  } catch (syncError) {
    console.error('Failed to sync normalized state, but app_state was saved:', syncError);
  }
  
  return mergedState;
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
      ...createSeedState(true),
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
