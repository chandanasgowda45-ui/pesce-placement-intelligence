import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('./.env', 'utf-8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Create a slug from company name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function migrate() {
  console.log('Fetching from companies table...');
  const { data: companies, error: fetchErr } = await supabase.from('companies').select('*');
  if (fetchErr) {
    console.error('Error fetching companies:', fetchErr);
    return;
  }
  
  if (!companies || companies.length === 0) {
    console.log('No companies to migrate.');
    return;
  }

  console.log(`Found ${companies.length} companies to migrate.`);
  
  // Fetch existing in companies_json
  const { data: existingJson } = await supabase.from('companies_json').select('company_id');
  const existingIds = new Set(existingJson?.map(c => c.company_id) || []);

  const toInsert = [];
  
  for (const c of companies) {
    // Determine a string ID
    const strId = c.short_name ? createSlug(c.short_name) : (c.name ? createSlug(c.name) : c.company_id.toString());
    
    // Ensure uniqueness
    let counter = 1;
    let finalId = strId;
    while (existingIds.has(finalId)) {
      finalId = `${strId}-${counter}`;
      counter++;
    }
    
    existingIds.add(finalId);
    
    const shortJson = {
      name: c.name,
      short_name: c.short_name,
      category: c.category,
      incorporation_year: c.incorporation_year,
      nature_of_company: c.nature_of_company,
      headquarters_address: c.headquarters_address,
      employee_size: c.employee_size,
      overview_text: c.overview_text,
    };
    
    const fullJson = {
      ...c, // Source columns
      // Explicitly ensuring all 163 fields are represented (even if null)
      // Identification
      name: c.name,
      short_name: c.short_name,
      logo_url: c.logo_url,
      category: c.category,
      company_tier: c.company_tier,
      incorporation_year: c.incorporation_year,
      nature_of_company: c.nature_of_company,
      headquarters_address: c.headquarters_address,
      operating_countries: c.operating_countries,
      office_count: c.office_count,
      office_locations: c.office_locations,
      employee_size: c.employee_size,
      overview_text: c.overview_text,
      history_timeline: c.history_timeline,
      recent_news: c.recent_news,

      // Business & Market
      pain_points_addressed: c.pain_points_addressed || null,
      focus_sectors: c.focus_sectors || null,
      offerings_description: c.offerings_description || null,
      top_customers: c.top_customers || null,
      core_value_proposition: c.core_value_proposition || null,
      unique_differentiators: c.unique_differentiators || null,
      competitive_advantages: c.competitive_advantages || null,
      weaknesses_gaps: c.weaknesses_gaps || null,
      key_challenges_needs: c.key_challenges_needs || null,
      key_competitors: c.key_competitors || null,
      tam: c.tam || null,
      sam: c.sam || null,
      som: c.som || null,
      market_share_percentage: c.market_share_percentage || null,
      go_to_market_strategy: c.go_to_market_strategy || null,
      strategic_priorities: c.strategic_priorities || null,
      future_projections: c.future_projections || null,

      // Culture & People
      work_culture_summary: c.work_culture_summary || null,
      hiring_velocity: c.hiring_velocity || null,
      employee_turnover: c.employee_turnover || null,
      avg_retention_tenure: c.avg_retention_tenure || null,
      manager_quality: c.manager_quality || null,
      psychological_safety: c.psychological_safety || null,
      feedback_culture: c.feedback_culture || null,
      diversity_metrics: c.diversity_metrics || null,
      diversity_inclusion_score: c.diversity_inclusion_score || null,
      ethical_standards: c.ethical_standards || null,
      layoff_history: c.layoff_history || null,
      burnout_risk: c.burnout_risk || null,
      mission_clarity: c.mission_clarity || null,

      // Growth
      training_spend: c.training_spend || null,
      onboarding_quality: c.onboarding_quality || null,
      learning_culture: c.learning_culture || null,
      exposure_quality: c.exposure_quality || null,
      mentorship_availability: c.mentorship_availability || null,
      internal_mobility: c.internal_mobility || null,
      promotion_clarity: c.promotion_clarity || null,
      tools_access: c.tools_access || null,
      role_clarity: c.role_clarity || null,
      early_ownership: c.early_ownership || null,
      work_impact: c.work_impact || null,
      execution_thinking_balance: c.execution_thinking_balance || null,
      automation_level: c.automation_level || null,
      cross_functional_exposure: c.cross_functional_exposure || null,
      exit_opportunities: c.exit_opportunities || null,
      skill_relevance: c.skill_relevance || null,
      network_strength: c.network_strength || null,
      global_exposure: c.global_exposure || null,
      external_recognition: c.external_recognition || null,

      // Compensation
      fixed_vs_variable_pay: c.fixed_vs_variable_pay || null,
      bonus_predictability: c.bonus_predictability || null,
      esops_incentives: c.esops_incentives || null,
      family_health_insurance: c.family_health_insurance || null,
      relocation_support: c.relocation_support || null,
      lifestyle_benefits: c.lifestyle_benefits || null,
      leave_policy: c.leave_policy || null,
      health_support: c.health_support || null,

      // Logistics
      remote_policy_details: c.remote_policy_details || null,
      typical_hours: c.typical_hours || null,
      overtime_expectations: c.overtime_expectations || null,
      weekend_work: c.weekend_work || null,
      flexibility_level: c.flexibility_level || null,
      location_centrality: c.location_centrality || null,
      public_transport_access: c.public_transport_access || null,
      cab_policy: c.cab_policy || null,
      airport_commute_time: c.airport_commute_time || null,
      office_zone_type: c.office_zone_type || null,
      area_safety: c.area_safety || null,
      safety_policies: c.safety_policies || null,
      infrastructure_safety: c.infrastructure_safety || null,
      emergency_preparedness: c.emergency_preparedness || null,

      // Financials
      annual_revenue: c.annual_revenue || null,
      annual_profit: c.annual_profit || null,
      revenue_mix: c.revenue_mix || null,
      valuation: c.valuation || null,
      yoy_growth_rate: c.yoy_growth_rate || null,
      profitability_status: c.profitability_status || null,
      key_investors: c.key_investors || null,
      recent_funding_rounds: c.recent_funding_rounds || null,
      total_capital_raised: c.total_capital_raised || null,
      burn_rate: c.burn_rate || null,
      runway_months: c.runway_months || null,
      burn_multiplier: c.burn_multiplier || null,
      esg_ratings: c.esg_ratings || null,
      regulatory_status: c.regulatory_status || null,
      legal_issues: c.legal_issues || null,
      supply_chain_dependencies: c.supply_chain_dependencies || null,
      geopolitical_risks: c.geopolitical_risks || null,
      macro_risks: c.macro_risks || null,

      // Tech
      tech_stack: c.tech_stack || null,
      technology_partners: c.technology_partners || null,
      intellectual_property: c.intellectual_property || null,
      r_and_d_investment: c.r_and_d_investment || null,
      ai_ml_adoption_level: c.ai_ml_adoption_level || null,
      cybersecurity_posture: c.cybersecurity_posture || null,
      innovation_roadmap: c.innovation_roadmap || null,
      product_pipeline: c.product_pipeline || null,
      tech_adoption_rating: c.tech_adoption_rating || null,
      partnership_ecosystem: c.partnership_ecosystem || null,

      // Leadership
      ceo_name: c.ceo_name || null,
      ceo_linkedin_url: c.ceo_linkedin_url || null,
      key_leaders: c.key_leaders || null,
      board_members: c.board_members || null,
      warm_intro_pathways: c.warm_intro_pathways || null,
      decision_maker_access: c.decision_maker_access || null,
      primary_contact_email: c.primary_contact_email || null,
      primary_phone_number: c.primary_phone_number || null,
      contact_person_name: c.contact_person_name || null,
      contact_person_title: c.contact_person_title || null,
      contact_person_email: c.contact_person_email || null,
      contact_person_phone: c.contact_person_phone || null,

      // Brand
      website_url: c.website_url || null,
      website_quality: c.website_quality || null,
      website_rating: c.website_rating || null,
      website_traffic_rank: c.website_traffic_rank || null,
      social_media_followers: c.social_media_followers || null,
      glassdoor_rating: c.glassdoor_rating || null,
      indeed_rating: c.indeed_rating || null,
      google_rating: c.google_rating || null,
      linkedin_url: c.linkedin_url || null,
      twitter_handle: c.twitter_handle || null,
      facebook_url: c.facebook_url || null,
      instagram_url: c.instagram_url || null,
      marketing_video_url: c.marketing_video_url || null,
      customer_testimonials: c.customer_testimonials || null,
      awards_recognitions: c.awards_recognitions || null,
      brand_sentiment_score: c.brand_sentiment_score || null,
      event_participation: c.event_participation || null,
    };
    
    toInsert.push({
      company_id: finalId,
      short_json: shortJson,
      full_json: fullJson
    });
  }
  
  console.log(`Inserting ${toInsert.length} into companies_json...`);
  
  // Insert in batches
  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50);
    const { error: insertErr } = await supabase.from('companies_json').insert(batch);
    if (insertErr) {
      console.error(`Error inserting batch ${i}:`, insertErr);
    } else {
      console.log(`Inserted batch ${i} to ${i + batch.length}`);
    }
  }
  
  console.log('Migration complete.');
}

migrate();
