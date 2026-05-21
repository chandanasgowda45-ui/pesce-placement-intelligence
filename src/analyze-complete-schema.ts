import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

function getEnvValue(key: string): string {
  return process.env[key] || "";
}

function resolveSupabaseConfig() {
  const url = getEnvValue("VITE_SUPABASE_URL") || getEnvValue("SUPABASE_URL");
  const key =
    getEnvValue("VITE_SUPABASE_ANON_KEY") ||
    getEnvValue("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getEnvValue("SUPABASE_ANON_KEY") ||
    getEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    console.error("❌ Missing Supabase environment variables.");
    process.exit(1);
  }

  return { url, key };
}

const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  global: { headers: { "X-Client-Info": "complete-schema-analysis" } },
});

async function analyzeCompleteSchema() {
  console.log("🔍 Complete Supabase Schema Analysis\n");

  // Analyze main companies_json table
  console.log("=== COMPANIES_JSON TABLE ===");
  const { data: companies, error: companiesError } = await supabase
    .from("companies_json")
    .select("*")
    .limit(1);

  if (companiesError) {
    console.error("Error fetching companies:", companiesError);
    return;
  }

  if (companies && companies.length > 0) {
    const company = companies[0];
    console.log("Main table fields:");
    Object.keys(company).forEach(key => {
      const value = company[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  ${key}: ${type}`);
    });

    // Analyze short_json
    if (company.short_json) {
      console.log("\nshort_json fields:");
      Object.keys(company.short_json).forEach(key => {
        const value = company.short_json[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  ${key}: ${type}`);
      });
    }

    // Analyze full_json
    if (company.full_json) {
      console.log("\nfull_json fields:");
      Object.keys(company.full_json).forEach(key => {
        const value = company.full_json[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  ${key}: ${type}`);
      });
    }
  }

  // Analyze innovx_json table
  console.log("\n=== INNOVX_JSON TABLE ===");
  const { data: innovx, error: innovxError } = await supabase
    .from("innovx_json")
    .select("*")
    .limit(1);

  if (innovx && innovx.length > 0) {
    const innovxRecord = innovx[0];
    console.log("InnovX table fields:");
    Object.keys(innovxRecord).forEach(key => {
      const value = innovxRecord[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  ${key}: ${type}`);
    });

    if (innovxRecord.json_data) {
      console.log("\njson_data fields:");
      Object.keys(innovxRecord.json_data).forEach(key => {
        const value = innovxRecord.json_data[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  ${key}: ${type}`);
      });
    }
  }

  // Analyze hiring_rounds_json table
  console.log("\n=== HIRING_ROUNDS_JSON TABLE ===");
  const { data: hiringRounds, error: hiringError } = await supabase
    .from("hiring_rounds_json")
    .select("*")
    .limit(1);

  if (hiringRounds && hiringRounds.length > 0) {
    const hiringRecord = hiringRounds[0];
    console.log("Hiring rounds table fields:");
    Object.keys(hiringRecord).forEach(key => {
      const value = hiringRecord[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  ${key}: ${type}`);
    });

    if (hiringRecord.hiring_rounds_json && Array.isArray(hiringRecord.hiring_rounds_json)) {
      console.log("\nhiring_rounds_json array items:");
      hiringRecord.hiring_rounds_json.forEach((round, index) => {
        if (typeof round === 'object' && round !== null) {
          console.log(`  Round ${index}:`, Object.keys(round));
        }
      });
    }
  }

  // Analyze job_role_details_json table
  console.log("\n=== JOB_ROLE_DETAILS_JSON TABLE ===");
  const { data: jobRoles, error: jobError } = await supabase
    .from("job_role_details_json")
    .select("*")
    .limit(1);

  if (jobRoles && jobRoles.length > 0) {
    const jobRecord = jobRoles[0];
    console.log("Job roles table fields:");
    Object.keys(jobRecord).forEach(key => {
      const value = jobRecord[key];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`  ${key}: ${type}`);
    });

    if (jobRecord.job_role_json && Array.isArray(jobRecord.job_role_json)) {
      console.log("\njob_role_json array items:");
      jobRecord.job_role_json.forEach((role, index) => {
        if (typeof role === 'object' && role !== null) {
          console.log(`  Role ${index}:`, Object.keys(role));
        }
      });
    }
  }

  // Count total records
  console.log("\n=== RECORD COUNTS ===");
  const [companiesCount, innovxCount, hiringCount, jobCount] = await Promise.all([
    supabase.from("companies_json").select("*", { count: "exact", head: true }),
    supabase.from("innovx_json").select("*", { count: "exact", head: true }),
    supabase.from("hiring_rounds_json").select("*", { count: "exact", head: true }),
    supabase.from("job_role_details_json").select("*", { count: "exact", head: true }),
  ]);

  console.log(`Companies: ${companiesCount.count}`);
  console.log(`InnovX records: ${innovxCount.count}`);
  console.log(`Hiring rounds: ${hiringCount.count}`);
  console.log(`Job roles: ${jobCount.count}`);
}

analyzeCompleteSchema().catch(console.error);
