import { executeSupabaseRequest, isBrowserOffline, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Company } from "@/types/company";
import { calculateCompanyIntelligence } from "@/services/scoringService";
import type { SupabaseClient } from "@supabase/supabase-js";

const COMPANY_TABLE = "companies_json";

function flattenCompanyJsonRow(row: any): Company {
  const company = {
    company_id: String(row?.company_id ?? ""),
    ...(row?.short_json ?? {}),
    ...(row?.full_json ?? {}),
    hiring_rounds_json: row?.hiring_rounds_json,
    innovx_json: row?.innovx_json,
    job_role_details_json: row?.job_role_details_json,
    short_json: row?.short_json,
    full_json: row?.full_json,
  } as Company & { intelligence?: unknown };

  if (!company.intelligence) {
    company.intelligence = calculateCompanyIntelligence(company);
  }

  return company as Company;
}

async function runSafeSupabaseQuery<T>(
  operation: string,
  queryFn: () => PromiseLike<{ data: T | null; error: unknown }> | { data: T | null; error: unknown }
): Promise<T | null> {
  if (isBrowserOffline() || !isSupabaseConfigured) {
    return null;
  }

  try {
    const result = await executeSupabaseRequest(operation, queryFn);
    if (result.error) {
      console.error(`[Supabase] ${operation} failed:`, result.error);
      return null;
    }
    return result.data;
  } catch (error) {
    console.error(`[Supabase] ${operation} failed:`, error);
    return null;
  }
}

export async function getAllCompanies(supabaseClient?: SupabaseClient): Promise<Company[]> {
  const client = supabaseClient || supabase;
  const data = await runSafeSupabaseQuery("getAllCompanies", () =>
    client
      .from(COMPANY_TABLE)
      .select("company_id, short_json, full_json")
      .order("short_json->>name", { ascending: true })
  );

  return (data || []).map(flattenCompanyJsonRow);
}

export async function getCompanyById(id: string | number, supabaseClient?: SupabaseClient): Promise<Company | null> {
  const client = supabaseClient || supabase;
  const data = await runSafeSupabaseQuery("getCompanyById", () =>
    client
      .from(COMPANY_TABLE)
      .select("*") // Joins removed, fetching standard columns only
      .eq("company_id", String(id))
      .maybeSingle()
  );

  if (data) console.log("RAW SUPABASE RESPONSE (getCompanyById):", data);

  return data ? flattenCompanyJsonRow(data) : null;
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const search = query.trim();
  if (!search) {
    return getAllCompanies();
  }

  const data = await runSafeSupabaseQuery("searchCompanies", () =>
    supabase
      .from(COMPANY_TABLE)
      .select("company_id, short_json, full_json")
      .or(
        `short_json->>name.ilike.%${search}%,short_json->>short_name.ilike.%${search}%,short_json->>category.ilike.%${search}%`
      )
  );

  return (data || []).map(flattenCompanyJsonRow);
}

export async function getCompaniesByCategory(category: string): Promise<Company[]> {
  const normalizedCategory = category.trim();
  if (!normalizedCategory || normalizedCategory.toLowerCase() === "all") {
    return getAllCompanies();
  }

  const data = await runSafeSupabaseQuery("getCompaniesByCategory", () =>
    supabase
      .from(COMPANY_TABLE)
      .select("company_id, short_json, full_json")
      .ilike("short_json->>category", `%${normalizedCategory}%`)
  );

  return (data || []).map(flattenCompanyJsonRow);
}

export async function compareCompanies(companyIds: Array<string | number>): Promise<Company[]> {
  const ids = companyIds.map(String);
  const data = await runSafeSupabaseQuery("compareCompanies", () =>
    supabase
      .from(COMPANY_TABLE)
      .select("company_id, short_json, full_json")
      .in("company_id", ids)
  );

  return (data || []).map(flattenCompanyJsonRow);
}

export async function getCompanyStats() {
  const companies = await getAllCompanies();

  const categories: Record<string, number> = {};
  const tiers: Record<string, number> = {};

  companies.forEach((company) => {
    const category = company.category || "Unknown";
    // Since tier data is not available, use category as proxy
    const tier = category;

    categories[category] = (categories[category] || 0) + 1;
    tiers[tier] = (tiers[tier] || 0) + 1;
  });

  return {
    total: companies.length,
    tiers,
    categories,
  };
}
