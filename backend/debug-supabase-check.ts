import 'dotenv/config';
import { supabase } from '../src/lib/supabase';
import { fetchCompanyFullData } from './companyDataService';

async function run() {
  console.log('🚀 UNIFIED PIPELINE VERIFIER: Auditing 116 Companies\n');

  // Fetch the basic list first
  const { data: list, error } = await supabase.from('companies_json').select('id, name');
  if (error || !list) {
    console.error('Failed to retrieve basic company list:', error);
    process.exit(1);
  }

  console.log(`Auditing ${list.length} companies...\n`);
  let successCount = 0;

  for (const entry of list) {
    try {
      const data = await fetchCompanyFullData(entry.id);
      const status = [
        data.company.name !== 'Unknown Company' ? '✓ company' : '✗ company',
        data.hiringRounds.length > 0 ? '✓ hiring' : '⚠ hiring ',
        data.innovx.innovation_score > 0 ? '✓ innovx' : '⚠ innovx ',
        data.skills.length > 0 ? '✓ skills ' : '⚠ skills '
      ];
      console.log(`Company ${entry.id.toString().padEnd(3)} — ${entry.name.padEnd(25)} ${status.join(' ')}`);
      if (data.company.name !== 'Unknown Company') successCount++;
    } catch (e) {
      console.log(`Company ${entry.id.toString().padEnd(3)} — ${entry.name.padEnd(25)} 🛑 PIPELINE CRASH`);
    }
  }

  console.log(`\n✅ Audit Complete: ${successCount}/${list.length} passed normalization.`);
}
run().catch(err => { console.error('Debug error:', err); process.exit(1); });
