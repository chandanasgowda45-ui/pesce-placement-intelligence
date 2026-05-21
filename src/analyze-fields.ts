import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

function getEnvValue(key: string): string {
  return process.env[key] || "";
}

function resolveSupabaseConfig() {
  const url = getEnvValue("VITE_SUPABASE_URL") || getEnvValue("SUPABASE_URL");
  const key =
    getEnvValue("VITE_SUPABASE_ANON_KEY") ||
    getEnvValue("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    getEnvValue("SUPABASE_ANON_KEY") ||
    getEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    console.error("❌ Missing Supabase environment variables.");
    process.exit(1);
  }

  return { url, key };
}

const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  global: { headers: { "X-Client-Info": "field-analysis" } },
});

async function analyzeFieldPresence() {
  console.log("🔍 Analyzing actual field presence in Supabase data\n");

  const { data: companies, error } = await supabase
    .from("companies_json")
    .select("company_id, short_json, full_json")
    .limit(5); // Analyze first 5 companies

  if (error) {
    console.error("Error fetching companies:", error);
    return;
  }

  if (!companies || companies.length === 0) {
    console.log("No companies found");
    return;
  }

  const fieldCounts: { [key: string]: number } = {};
  const totalCompanies = companies.length;

  for (const company of companies) {
    const flattened = {
      company_id: company.company_id,
      ...(company.short_json || {}),
      ...(company.full_json || {}),
    };

    for (const [key, value] of Object.entries(flattened)) {
      if (value !== null && value !== undefined && value !== "") {
        fieldCounts[key] = (fieldCounts[key] || 0) + 1;
      }
    }
  }

  console.log(`📊 Field presence analysis (${totalCompanies} companies sampled):\n`);

  // Sort by presence percentage
  const sortedFields = Object.entries(fieldCounts)
    .map(([field, count]) => ({
      field,
      count,
      percentage: Math.round((count / totalCompanies) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  console.log("Field".padEnd(30), "Present", "Percentage");
  console.log("-".repeat(50));

  for (const { field, count, percentage } of sortedFields) {
    console.log(
      field.padEnd(30),
      `${count}/${totalCompanies}`.padStart(8),
      `${percentage}%`.padStart(10)
    );
  }

  console.log(`\n📈 Total unique fields found: ${sortedFields.length}`);

  // Show fields that are always present
  const alwaysPresent = sortedFields.filter(f => f.percentage === 100);
  console.log(`✅ Fields always present (${alwaysPresent.length}):`);
  alwaysPresent.forEach(f => console.log(`   • ${f.field}`));

  // Show fields that are sometimes present
  const sometimesPresent = sortedFields.filter(f => f.percentage > 0 && f.percentage < 100);
  console.log(`⚠️  Fields sometimes present (${sometimesPresent.length}):`);
  sometimesPresent.slice(0, 10).forEach(f => console.log(`   • ${f.field} (${f.percentage}%)`));
  if (sometimesPresent.length > 10) {
    console.log(`   ... and ${sometimesPresent.length - 10} more`);
  }

  // Show fields that are never present
  const expectedFields = [
    "company_id", "name", "short_name", "logo_url", "category", "company_tier",
    "incorporation_year", "nature_of_company", "headquarters_address", "operating_countries",
    "office_count", "office_locations", "employee_size", "overview_text", "history_timeline", "recent_news",
    "pain_points_addressed", "focus_sectors", "offerings_description", "top_customers",
    "core_value_proposition", "unique_differentiators", "competitive_advantages", "weaknesses_gaps",
    "key_challenges_needs", "key_competitors", "tam", "sam", "som", "market_share_percentage",
    "go_to_market_strategy", "strategic_priorities", "future_projections",
    "work_culture_summary", "hiring_velocity", "employee_turnover", "avg_retention_tenure",
    "manager_quality", "psychological_safety", "feedback_culture", "diversity_metrics",
    "diversity_inclusion_score", "ethical_standards", "layoff_history", "burnout_risk", "mission_clarity",
    "training_spend", "onboarding_quality", "learning_culture", "exposure_quality", "mentorship_availability",
    "internal_mobility", "promotion_clarity", "tools_access", "role_clarity", "early_ownership",
    "work_impact", "execution_thinking_balance", "automation_level", "cross_functional_exposure",
    "exit_opportunities", "skill_relevance", "network_strength", "global_exposure", "external_recognition",
    "fixed_vs_variable_pay", "bonus_predictability", "esops_incentives", "family_health_insurance",
    "relocation_support", "lifestyle_benefits", "leave_policy", "health_support",
    "remote_policy_details", "typical_hours", "overtime_expectations", "weekend_work", "flexibility_level",
    "location_centrality", "public_transport_access", "cab_policy", "airport_commute_time", "office_zone_type",
    "area_safety", "safety_policies", "infrastructure_safety", "emergency_preparedness",
    "annual_revenue", "annual_profit", "revenue_mix", "valuation", "yoy_growth_rate", "profitability_status",
    "key_investors", "recent_funding_rounds", "total_capital_raised", "burn_rate", "runway_months",
    "burn_multiplier", "esg_ratings", "regulatory_status", "legal_issues", "supply_chain_dependencies",
    "geopolitical_risks", "macro_risks",
    "tech_stack", "technology_partners", "intellectual_property", "r_and_d_investment", "ai_ml_adoption_level",
    "cybersecurity_posture", "innovation_roadmap", "product_pipeline", "tech_adoption_rating", "partnership_ecosystem",
    "ceo_name", "ceo_linkedin_url", "key_leaders", "board_members", "warm_intro_pathways", "decision_maker_access",
    "primary_contact_email", "primary_phone_number", "contact_person_name", "contact_person_title",
    "contact_person_email", "contact_person_phone",
    "website_url", "website_quality", "website_rating", "website_traffic_rank", "social_media_followers",
    "glassdoor_rating", "indeed_rating", "google_rating", "linkedin_url", "twitter_handle", "facebook_url",
    "instagram_url", "marketing_video_url", "customer_testimonials", "awards_recognitions", "brand_sentiment_score",
    "event_participation"
  ];

  const presentFieldNames = new Set(sortedFields.map(f => f.field));
  const missingFields = expectedFields.filter(field => !presentFieldNames.has(field));

  console.log(`❌ Expected fields not found in data (${missingFields.length}):`);
  missingFields.slice(0, 20).forEach(field => console.log(`   • ${field}`));
  if (missingFields.length > 20) {
    console.log(`   ... and ${missingFields.length - 20} more`);
  }
}

analyzeFieldPresence().catch(console.error);
