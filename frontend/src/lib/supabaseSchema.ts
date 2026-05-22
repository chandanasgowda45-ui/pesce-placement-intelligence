import { supabase } from "@/lib/supabase";

const COMPANY_TABLE_CANDIDATES = ["companies_json"] as const;
type CompanyTableName = (typeof COMPANY_TABLE_CANDIDATES)[number];

let schemaChecked = false;
let schemaReady = false;
let activeCompanyTable: CompanyTableName | null = null;
let schemaCheckPromise: Promise<boolean> | null = null;

/**
 * PostgreSQL error codes:
 * 42P01 - undefined_table
 */
export function isSupabaseTableMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { message?: string; code?: string };
  if (e.code === "42P01") return true;
  if (typeof e.message === "string" && e.message.includes("does not exist")) return true;
  return false;
}

export function getActiveCompanyTableName(): CompanyTableName | null {
  return activeCompanyTable;
}

async function detectCompanyTable(): Promise<CompanyTableName | null> {
  if (activeCompanyTable) {
    return activeCompanyTable;
  }

  for (const table of COMPANY_TABLE_CANDIDATES) {
    try {
      const { error } = await supabase
        .from(table)
        .select("company_id")
        .limit(1);

      if (!error || !isSupabaseTableMissingError(error)) {
        activeCompanyTable = table;
        return activeCompanyTable;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Verify Supabase schema exists. Silently catches errors to prevent console spam.
 */
export async function verifySupabaseSchema(): Promise<boolean> {
  if (schemaChecked) {
    return schemaReady;
  }

  if (schemaCheckPromise) {
    return schemaCheckPromise;
  }

  schemaCheckPromise = (async () => {
    const originalError = console.error;
    console.error = () => {};

    try {
      const table = await detectCompanyTable();
      schemaReady = Boolean(table);
    } catch {
      schemaReady = false;
    } finally {
      console.error = originalError;
      schemaChecked = true;
    }

    return schemaReady;
  })().catch(() => false);

  return schemaCheckPromise;
}

export function setSupabaseSchemaReady(value: boolean) {
  schemaChecked = true;
  schemaReady = value;
}

export function getSupabaseSchemaReady(): boolean | undefined {
  return schemaChecked ? schemaReady : undefined;
}

/**
 * Check if Supabase is usable.
 */
export async function isSupabaseReady(): Promise<boolean> {
  if (schemaChecked) return schemaReady;
  return verifySupabaseSchema();
}
