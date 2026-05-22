import 'dotenv/config';
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './src/lib/supabase';
import { getAllCompanies } from './src/services/companyService';

async function run() {
  console.log('isSupabaseConfigured=', isSupabaseConfigured);
  console.log('supabaseUrl=', supabaseUrl ? '[SET]' : '[MISSING]');
  console.log('supabaseAnonKey=', supabaseAnonKey ? '[SET]' : '[MISSING]');
  const companies = await getAllCompanies();
  console.log('getAllCompanies returned count=', (companies || []).length);
}

run().catch(err => { console.error('Debug error:', err); process.exit(1); });
