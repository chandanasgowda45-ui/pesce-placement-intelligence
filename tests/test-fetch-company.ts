import dotenv from 'dotenv';
dotenv.config();

import { findCompanyByName } from './src/lib/companyBackend';

async function run() {
  console.log('ENV VITE_SUPABASE_URL=', process.env.VITE_SUPABASE_URL ? '[SET]' : '[MISSING]');
  console.log('ENV VITE_SUPABASE_ANON_KEY=', process.env.VITE_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]');
  try {
    const name = process.argv[2] || 'Siemens';
    console.log(`Looking up company: ${name}`);
    const rec = await findCompanyByName(name);
    if (!rec) {
      console.log('Company not found');
      process.exit(2);
    }
    console.log('Found company:', rec.company_id, '-', rec.name);
    console.log('Short JSON keys:', Object.keys(rec.short_json || {}).length);
    process.exit(0);
  } catch (err: any) {
    console.error('Lookup failed:', err?.message || err);
    process.exit(1);
  }
}

run();
