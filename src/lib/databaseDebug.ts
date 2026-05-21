/**
 * Database Initialization & Debugging Script
 * Run this in the browser console to check and fix your Supabase integration
 * Usage: 
 *   1. Open app at http://localhost:5173
 *   2. Open DevTools (F12)
 *   3. Go to Console tab
 *   4. Import and run functions below
 */

import { supabase } from '@/lib/supabase';
import dataLoader from '@/services/dataLoader';

/**
 * ✅ Test 1: Verify Supabase Connection
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  try {
    // Use a lightweight health-check query instead of auth.getSession()
    // to avoid iframe redirect issues
    const { error } = await supabase
      .from('companies_json')
      .select('company_id', { count: 'exact', head: true });
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Connection error:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

/**
 * ✅ Test 2: Check if tables exist
 */
export async function testDatabaseTables() {
  console.log('📋 Checking database tables...');
  
  const results = await dataLoader.verifyDatabaseSetup();
  
  console.log('📊 Table Status:');
  console.log(`  companies_json: ${results.companies_json ? '✅ Exists' : '❌ Missing'}`);
  console.log(`  innovx_json: ${results.innovx_json ? '✅ Exists' : '❌ Missing'}`);
  console.log(`  job_role_details_json: ${results.job_role_details_json ? '✅ Exists' : '❌ Missing'}`);
  console.log(`  hiring_rounds_json: ${results.hiring_rounds_json ? '✅ Exists' : '❌ Missing'}`);
  
  const allExist = Object.values(results).every(v => v === true);
  if (!allExist) {
    console.error('❌ Some tables are missing!');
    console.error('');
    console.error('📝 TO FIX THIS:');
    console.error('1. Open: https://app.supabase.com/project/qbkdmeginffcgfofmoav/');
    console.error('2. Click: SQL Editor → New Query');
    console.error('3. Copy file: database_setup.sql');
    console.error('4. Paste into editor and click: Run');
    console.error('5. Refresh your app (F5)');
    console.error('');
    console.error('📚 See: FIX_404_ERROR.md for detailed steps');
    return false;
  }
  
  return true;
}

/**
 * ✅ Test 3: Check data in companies_json table
 */
export async function testCompaniesData() {
  console.log('📦 Checking companies data...');
  
  try {
    const { data, error } = await supabase
      .from('companies_json')
      .select('company_id, short_json->name as name')
      .limit(10);
    
    if (error) {
      if (error.message.includes('relation "companies_json" does not exist')) {
        console.error('❌ Table does not exist');
        console.error('   companies_json table is missing!');
        return false;
      }
      console.error('❌ Error fetching companies:', error.message);
      return false;
    }
    
    const count = data?.length || 0;
    if (count === 0) {
      console.error('❌ No data found');
      console.error('   Table exists but is empty!');
      return false;
    }
    
    console.log(`✅ Found ${count} companies:`);
    data?.forEach((c) => {
      const row = c as unknown as Record<string, unknown>;
      console.log(`   - ${row.company_id}: ${row.name}`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

/**
 * ✅ Test 4: Complete integration test
 */
export async function runFullIntegrationTest() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  🚀 SUPABASE INTEGRATION TEST                      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  
  const tests = [
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Database Tables', fn: testDatabaseTables },
    { name: 'Companies Data', fn: testCompaniesData },
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    console.log(`⏳ Testing: ${test.name}`);
    console.log('─'.repeat(50));
    const passed = await test.fn();
    console.log('');
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('═'.repeat(50));
  console.log('');
  if (allPassed) {
    console.log('🎉 SUCCESS! All tests passed!');
    console.log('');
    console.log('✅ Your Supabase integration is working perfectly!');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Navigate to: /companies');
    console.log('   2. You should see 3 company cards');
    console.log('   3. Click on a company to see details');
    console.log('   4. Try searching for companies');
    console.log('');
  } else {
    console.error('❌ FAILED! Some tests did not pass.');
    console.error('');
    console.error('🔥 MOST COMMON FIX:');
    console.error('The database tables have not been created yet.');
    console.error('');
    console.error('📝 TO FIX:');
    console.error('1. Open: https://app.supabase.com/project/qbkdmeginffcgfofmoav/');
    console.error('2. Click: SQL Editor → New Query');
    console.error('3. Copy entire content of: database_setup.sql');
    console.error('4. Paste into Supabase editor');
    console.error('5. Click: Run button');
    console.error('6. Wait for success message');
    console.error('7. Refresh this page (F5)');
    console.error('8. Run this test again');
    console.error('');
    console.error('📚 Detailed guide: See FIX_404_ERROR.md');
    console.error('');
  }
  
  return allPassed;
}

/**
 * ✅ Test 5: Get companies count
 */
export async function getCompaniesCount() {
  console.log('📊 Getting companies count...');
  const count = await dataLoader.getCompaniesCount();
  console.log(`Total companies: ${count}`);
  return count;
}

/**
 * 🔧 Debug: Fetch raw data
 */
export async function debugFetchRawData(table: string) {
  console.log(`🔧 Fetching raw data from ${table}...`);
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(5);
  
  if (error) {
    console.error(`❌ Error:`, error);
    return null;
  }
  
  console.log(`📊 Raw data (first 5 rows):`, data);
  return data;
}

/**
 * 🔧 Debug: Check API response
 */
export async function debugAPIResponse() {
  console.log('🔧 Debugging API response...');
  
  try {
    const response = await fetch(
      'https://qbkdmeginffcgfofmoav.supabase.co/rest/v1/companies_json?select=*',
      {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
      }
    );
    
    console.log(`📊 Status: ${response.status}`);
    const data = await response.json();
    console.log('📦 Response data:', data);
    return data;
  } catch (err) {
    console.error('❌ Error:', err);
    return null;
  }
}

/**
 * Export all test functions for console access
 */
export const DatabaseTests = {
  testSupabaseConnection,
  testDatabaseTables,
  testCompaniesData,
  runFullIntegrationTest,
  getCompaniesCount,
  debugFetchRawData,
  debugAPIResponse,
};

// Auto-export for console access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).DatabaseTests = DatabaseTests;
}

export default DatabaseTests;
