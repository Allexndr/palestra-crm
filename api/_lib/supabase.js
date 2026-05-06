import { createClient } from '@supabase/supabase-js';
import { parseCookies } from './http.js';
export { parseCookies };

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && anonKey);
}

export function hasSupabaseServiceEnv() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function getAnonClient() {
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase public env vars');
  }
  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service env vars');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function getRequestUser(req) {
  const cookies = parseCookies(req);
  const token = cookies['palestra-access-token'];
  const demoRole = cookies['palestra-demo-role'];

  if (token && hasSupabaseEnv()) {
    const { data, error } = await getAnonClient().auth.getUser(token);
    if (!error && data?.user) {
      const profile = await getProfileByAuthUserId(data.user.id);
      return {
        authUser: data.user,
        profile,
        isDemo: false,
      };
    }
  }

  if (demoRole) {
    return {
      authUser: null,
      profile: createDemoProfile(demoRole),
      isDemo: true,
    };
  }

  return null;
}

export function createDemoProfile(role = 'admin') {
  return {
    id: role === 'parent' ? 'p1' : role === 'student' ? 'm1' : role === 'coach' ? 'c1' : 'admin1',
    auth_user_id: null,
    club_id: '00000000-0000-0000-0000-000000000001',
    role,
    name: role === 'admin' ? 'Администратор' : role === 'coach' ? 'Тренер' : role === 'parent' ? 'Родитель' : 'Ученик',
    email: `${role}@palestra.fit`,
  };
}

export async function getProfileByAuthUserId(authUserId) {
  const { data, error } = await getServiceClient()
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function mapProfileToUser(profile) {
  if (!profile) return null;
  const role = profile.email === 'murdasoft@gmail.com' ? 'superadmin' : profile.role;
  return {
    id: profile.id,
    role: role,
    login: profile.email || profile.role,
    name: profile.name,
    email: profile.email || `${profile.role}@palestra.fit`,
    clubId: profile.club_id,
  };
}
