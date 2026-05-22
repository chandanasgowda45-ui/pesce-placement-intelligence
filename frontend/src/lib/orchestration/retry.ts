import { OrchestrationState } from "./state";
import { COMPANY_FIELDS } from "../../agents/phase2-research";

/**
 * Identify fields that need a retry based on consolidation and validation results
 */
export function identifyRetryFields(state: OrchestrationState) {
  const fieldsToRetry: string[] = [];
  
  // Retry fields with 0 confidence (no provider found data)
  COMPANY_FIELDS.forEach(field => {
    const score = state.confidenceScores[field] || 0;
    if (score === 0) {
      fieldsToRetry.push(field);
    }
  });

  // Also retry fields that failed final validation
  if (state.finalValidationErrors) {
    state.finalValidationErrors.forEach(err => {
      const field = err.split(":")[0];
      if (COMPANY_FIELDS.includes(field) && !fieldsToRetry.includes(field)) {
        fieldsToRetry.push(field);
      }
    });
  }

  return fieldsToRetry;
}

/**
 * Build a summary of the retry attempt
 */
export function getRetrySummary(attempt: number, fields: string[]) {
  if (fields.length === 0) return [`[INFO] Retry Attempt ${attempt}: No fields required retry.`];
  return [`[WARNING] Retry Attempt ${attempt}: Retrying ${fields.length} failed/low-confidence fields.`];
}
