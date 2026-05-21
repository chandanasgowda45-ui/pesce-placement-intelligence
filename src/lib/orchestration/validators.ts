import { z } from "zod";
import { COMPANY_FIELDS } from "../../agents/phase2-research";

// Define base validators for field types
export const FieldValidators = {
  string: z.string().min(1, "Field cannot be empty"),
  url: z.string().url("Invalid URL format"),
  email: z.string().email("Invalid email format"),
  number: z.number(),
  rating: z.number().min(0).max(100),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  array: z.array(z.any()),
  object: z.record(z.any()).default({}),
  stringArray: z.array(z.string()).default([]),
  boardMembers: z.array(z.object({
    name: z.string(),
    position: z.string().optional()
  })).default([]),
  keyLeaders: z.array(z.object({
    name: z.string(),
    role: z.string().optional()
  })).default([]),
};

// Map fields to validator types
export function getValidatorForField(fieldName: string) {
  // Explicit field mapping for prioritized structured fields
  const structuredMappings: Record<string, z.ZodTypeAny> = {
    operating_countries: FieldValidators.stringArray,
    key_competitors: FieldValidators.stringArray,
    core_values: FieldValidators.stringArray,
    strategic_priorities: FieldValidators.stringArray,
    focus_sectors: FieldValidators.stringArray,
    competitive_advantages: FieldValidators.stringArray,
    board_members: FieldValidators.boardMembers,
    key_leaders: FieldValidators.keyLeaders,

    // ARRAY(string[]) fields
    pain_points_addressed: FieldValidators.stringArray,
    top_customers: FieldValidators.stringArray,
    unique_differentiators: FieldValidators.stringArray,
    weaknesses_gaps: FieldValidators.stringArray,
    key_challenges_needs: FieldValidators.stringArray,
    industry_associations: FieldValidators.stringArray,
    legal_issues: FieldValidators.stringArray,
    supply_chain_dependencies: FieldValidators.stringArray,
    macro_risks: FieldValidators.stringArray,
    awards_recognitions: FieldValidators.stringArray,
    event_participation: FieldValidators.stringArray,
    warm_intro_pathways: FieldValidators.stringArray,
    key_investors: FieldValidators.stringArray,

    // ARRAY(any/string) fields
    go_to_market_strategy: FieldValidators.stringArray,
    innovation_roadmap: FieldValidators.stringArray,
    product_pipeline: FieldValidators.stringArray,

    // OBJECT fields
    social_media_followers: FieldValidators.object,
    diversity_metrics: FieldValidators.object,
    esg_ratings: FieldValidators.object,
    revenue_mix: FieldValidators.object,

    // NUMERIC fields
    website_rating: FieldValidators.number,
    glassdoor_rating: FieldValidators.number,
    indeed_rating: FieldValidators.number,
    google_rating: FieldValidators.number,
    brand_sentiment_score: FieldValidators.number,
    market_share_percentage: FieldValidators.number,
    airport_commute_time: FieldValidators.number,
    customer_acquisition_cost: FieldValidators.number,
    customer_lifetime_value: FieldValidators.number,
    cac_ltv_ratio: FieldValidators.number,
    yoy_growth_rate: FieldValidators.number,
    burn_rate: FieldValidators.number,
    runway_months: FieldValidators.number,
    annual_revenue: FieldValidators.number,
    annual_profit: FieldValidators.number,
    automation_level: FieldValidators.number,
    valuation: FieldValidators.number,
    total_capital_raised: FieldValidators.number,

    // STRING fields
    profitability_status: FieldValidators.string,
    website_quality: FieldValidators.string,
    website_traffic_rank: FieldValidators.string,
    exit_strategy_history: FieldValidators.string,
    employee_turnover: FieldValidators.string,
    avg_retention_tenure: FieldValidators.string,
    training_spend: FieldValidators.string,
    brand_value: FieldValidators.string,
    tech_adoption_rating: FieldValidators.string,
    r_and_d_investment: FieldValidators.string,
  };

  if (structuredMappings[fieldName]) {
    return structuredMappings[fieldName].optional().nullable();
  }

  if (fieldName.includes("url") || fieldName.includes("link") || fieldName.includes("website")) {
    return FieldValidators.url.optional().nullable();
  }
  if (fieldName.includes("email")) {
    return FieldValidators.email.optional().nullable();
  }
  if (fieldName.includes("rating") || fieldName.includes("score") || fieldName.includes("rank") || fieldName.includes("percentage")) {
    return FieldValidators.rating.optional().nullable();
  }
  if (fieldName.includes("count") || fieldName.includes("size") || fieldName.includes("rate") || fieldName.includes("multiplier") || fieldName.includes("revenue") || fieldName.includes("profit") || fieldName.includes("valuation") || fieldName.includes("capital") || fieldName.includes("months")) {
    return FieldValidators.number.optional().nullable();
  }
  if (fieldName.includes("year") || fieldName.includes("founded") || fieldName.includes("incorporation")) {
    return FieldValidators.year.optional().nullable();
  }
  if (fieldName.includes("list") || fieldName.includes("locations") || fieldName.includes("stack") || fieldName.includes("partners") || fieldName.includes("timeline") || fieldName.includes("news") || fieldName.includes("rounds") || fieldName.includes("indicators") || fieldName.includes("recommendations")) {
    return FieldValidators.array.optional().nullable();
  }
  return FieldValidators.string.optional().nullable();
}

/**
 * Validate a full record against the 163-field schema
 */
export function validateCompanyRecord(data: Record<string, any>) {
  const errors: string[] = [];
  const validatedFields: string[] = [];
  const hallucinatedFields: string[] = [];

  COMPANY_FIELDS.forEach(field => {
    const validator = getValidatorForField(field);
    const result = validator.safeParse(data[field]);
    
    if (result.success) {
      if (data[field] !== undefined && data[field] !== null) {
        validatedFields.push(field);
      }
    } else {
      errors.push(`${field}: ${result.error.errors[0].message}`);
    }
  });

  // Detect hallucinated fields (fields present in data but not in COMPANY_FIELDS)
  Object.keys(data).forEach(key => {
    if (!COMPANY_FIELDS.includes(key)) {
      hallucinatedFields.push(key);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validatedFields,
    hallucinatedFields
  };
}
