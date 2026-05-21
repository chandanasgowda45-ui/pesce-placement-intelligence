/**
 * Phase 2: Research Agent
 * Orchestrates 3 LLMs in parallel to research 163 company parameters
 * Each LLM independently researches and returns its own set of findings
 */

import { CompanyResearchInput, ResearchAgentOutput } from "./types";

// 163 core company fields to research
const COMPANY_FIELDS = [
  // Overview (18 fields)
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
  "vision_statement",
  "mission_statement",
  "core_values",

  // Business & Market (23 fields)
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
  "sales_motion",
  "customer_concentration_risk",
  "exit_strategy_history",
  "benchmark_vs_peers",
  "industry_associations",
  "case_studies",

  // Culture & People (15 fields)
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
  "sustainability_csr",
  "crisis_behavior",

  // Growth & Career (22 fields)
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
  "company_maturity",
  "brand_value",
  "client_quality",

  // Compensation (9 fields)
  "fixed_vs_variable_pay",
  "bonus_predictability",
  "esops_incentives",
  "family_health_insurance",
  "relocation_support",
  "lifestyle_benefits",
  "leave_policy",
  "health_support",
  "ethical_sourcing",

  // Work Logistics (14 fields)
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

  // Financials (23 fields)
  "annual_revenue",
  "annual_profit",
  "revenue_mix",
  "valuation",
  "yoy_growth_rate",
  "profitability_status",
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
  "customer_acquisition_cost",
  "customer_lifetime_value",
  "cac_ltv_ratio",
  "churn_rate",
  "net_promoter_score",

  // Technology (10 fields)
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

  // Leadership (12 fields)
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

  // Brand (17 fields)
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
  "event_participation"
];

interface LLMConfig {
  name: "llm1" | "llm2" | "llm3";
  model: string;
  apiKey?: string;
}

/**
 * Mock LLM research - replace with actual LLM calls
 */
async function callLLMResearch(
  companyName: string,
  llmConfig: LLMConfig
): Promise<Record<string, unknown>> {
  console.log(`🔍 [${llmConfig.name}] Researching ${companyName} with ${llmConfig.model}`);

  // In production, this would call actual LLM API (Claude, GPT, etc.)
  // For now, return mock data structure
  const mockResults: Record<string, unknown> = {};

  for (const field of COMPANY_FIELDS) {
    // Simulate research delay
    await new Promise((resolve) => setTimeout(resolve, 5));

    // Generate mock values based on field type
    if (field.includes("url") || field.includes("email") || field.includes("phone")) {
      mockResults[field] = `https://example.com/${field}`;
    } else if (field.includes("rating") || field.includes("score") || field.includes("rank")) {
      mockResults[field] = Math.floor(Math.random() * 100);
    } else if (field.includes("count") || field.includes("size")) {
      mockResults[field] = Math.floor(Math.random() * 10000);
    } else if (field.includes("year")) {
      mockResults[field] = 2024 - Math.floor(Math.random() * 20);
    } else {
      mockResults[field] = `${llmConfig.name} research on ${field}`;
    }
  }

  return mockResults;
}

/**
 * Phase 2: Research Agent
 * Runs 3 LLMs in parallel and aggregates their outputs
 */
export async function executePhase2ResearchAgent(
  input: CompanyResearchInput
): Promise<ResearchAgentOutput> {
  console.log(`\n📍 Phase 2: Research Agent - Researching "${input.companyName}"`);
  console.log("🚀 Starting 3 LLMs in parallel...\n");

  const llmConfigs: LLMConfig[] = [
    { name: "llm1", model: "claude-opus" },
    { name: "llm2", model: "gpt-4" },
    { name: "llm3", model: "claude-sonnet" },
  ];

  try {
    // Execute all 3 LLM calls in parallel
    const [llm1Results, llm2Results, llm3Results] = await Promise.all([
      callLLMResearch(input.companyName, llmConfigs[0]),
      callLLMResearch(input.companyName, llmConfigs[1]),
      callLLMResearch(input.companyName, llmConfigs[2]),
    ]);

    const output: ResearchAgentOutput = {
      llm1Results,
      llm2Results,
      llm3Results,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Phase 2 Complete: 3 LLMs researched ${COMPANY_FIELDS.length} fields`);
    console.log(`   LLM1: ${Object.keys(llm1Results).length} fields`);
    console.log(`   LLM2: ${Object.keys(llm2Results).length} fields`);
    console.log(`   LLM3: ${Object.keys(llm3Results).length} fields\n`);

    return output;
  } catch (error) {
    console.error("❌ Phase 2 Error:", error);
    throw error;
  }
}

export { COMPANY_FIELDS };
