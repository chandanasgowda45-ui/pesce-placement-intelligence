import { CompanyResearchInput, PipelineFailedParameter, PipelineOutput, PipelineState } from "./types";
import { executePhase2ResearchAgent } from "./phase2-research";
import { executePhase3MetadataRuleCheck } from "./phase3-metadata-rules";
import { executePhase4ConsolidationAgent } from "./phase4-consolidation";
import { executePhase5SaveValidationAgent } from "./phase5-save-validation";
import { SupabaseWriteOutput } from "./phase6-supabase-write";
import { VALID_SUPABASE_FIELDS } from "../lib/schemaRegistry";
import { type CompanyFieldKey } from "../types/company";

export interface PipelineOptions {
  maxRegenerationAttempts?: number;
}

function createPhaseOutput(
  phase: number,
  status: PipelineOutput["status"],
  data: unknown = null,
  errors: string[] = []
): PipelineOutput {
  return {
    phase,
    status,
    data,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };
}

function initializePipelineState(
  companyName: string,
  maxRegenerationAttempts = 2
): PipelineState {
  return {
    companyName,
    phase1: null,
    phase2: null,
    phase3: null,
    phase4: null,
    phase5: null,
    failedParameters: [],
    regenerationAttempts: 0,
    maxRegenerationAttempts,
  };
}

export async function executeCompanyPipeline(
  companyName: string,
  overrideFields: Record<string, unknown> = {},
  options: PipelineOptions = {}
): Promise<{ state: PipelineState; supabaseResult?: SupabaseWriteOutput }> {
  const state = initializePipelineState(
    companyName,
    options.maxRegenerationAttempts ?? 2
  );

  state.phase1 = createPhaseOutput(1, "completed", {
    companyName,
    overrideFields,
    startedAt: new Date().toISOString(),
  });

  try {
    state.phase2 = createPhaseOutput(2, "in_progress", { message: "Starting research agent" });
    const phase2Output = await executePhase2ResearchAgent({
      companyName,
      overrideFields,
    });
    state.phase2 = createPhaseOutput(2, "completed", phase2Output);

    state.phase3 = createPhaseOutput(3, "in_progress", { message: "Running metadata rule checks" });
    const phase3Output = await executePhase3MetadataRuleCheck(phase2Output);
    state.phase3 = createPhaseOutput(3, "completed", phase3Output);

    state.phase4 = createPhaseOutput(4, "in_progress", { message: "Consolidating outputs" });
    const phase4Output = await executePhase4ConsolidationAgent(phase2Output, phase3Output);
    state.phase4 = createPhaseOutput(4, "completed", phase4Output);

    state.phase5 = createPhaseOutput(5, "in_progress", { message: "Validating and persisting golden record" });
    const saveValidationOutput = await executePhase5SaveValidationAgent(
      companyName,
      phase4Output
    );
    state.phase5 = createPhaseOutput(5, "completed", saveValidationOutput);

    state.failedParameters = saveValidationOutput.failedParameters;

    return { state, supabaseResult: saveValidationOutput.supabaseResult };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (state.phase2?.status === "in_progress") {
      state.phase2 = createPhaseOutput(2, "failed", state.phase2.data, [errorMessage]);
    } else if (state.phase3?.status === "in_progress") {
      state.phase3 = createPhaseOutput(3, "failed", state.phase3.data, [errorMessage]);
    } else if (state.phase4?.status === "in_progress") {
      state.phase4 = createPhaseOutput(4, "failed", state.phase4.data, [errorMessage]);
    } else if (state.phase5?.status === "in_progress") {
      state.phase5 = createPhaseOutput(5, "failed", state.phase5.data, [errorMessage]);
    }

    throw new Error(`Pipeline failed at company=${companyName}: ${errorMessage}`);
  }
}

export function validateFieldKeyMetadata(
  fields: Array<{ label: string; fieldKey: CompanyFieldKey }>,
  supabaseSchemaKeys: Set<CompanyFieldKey>
) {
  const warnings: string[] = [];
  let missingFieldKeys = 0;
  let invalidMappings = 0;
  let duplicateMappings = 0;
  let unmappedLabels = 0;
  const seenFieldKeys = new Map<string, string[]>();

  fields.forEach((field) => {
    if (!field.fieldKey) {
      warnings.push(`Missing fieldKey metadata for label: ${field.label}`);
      missingFieldKeys++;
      unmappedLabels++;
    } else if (!supabaseSchemaKeys.has(field.fieldKey)) {
      warnings.push(`fieldKey not found in Supabase schema: ${field.fieldKey}`);
      invalidMappings++;
      unmappedLabels++;
    } else {
      if (!seenFieldKeys.has(field.fieldKey)) {
        seenFieldKeys.set(field.fieldKey, []);
      }
      seenFieldKeys.get(field.fieldKey)!.push(field.label);
    }
  });

  seenFieldKeys.forEach((labels, fieldKey) => {
    if (labels.length > 1) {
      warnings.push(`Duplicate fieldKey mapping: ${fieldKey}`);
      duplicateMappings++;
    }
  });

  return { warnings, missingFieldKeys, invalidMappings, duplicateMappings, unmappedLabels };
}
