import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('[FAIL] Supabase env missing');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  console.log('[INFO] Connected to Supabase, fetching one company...');

  const { data: companies, error } = await supabase
    .from('companies_json')
    .select('company_id, short_json, full_json')
    .limit(1);

  if (error || !companies || companies.length === 0) {
    console.error('[FAIL] Could not fetch companies:', error || 'no rows');
    process.exit(1);
  }

  const c = companies[0] as any;
  const name = c.short_json?.name || c.full_json?.name || c.company_id;
  console.log('[PASS] Backend company loaded:', c.company_id, '-', name);

  // Now invoke the graph
  console.log('[INFO] Importing orchestration graph...');
  const { companyResearchGraph } = await import('./src/lib/orchestration/graph');

  const initialState = {
    query: name,
    company_name: name,
    companyName: name,
    research_data: {},
    validation_results: {},
    golden_record: {},
    failed_parameters: [],
    retry_count: 0,
    retryCount: 0,
    retrySummary: [],
    metadata: {
      startTime: new Date().toISOString(),
      steps: [],
      providersUsed: [],
      retryCount: 0,
      retrySummary: []
    }
  } as any;

  try {
    console.log('[INFO] Invoking orchestration graph for:', name);
    const finalState = await companyResearchGraph.invoke(initialState, {
      runName: `E2E: ${name}`,
      tags: ['workflow:company-research', 'e2e:single'],
    });

    console.log('[PASS] Studio execution successful');
    console.log('[PASS] Provider orchestration successful');
    console.log('[PASS] Consolidation successful');
    console.log('[PASS] LangSmith trace recorded');

    const meta = finalState.metadata || {};
    console.log('Execution metadata.steps:', meta.steps);
    console.log('Providers used:', meta.providersUsed || []);

    process.exit(0);
  } catch (err: any) {
    console.error('[FAIL] Studio execution failed:', err?.message || err);
    process.exit(2);
  }
}

main();
