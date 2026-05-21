/**
 * Populate Job Role Details into Supabase
 * Run this to load job role data from embedded company JSON into job_role_details_json table
 * Usage: npx tsx src/populate-job-roles.ts
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

async function populateJobRoles() {
  console.log("🚀 Starting job role population...\n");

  // Fetch all companies
  const { data: companies, error: companiesError } = await supabase
    .from("companies_json")
    .select("company_id, short_json, full_json");

  if (companiesError) {
    console.error("❌ Error fetching companies:", companiesError);
    process.exit(1);
  }

  if (!companies || companies.length === 0) {
    console.warn("⚠️  No companies found");
    return;
  }

  console.log(`📊 Found ${companies.length} companies\n`);

  let successCount = 0;
  let skipCount = 0;

  for (const company of companies) {
    const companyId = String(company.company_id);
    const companyName = company.short_json?.name || company.full_json?.name || companyId;
    const jobRoles = company.full_json?.job_roles;

    if (!jobRoles || !Array.isArray(jobRoles) || jobRoles.length === 0) {
      console.log(`⊘ Skipping ${companyName} (no job_roles)`);
      skipCount++;
      continue;
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from("job_role_details_json")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle();

    if (existing) {
      console.log(`↻ Updating ${companyName}...`);
      const { error: updateError } = await supabase
        .from("job_role_details_json")
        .update({
          company_name: companyName,
          job_role_json: {
            company_name: companyName,
            job_role_details: jobRoles,
          },
        })
        .eq("company_id", companyId);

      if (updateError) {
        console.error(`  ❌ Error: ${updateError.message}`);
      } else {
        console.log(`  ✅ Updated`);
        successCount++;
      }
    } else {
      const { error: insertError } = await supabase
        .from("job_role_details_json")
        .insert([
          {
            company_id: companyId,
            company_name: companyName,
            job_role_json: {
              company_name: companyName,
              job_role_details: jobRoles,
            },
          },
        ]);

      if (insertError) {
        console.error(`❌ Error inserting ${companyName}: ${insertError.message}`);
      } else {
        console.log(`✅ Inserted ${companyName}`);
        successCount++;
      }
    }
  }

  console.log(
    `\n📈 Summary: ${successCount} succeeded, ${skipCount} skipped\n`
  );
}

populateJobRoles().catch(console.error);
