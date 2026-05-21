import { supabase } from "@/lib/supabase";
import { parseInnovxJson, parseJobRoleDetailsJson, parseHiringRoundsJson } from "@/lib/validation";
import { isSupabaseReady } from "@/lib/supabaseSchema";

export interface InnovxRecord {
  id: number;
  company_id: string;
  name: string;
  json_data: unknown;
}

export interface JobRoleDetailRecord {
  id: number;
  company_id: string;
  company_name: string;
  job_role_json: unknown;
}

export interface HiringRoundsRecord {
  id: number;
  company_id: string;
  hiring_rounds_json: unknown;
}

export async function fetchInnovxRecords(companyId: string): Promise<InnovxRecord[]> {
  if (!(await isSupabaseReady())) {
    return [];
  }

  const { data, error } = await supabase
    .from("innovx_json")
    .select("id, company_id, name, json_data")
    .eq("company_id", companyId);

  if (error) {
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as number,
    company_id: row.company_id as string,
    name: row.name as string,
    json_data: parseInnovxJson(row.json_data),
  }));
}

export async function fetchJobRoleDetails(companyId: string): Promise<JobRoleDetailRecord[]> {
  if (!(await isSupabaseReady())) {
    return [];
  }

  const { data, error } = await supabase
    .from("job_role_details_json")
    .select("id, company_id, company_name, job_role_json")
    .eq("company_id", companyId);

  if (error) {
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as number,
    company_id: row.company_id as string,
    company_name: row.company_name as string,
    job_role_json: parseJobRoleDetailsJson(row.job_role_json),
  }));
}

export async function fetchHiringRounds(companyId: string): Promise<HiringRoundsRecord[]> {
  if (!(await isSupabaseReady())) {
    return [];
  }

  const { data, error } = await supabase
    .from("hiring_rounds_json")
    .select("id, company_id, hiring_rounds_json")
    .eq("company_id", companyId);

  if (error) {
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as number,
    company_id: row.company_id as string,
    hiring_rounds_json: parseHiringRoundsJson(row.hiring_rounds_json),
  }));
}

