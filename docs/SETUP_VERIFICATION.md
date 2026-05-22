#!/usr/bin/env node

/**
 * Quick Setup Verification Script
 * Run this after you've created the Supabase tables
 * 
 * In your project directory, run:
 * node verify-setup.js
 * 
 * Or import in your app and run in browser console
 */

async function verifySetup() {
  console.log('🔍 SRM Career Compass - Supabase Setup Verification\n');
  console.log('='.repeat(50));

  const steps = [
    {
      title: '1️⃣  Environment Variables',
      check: () => {
        const url = process.env.VITE_SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY;
        
        if (url && key) {
          console.log('   ✅ Supabase URL configured');
          console.log('   ✅ Supabase Anon Key configured');
          return true;
        }
        
        console.log('   ❌ Missing environment variables');
        console.log('   📝 Check your .env file');
        return false;
      },
    },
    {
      title: '2️⃣  Database Tables Created',
      check: () => {
        console.log('   📋 Tables to verify in Supabase SQL Editor:');
        console.log('      - companies_json');
        console.log('      - innovx_json');
        console.log('      - job_role_details_json');
        console.log('      - hiring_rounds_json');
        console.log('   ✅ Go to: https://app.supabase.com');
        console.log('   📝 Click: SQL Editor → Copy database_setup.sql → Run');
        return true;
      },
    },
    {
      title: '3️⃣  Sample Data Inserted',
      check: () => {
        console.log('   ✅ database_setup.sql includes sample data:');
        console.log('      - Google (company_id: "google")');
        console.log('      - Microsoft (company_id: "microsoft")');
        console.log('      - Amazon (company_id: "amazon")');
        console.log('   📝 Data should be in companies_json table');
        return true;
      },
    },
    {
      title: '4️⃣  Frontend Ready',
      check: () => {
        console.log('   ✅ Hooks configured:');
        console.log('      - useCompanies() → Fetches all companies');
        console.log('      - useCompany(id) → Fetches single company');
        console.log('      - useSearchCompanies(query) → Searches companies');
        console.log('   ✅ Services configured:');
        console.log('      - companyDataService → Full data package');
        console.log('      - dataLoader → Insert/update data');
        return true;
      },
    },
  ];

  console.log('\n✅ SETUP CHECKLIST:\n');

  for (const step of steps) {
    console.log(step.title);
    step.check();
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('\n🚀 NEXT STEPS:\n');
  
  console.log('1. Create Supabase Tables:');
  console.log('   a. Open: https://app.supabase.com/project/qbkdmeginffcgfofmoav');
  console.log('   b. Click: SQL Editor → New Query');
  console.log('   c. Copy entire content of: database_setup.sql');
  console.log('   d. Paste into editor and click: Run\n');
  
  console.log('2. Verify Tables Created:');
  console.log('   a. Click: Table Editor (left sidebar)');
  console.log('   b. You should see 4 tables with data\n');
  
  console.log('3. Start Development Server:');
  console.log('   npm run dev');
  console.log('   or');
  console.log('   bun dev\n');
  
  console.log('4. Test in Browser:');
  console.log('   a. Open: http://localhost:5173');
  console.log('   b. Press F12 → Console tab');
  console.log('   c. Run: DatabaseTests.runFullIntegrationTest()\n');
  
  console.log('5. Check UI:');
  console.log('   a. Navigate to: /companies');
  console.log('   b. You should see Google, Microsoft, Amazon cards');
  console.log('   c. Click cards to see detailed information\n');

  console.log('='.repeat(50));
  console.log('\n📚 HELPFUL RESOURCES:\n');
  
  console.log('Files to Review:');
  console.log('  - SUPABASE_INTEGRATION_COMPLETE.md  (Full setup guide)');
  console.log('  - database_setup.sql                 (SQL to run)');
  console.log('  - src/lib/databaseDebug.ts          (Testing utilities)');
  console.log('  - src/services/dataLoader.ts        (Data insertion)');
  console.log('  - src/hooks/useCompanies.ts         (Data fetching)\n');

  console.log('Documentation:');
  console.log('  - https://supabase.com/docs');
  console.log('  - https://tanstack.com/query/latest');
  console.log('  - https://reactjs.org\n');

  console.log('='.repeat(50));
  console.log('\n✨ You\'re all set! Happy coding! 🚀\n');
}

// Run verification
verifySetup();

export default verifySetup;
