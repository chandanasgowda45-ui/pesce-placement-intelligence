/**
 * Shared types for Agent Pipeline
 */

export interface CompanyResearchInput {
  companyName: string;
  overrideFields?: Record<string, unknown>;
}

export interface ResearchAgentOutput {
  llm1Results: Record<string, unknown>;
  llm2Results: Record<string, unknown>;
  llm3Results: Record<string, unknown>;
  timestamp: string;
}

export interface MetadataRule {
  fieldName: string;
  rule: (value: unknown) => { pass: boolean; message?: string };
}

export interface RuleCheckResult {
  fieldName: string;
  pass: boolean;
  message?: string;
  source: "llm1" | "llm2" | "llm3";
}

export interface RuleCheckOutput {
  llm1Violations: RuleCheckResult[];
  llm2Violations: RuleCheckResult[];
  llm3Violations: RuleCheckResult[];
  timestamp: string;
}

export interface ConsolidationOutput {
  goldenRecord: Record<string, unknown>;
  confidenceScores: Record<string, number>;
  sourceTracking: Record<string, "llm1" | "llm2" | "llm3" | "consensus" | "none">;
  timestamp: string;
}

export interface ValidationResult {
  fieldName: string;
  pass: boolean;
  errors: string[];
}

export interface ValidationSuiteOutput {
  results: ValidationResult[];
  passCount: number;
  failCount: number;
  overallPass: boolean;
  timestamp: string;
}

export interface PipelineFailedParameter {
  fieldName: string;
  reason: string;
  lastAttempt: string;
}

export interface PipelineOutput {
  phase: number;
  status: "pending" | "in_progress" | "completed" | "failed" | "regenerating";
  data: any;
  errors?: string[];
  timestamp: string;
}

export interface PipelineState {
  companyName: string;
  phase1: PipelineOutput | null;
  phase2: PipelineOutput | null;
  phase3: PipelineOutput | null;
  phase4: PipelineOutput | null;
  phase5: PipelineOutput | null;
  failedParameters: PipelineFailedParameter[];
  regenerationAttempts: number;
  maxRegenerationAttempts: number;
}
