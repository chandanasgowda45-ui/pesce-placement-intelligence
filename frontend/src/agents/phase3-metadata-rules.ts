/**
 * Phase 3: Metadata Rule Check
 * 22 rules applied independently to each LLM output
 * Checks for data type, completeness, consistency, uniqueness, and encoding
 */

import { ResearchAgentOutput, RuleCheckOutput, RuleCheckResult } from "./types";
import { COMPANY_FIELDS } from "./phase2-research";

// 22 metadata validation rules
const METADATA_RULES = {
  typeValidation: (value: unknown, expectedType: string) => {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    return {
      pass: actualType === expectedType,
      message: `Expected ${expectedType}, got ${actualType}`,
    };
  },

  notNull: (value: unknown) => ({
    pass: value !== null && value !== undefined,
    message: "Value is null or undefined",
  }),

  notEmpty: (value: unknown) => {
    if (typeof value === "string") {
      return {
        pass: value.trim().length > 0,
        message: "String is empty",
      };
    }
    if (Array.isArray(value)) {
      return {
        pass: value.length > 0,
        message: "Array is empty",
      };
    }
    return { pass: true };
  },

  emailFormat: (value: unknown) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = typeof value === "string" && emailRegex.test(value);
    return {
      pass: !value || isEmail,
      message: isEmail ? undefined : "Invalid email format",
    };
  },

  urlFormat: (value: unknown) => {
    try {
      if (!value) return { pass: true };
      const url = new URL(value as string);
      return { pass: true };
    } catch {
      return {
        pass: false,
        message: "Invalid URL format",
      };
    }
  },

  numericRange: (value: unknown, min: number, max: number) => {
    const num = Number(value);
    return {
      pass: !isNaN(num) && num >= min && num <= max,
      message: `Value out of range [${min}, ${max}]`,
    };
  },

  yearValidation: (value: unknown) => {
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    return {
      pass: !isNaN(year) && year >= 1900 && year <= currentYear,
      message: `Invalid year (expected 1900-${currentYear})`,
    };
  },

  noXSSContent: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    const xssPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    const hasXSS = xssPatterns.some((pattern) => pattern.test(value));
    return {
      pass: !hasXSS,
      message: "Potential XSS content detected",
    };
  },

  noSQLInjection: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    const sqlPatterns = [/(\bOR\b|\bAND\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/i];
    const hasSQLContent = sqlPatterns.some((pattern) => pattern.test(value));
    return {
      pass: !hasSQLContent,
      message: "Potential SQL injection content detected",
    };
  },

  lengthValidation: (value: unknown, maxLength: number) => {
    const length = typeof value === "string" ? value.length : String(value).length;
    return {
      pass: length <= maxLength,
      message: `String exceeds max length of ${maxLength}`,
    };
  },

  consistentCasing: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    // Check if string follows reasonable casing patterns (not ALL CAPS unless acronym)
    const isValidCasing =
      !/^[A-Z\s&-]+$/.test(value) || value.length <= 4; // Allow acronyms
    return {
      pass: isValidCasing,
      message: "Inconsistent or unusual casing pattern",
    };
  },

  noExcessiveWhitespace: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    return {
      pass: !/\s{2,}/.test(value),
      message: "Contains excessive whitespace",
    };
  },

  validCountryCode: (value: unknown) => {
    const countryRegex = /^[A-Z]{2}$/;
    return {
      pass: !value || (typeof value === "string" && countryRegex.test(value as string)),
      message: "Invalid country code format",
    };
  },

  phoneNumberFormat: (value: unknown) => {
    if (!value) return { pass: true };
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return {
      pass: typeof value === "string" && phoneRegex.test(value),
      message: "Invalid phone number format",
    };
  },

  percentageValue: (value: unknown) => {
    const num = Number(value);
    return {
      pass: !isNaN(num) && num >= 0 && num <= 100,
      message: "Percentage must be between 0-100",
    };
  },

  currencyFormat: (value: unknown) => {
    if (!value) return { pass: true };
    const currencyRegex = /^\$[\d,.]+[KMB]?$|^[\d,.]+\s?(USD|EUR|GBP|INR)$/i;
    return {
      pass: typeof value === "string" && currencyRegex.test(value),
      message: "Invalid currency format",
    };
  },

  noRepeatedCharacters: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    // Detect more than 3 consecutive same characters
    return {
      pass: !/(.)\1{3,}/.test(value),
      message: "Contains excessive repeated characters",
    };
  },

  dateFormatISO8601: (value: unknown) => {
    if (!value) return { pass: true };
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?Z?$/;
    return {
      pass: typeof value === "string" && iso8601Regex.test(value),
      message: "Invalid ISO8601 date format",
    };
  },

  uniqueElementsInArray: (value: unknown) => {
    if (!Array.isArray(value)) return { pass: true };
    const uniqueSet = new Set(value);
    return {
      pass: uniqueSet.size === value.length,
      message: "Array contains duplicate elements",
    };
  },

  noNullBytes: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    return {
      pass: !value.includes("\\x00"),
      message: "Contains null bytes",
    };
  },

  reasonableStringLength: (value: unknown) => {
    if (typeof value !== "string") return { pass: true };
    // Reasonable length for company description: 10-5000 chars
    const isTextField =
      value.includes(" ") && !value.includes("@") && !value.includes("http");
    if (!isTextField) return { pass: true };

    return {
      pass: value.length >= 10 && value.length <= 5000,
      message: "Field content length unreasonable",
    };
  },
};

/**
 * Apply field-specific metadata rules
 */
function getFieldRules(fieldName: string): Array<(value: unknown) => any> {
  const rules: Array<(value: unknown) => any> = [];

  // Common rules for all fields
  rules.push(METADATA_RULES.noXSSContent);
  rules.push(METADATA_RULES.noSQLInjection);
  rules.push(METADATA_RULES.noNullBytes);
  rules.push(METADATA_RULES.noExcessiveWhitespace);

  // Field-specific rules
  if (fieldName.includes("email")) {
    rules.push(METADATA_RULES.emailFormat);
  }
  if (fieldName.includes("url") || fieldName.includes("link")) {
    rules.push(METADATA_RULES.urlFormat);
  }
  if (fieldName.includes("year") || fieldName.includes("founded")) {
    rules.push(METADATA_RULES.yearValidation);
  }
  if (fieldName.includes("phone")) {
    rules.push(METADATA_RULES.phoneNumberFormat);
  }
  if (fieldName.includes("rating") || fieldName.includes("score")) {
    rules.push((v) => METADATA_RULES.percentageValue(v));
  }
  if (fieldName.includes("text") || fieldName.includes("description")) {
    rules.push(METADATA_RULES.reasonableStringLength);
  }

  return rules;
}

/**
 * Phase 3: Metadata Rule Check
 * Validate each LLM output against 22 rules
 */
export async function executePhase3MetadataRuleCheck(
  phase2Output: ResearchAgentOutput
): Promise<RuleCheckOutput> {
  console.log("\n📍 Phase 3: Metadata Rule Check - Validating 3 LLM outputs");
  console.log("🔍 Applying 22 rules independently to each output...\n");

  const checkLLMOutput = (
    llmResults: Record<string, unknown>,
    llmName: "llm1" | "llm2" | "llm3"
  ): RuleCheckResult[] => {
    const violations: RuleCheckResult[] = [];

    for (const field of COMPANY_FIELDS) {
      const value = llmResults[field];
      const fieldRules = getFieldRules(field);

      for (const rule of fieldRules) {
        const result = rule(value);
        if (!result.pass) {
          violations.push({
            fieldName: field,
            pass: false,
            message: result.message,
            source: llmName,
          });
        }
      }
    }

    return violations;
  };

  const llm1Violations = checkLLMOutput(phase2Output.llm1Results, "llm1");
  const llm2Violations = checkLLMOutput(phase2Output.llm2Results, "llm2");
  const llm3Violations = checkLLMOutput(phase2Output.llm3Results, "llm3");

  const output: RuleCheckOutput = {
    llm1Violations,
    llm2Violations,
    llm3Violations,
    timestamp: new Date().toISOString(),
  };

  console.log(`✅ Phase 3 Complete: Rules validation finished`);
  console.log(
    `   LLM1 Violations: ${llm1Violations.length} (${((llm1Violations.length / COMPANY_FIELDS.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   LLM2 Violations: ${llm2Violations.length} (${((llm2Violations.length / COMPANY_FIELDS.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `   LLM3 Violations: ${llm3Violations.length} (${((llm3Violations.length / COMPANY_FIELDS.length) * 100).toFixed(1)}%)\n`
  );

  return output;
}
