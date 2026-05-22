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
  global: { headers: { "X-Client-Info": "field-mapping-analysis" } },
});

// Expected fields from Company interface (163 parameters)
const EXPECTED_COMPANY_FIELDS = [
  'company_id', 'name', 'short_name', 'logo_url', 'category', 'company_tier',
  'incorporation_year', 'nature_of_company', 'headquarters_address', 'operating_countries',
  'office_count', 'office_locations', 'employee_size', 'overview_text', 'history_timeline',
  'recent_news', 'pain_points_addressed', 'focus_sectors', 'offerings_description',
  'top_customers', 'core_value_proposition', 'unique_differentiators', 'competitive_advantages',
  'weaknesses_gaps', 'key_challenges_needs', 'key_competitors', 'tam', 'sam', 'som',
  'market_share_percentage', 'go_to_market_strategy', 'strategic_priorities', 'future_projections',
  'work_culture_summary', 'hiring_velocity', 'employee_turnover', 'avg_retention_tenure',
  'manager_quality', 'psychological_safety', 'feedback_culture', 'diversity_metrics',
  'diversity_inclusion_score', 'ethical_standards', 'layoff_history', 'burnout_risk',
  'mission_clarity', 'training_spend', 'onboarding_quality', 'learning_culture',
  'exposure_quality', 'mentorship_availability', 'internal_mobility', 'promotion_clarity',
  'tools_access', 'role_clarity', 'early_ownership', 'work_impact', 'execution_thinking_balance',
  'automation_level', 'cross_functional_exposure', 'exit_opportunities', 'skill_relevance',
  'network_strength', 'global_exposure', 'external_recognition', 'fixed_vs_variable_pay',
  'bonus_predictability', 'esops_incentives', 'family_health_insurance', 'relocation_support',
  'lifestyle_benefits', 'leave_policy', 'health_support', 'remote_policy_details',
  'typical_hours', 'overtime_expectations', 'weekend_work', 'flexibility_level',
  'location_centrality', 'public_transport_access', 'cab_policy', 'airport_commute_time',
  'office_zone_type', 'area_safety', 'safety_policies', 'infrastructure_safety',
  'emergency_preparedness', 'annual_revenue', 'annual_profit', 'revenue_mix', 'valuation',
  'yoy_growth_rate', 'profitability_status', 'key_investors', 'recent_funding_rounds',
  'total_capital_raised', 'burn_rate', 'runway_months', 'burn_multiplier', 'esg_ratings',
  'regulatory_status', 'legal_issues', 'supply_chain_dependencies', 'geopolitical_risks',
  'macro_risks', 'tech_stack', 'technology_partners', 'intellectual_property',
  'r_and_d_investment', 'ai_ml_adoption_level', 'cybersecurity_posture', 'innovation_roadmap',
  'product_pipeline', 'tech_adoption_rating', 'partnership_ecosystem', 'ceo_name',
  'ceo_linkedin_url', 'key_leaders', 'board_members', 'warm_intro_pathways',
  'decision_maker_access', 'primary_contact_email', 'primary_phone_number',
  'contact_person_name', 'contact_person_title', 'contact_person_email',
  'contact_person_phone', 'website_url', 'website_quality', 'website_rating',
  'website_traffic_rank', 'social_media_followers', 'glassdoor_rating', 'indeed_rating',
  'google_rating', 'linkedin_url', 'twitter_handle', 'facebook_url', 'instagram_url',
  'marketing_video_url', 'customer_testimonials', 'awards_recognitions',
  'brand_sentiment_score', 'event_participation', 'intelligence'
];

async function analyzeFieldMapping() {
  console.log("🔍 Field Mapping Analysis: Expected vs Actual\n");

  console.log(`Expected fields in Company interface: ${EXPECTED_COMPANY_FIELDS.length}\n`);

  // Get actual fields from Supabase
  const { data: companies, error } = await supabase
    .from("companies_json")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Error fetching companies:", error);
    return;
  }

  const actualFields = new Set<string>();

  if (companies && companies.length > 0) {
    companies.forEach(company => {
      // Add main table fields
      Object.keys(company).forEach(key => {
        if (key !== 'short_json' && key !== 'full_json') {
          actualFields.add(key);
        }
      });

      // Add short_json fields
      if (company.short_json) {
        Object.keys(company.short_json).forEach(key => actualFields.add(key));
      }

      // Add full_json fields
      if (company.full_json) {
        Object.keys(company.full_json).forEach(key => actualFields.add(key));
      }
    });
  }

  // Check related tables for additional fields
  const { data: innovx } = await supabase.from("innovx_json").select("*").limit(1);
  if (innovx && innovx.length > 0 && innovx[0].json_data?.innovx_master) {
    Object.keys(innovx[0].json_data.innovx_master).forEach(key => actualFields.add(key));
  }

  const { data: hiring } = await supabase.from("hiring_rounds_json").select("*").limit(1);
  if (hiring && hiring.length > 0 && hiring[0].hiring_rounds_json) {
    // hiring_rounds_json is an array, but we can add 'hiring_rounds' as a field
    actualFields.add('hiring_rounds');
  }

  const { data: jobRoles } = await supabase.from("job_role_details_json").select("*").limit(1);
  if (jobRoles && jobRoles.length > 0 && jobRoles[0].job_role_json) {
    actualFields.add('job_roles');
  }

  console.log(`Actual fields found in Supabase: ${actualFields.size}`);
  console.log("Actual fields:", Array.from(actualFields).sort().join(', '));

  // Find missing fields
  const missingFields = EXPECTED_COMPANY_FIELDS.filter(field => !actualFields.has(field));
  const presentFields = EXPECTED_COMPANY_FIELDS.filter(field => actualFields.has(field));

  console.log(`\n✅ Present fields (${presentFields.length}):`);
  presentFields.forEach(field => console.log(`  ✓ ${field}`));

  console.log(`\n❌ Missing fields (${missingFields.length}):`);
  missingFields.forEach(field => console.log(`  ✗ ${field}`));

  console.log(`\n📊 Summary:`);
  console.log(`  Expected: ${EXPECTED_COMPANY_FIELDS.length} fields`);
  console.log(`  Present: ${presentFields.length} fields`);
  console.log(`  Missing: ${missingFields.length} fields`);
  console.log(`  Coverage: ${((presentFields.length / EXPECTED_COMPANY_FIELDS.length) * 100).toFixed(1)}%`);

  // Detailed analysis of what's actually in the data
  console.log(`\n🔍 Detailed Data Analysis:`);
  if (companies && companies.length > 0) {
    const company = companies[0];
    console.log(`\nSample company data structure:`);
    console.log(`  Main fields: ${Object.keys(company).filter(k => k !== 'short_json' && k !== 'full_json').join(', ')}`);
    console.log(`  Short JSON fields: ${company.short_json ? Object.keys(company.short_json).length : 0}`);
    console.log(`  Full JSON fields: ${company.full_json ? Object.keys(company.full_json).length : 0}`);
  }

  return {
    expected: EXPECTED_COMPANY_FIELDS.length,
    present: presentFields.length,
    missing: missingFields.length,
    presentFields,
    missingFields
  };
}

analyzeFieldMapping().catch(console.error);
