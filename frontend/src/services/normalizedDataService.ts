import { supabase } from "@/lib/supabase";
import { Company } from "@/types/company";
import { getSupabaseSchemaReady, verifySupabaseSchema } from "@/lib/supabaseSchema";

/**
 * This service handles fetching company data from the normalized tables
 * and transforming it into the Company interface format.
 */

async function fetchAllRows(table: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .limit(1000);

  if (error) {
    throw error;
  }
  return data || [];
}

export async function fetchNormalizedCompanies(): Promise<Company[]> {
  let schemaReady = getSupabaseSchemaReady();
  if (schemaReady === undefined) {
    schemaReady = await verifySupabaseSchema();
  }
  if (schemaReady === false) {
    throw new Error("Supabase schema is not ready.");
  }

  const companiesData = await fetchAllRows("companies");
  return companiesData.map((row: any) => transformNormalizedToCompany(row));
}

export async function fetchNormalizedCompanyById(id: string | number): Promise<Company | null> {
  let schemaReady = getSupabaseSchemaReady();
  if (schemaReady === undefined) {
    schemaReady = await verifySupabaseSchema();
  }
  if (schemaReady === false) {
    throw new Error("Supabase schema is not ready.");
  }

  const stringId = String(id);
  
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("company_id", stringId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return transformNormalizedToCompany(data);
}

function transformNormalizedToCompany(row: unknown): Company {
  if (!row || typeof row !== "object") return {} as Company;
  const r = row as Record<string, unknown>;
  
  return {
    ...r,
    company_id: String(r.company_id),
  } as Company;
}
