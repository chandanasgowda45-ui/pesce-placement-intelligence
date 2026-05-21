import { debugSupabaseStatus } from './lib/supabaseDebug';
import { supabase } from './lib/supabase';

console.log('🧪 Testing Supabase...');
debugSupabaseStatus();

// Test company counts from all tables (safe for iframe contexts)
Promise.all([
  supabase.from('companies_json').select('count', { count: 'exact', head: true }).then(r => ({ table: 'companies_json', count: ((r.data as unknown) as { count?: number })?.count || 0, error: r.error?.message || null })),
  supabase.from('innovx_json').select('count', { count: 'exact', head: true }).then(r => ({ table: 'innovx_json', count: ((r.data as unknown) as { count?: number })?.count || 0, error: r.error?.message || null })),
  supabase.from('job_role_details_json').select('count', { count: 'exact', head: true }).then(r => ({ table: 'job_role_details_json', count: ((r.data as unknown) as { count?: number })?.count || 0, error: r.error?.message || null })),
  supabase.from('hiring_rounds_json').select('count', { count: 'exact', head: true }).then(r => ({ table: 'hiring_rounds_json', count: ((r.data as unknown) as { count?: number })?.count || 0, error: r.error?.message || null }))
]).then(results => {
  console.table(results);
  const hasErrors = results.some(r => r.error);
  if (hasErrors) {
    console.warn('⚠️ Some tables returned errors — check Supabase setup and RLS policies');
  } else {
    console.log('✅ All tables accessible - Hiring/InnovX data integrated');
  }
}).catch(err => {
  console.error('❌ Supabase test failed:', err);
});

