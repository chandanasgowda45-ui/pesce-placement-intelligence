import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function parseEnv(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return env;
}

const env = parseEnv('.env');
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('Checking for migration tables...');
  // Check public schema first
  const { data: tables, error } = await supabase
    .from('schema_migrations')
    .select('*')
    .limit(1);

  if (error) {
    console.log('schema_migrations not in public schema or error:', error.message);
  } else {
    console.log('schema_migrations found in public schema.');
  }

  // Try to query information_schema to see all tables
  const { data: info, error: infoError } = await supabase
    .rpc('get_tables_info'); // Assuming such a function exists or we can try a raw query if we had access

  // Since we can't do raw SQL easily without a custom RPC, let's try common names
  const { error: error2 } = await supabase.from('supabase_migrations').select('*').limit(1);
  console.log('supabase_migrations check:', error2 ? error2.message : 'Exists');
}

inspect();
