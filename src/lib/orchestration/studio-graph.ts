import { z } from "zod";

import {
  companyResearchGraph
} from "./graph";

// REAL Studio graph export
export const graph = companyResearchGraph;

// REQUIRED Studio schemas
export const inputSchema = z.object({

  company_name: z.string().describe(
    "Target company name"
  ),

  country: z.string().optional().describe(
    "Target country"
  )

});

export const outputSchema = z.object({

  result: z.any().optional()

});

export const configSchema = z.object({});

export const stateSchema = z.object({

  company_name: z.string(),

  country: z.string().optional(),

  result: z.any().optional()

});