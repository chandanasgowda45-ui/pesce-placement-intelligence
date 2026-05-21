import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import {
  validateCompanyFullJson,
  validateCompanyShortJson,
  validateInnovxJson,
  validateJobRoleDetailsJson,
  validateHiringRoundsJson,
  JsonValidationResult,
} from "./lib/validation";

dotenv.config();

const PAGE_SIZE = 250;

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
    console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  return { url, key };
}

async function fetchAllRecords(table: string, selectFields: string) {
  const rows: any[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(selectFields)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch ${table}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);
    if (data.length < PAGE_SIZE) {
      break;
    }
    from += PAGE_SIZE;
  }

  return rows;
}

function formatErrors(result: JsonValidationResult): string[] {
  return result.errors.length > 0 ? result.errors : ["Unknown validation error"];
}

function addFailure(summary: Record<string, any>[], recordId: string, table: string, resultName: string, result: JsonValidationResult) {
  if (!result.valid) {
    summary.push({
      table,
      recordId,
      resultName,
      valid: false,
      errors: formatErrors(result).join("; "),
    });
  }
}

const { url, key } = resolveSupabaseConfig();
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  global: { headers: { "X-Client-Info": "srm-career-compass-validation" } },
});

async function runValidation() {
  console.log("🔍 Starting Supabase data validation");
  console.log("  Supabase URL:", url);
  console.log("  Tables: companies_json, innovx_json, job_role_details_json, hiring_rounds_json\n");

  const summaries: Array<{ table: string; total: number; passed: number; failed: number }> = [];
  const failureRows: Array<{ table: string; recordId: string; resultName: string; valid: boolean; errors: string }> = [];

  // Validate companies_json
  const companies = await fetchAllRecords(
    "companies_json",
    "company_id, short_json, full_json"
  );
  console.log(`📍 companies_json: fetched ${companies.length} records`);

  let companiesPassed = 0;
  for (let index = 0; index < companies.length; index++) {
    const company = companies[index];
    const companyId = String(company.company_id || `row-${index + 1}`);
    const shortResult = validateCompanyShortJson(company.short_json);
    const fullResult = validateCompanyFullJson(company.full_json);

    if (shortResult.valid && fullResult.valid) {
      companiesPassed += 1;
    } else {
      addFailure(failureRows, companyId, "companies_json", "short_json", shortResult);
      addFailure(failureRows, companyId, "companies_json", "full_json", fullResult);
    }

    if ((index + 1) % 25 === 0 || index + 1 === companies.length) {
      console.log(`  [companies_json] validated ${index + 1}/${companies.length}`);
    }
  }

  summaries.push({
    table: "companies_json",
    total: companies.length,
    passed: companiesPassed,
    failed: companies.length - companiesPassed,
  });

  // Validate innovx_json
  const innovx = await fetchAllRecords("innovx_json", "id, company_id, innovx_json");
  console.log(`\n📍 innovx_json: fetched ${innovx.length} records`);
  let innovxPassed = 0;

  for (let index = 0; index < innovx.length; index++) {
    const record = innovx[index];
    const recordId = String(record.id || record.company_id || `row-${index + 1}`);
    const result = validateInnovxJson(record.innovx_json);

    if (result.valid) {
      innovxPassed += 1;
    } else {
      addFailure(failureRows, recordId, "innovx_json", "innovx_json", result);
    }

    if ((index + 1) % 25 === 0 || index + 1 === innovx.length) {
      console.log(`  [innovx_json] validated ${index + 1}/${innovx.length}`);
    }
  }

  summaries.push({
    table: "innovx_json",
    total: innovx.length,
    passed: innovxPassed,
    failed: innovx.length - innovxPassed,
  });

  // Validate job_role_details_json
  const jobRoles = await fetchAllRecords("job_role_details_json", "id, company_id, job_role_json");
  console.log(`\n📍 job_role_details_json: fetched ${jobRoles.length} records`);
  let jobRolesPassed = 0;

  for (let index = 0; index < jobRoles.length; index++) {
    const record = jobRoles[index];
    const recordId = String(record.id || record.company_id || `row-${index + 1}`);
    const result = validateJobRoleDetailsJson(record.job_role_json);

    if (result.valid) {
      jobRolesPassed += 1;
    } else {
      addFailure(failureRows, recordId, "job_role_details_json", "job_role_json", result);
    }

    if ((index + 1) % 25 === 0 || index + 1 === jobRoles.length) {
      console.log(`  [job_role_details_json] validated ${index + 1}/${jobRoles.length}`);
    }
  }

  summaries.push({
    table: "job_role_details_json",
    total: jobRoles.length,
    passed: jobRolesPassed,
    failed: jobRoles.length - jobRolesPassed,
  });

  // Validate hiring_rounds_json
  const rounds = await fetchAllRecords("hiring_rounds_json", "id, company_id, hiring_rounds_json");
  console.log(`\n📍 hiring_rounds_json: fetched ${rounds.length} records`);
  let roundsPassed = 0;

  for (let index = 0; index < rounds.length; index++) {
    const record = rounds[index];
    const recordId = String(record.id || record.company_id || `row-${index + 1}`);
    const result = validateHiringRoundsJson(record.hiring_rounds_json);

    if (result.valid) {
      roundsPassed += 1;
    } else {
      addFailure(failureRows, recordId, "hiring_rounds_json", "hiring_rounds_json", result);
    }

    if ((index + 1) % 25 === 0 || index + 1 === rounds.length) {
      console.log(`  [hiring_rounds_json] validated ${index + 1}/${rounds.length}`);
    }
  }

  summaries.push({
    table: "hiring_rounds_json",
    total: rounds.length,
    passed: roundsPassed,
    failed: rounds.length - roundsPassed,
  });

  console.log("\n✅ Supabase validation complete\n");
  console.table(summaries);

  if (failureRows.length > 0) {
    console.log(`Found ${failureRows.length} validation failures across Supabase tables.`);
    console.table(failureRows.slice(0, 15));
    if (failureRows.length > 15) {
      console.log(`...and ${failureRows.length - 15} more failures.`);
    }
    process.exit(1);
  } else {
    console.log("✅ All validated Supabase records passed schema checks.");
  }
}

runValidation().catch((error) => {
  console.error("❌ Validation runner failed:", error);
  process.exit(1);
});
