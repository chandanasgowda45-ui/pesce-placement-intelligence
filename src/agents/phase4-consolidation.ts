/**
 * Phase 4: Consolidation Agent
 * Merges 3 LLM outputs into one 163-field golden record
 * Uses consensus voting, confidence scoring, and source tracking
 */

import {
  ResearchAgentOutput,
  RuleCheckOutput,
  ConsolidationOutput,
} from "./types";
import { COMPANY_FIELDS } from "./phase2-research";

interface FieldCandidate {
  value: unknown;
  source: "llm1" | "llm2" | "llm3";
  violations: number;
}

/**
 * Calculate similarity between two values
 */
function calculateSimilarity(val1: unknown, val2: unknown): number {
  const str1 = JSON.stringify(val1).toLowerCase();
  const str2 = JSON.stringify(val2).toLowerCase();

  if (str1 === str2) return 1.0;

  // Levenshtein distance for string similarity
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Consolidate field values from 3 sources using voting and scoring
 */
function consolidateFieldValue(
  llm1Value: unknown,
  llm2Value: unknown,
  llm3Value: unknown,
  llm1Violations: number,
  llm2Violations: number,
  llm3Violations: number
): { value: unknown; confidence: number; source: "llm1" | "llm2" | "llm3" | "consensus" | "none" } {
  // Collect candidates
  const candidates: FieldCandidate[] = [
    { value: llm1Value, source: "llm1" as const, violations: llm1Violations },
    { value: llm2Value, source: "llm2" as const, violations: llm2Violations },
    { value: llm3Value, source: "llm3" as const, violations: llm3Violations },
  ].filter((c) => c.value !== undefined && c.value !== null) as FieldCandidate[];

  if (candidates.length === 0) {
    return { value: null, confidence: 0, source: "none" };
  }

  if (candidates.length === 1) {
    return {
      value: candidates[0].value,
      confidence: Math.max(0, 1 - candidates[0].violations * 0.1),
      source: candidates[0].source,
    };
  }

  // Calculate consensus score for each candidate
  const consensusScores: Record<string, number> = {};

  candidates.forEach((candidate) => {
    let score = 1;

    // Compare against other candidates
    candidates.forEach((other) => {
      if (candidate.source !== other.source) {
        score += calculateSimilarity(candidate.value, other.value) * 0.5;
      }
    });

    // Factor in violations (lower is better)
    const violationPenalty = candidate.violations * 0.15;
    score *= Math.max(0, 1 - violationPenalty);

    consensusScores[candidate.source] = score;
  });

  // Select best candidate
  const [bestSource, bestScore] = Object.entries(consensusScores).reduce(
    (prev, curr) => (curr[1] > prev[1] ? curr : prev),
    (["none", 0] as ["llm1" | "llm2" | "llm3" | "consensus" | "none", number])
  );

  const bestCandidate = candidates.find((c) => c.source === bestSource);

  if (!bestCandidate) {
    return { value: null, confidence: 0, source: "none" };
  }

  // Normalize confidence (0-1)
  const confidence = Math.min(1, Math.max(0, bestScore / 3));

  // Check for consensus (all 3 agree)
  const allAgree =
    calculateSimilarity(llm1Value, llm2Value) > 0.8 &&
    calculateSimilarity(llm2Value, llm3Value) > 0.8;

  return {
    value: bestCandidate.value,
    confidence: allAgree ? 0.95 : confidence,
    source: (allAgree ? "consensus" : bestSource) as "llm1" | "llm2" | "llm3" | "consensus" | "none",
  };
}

/**
 * Phase 4: Consolidation Agent
 * Merge 3 LLM outputs into one golden record
 */
export async function executePhase4ConsolidationAgent(
  phase2Output: ResearchAgentOutput,
  phase3Output: RuleCheckOutput
): Promise<ConsolidationOutput> {
  console.log("\n📍 Phase 4: Consolidation Agent - Merging 3 LLM outputs");
  console.log(
    `📊 Creating 163-field golden record with confidence scoring...\n`
  );

  const goldenRecord: Record<string, unknown> = {};
  const confidenceScores: Record<string, number> = {};
  const sourceTracking: Record<string, "llm1" | "llm2" | "llm3" | "consensus" | "none"> =
    {};

  // Count violations per field for each LLM
  const violationCounts: Record<string, Record<string, number>> = {
    llm1: {},
    llm2: {},
    llm3: {},
  };

  phase3Output.llm1Violations.forEach((v) => {
    violationCounts.llm1[v.fieldName] =
      (violationCounts.llm1[v.fieldName] || 0) + 1;
  });
  phase3Output.llm2Violations.forEach((v) => {
    violationCounts.llm2[v.fieldName] =
      (violationCounts.llm2[v.fieldName] || 0) + 1;
  });
  phase3Output.llm3Violations.forEach((v) => {
    violationCounts.llm3[v.fieldName] =
      (violationCounts.llm3[v.fieldName] || 0) + 1;
  });

  // Consolidate each field
  for (const field of COMPANY_FIELDS) {
    const llm1Value = phase2Output.llm1Results[field];
    const llm2Value = phase2Output.llm2Results[field];
    const llm3Value = phase2Output.llm3Results[field];

    const llm1Vios = violationCounts.llm1[field] || 0;
    const llm2Vios = violationCounts.llm2[field] || 0;
    const llm3Vios = violationCounts.llm3[field] || 0;

    const consolidated = consolidateFieldValue(
      llm1Value,
      llm2Value,
      llm3Value,
      llm1Vios,
      llm2Vios,
      llm3Vios
    );

    goldenRecord[field] = consolidated.value;
    confidenceScores[field] = consolidated.confidence;
    sourceTracking[field] = consolidated.source;
  }

  const output: ConsolidationOutput = {
    goldenRecord,
    confidenceScores,
    sourceTracking,
    timestamp: new Date().toISOString(),
  };

  // Calculate aggregate stats
  const avgConfidence =
    Object.values(confidenceScores).reduce((a, b) => a + b, 0) /
    COMPANY_FIELDS.length;
  const consensusCount = Object.values(sourceTracking).filter(
    (s) => s === "consensus"
  ).length;

  console.log(`✅ Phase 4 Complete: Golden record consolidated`);
  console.log(`   Average Confidence Score: ${(avgConfidence * 100).toFixed(1)}%`);
  console.log(
    `   Consensus Fields (all 3 LLMs agreed): ${consensusCount}/${COMPANY_FIELDS.length}`
  );
  console.log(`   Fields from LLM1: ${Object.values(sourceTracking).filter((s) => s === "llm1").length}`);
  console.log(`   Fields from LLM2: ${Object.values(sourceTracking).filter((s) => s === "llm2").length}`);
  console.log(`   Fields from LLM3: ${Object.values(sourceTracking).filter((s) => s === "llm3").length}\n`);

  return output;
}
