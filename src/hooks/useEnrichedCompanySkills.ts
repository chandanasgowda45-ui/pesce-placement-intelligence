import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Company } from "@/types/company";

export interface EnrichedCompanySkillData extends Company {
  // Normalized skills from both embedded and Supabase sources
  enrichedSkills: {
    role?: string;
    salary?: string;
    skills?: string[];
  }[];
  
  // All unique skills mentioned across all roles
  allSkillsSet: Set<string>;
  
  // Hiring rounds from Supabase if available
  hiringRounds: {
    order?: number;
    name?: string;
    type?: string;
    duration?: string;
  }[];
}

/**
 * Enriches company data with skills from both embedded JSON and Supabase
 * Useful for skill mapping and analysis pages that need comprehensive skill coverage
 */
export function useEnrichedCompanySkills(companies: Company[]) {
  return useQuery({
    queryKey: ["enriched-skills", companies.map(c => c.company_id).join(",")],
    queryFn: async () => {
      if (!companies || companies.length === 0) return [];

      // Fetch job roles and hiring rounds for all companies in parallel
      const queries = companies.map(company => 
        Promise.all([
          supabase
            .from("job_role_details_json")
            .select("job_role_json")
            .eq("company_id", String(company.company_id))
            .maybeSingle(),
          supabase
            .from("hiring_rounds_json")
            .select("hiring_rounds_json")
            .eq("company_id", String(company.company_id))
            .maybeSingle(),
        ]).then(([rolesRes, roundsRes]) => ({
          companyId: company.company_id,
          roles: rolesRes.data?.job_role_json,
          rounds: roundsRes.data?.hiring_rounds_json,
        }))
      );

      const supabseData = await Promise.all(queries);
      const supabseMap = new Map(supabseData.map(d => [d.companyId, d]));

      return companies.map(company => {
        const supabaseEntry = supabseMap.get(company.company_id);
        
        // Extract embedded roles
        const embeddedRoles = (company.full_json?.job_roles as any[] || []).map(role => ({
          role: role.role || role.role_title,
          salary: role.salary,
          skills: Array.isArray(role.skills) ? role.skills : [],
        }));

        // Extract Supabase roles
        let supabaseRoles: any[] = [];
        if (supabaseEntry?.roles) {
          const payload = supabaseEntry.roles as any;
          if (Array.isArray(payload.job_role_details)) {
            supabaseRoles = payload.job_role_details.map((role: any) => ({
              role: role.role_title || role.opportunity_type,
              salary: role.compensation || role.ctc_or_stipend,
              skills: Array.isArray(role.required_skills) 
                ? role.required_skills.map((s: any) => s.skill_name || s)
                : [],
            }));
          }
        }

        // Merge roles, preferring Supabase data if available
        const enrichedSkills = supabaseRoles.length > 0 ? supabaseRoles : embeddedRoles;

        // Collect all unique skills
        const allSkillsSet = new Set<string>();
        enrichedSkills.forEach(role => {
          if (Array.isArray(role.skills)) {
            role.skills.forEach(skill => {
              if (typeof skill === "string") {
                allSkillsSet.add(skill.toLowerCase());
              }
            });
          }
        });

        // Extract hiring rounds
        let hiringRounds: any[] = [];
        if (supabaseEntry?.rounds) {
          const payload = supabaseEntry.rounds as any;
          if (Array.isArray(payload.job_role_details)) {
            hiringRounds = payload.job_role_details.flatMap((role: any) =>
              Array.isArray(role.hiring_rounds) ? role.hiring_rounds : []
            );
          } else if (Array.isArray(payload.hiring_rounds)) {
            hiringRounds = payload.hiring_rounds;
          }
        }

        return {
          ...company,
          enrichedSkills,
          allSkillsSet,
          hiringRounds,
        } as EnrichedCompanySkillData;
      });
    },
    enabled: companies.length > 0,
  });
}
