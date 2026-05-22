import { ConsolidationOutput, PipelineFailedParameter } from "./types";
import { executePhase5ValidationSuite } from "./phase5-validation";
import { executePhase6SupabaseWrite, SupabaseWriteOutput } from "./phase6-supabase-write";

export interface SaveValidationAgentOutput {
  validationOutput: Awaited<ReturnType<typeof executePhase5ValidationSuite>>;
  supabaseResult: SupabaseWriteOutput;
  failedParameters: PipelineFailedParameter[];
}

/**
 * Phase 5: Save & Validation Agent
 * Validates consolidated data through the validation suite tool layer,
 * then persists only approved, high-integrity records to storage.
 */
export async function executePhase5SaveValidationAgent(
  companyName: string,
  consolidationOutput: ConsolidationOutput
): Promise<SaveValidationAgentOutput> {
  console.log(
    "\n📍 Phase 5: Save & Validation Agent - Validating consolidated data and persisting approved records"
  );

  const validationOutput = await executePhase5ValidationSuite(consolidationOutput);

  const failedParameters: PipelineFailedParameter[] = validationOutput.results
    .filter((result) => !result.pass)
    .map((result) => ({
      fieldName: result.fieldName,
      reason: result.errors.join("; ") || "Validation failure",
      lastAttempt: new Date().toISOString(),
    }));

  const supabaseResult = await executePhase6SupabaseWrite(
    companyName,
    consolidationOutput,
    validationOutput,
    failedParameters
  );

  return {
    validationOutput,
    supabaseResult,
    failedParameters,
  };
}
