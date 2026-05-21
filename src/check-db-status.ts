import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Simple .env parser
function parseEnv(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
  return env;
}

const env = parseEnv('.env');
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('--- Checking Database Status ---');

  const tables = [
    'companies_json',
    'innovx_json',
    'hiring_rounds_json',
    'job_role_details_json'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`${table}: Error - ${error.message}`);
    } else {
      console.log(`${table}: ${count} rows`);
    }
  }

  // Sample check for companies_json
  const { data: companies, error: compError } = await supabase
    .from('companies_json')
    .select('company_id, short_json, full_json')
    .limit(125);

  if (compError) {
    console.log(`Error fetching companies: ${compError.message}`);
  } else if (companies) {
    console.log(`Fetched ${companies.length} rows from companies_json`);
    const ids = companies.map(c => c.company_id);
    
    // Check for "other 5 companies" vs 116
    const legacyIds = ['google', 'microsoft', 'amazon', 'tcs', 'infosys'];
    const foundLegacy = ids.filter(id => legacyIds.includes(id));
    console.log(`Found legacy IDs: ${foundLegacy.join(', ')}`);
    
    const sampleComp = companies.find(c => !legacyIds.includes(c.company_id)) || companies[0];
    if (sampleComp) {
      console.log(`Inspecting company: ${sampleComp.company_id}`);
      console.log('Short JSON keys:', Object.keys(sampleComp.short_json || {}).length);
      console.log('Full JSON keys:', Object.keys(sampleComp.full_json || {}).length);
      console.log('Logo URL present in short_json:', !!(sampleComp.short_json as { logo_url?: string })?.logo_url);
      console.log('Logo URL value:', (sampleComp.short_json as { logo_url?: string })?.logo_url);
    }
  }
}

checkDatabase();
