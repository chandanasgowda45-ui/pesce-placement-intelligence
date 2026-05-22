import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbkdmeginffcgfofmoav.supabase.co';
const supabaseKey = 'sb_publishable_348YLRa87TbBk1bRgLDk1A_QSRx5a-H';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('companies').select('*').limit(2);
  console.log('companies data:', data);

  const { data: allTables, error: e2 } = await supabase.rpc('get_tables'); // Or try an introspective query if allowed
  console.log('all tables?', allTables, e2);
}

test();
