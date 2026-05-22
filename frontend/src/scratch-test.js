import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbkdmeginffcgfofmoav.supabase.co';
const supabaseKey = 'sb_publishable_348YLRa87TbBk1bRgLDk1A_QSRx5a-H';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('companies_json').select('*').limit(5);
  console.log('companies_json error:', error);
  console.log('companies_json data:', data);

  const { data: d2, error: e2 } = await supabase.from('companies').select('*').limit(5);
  console.log('companies error:', e2);
  console.log('companies data:', d2);
}

test();
