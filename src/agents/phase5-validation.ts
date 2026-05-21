/**
 * Phase 5: Validation Suite Tool Layer
 * Full QA check on all 163 golden record parameters.
 * This module is a tool layer within the agent ecosystem and does not host a standalone LLM.
 * It validates the consolidated golden record before persistence.
 */

import { ConsolidationOutput, ValidationSuiteOutput, ValidationResult } from "./types";
import { COMPANY_FIELDS } from "./phase2-research";

// Validation schemas per field category
const VALIDATION_SCHEMAS: Record<string, (value: unknown, ...args: any[]) => string[]> = {
  // String fields
  stringField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (typeof value !== "string") {
      errors.push(`Expected string, got ${typeof value}`);
    } else {
      if (value.length === 0) errors.push("String cannot be empty");
      if (value.length > 5000) errors.push("String exceeds max length of 5000");
    }
    return errors;
  },

  // Email fields
  emailField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (value && typeof value !== "string") {
      errors.push("Email must be a string");
    } else if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) errors.push("Invalid email format");
    }
    return errors;
  },

  // URL fields
  urlField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (value && typeof value !== "string") {
      errors.push("URL must be a string");
    } else if (value) {
      try {
        new URL(value as string);
      } catch {
        errors.push("Invalid URL format");
      }
    }
    return errors;
  },

  // Numeric fields
  numericField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (value !== null && value !== undefined) {
      const num = Number(value);
      if (isNaN(num)) errors.push(`Expected number, got ${typeof value}`);
    }
    return errors;
  },

  // Year fields
  yearField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (value) {
      const year = Number(value);
      if (isNaN(year)) errors.push("Year must be numeric");
      if (year < 1900 || year > new Date().getFullYear()) {
        errors.push(`Year out of valid range (1900-${new Date().getFullYear()})`);
      }
    }
    return errors;
  },

  // Rating/Score fields (0-100)
  ratingField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (value !== null && value !== undefined) {
      const num = Number(value);
      if (isNaN(num)) errors.push("Rating must be numeric");
      if (num < 0 || num > 100) errors.push("Rating must be between 0-100");
    }
    return errors;
  },

  // Array fields
  arrayField: (value: unknown): string[] => {
    const errors: string[] = [];
    if (value && !Array.isArray(value)) {
      errors.push(`Expected array, got ${typeof value}`);
    } else if (Array.isArray(value)) {
      // Check for duplicates
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push("Array contains duplicate elements");
          break;
        }
        seen.add(key);
      }
    }
    return errors;
  },

  // Enum fields (specific allowed values)
  // Enum fields (specific allowed values)
  enumField: (value: unknown, allowedValues: string[] = []): string[] => {
    const errors: string[] = [];
    if (value && !allowedValues.includes(String(value))) {
      errors.push(
        `Invalid value. Must be one of: ${allowedValues.join(", ")}`
      );
    }
    return errors;
  },
};

/**
 * Get validation schema for a specific field
 */
function getValidationSchema(fieldName: string): (value: unknown, ...args: any[]) => string[] {
  // URL fields
  if (
    fieldName.includes("url") ||
    fieldName.includes("link") ||
    fieldName.includes("website")
  ) {
    return VALIDATION_SCHEMAS.urlField;
  }

  // Email fields
  if (fieldName.includes("email")) {
    return VALIDATION_SCHEMAS.emailField;
  }

  // Phone fields
  if (fieldName.includes("phone")) {
    return (value: unknown) => {
      const errors: string[] = [];
      if (value && typeof value !== "string") {
        errors.push("Phone must be a string");
      } else if (value) {
        const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
        if (!phoneRegex.test(value as string)) errors.push("Invalid phone format");
      }
      return errors;
    };
  }

  // Year fields
  if (fieldName.includes("year") || fieldName.includes("founded")) {
    return VALIDATION_SCHEMAS.yearField;
  }

  // Rating/Score fields
  if (fieldName.includes("rating") || fieldName.includes("score")) {
    return VALIDATION_SCHEMAS.ratingField;
  }

  // Numeric fields
  if (fieldName.includes("count") || fieldName.includes("revenue") || fieldName.includes("burn")) {
    return VALIDATION_SCHEMAS.numericField;
  }

  // Array fields
  if (fieldName.includes("partners") || fieldName.includes("locations") || fieldName.includes("list")) {
    return VALIDATION_SCHEMAS.arrayField;
  }

  // Default to string field
  return VALIDATION_SCHEMAS.stringField;
}

/**
 * Phase 5: Validation Suite
 * Perform comprehensive QA on all 163 parameters
 */
export async function executePhase5ValidationSuite(
  phase4Output: ConsolidationOutput
): Promise<ValidationSuiteOutput> {
  console.log("\n📍 Phase 5: Validation Suite - Full QA check");
  console.log(`✓ Validating all 163 golden record parameters...\n`);

  const results: ValidationResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (const field of COMPANY_FIELDS) {
    const value = phase4Output.goldenRecord[field];
    const confidence = phase4Output.confidenceScores[field];

    // Skip validation for very low confidence fields
    if (confidence < 0.2) {
      results.push({
        fieldName: field,
        pass: false,
        errors: ["Field confidence below threshold (< 0.2)"],
      });
      failCount++;
      continue;
    }

    const validator = getValidationSchema(field);
    const validationErrors = validator(value);

    const pass = validationErrors.length === 0;

    results.push({
      fieldName: field,
      pass,
      errors: validationErrors,
    });

    if (pass) {
      passCount++;
    } else {
      failCount++;
    }
  }

  const output: ValidationSuiteOutput = {
    results,
    passCount,
    failCount,
    overallPass: failCount === 0,
    timestamp: new Date().toISOString(),
  };

  console.log(`✅ Phase 5 Complete: Validation Suite results`);
  console.log(`   ✓ PASS: ${passCount}/${COMPANY_FIELDS.length} fields`);
  console.log(`   ✗ FAIL: ${failCount}/${COMPANY_FIELDS.length} fields`);
  console.log(
    `   Overall Status: ${output.overallPass ? "✅ PASS" : "⚠️  NEEDS REVIEW"}\n`
  );

  // Show failed fields
  if (failCount > 0 && failCount <= 10) {
    console.log("Failed fields:");
    results
      .filter((r) => !r.pass)
      .slice(0, 10)
      .forEach((r) => {
        console.log(`   • ${r.fieldName}: ${r.errors.join(", ")}`);
      });
    if (failCount > 10) {
      console.log(`   ... and ${failCount - 10} more\n`);
    } else {
      console.log();
    }
  }

  return output;
}
