import { z } from "zod";

/**
 * Core Business Validation Schema
 * Standardizes types for LangGraph State and structured output.
 */
export const CompanyResearchSchema = z.object({
  company_name: z.string(),
  country: z.string().optional().nullable(),
  
  // Array-like business fields (Prioritized)
  operating_countries: z.array(z.string()).default([]),
  key_competitors: z.array(z.string()).default([]),
  core_values: z.array(z.string()).default([]),
  strategic_priorities: z.array(z.string()).default([]),
  focus_sectors: z.array(z.string()).default([]),
  competitive_advantages: z.array(z.string()).default([]),
  
  // Complex Object Arrays
  board_members: z.array(z.object({
    name: z.string(),
    position: z.string().optional()
  })).default([]),
  
  key_leaders: z.array(z.object({
    name: z.string(),
    role: z.string().optional()
  })).default([]),

  // Standard Metadata
  description: z.string().optional(),
  revenue: z.string().optional(),
  employee_count: z.string().optional(),
  founded_year: z.number().optional(),
  hq_location: z.string().optional()
});

export type CompanyResearchState = z.infer<typeof CompanyResearchSchema>;

// Result wrapper for the graph output
export const GraphOutputSchema = z.object({
  result: CompanyResearchSchema
});