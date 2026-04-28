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
  'Content-Type': 'application/json'
};

async function migrate() {
  console.log("Attempting to add columns to profiles table via SQL API...");
  
  // Note: Supabase doesn't expose a direct ALTER TABLE via REST. 
  // Usually we'd use the SQL editor or a proper migration tool.
  // But I'll try to check if I can at least read/write to these hypothetical columns.
  
  // Actually, I'll just use a JSONB column 'metadata' if it exists, or 'bot_data'.
  // Let's check the columns first.
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&limit=1`, { headers });
  const data = await res.json();
  console.log("Columns:", Object.keys(data[0] || {}));
}

migrate();
