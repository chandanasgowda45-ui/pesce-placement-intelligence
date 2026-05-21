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
  console.log('Checking categories and tiers in companies_json...');
  const { data, error } = await supabase
    .from('companies_json')
    .select('short_json->category, short_json->company_tier')
    .limit(100);

  if (error) {
    console.error('Error:', error);
  } else if (data) {
    const categories = new Set(data.map(d => (d as any).category));
    const tiers = new Set(data.map(d => (d as any).company_tier));
    console.log('Unique Categories:', Array.from(categories));
    console.log('Unique Tiers:', Array.from(tiers));
  }
}

inspect();
