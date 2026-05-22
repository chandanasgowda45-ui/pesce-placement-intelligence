/**
 * Data Loader Utility for Supabase
 * Use this to programmatically insert data into Supabase from your app
 * Requires admin privileges or proper RLS policies
 */

import { supabase } from "@/lib/supabase";

interface CompanyInsertData {
  company_id: string;
  short_json: Record<string, unknown>;
  full_json: Record<string, unknown>;
}

interface HiringRoundInsertData {
  company_id: string;
  // Fix: The hiring_rounds_json column MUST contain a JSON object 
  // with 'hiring_rounds' as the root key, not 'job_role_details'.
  hiring_rounds_json: {
    hiring_rounds: any[];
  };
}

interface InnovXInsertData {
  company_id: string;
  name: string;
  json_data: Record<string, unknown>;
}

interface JobRoleInsertData {
  company_id: string;
  company_name: string;
  // Fix: The job_role_json column MUST contain a JSON object 
  // with 'job_role_details' as the root key.
  job_role_json: {
    job_role_details: any[];
  };
}

/**
 * Insert a company into the companies_json table
 */
export async function insertCompany(data: CompanyInsertData) {
  console.log(`[DataLoader] Inserting company: ${data.company_id}`);

  const { data: result, error } = await supabase
    .from("companies_json")
    .insert([data])
    .select();

  if (error) {
    console.error(`[DataLoader] Error inserting company:`, error);
    throw error;
  }

  console.log(`[DataLoader] ✅ Company inserted:`, result);
  return result;
}

/**
 * Insert multiple companies at once
 */
export async function insertCompanies(companies: CompanyInsertData[]) {
  console.log(`[DataLoader] Inserting ${companies.length} companies...`);

  const { data: result, error } = await supabase
    .from("companies_json")
    .insert(companies)
    .select();

  if (error) {
    console.error(`[DataLoader] Error inserting companies:`, error);
    throw error;
  }

  console.log(`[DataLoader] ✅ ${result?.length} companies inserted`);
  return result;
}

/**
 * Update a company
 */
export async function updateCompany(
  company_id: string,
  updates: Partial<CompanyInsertData>
) {
  console.log(`[DataLoader] Updating company: ${company_id}`);

  const { data: result, error } = await supabase
    .from("companies_json")
    .update(updates)
    .eq("company_id", company_id)
    .select();

  if (error) {
    console.error(`[DataLoader] Error updating company:`, error);
    throw error;
  }

  console.log(`[DataLoader] ✅ Company updated:`, result);
  return result;
}

/**
 * Insert hiring rounds for a company
 */
export async function insertHiringRounds(data: HiringRoundInsertData) {
  console.log(`[DataLoader] Inserting hiring rounds for: ${data.company_id}`);

  const { data: result, error } = await supabase
    .from("hiring_rounds_json")
    .insert([data])
    .select();

  if (error) {
    console.error(`[DataLoader] Error inserting hiring rounds:`, error);
    throw error;
  }

  console.log(`[DataLoader] ✅ Hiring rounds inserted:`, result);
  return result;
}

/**
 * Insert InnovX data for a company
 */
export async function insertInnovX(data: InnovXInsertData) {
  console.log(`[DataLoader] Inserting InnovX data for: ${data.company_id}`);

  const { data: result, error } = await supabase
    .from("innovx_json")
    .insert([data])
    .select();

  if (error) {
    console.error(`[DataLoader] Error inserting InnovX data:`, error);
    throw error;
  }

  console.log(`[DataLoader] ✅ InnovX data inserted:`, result);
  return result;
}

/**
 * Insert job role details for a company
 */
export async function insertJobRoles(data: JobRoleInsertData) {
  console.log(`[DataLoader] Inserting job roles for: ${data.company_id}`);

  const { data: result, error } = await supabase
    .from("job_role_details_json")
    .insert([data])
    .select();

  if (error) {
    console.error(`[DataLoader] Error inserting job roles:`, error);
    throw error;
  }

  console.log(`[DataLoader] ✅ Job roles inserted:`, result);
  return result;
}

/**
 * Check if a company exists
 */
export async function companyExists(company_id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("companies_json")
    .select("company_id")
    .eq("company_id", company_id)
    .maybeSingle();

  return !error && data !== null;
}

/**
 * Get all companies count
 */
export async function getCompaniesCount(): Promise<number> {
  const { count, error } = await supabase
    .from("companies_json")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[DataLoader] Error getting count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Verify all tables exist and are accessible
 */
export async function verifyDatabaseSetup(): Promise<{
  companies_json: boolean;
  innovx_json: boolean;
  job_role_details_json: boolean;
  hiring_rounds_json: boolean;
}> {
  const results = {
    companies_json: false,
    innovx_json: false,
    job_role_details_json: false,
    hiring_rounds_json: false,
  };

  // Test companies_json
  try {
    const { error } = await supabase
      .from("companies_json")
      .select("company_id")
      .limit(1);
    results.companies_json = !error;
  } catch {
    // no-op
  }

  // Test innovx_json
  try {
    const { error } = await supabase
      .from("innovx_json")
      .select("id")
      .limit(1);
    results.innovx_json = !error;
  } catch {
    // no-op
  }

  // Test job_role_details_json
  try {
    const { error } = await supabase
      .from("job_role_details_json")
      .select("id")
      .limit(1);
    results.job_role_details_json = !error;
  } catch {
    // no-op
  }

  // Test hiring_rounds_json
  try {
    const { error } = await supabase
      .from("hiring_rounds_json")
      .select("id")
      .limit(1);
    results.hiring_rounds_json = !error;
  } catch {
    // no-op
  }

  return results;
}

export default {
  insertCompany,
  insertCompanies,
  updateCompany,
  insertHiringRounds,
  insertInnovX,
  insertJobRoles,
  companyExists,
  getCompaniesCount,
  verifyDatabaseSetup,
};
