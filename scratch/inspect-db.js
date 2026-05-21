import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve('.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: companies, error: err1 } = await supabase.from('companies_json').select('company_id, short_json');
  if (err1) {
    console.error("Error fetching companies:", err1);
    return;
  }
  console.log(`Total companies: ${companies.length}`);
  console.log("Sample companies:");
  companies.slice(0, 15).forEach(c => {
    console.log(`ID: ${c.company_id}, Name: ${c.short_json?.name || c.short_json?.short_name}`);
  });

  const { data: hiring, error: err2 } = await supabase.from('hiring_rounds_json').select('id, company_id, hiring_rounds_json');
  if (err2) {
    console.error("Error fetching hiring rounds:", err2);
    return;
  }
  console.log(`\nTotal hiring rounds records: ${hiring.length}`);
  const nonHollow = hiring.filter(h => {
    const rounds = h.hiring_rounds_json?.hiring_rounds || h.hiring_rounds_json?.rounds || h.hiring_rounds_json?.stages || (Array.isArray(h.hiring_rounds_json) ? h.hiring_rounds_json : null);
    return rounds && rounds.length > 0;
  });
  console.log(`Non-hollow hiring records (with rounds): ${nonHollow.length}`);
  
  // Find Google LLC if exists
  const google = companies.find(c => {
    const name = c.short_json?.name || c.short_json?.short_name || '';
    return name.toLowerCase().includes('google');
  });
  console.log("\nGoogle search in companies_json:", google);
  if (google) {
    const hr = hiring.filter(h => h.company_id === google.company_id);
    console.log("Google hiring rounds in hiring_rounds_json:", JSON.stringify(hr, null, 2));
  }
}

run();
