/**
 * Data Verification Utility - Check job role data flow through the entire pipeline
 * Usage: npx tsx src/verify-job-role-mapping.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMapping() {
  console.log("🔍 Verifying job role data mapping...\n");

  // Stage 1: Check companies_json table
  console.log("📍 Stage 1: Checking companies_json table");
  const { data: companies, error: companiesError } = await supabase
    .from("companies_json")
    .select("company_id, short_json->name, full_json->job_roles");

  if (companiesError) {
    console.error("  ❌ Error:", companiesError.message);
    return;
  }

  const companiesWithRoles = companies?.filter((c: any) => 
    Array.isArray(c.job_roles) && c.job_roles.length > 0
  ) || [];

  console.log(`  ✅ Found ${companiesWithRoles.length}/${companies?.length} companies with embedded job_roles\n`);

  // Stage 2: Check job_role_details_json table
  console.log("📍 Stage 2: Checking job_role_details_json table");
  const { data: jobRoles, error: jobRolesError, count } = await supabase
    .from("job_role_details_json")
    .select("id, company_id, company_name, job_role_json", { count: "exact" });

  if (jobRolesError) {
    console.error("  ❌ Error:", jobRolesError.message);
    return;
  }

  console.log(`  ✅ Found ${count} records in job_role_details_json table\n`);

  // Stage 3: Sample company data extraction
  console.log("📍 Stage 3: Sample data extraction (first 2 companies)\n");

  for (let i = 0; i < Math.min(2, companiesWithRoles.length); i++) {
    const company = companiesWithRoles[i];
    const companyId = company.company_id;
    const companyName = company.name || companyId;

    console.log(`📌 ${companyName} (ID: ${companyId})`);

    // Check embedded roles
    const embeddedRoles = (company.job_roles || []) as any[];
    console.log(`  Embedded roles: ${embeddedRoles.length}`);
    embeddedRoles.forEach((role: any, idx: number) => {
      const roleTitle = role.role || role.role_title || "(No title)";
      const skillCount = Array.isArray(role.skills) ? role.skills.length : 0;
      console.log(`    - ${idx + 1}. ${roleTitle} (${skillCount} skills)`);
    });

    // Check Supabase roles
    const { data: supabaseRoles } = await supabase
      .from("job_role_details_json")
      .select("job_role_json")
      .eq("company_id", companyId)
      .maybeSingle();

    if (supabaseRoles?.job_role_json) {
      const payload = supabaseRoles.job_role_json as any;
      const roles = payload.job_role_details || [];
      console.log(`  Supabase roles: ${roles.length}`);
      roles.forEach((role: any, idx: number) => {
        const roleTitle = role.role || role.role_title || "(No title)";
        const skillCount = Array.isArray(role.required_skills) ? role.required_skills.length : 0;
        console.log(`    - ${idx + 1}. ${roleTitle} (${skillCount} required_skills)`);
      });
    } else {
      console.log(`  Supabase roles: Not found`);
    }

    console.log();
  }

  // Stage 4: Data consistency check
  console.log("📍 Stage 4: Data consistency check\n");

  const consistencyReport = {
    totalCompanies: companies?.length || 0,
    companiesWithEmbeddedRoles: companiesWithRoles.length,
    companiesInJobRoleTable: jobRoles?.length || 0,
    coverage: `${Math.round(((jobRoles?.length || 0) / companiesWithRoles.length) * 100)}%`,
  };

  console.log("  Summary:");
  console.log(`    • Total companies: ${consistencyReport.totalCompanies}`);
  console.log(`    • With embedded roles: ${consistencyReport.companiesWithEmbeddedRoles}`);
  console.log(`    • In job_role_details_json: ${consistencyReport.companiesInJobRoleTable}`);
  console.log(`    • Coverage: ${consistencyReport.coverage}`);

  // Stage 5: Recommendations
  console.log("\n📍 Stage 5: Recommendations\n");
  if (consistencyReport.companiesInJobRoleTable === 0) {
    console.log("  ⚠️  No data in job_role_details_json table");
    console.log("  → Run: npx tsx src/populate-job-roles.ts\n");
  } else if (consistencyReport.companiesInJobRoleTable < consistencyReport.companiesWithEmbeddedRoles) {
    console.log("  ⚠️  Partial coverage in job_role_details_json table");
    console.log(`  → ${consistencyReport.companiesWithEmbeddedRoles - consistencyReport.companiesInJobRoleTable} companies need to be populated\n`);
  } else {
    console.log("  ✅ All data properly mapped!\n");
  }

  console.log("✅ Verification complete\n");
}

verifyMapping().catch(console.error);
