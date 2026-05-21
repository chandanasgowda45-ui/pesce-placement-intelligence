import { runCompanyResearch } from "./smith";
import { Company } from "../../types/company";

/**
 * Hook-ready adapter for React components to trigger the orchestration pipeline
 */
export async function fetchEnhancedCompanyIntelligence(query: string): Promise<Company> {
  console.log(`[ADAPTER] Requesting enhanced intelligence for: ${query}`);
  
  try {
    const result = await runCompanyResearch(query);
    
    if (!result.goldenRecord) {
      throw new Error("Pipeline failed to generate a golden record.");
    }

    // Combine metadata with the record for frontend visibility
    return {
      ...(result.goldenRecord as Company),
      // We can attach confidence scores or metadata if the Company type supports it
      // For now, return the clean golden record
    };
  } catch (error) {
    console.error("[ADAPTER] Orchestration pipeline error:", error);
    throw error;
  }
}
