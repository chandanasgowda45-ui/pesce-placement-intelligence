// Test script to check Supabase connection and data
// Run this in the browser console at http://localhost:8082

import { supabase } from './src/lib/supabase.ts';

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...');

  try {
    // Test 1: Check if tables exist
    console.log('📋 Checking if companies_json table exists...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies_json')
      .select('company_id, short_json')
      .limit(5);

    if (companiesError) {
      console.error('❌ companies_json table error:', companiesError);
      return false;
    }

    console.log('✅ companies_json table accessible');
    console.log(`📊 Found ${companies?.length || 0} companies:`, companies?.map(c => c.company_id));

    // Test 2: Check innovx_json table
    console.log('📋 Checking if innovx_json table exists...');
    const { data: innovx, error: innovxError } = await supabase
      .from('innovx_json')
      .select('company_id, name')
      .limit(3);

    if (innovxError) {
      console.error('❌ innovx_json table error:', innovxError);
    } else {
      console.log('✅ innovx_json table accessible');
      console.log(`📊 Found ${innovx?.length || 0} innovx records`);
    }

    // Test 3: Check hiring_rounds_json table
    console.log('📋 Checking if hiring_rounds_json table exists...');
    const { data: hiring, error: hiringError } = await supabase
      .from('hiring_rounds_json')
      .select('company_id')
      .limit(3);

    if (hiringError) {
      console.error('❌ hiring_rounds_json table error:', hiringError);
    } else {
      console.log('✅ hiring_rounds_json table accessible');
      console.log(`📊 Found ${hiring?.length || 0} hiring records`);
    }

    console.log('🎉 Database connection test completed!');
    return true;

  } catch (err) {
    console.error('❌ Database test failed:', err);
    return false;
  }
}

// Run the test
testDatabaseConnection();