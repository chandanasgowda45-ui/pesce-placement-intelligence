/**
 * Phase 6: Supabase Write
 * Persist validated golden record to database
 * Includes data lineage tracking for audit trail
 */

import { supabase } from "@/lib/supabase";
import {
  ConsolidationOutput,
  ValidationSuiteOutput,
  PipelineFailedParameter,
} from "./types";
import { COMPANY_FIELDS } from "./phase2-research";

export interface SupabaseWriteOutput {
  success: boolean;
  companyId?: string;
  recordId?: string;
  parametersWritten: number;
  timestamp: string;
  errors?: string[];
}

/**
 * Create company record for Supabase
 */
function buildCompanyRecord(
  companyName: string,
  goldenRecord: Record<string, unknown>,
  consolidationOutput: ConsolidationOutput,
  validationResults: ValidationSuiteOutput
): Record<string, unknown> {
  // Extract short JSON fields
  const shortJson = {
    name: goldenRecord.name || companyName,
    short_name: goldenRecord.short_name,
    category: goldenRecord.category,
    company_tier: goldenRecord.company_tier,
    logo_url: goldenRecord.logo_url,
    headquarters_address: goldenRecord.headquarters_address,
    employee_size: goldenRecord.employee_size,
  };

  // Full JSON with all fields
  const fullJson = { ...goldenRecord };

  // Add pipeline metadata
  const pipelineMetadata = {
    source: "company-intelligence-pipeline",
    phase: "production",
    consolidationStats: {
      avgConfidence:
        Object.values(consolidationOutput.confidenceScores).reduce((a, b) => a + b, 0) /
        COMPANY_FIELDS.length,
      consensusFields: Object.values(consolidationOutput.sourceTracking).filter(
        (s) => s === "consensus"
      ).length,
      totalFields: COMPANY_FIELDS.length,
    },
    validationStats: {
      passCount: validationResults.passCount,
      failCount: validationResults.failCount,
      overallPass: validationResults.overallPass,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    company_id: String(companyName).toLowerCase().replace(/\s+/g, "-"),
    short_json: shortJson,
    full_json: fullJson,
    pipeline_metadata: pipelineMetadata,
  };
}

/**
 * Phase 6: Supabase Write
 * Write validated golden record to database
 */
export async function executePhase6SupabaseWrite(
  companyName: string,
  consolidationOutput: ConsolidationOutput,
  validationOutput: ValidationSuiteOutput,
  failedParameters: PipelineFailedParameter[] = []
): Promise<SupabaseWriteOutput> {
  console.log("\n📍 Phase 6: Supabase Write - Persisting validated record");
  console.log(`📤 Writing 163 parameters to database...\n`);

  try {
    // Only write approved, high-integrity records.
    if (!validationOutput.overallPass) {
      console.log("⚠️  Validation did not pass. Skipping write.");
      return {
        success: false,
        parametersWritten: 0,
        timestamp: new Date().toISOString(),
        errors: ["Validation failed"],
      };
    }

    // Build record
    const companyRecord = buildCompanyRecord(
      companyName,
      consolidationOutput.goldenRecord,
      consolidationOutput,
      validationOutput
    );

    // Check if company exists
    const { data: existing, error: checkError } = await supabase
      .from("companies_json")
      .select("company_id")
      .eq("company_id", companyRecord.company_id)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check existing record: ${checkError.message}`);
    }

    // Insert or update
    let result;
    if (existing) {
      console.log(`🔄 Updating existing record for ${companyName}...`);
      result = await supabase
        .from("companies_json")
        .update(companyRecord)
        .eq("company_id", companyRecord.company_id)
        .select();
    } else {
      console.log(`✨ Creating new record for ${companyName}...`);
      result = await supabase.from("companies_json").insert([companyRecord]).select();
    }

    if (result.error) {
      throw new Error(`Database write failed: ${result.error.message}`);
    }

    const parametersWritten = Object.keys(consolidationOutput.goldenRecord).length;

    console.log(`✅ Phase 6 Complete: Record persisted to Supabase`);
    console.log(`   Company ID: ${companyRecord.company_id}`);
    console.log(`   Parameters Written: ${parametersWritten}/${COMPANY_FIELDS.length}`);
    console.log(`   Validation Status: ${validationOutput.overallPass ? "✅ PASS" : "⚠️  REVIEW"}`);

    if (failedParameters.length > 0) {
      console.log(`   Failed Parameters (flagged for regeneration): ${failedParameters.length}`);
    }
    console.log();

    return {
      success: true,
      companyId: String(companyRecord.company_id),
      recordId: result.data?.[0]?.id || "unknown",
      parametersWritten,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Phase 6 Error:", error);
    return {
      success: false,
      parametersWritten: 0,
      timestamp: new Date().toISOString(),
      errors: [String(error)],
    };
  }
}
