import { Company } from "../../types/company";
import { COMPANY_FIELDS } from "../../agents/phase2-research";
import { ProviderResult } from "./state";

/**
 * Consolidate results from multiple AI providers into a single golden record
 */
export function consolidateProviderResults(results: Record<string, ProviderResult>) {
  const goldenRecord: Partial<Company> = {};
  const confidenceScores: Record<string, number> = {};
  const providerKeys = Object.keys(results);

  if (providerKeys.length === 0) return { goldenRecord, confidenceScores };

  COMPANY_FIELDS.forEach(field => {
    const values = providerKeys
      .map(p => results[p].data[field])
      .filter(v => v !== undefined && v !== null && v !== "");

    if (values.length === 0) {
      confidenceScores[field] = 0;
      return;
    }

    // Simple consensus: most frequent value
    const frequency: Record<string, number> = {};
    values.forEach(v => {
      const s = JSON.stringify(v);
      frequency[s] = (frequency[s] || 0) + 1;
    });

    const mostFrequent = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];
    (goldenRecord as any)[field] = JSON.parse(mostFrequent[0]);
    
    // Confidence = frequency / total providers
    confidenceScores[field] = mostFrequent[1] / providerKeys.length;
  });

  return { goldenRecord, confidenceScores };
}
