import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbkdmeginffcgfofmoav.supabase.co';
const supabaseKey = 'sb_publishable_348YLRa87TbBk1bRgLDk1A_QSRx5a-H';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { count: countJson, error: e1 } = await supabase.from('companies_json').select('*', { count: 'exact', head: true });
  console.log('companies_json count:', countJson, 'error:', e1);

  const { count: countCompanies, error: e2 } = await supabase.from('companies').select('*', { count: 'exact', head: true });
  console.log('companies count:', countCompanies, 'error:', e2);
}

test();
