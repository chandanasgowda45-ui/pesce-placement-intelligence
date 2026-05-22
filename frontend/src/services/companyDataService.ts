import { executeSupabaseRequest, isBrowserOffline, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Company } from "@/types/company";
import { getCompanyById } from "./companyService";
import { isSupabaseReady } from "@/lib/supabaseSchema";
import {
  parseInnovxJson,
  parseHiringRoundsJson,
  parseJobRoleDetailsJson,
} from "@/lib/validation";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface HiringRound {
  order?: number;
  name?: string;
  type?: string;
  duration?: string;
}

export interface JobRoleDetail {
  role?: string;
  salary?: string;
  skills?: string[];
}

export interface InnovxPayload {
  overview?: string;
  active_projects?: string[];
  lab_locations?: string[];
  metrics?: {
    patents?: string;
    r_and_d_spend?: string;
    innovation_index?: string;
  };
}

export interface CompanyDataPackage {
  company: Company | null;
  hiringRounds: HiringRound[];
  innovx: InnovxPayload | null;
  skills: JobRoleDetail[];
}

const INNOVX_TABLE = "innovx_json";
const ROUNDS_TABLE = "hiring_rounds_json";
const ROLES_TABLE = "job_role_details_json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getJsonPayload(response: any, keys: string[]): unknown {
  if (!response || response.error) return null;
  let target = response.data ?? response;

  // Handle array of rows from direct select("*") queries
  if (Array.isArray(target) && target.length > 0) {
    target = target[0];
  }

  if (!target || typeof target !== "object") return null;
  for (const key of keys) {
    if (key in target) {
      return target[key];
    }
  }
  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === "string") {
      return item
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    if (isRecord(item) && item.skill_name) {
      return String(item.skill_name)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  });
}

function normalizeJobRoleItem(item: unknown): JobRoleDetail {
  if (!isRecord(item)) return {};

  const role = String(
    item.role || item.role_title || item.title || item.opportunity_type || item.job_title || ""
  )
    .trim();
  const salary = String(
    item.salary || item.compensation || item.ctc_or_stipend || item.stipend || item.package || ""
  )
    .trim();

  const skills = [
    normalizeStringArray(item.skills),
    normalizeStringArray(item.required_skills),
    normalizeStringArray(item.skill_sets),
    normalizeStringArray(item.topics),
    normalizeStringArray(item.key_skills),
    normalizeStringArray(item.technical_skills),
  ].flat();

  if (skills.length === 0 && Array.isArray(item.hiring_rounds)) {
    item.hiring_rounds.forEach((round) => {
      if (isRecord(round)) {
        skills.push(...normalizeStringArray((round as any).skill_sets));
        skills.push(...normalizeStringArray((round as any).topics));
      }
    });
  }

  const uniqueSkills = Array.from(new Set(skills.filter(Boolean)));

  return {
    role: role || undefined,
    salary: salary || undefined,
    skills: uniqueSkills.length > 0 ? uniqueSkills : undefined,
  };
}

function extractJobRoleDetails(payload: unknown): JobRoleDetail[] {
  if (!payload) return [];

  // Handle joined result (array of rows)
  if (Array.isArray(payload) && payload.length > 0 && isRecord(payload[0])) {
    const subPayload = payload[0].job_role_json || payload[0].job_role_details || payload[0].roles;
    if (subPayload) {
      return extractJobRoleDetails(subPayload);
    }
  }

  if (Array.isArray(payload)) {
    return payload
      .map(normalizeJobRoleItem)
      .filter((role) => role.role || role.salary || (role.skills?.length ?? 0) > 0);
  }

  if (isRecord(payload)) {
    const candidates: unknown[] = [];
    const roleArray = payload.job_role_details ?? payload.job_roles ?? payload.roles ?? payload.jobRoles;
    if (Array.isArray(roleArray)) {
      candidates.push(...roleArray);
    }

    if (Array.isArray(payload.hiring_rounds)) {
      candidates.push(...payload.hiring_rounds);
    }

    return candidates
      .map(normalizeJobRoleItem)
      .filter((role) => role.role || role.salary || (role.skills?.length ?? 0) > 0);
  }

  return [];
}

function extractHiringRounds(payload: unknown): HiringRound[] {
  if (!payload) return [];

  // Handle joined result (array of rows)
  if (Array.isArray(payload) && payload.length > 0 && isRecord(payload[0])) {
    const subPayload = payload[0].hiring_rounds_json || payload[0].hiring_rounds;
    if (subPayload) {
      return extractHiringRounds(subPayload);
    }
  }

  if (Array.isArray(payload)) return payload as HiringRound[];

  if (isRecord(payload)) {
    if (Array.isArray(payload.hiring_rounds)) {
      return payload.hiring_rounds as HiringRound[];
    }

    if (Array.isArray(payload.job_role_details)) {
      return payload.job_role_details.flatMap((jobRole) => {
        if (isRecord(jobRole) && Array.isArray(jobRole.hiring_rounds)) {
          return jobRole.hiring_rounds as HiringRound[];
        }
        return [];
      });
    }
  }

  return [];
}

async function runSafeTableQuery<T>(
  operation: string,
  queryFn: () => PromiseLike<{ data: T | null; error: unknown }> | { data: T | null; error: unknown }
) {
  if (isBrowserOffline() || !isSupabaseConfigured) {
    console.warn(`[Supabase] Skipping ${operation}: offline or invalid Supabase configuration.`);
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

/**
 * Fetches all related company data in parallel.
 * Returns empty/null data gracefully when Supabase tables don't exist.
 */
export const fetchCompanyFullData = async (companyId: string, supabaseClient?: SupabaseClient): Promise<CompanyDataPackage | null> => {
  const client = supabaseClient || supabase;
  if (!companyId) return null;

  const company = await getCompanyById(companyId, client);
  if (!company) return null;

  const ready = await isSupabaseReady();
  console.log("DATABASE READY STATUS:", ready);

  if (!ready) {
    return {
      company,
      hiringRounds: [],
      innovx: null,
      skills: [],
    };
  }

  const canonicalCompanyId = String(companyId);
  const companyName = String(company.name || "");
  const shouldQueryInnovxByName = /^\d+$/.test(canonicalCompanyId) && !!companyName;

  const innovxRes = await runSafeTableQuery("fetchInnovx", () =>
  (shouldQueryInnovxByName ?
    client.from(INNOVX_TABLE).select("*").ilike("name", `%${companyName}%`) :
    client.from(INNOVX_TABLE).select("*").eq("company_id", canonicalCompanyId))
  );

  const roundsRes = await runSafeTableQuery("fetchHiringRounds", () =>
    client.from(ROUNDS_TABLE).select("*").eq("company_id", canonicalCompanyId)
  );

  const rolesRes = await runSafeTableQuery("fetchJobRoles", () =>
    client.from(ROLES_TABLE).select("*").eq("company_id", canonicalCompanyId)
  );

  console.log("RAW SUPABASE RESPONSE (fetchInnovx):", innovxRes);
  console.log("RAW SUPABASE RESPONSE (fetchHiringRounds):", roundsRes);
  console.log("RAW SUPABASE RESPONSE (fetchJobRoles):", rolesRes);

  if (roundsRes) console.log("DIRECT HIRING DATA:", roundsRes);
  if (rolesRes) console.log("DIRECT SKILLS DATA:", rolesRes);

  const innovxRaw = getJsonPayload(innovxRes, ["json_data"]);
  const jobRoleRaw = getJsonPayload(rolesRes, ["job_role_json"]);

  // 1. Process InnovX with Fallback
  let innovx: InnovxPayload | null = null;
  const innovxSource = innovxRaw || company.full_json?.innovx;

  if (innovxSource && typeof innovxSource === "object") {
    if ("innovx_master" in (innovxSource as any)) {
      const masterData = (innovxSource as any).innovx_master;
      innovx = {
        overview: `Leading ${masterData.industry || "technology"} company focused on ${masterData.core_business_model || "innovative solutions"} with ${masterData.geographic_focus || "global"} presence.`,
        active_projects: [],
        lab_locations: [],
        metrics: {
          patents: "N/A",
          r_and_d_spend: "N/A",
          innovation_index: "N/A",
        },
      };
    } else {
      // Direct mapping for refined schema
      const raw = innovxSource as any;
      innovx = {
        overview: raw.overview || null,
        active_projects: raw.active_projects || [],
        lab_locations: raw.lab_locations || [],
        metrics: raw.metrics ? {
          patents: String(raw.metrics.patents || "N/A"),
          r_and_d_spend: String(raw.metrics.r_and_d_spend || "N/A"),
          innovation_index: String(raw.metrics.innovation_index || "N/A"),
        } : undefined
      };
    }
  }

  // 2. Process Hiring Rounds with Fallback
  const hiringData = Array.isArray(roundsRes) ? roundsRes : [];
  console.log("RAW HIRING PAYLOAD FROM SUPABASE:", JSON.stringify(hiringData, null, 2));

  const normalizedHiring = hiringData.flatMap((item: any) => {
    // Extract the actual data payload from the database row
    const payload = item?.hiring_rounds_json || item?.json_data || item;

    // Case 1: The payload is an object containing a 'hiring_rounds' array
    if (isRecord(payload) && Array.isArray(payload.hiring_rounds)) {
      return payload.hiring_rounds;
    }

    // Case 2: The payload is an object containing a 'rounds' array
    if (isRecord(payload) && Array.isArray(payload.rounds)) {
      return payload.rounds;
    }

    // Case 3: The item itself is a direct round record (flat structure)
    if (item.round_name || item.name) {
      return [{
        order: item.order ?? item.round ?? 1,
        name: item.round_name || item.name,
        type: item.round_type || item.type || "Interview",
        duration: item.duration || "N/A",
      }];
    }

    // Case 4: The payload is already the array we need
    if (Array.isArray(payload)) {
      return payload;
    }

    // Case 5: Handle corrupted mapping (e.g., job_role_details inside hiring table)
    if (isRecord(payload) && Array.isArray(payload.job_role_details)) {
      // Look for nested rounds inside job roles as a last resort
      return extractHiringRounds(payload);
    }

    return [];
  }) as HiringRound[];

  console.log("NORMALIZED HIRING:", normalizedHiring);

  let hiringRounds = normalizedHiring;

  const companyFallbackRounds = extractHiringRounds(
    (company as any).hiring_rounds_json ||
    company.full_json?.hiring_rounds ||
    company.full_json
  );
  if (hiringRounds.length === 0) {
    hiringRounds = companyFallbackRounds;
  }

  console.log("SERVICE LAYER FINAL HIRING ROUNDS:", hiringRounds);

  // 3. Process Skills with Fallback
  const validatedJobRolePayload = jobRoleRaw ? parseJobRoleDetailsJson(jobRoleRaw) : null;
  const primaryRoles = extractJobRoleDetails(validatedJobRolePayload ?? jobRoleRaw);
  const fallbackRoles = extractJobRoleDetails(
    (company as any).job_role_details_json ||
    company.full_json?.job_roles ||
    company.full_json?.job_role_details
  );
  const skills = primaryRoles.length > 0 ? primaryRoles : fallbackRoles;

  return {
    company,
    hiringRounds,
    innovx,
    skills,
  };
};
