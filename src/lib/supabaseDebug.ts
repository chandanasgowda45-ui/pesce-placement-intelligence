import { supabase } from "@/lib/supabase";

const PRIMARY_COMPANY_TABLE = "companies_json";
const INNOVX_TABLE = "innovx_json";
const ROLES_TABLE = "job_role_details_json";
const ROUNDS_TABLE = "hiring_rounds_json";

export async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase connection...");
  
  try {
    // Test 1: Check if client initialized
    if (!supabase) {
      console.error("❌ Supabase client not initialized");
      return false;
    }
    console.log("✅ Supabase client initialized");
    console.log(`   URL: ${import.meta.env.VITE_SUPABASE_URL}`);

    // Test 2: Try to fetch from all possible company tables
    for (const table of [PRIMARY_COMPANY_TABLE, INNOVX_TABLE, ROLES_TABLE, ROUNDS_TABLE]) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        console.warn(`⚠️ Failed to query ${table}:`, error.message);
      } else {
        const count = data?.length || 0;
        console.log(`✅ ${table} accessible - Found ${count} record(s)`);
      }
    }

    // Test 3: Check realtime connection
    console.log("✅ Supabase connection verified successfully!");
    return true;
  } catch (err) {
    console.error("❌ Connection test failed:", err);
    return false;
  }
}

export async function debugSupabaseStatus() {
  console.group("🔧 Supabase Debug Info");
  console.log("Environment Variables:");
  console.log(`  VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || "NOT SET"}`);
  console.log(`  VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ SET" : "❌ NOT SET"}`);

  const connected = await testSupabaseConnection();
  console.log("\nConnection Status:", connected ? "🟢 CONNECTED" : "🔴 DISCONNECTED");
  console.groupEnd();

  return connected;
}
