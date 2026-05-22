import { supabase } from "@/lib/supabase";
import { verifySupabaseSchema, getActiveCompanyTableName } from "@/lib/supabaseSchema";

function normalizeName(s: string | undefined): string {
  return (s || "")
    .toLowerCase()
    .replace(/[\s\-_]+/g, " ")
    .replace(/[.,()"'`]/g, "")
    .trim();
}

export type CompanyRecord = {
  company_id: string;
  name: string;
  short_json?: any;
  full_json?: any;
};

export async function fetchCompanies(limit = 500): Promise<CompanyRecord[]> {
  await verifySupabaseSchema();
  const table = getActiveCompanyTableName();
  if (!table) return [];

  const { data, error } = await supabase
    .from(table)
    .select("company_id, short_json, full_json")
    .limit(limit);

  if (error) {
    console.error("[FAIL] fetchCompanies supabase error:", error.message || error);
    return [];
  }

  const rows = (data || []) as any[];
  return rows.map((r) => {
    const shortJson = r.short_json || {};
    const fullJson = r.full_json || {};
    const name = shortJson.name || fullJson.name || r.company_id || "";
    return {
      company_id: r.company_id,
      name,
      short_json: shortJson,
      full_json: fullJson,
    } as CompanyRecord;
  });
}

export async function findCompanyByName(
  companyName: string
) {

  const companies = await fetchCompanies();

  console.log(
    "[DEBUG] Total backend companies:",
    companies.length
  );

  const normalize = (value: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const inputName =
    normalize(companyName);

  console.log(
    "[DEBUG] Normalized input:",
    inputName
  );

  const matchedCompany =
    companies.find((company: any) => {

      const backendName =
        normalize(
          company.name ||
          company.company_name ||
          ""
        );

      return backendName === inputName;
    });

  console.log(
    "[DEBUG] Matched company:",
    matchedCompany?.name
  );

  if (!matchedCompany) {

    console.log(
      "[DEBUG] Available sample companies:",
      companies
        .slice(0, 20)
        .map((c: any) =>
          c.name ||
          c.company_name
        )
    );
  }

  return matchedCompany;
}

export { normalizeName };
