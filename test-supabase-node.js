import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file
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

// Use environment variables or fallback
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'srm-career-compass-test',
    },
  },
});

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key configured:', !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key');

  if (supabaseUrl.includes('placeholder') || supabaseAnonKey === 'placeholder-key') {
    console.log('❌ Using placeholder credentials - no real connection');
    return;
  }

  try {
    // Test companies_json
    console.log('\n📋 Testing companies_json table...');
    const companiesRes = await supabase.from('companies_json').select('count', { count: 'exact', head: true });
    console.log('companies_json:', companiesRes.count || 0, 'records');

    // Test innovx_json
    console.log('📋 Testing innovx_json table...');
    const innovxRes = await supabase.from('innovx_json').select('count', { count: 'exact', head: true });
    console.log('innovx_json:', innovxRes.count || 0, 'records');

    // Test hiring_rounds_json
    console.log('📋 Testing hiring_rounds_json table...');
    const hiringRes = await supabase.from('hiring_rounds_json').select('count', { count: 'exact', head: true });
    console.log('hiring_rounds_json:', hiringRes.count || 0, 'records');

    // Test job_role_details_json
    console.log('📋 Testing job_role_details_json table...');
    const rolesRes = await supabase.from('job_role_details_json').select('count', { count: 'exact', head: true });
    console.log('job_role_details_json:', rolesRes.count || 0, 'records');

    // Sample data check
    if (companiesRes.count && companiesRes.count > 0) {
      console.log('\n📊 Sample company data:');
      const sample = await supabase.from('companies_json').select('company_id, short_json->>name').limit(3);
      console.log(sample.data);
    }

  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
  }
}

testSupabase();