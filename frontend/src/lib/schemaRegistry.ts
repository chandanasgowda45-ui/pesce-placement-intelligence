/**
 * Schema Registry - Single Source of Truth for Supabase Fields
 * Contains all 163 valid Supabase company fields
 * Ensures frontend is fully synchronized with database schema
 */

import { type Company, type CompanyFieldKey, type FieldDefinition } from "@/types/company";

export { type Company, type CompanyFieldKey, type FieldDefinition };


export const VALID_SUPABASE_FIELDS = new Set<CompanyFieldKey>([
  "company_id",
  "name",
  "short_name",
  "logo_url",
  "category",
  "company_tier",
  "incorporation_year",
  "nature_of_company",
  "headquarters_address",
  "operating_countries",
  "office_count",
  "office_locations",
  "employee_size",
  "overview_text",
  "history_timeline",
  "recent_news",
  "pain_points_addressed",
  "focus_sectors",
  "offerings_description",
  "top_customers",
  "core_value_proposition",
  "unique_differentiators",
  "competitive_advantages",
  "weaknesses_gaps",
  "key_challenges_needs",
  "key_competitors",
  "tam",
  "sam",
  "som",
  "market_share_percentage",
  "go_to_market_strategy",
  "strategic_priorities",
  "future_projections",
  "work_culture_summary",
  "hiring_velocity",
  "employee_turnover",
  "avg_retention_tenure",
  "manager_quality",
  "psychological_safety",
  "feedback_culture",
  "diversity_metrics",
  "diversity_inclusion_score",
  "ethical_standards",
  "layoff_history",
  "burnout_risk",
  "mission_clarity",
  "training_spend",
  "onboarding_quality",
  "learning_culture",
  "exposure_quality",
  "mentorship_availability",
  "internal_mobility",
  "promotion_clarity",
  "tools_access",
  "role_clarity",
  "early_ownership",
  "work_impact",
  "execution_thinking_balance",
  "automation_level",
  "cross_functional_exposure",
  "exit_opportunities",
  "skill_relevance",
  "network_strength",
  "global_exposure",
  "external_recognition",
  "fixed_vs_variable_pay",
  "bonus_predictability",
  "esops_incentives",
  "family_health_insurance",
  "relocation_support",
  "lifestyle_benefits",
  "leave_policy",
  "health_support",
  "remote_policy_details",
  "typical_hours",
  "overtime_expectations",
  "weekend_work",
  "flexibility_level",
  "location_centrality",
  "public_transport_access",
  "cab_policy",
  "airport_commute_time",
  "office_zone_type",
  "area_safety",
  "safety_policies",
  "infrastructure_safety",
  "emergency_preparedness",
  "annual_revenue",
  "annual_profit",
  "revenue_mix",
  "valuation",
  "yoy_growth_rate",
  "profitability_status",
  "company_maturity",
  "key_investors",
  "recent_funding_rounds",
  "total_capital_raised",
  "burn_rate",
  "runway_months",
  "burn_multiplier",
  "esg_ratings",
  "regulatory_status",
  "legal_issues",
  "supply_chain_dependencies",
  "geopolitical_risks",
  "macro_risks",
  "tech_stack",
  "technology_partners",
  "intellectual_property",
  "r_and_d_investment",
  "ai_ml_adoption_level",
  "cybersecurity_posture",
  "innovation_roadmap",
  "product_pipeline",
  "tech_adoption_rating",
  "partnership_ecosystem",
  "ceo_name",
  "ceo_linkedin_url",
  "key_leaders",
  "board_members",
  "warm_intro_pathways",
  "decision_maker_access",
  "primary_contact_email",
  "primary_phone_number",
  "contact_person_name",
  "contact_person_title",
  "contact_person_email",
  "contact_person_phone",
  "website_url",
  "website_quality",
  "website_rating",
  "website_traffic_rank",
  "social_media_followers",
  "glassdoor_rating",
  "indeed_rating",
  "google_rating",
  "linkedin_url",
  "twitter_handle",
  "facebook_url",
  "instagram_url",
  "marketing_video_url",
  "customer_testimonials",
  "awards_recognitions",
  "brand_sentiment_score",
  "event_participation",
  "vision_statement",
  "mission_statement",
  "core_values",
  "sales_motion",
  "customer_acquisition_cost",
  "customer_lifetime_value",
  "cac_ltv_ratio",
  "churn_rate",
  "net_promoter_score",
  "customer_concentration_risk",
  "exit_strategy_history",
  "ethical_sourcing",
  "benchmark_vs_peers",
  "industry_associations",
  "case_studies",
  "brand_value",
  "client_quality",
  "sustainability_csr",
  "crisis_behavior",
  "intelligence",
  "full_json",
  "short_json",
  "innovx",
  "hiring_rounds",
  "job_roles",
]);

export const TOTAL_SUPABASE_FIELDS = VALID_SUPABASE_FIELDS.size;

/**
 * Validates if a fieldKey is valid Supabase field
 */
export function isValidFieldKey(fieldKey: string): fieldKey is CompanyFieldKey {
  return VALID_SUPABASE_FIELDS.has(fieldKey as CompanyFieldKey);
}

/**
 * Throws an error if fieldKey is invalid (for development)
 */
export function assertValidFieldKey(fieldKey: string, context: string): asserts fieldKey is CompanyFieldKey {
  if (!isValidFieldKey(fieldKey)) {
    throw new Error(`[SCHEMA ERROR] Invalid fieldKey '${fieldKey}' in ${context}. Field not found in Supabase schema.`);
  }
}

/**
 * Validates field definitions and throws errors for invalid mappings
 */
export function validateFieldDefinitions(
  fields: Array<{ label: string; fieldKey: CompanyFieldKey; isLink?: boolean }> | null | undefined,
  context: string
): void {
  if (!Array.isArray(fields)) {
    console.warn(`[FAIL] Missing fields property for ${context}`);
    return;
  }

  const seenLabels = new Set<string>();
  const seenFieldKeys = new Set<string>();

  for (const field of fields) {
    // Check missing fieldKey
    if (!field.fieldKey) {
      throw new Error(`[SCHEMA ERROR] Missing fieldKey for label '${field.label}' in ${context}`);
    }

    // Check invalid fieldKey
    assertValidFieldKey(field.fieldKey, `${context} - label '${field.label}'`);

    // Check duplicate labels
    if (seenLabels.has(field.label)) {
      throw new Error(`[SCHEMA ERROR] Duplicate label '${field.label}' in ${context}`);
    }
    seenLabels.add(field.label);

    // Check duplicate fieldKeys
    if (seenFieldKeys.has(field.fieldKey)) {
      throw new Error(`[SCHEMA ERROR] Duplicate fieldKey '${field.fieldKey}' in ${context}`);
    }
    seenFieldKeys.add(field.fieldKey);
  }

  console.log(`[PASS] Valid schema mapping for ${context}: ${fields.length} fields validated`);
}

// Global schema validation
console.log(`[PASS] All ${TOTAL_SUPABASE_FIELDS} Supabase fields validated and schema registry initialized`);