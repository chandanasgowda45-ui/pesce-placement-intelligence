import { Annotation } from "@langchain/langgraph";
import { Company } from "../../types/company";

export interface ProviderResult {
  provider: string;
  data: Record<string, any>;
  validation: {
    isValid: boolean;
    errors: string[];
    validatedFields: string[];
    hallucinatedFields: string[];
  };
}

export const OrchestrationStateAnnotation = Annotation.Root({
  // Inputs
  query: Annotation<string>(),
  companyName: Annotation<string>(),
  companyId: Annotation<string | undefined>(),
  company_name: Annotation<string>({
    reducer: (old, newVal) => newVal ?? old,
    default: () => ""
  }),
  country: Annotation<string | undefined>({
    reducer: (old, newVal) => newVal ?? old,
    default: () => undefined
  }),
  research_data: Annotation<Record<string, any>>({
    reducer: (old, newVal) => ({ ...(old || {}), ...(newVal || {}) }),
    default: () => ({})
  }),
  validation_results: Annotation<Record<string, any>>({
    reducer: (old, newVal) => ({ ...(old || {}), ...(newVal || {}) }),
    default: () => ({})
  }),
  golden_record: Annotation<Record<string, any>>({
    reducer: (old, newVal) => ({ ...(old || {}), ...(newVal || {}) }),
    default: () => ({})
  }),
  failed_parameters: Annotation<string[]>({
    reducer: (old, newVal) => newVal || [],
    default: () => []
  }),
  retry_count: Annotation<number>({
    reducer: (old, newVal) => (typeof newVal === "number" ? newVal : old),
    default: () => 0
  }),
  
  // Parallel Research Results
  providerResults: Annotation<Record<string, ProviderResult>>({
    reducer: (old, newVal) => ({ ...old, ...newVal }),
    default: () => ({}),
  }),
  
  // Consolidation
  goldenRecord: Annotation<Partial<Company>>(),
  confidenceScores: Annotation<Record<string, number>>(),
  
  // Final Validation
  isFinalValidated: Annotation<boolean>(),
  finalValidationErrors: Annotation<string[]>(),
  
  // Retry Logic
  retryCount: Annotation<number>({
    reducer: (old, newVal) => newVal,
    default: () => 0,
  }),
  fieldsToRetry: Annotation<string[]>({
    reducer: (old, newVal) => newVal,
    default: () => [],
  }),
  retrySummary: Annotation<string[]>({
    reducer: (old, newVal) => [...old, ...newVal],
    default: () => [],
  }),

  // Metadata
  metadata: Annotation<{
    startTime: string;
    endTime?: string;
    traceId?: string;
    steps: string[];
    providersUsed: string[];
    companyName?: string;
    validationScore?: number;
    confidenceScore?: number;
    schemaValidationStatus?: string;
    retryCount?: number;
    retrySummary?: string[];
    orchestrationStatus?: string;
    providerCount?: number;
    failedProviders?: string[];
    executionDuration?: string;
  }>({
    reducer: (old, newVal) => {
      const merged = { ...(old || {}), ...(newVal || {}) };
      // Ensure required fields have defaults
      return {
        steps: merged.steps || [],
        providersUsed: merged.providersUsed || [],
        retrySummary: merged.retrySummary || [],
        retryCount: merged.retryCount || 0,
        failedProviders: merged.failedProviders || [],
        startTime: merged.startTime || new Date().toISOString(),
        ...merged
      };
    },
    default: () => ({
      steps: [],
      providersUsed: [],
      retrySummary: [],
      retryCount: 0,
      failedProviders: [],
      startTime: new Date().toISOString()
    })
  }),
});

export type OrchestrationState = typeof OrchestrationStateAnnotation.State;
