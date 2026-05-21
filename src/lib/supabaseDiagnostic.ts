/**
 * Supabase connection diagnostic
 * Run in browser console: await window.SupabaseDiagnostic.run()
 */

export async function diagnoseSupabase() {
  console.log("══════════════════════════════════════════");
  console.log("🔍 SUPABASE CONNECTION DIAGNOSTIC");
  console.log("══════════════════════════════════════════");

  // 1. Check env vars
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log("\n📋 Environment Variables:");
  console.log(`   VITE_SUPABASE_URL: ${url || "❌ NOT SET"}`);
  console.log(`   VITE_SUPABASE_ANON_KEY / PUBLISHABLE_KEY: ${key ? "✅ SET (hidden)" : "❌ NOT SET"}`);

  if (!url || !key) {
    console.error("\n❌ CRITICAL: Supabase credentials are missing from .env");
    console.error("   Fix: Ensure .env file contains:");
    console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.error('   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key');
    return false;
  }

  // 2. Try direct REST API call (bypasses the client library)
  console.log("\n🌐 Testing direct REST API connection...");
  try {
    const response = await fetch(`${url}/rest/v1/companies_json?select=count`, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`   HTTP Status: ${response.status} ${response.statusText}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(`   ✅ REST API connection successful`);
      console.log(`   📊 Records returned: ${data.length}`);
    } else if (response.status === 404) {
      console.warn("   ⚠️ Table 'companies_json' not found (404)");
      console.warn("   Fix: Run database_setup.sql in Supabase SQL Editor");
    } else if (response.status === 401) {
      console.warn("   ⚠️ Unauthorized (401) — check PUBLISHABLE_KEY");
    } else {
      const text = await response.text();
      console.warn(`   ⚠️ Unexpected response: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`   ❌ Network error: ${err}`);
  }

  // 3. Test via Supabase client
  console.log("\n📦 Testing via Supabase client...");
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("companies_json")
      .select("company_id")
      .limit(1);

    if (error) {
      console.error(`   ❌ Client error: ${error.message}`);
      if (error.message.includes("does not exist")) {
        console.error("   Fix: Create tables using database_setup.sql");
      }
      return false;
    }

    console.log(`   ✅ Client connection successful`);
    console.log(`   📊 Sample data:`, data);
    return true;
  } catch (err) {
    console.error(`   ❌ Client exception: ${err}`);
    return false;
  }
}

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).SupabaseDiagnostic = { run: diagnoseSupabase };
}

