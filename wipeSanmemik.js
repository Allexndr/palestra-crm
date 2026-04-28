import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.replace(/^['"](.*)['"]$/, '$1');
    env[match[1]] = value;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function wipeAccount() {
  console.log("Looking up sanmemik2000@gmail.com...");
  let res = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.sanmemik2000@gmail.com&select=id,club_id`, { headers });
  let data = await res.json();
  
  if (!data || data.length === 0) {
    console.error("Profile not found");
    process.exit(1);
  }

  const profile = data[0];
  console.log("Found profile. Club ID:", profile.club_id);

  res = await fetch(`${supabaseUrl}/rest/v1/app_state?club_id=eq.${profile.club_id}&select=state`, { headers });
  data = await res.json();

  if (!data || data.length === 0) {
    console.error("App state not found");
    process.exit(1);
  }

  const appState = data[0];
  const currentState = appState.state;

  console.log("Wiping state...");
  currentState.members = [];
  currentState.schedule = [];
  currentState.leads = [];
  currentState.groups = [];
  currentState.activities = [];
  currentState.attendance = [];
  currentState.achievements = [];
  currentState.shop = { products: [], orders: [] };
  currentState.locations = [{ id: '1', name: 'Основной зал', address: 'Адрес клуба', isActive: true }];

  res = await fetch(`${supabaseUrl}/rest/v1/app_state?club_id=eq.${profile.club_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ state: currentState })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Failed to update state:", res.status, err);
    process.exit(1);
  }

  console.log("Wipe successful!");
}

wipeAccount();
