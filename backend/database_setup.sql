-- SRM Career Compass Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Clean drop existing tables (reverse dependency order) to allow clean recreation
DROP TABLE IF EXISTS staging_skill_topics CASCADE;
DROP TABLE IF EXISTS staging_company_skill_levels CASCADE;
DROP TABLE IF EXISTS staging_company CASCADE;
DROP TABLE IF EXISTS company_office_locations_map CASCADE;
DROP TABLE IF EXISTS company_operating_countries_map CASCADE;
DROP TABLE IF EXISTS company_skill_levels CASCADE;
DROP TABLE IF EXISTS skill_set_topics CASCADE;
DROP TABLE IF EXISTS skill_set_master CASCADE;
DROP TABLE IF EXISTS proficiency_levels CASCADE;
DROP TABLE IF EXISTS innovx_json CASCADE;
DROP TABLE IF EXISTS job_role_details_json CASCADE;
DROP TABLE IF EXISTS hiring_rounds_json CASCADE;
DROP TABLE IF EXISTS companies_json CASCADE;
DROP TABLE IF EXISTS company_area_safety CASCADE;
DROP TABLE IF EXISTS company_awards_recognitions CASCADE;
DROP TABLE IF EXISTS company_benchmark_vs_peers CASCADE;
DROP TABLE IF EXISTS company_board_members CASCADE;
DROP TABLE IF EXISTS company_brand_reputation CASCADE;
DROP TABLE IF EXISTS company_business CASCADE;
DROP TABLE IF EXISTS company_cab_policy CASCADE;
DROP TABLE IF EXISTS company_case_studies CASCADE;
DROP TABLE IF EXISTS company_client_quality CASCADE;
DROP TABLE IF EXISTS company_compensation CASCADE;
DROP TABLE IF EXISTS company_competitive_advantages CASCADE;
DROP TABLE IF EXISTS company_core_value_proposition CASCADE;
DROP TABLE IF EXISTS company_core_values CASCADE;
DROP TABLE IF EXISTS company_cross_functional_exposure CASCADE;
DROP TABLE IF EXISTS company_culture CASCADE;
DROP TABLE IF EXISTS company_customer_testimonials CASCADE;
DROP TABLE IF EXISTS company_cybersecurity_posture CASCADE;
DROP TABLE IF EXISTS company_diversity_inclusion_score CASCADE;
DROP TABLE IF EXISTS company_diversity_metrics CASCADE;
DROP TABLE IF EXISTS company_emergency_preparedness CASCADE;
DROP TABLE IF EXISTS company_esg_ratings CASCADE;
DROP TABLE IF EXISTS company_esops_incentives CASCADE;
DROP TABLE IF EXISTS company_ethical_sourcing CASCADE;
DROP TABLE IF EXISTS company_ethical_standards CASCADE;
DROP TABLE IF EXISTS company_event_participation CASCADE;
DROP TABLE IF EXISTS company_exit_opportunities CASCADE;
DROP TABLE IF EXISTS company_exit_strategy_history CASCADE;
DROP TABLE IF EXISTS company_family_health_insurance CASCADE;
DROP TABLE IF EXISTS company_feedback_culture CASCADE;
DROP TABLE IF EXISTS company_financials CASCADE;
DROP TABLE IF EXISTS company_flexibility_level CASCADE;
DROP TABLE IF EXISTS company_focus_sectors CASCADE;
DROP TABLE IF EXISTS company_geopolitical_risks CASCADE;
DROP TABLE IF EXISTS company_global_exposure CASCADE;
DROP TABLE IF EXISTS company_go_to_market_strategy CASCADE;
DROP TABLE IF EXISTS company_health_support CASCADE;
DROP TABLE IF EXISTS company_hiring_velocity CASCADE;
DROP TABLE IF EXISTS company_history CASCADE;
DROP TABLE IF EXISTS company_industry_associations CASCADE;
DROP TABLE IF EXISTS company_infrastructure_safety CASCADE;
DROP TABLE IF EXISTS company_innovation_roadmap CASCADE;
DROP TABLE IF EXISTS company_intellectual_property CASCADE;
DROP TABLE IF EXISTS company_json CASCADE;
DROP TABLE IF EXISTS company_key_challenges_needs CASCADE;
DROP TABLE IF EXISTS company_key_competitors CASCADE;
DROP TABLE IF EXISTS company_key_investors CASCADE;
DROP TABLE IF EXISTS company_key_leaders CASCADE;
DROP TABLE IF EXISTS company_learning_culture CASCADE;
DROP TABLE IF EXISTS company_leave_policy CASCADE;
DROP TABLE IF EXISTS company_lifestyle_benefits CASCADE;
DROP TABLE IF EXISTS company_logistics CASCADE;
DROP TABLE IF EXISTS company_logo CASCADE;
DROP TABLE IF EXISTS company_macro_risks CASCADE;
DROP TABLE IF EXISTS company_marketing_videos CASCADE;
DROP TABLE IF EXISTS company_mentorship_availability CASCADE;
DROP TABLE IF EXISTS company_network_strength CASCADE;
DROP TABLE IF EXISTS company_offerings_description CASCADE;
DROP TABLE IF EXISTS company_pain_points_addressed CASCADE;
DROP TABLE IF EXISTS company_partnership_ecosystem CASCADE;
DROP TABLE IF EXISTS company_people CASCADE;
DROP TABLE IF EXISTS company_product_pipeline CASCADE;
DROP TABLE IF EXISTS company_promotion_clarity CASCADE;
DROP TABLE IF EXISTS company_public_transport_access CASCADE;
DROP TABLE IF EXISTS company_recent_funding_rounds CASCADE;
DROP TABLE IF EXISTS company_recent_news CASCADE;
DROP TABLE IF EXISTS company_regulatory_status CASCADE;
DROP TABLE IF EXISTS company_relocation_support CASCADE;
DROP TABLE IF EXISTS company_revenue_mix CASCADE;
DROP TABLE IF EXISTS company_safety_policies CASCADE;
DROP TABLE IF EXISTS company_strategic_priorities CASCADE;
DROP TABLE IF EXISTS company_supply_chain_dependencies CASCADE;
DROP TABLE IF EXISTS company_sustainability_csr CASCADE;
DROP TABLE IF EXISTS company_talent_growth CASCADE;
DROP TABLE IF EXISTS company_tech_adoption_rating CASCADE;
DROP TABLE IF EXISTS company_tech_stack CASCADE;
DROP TABLE IF EXISTS company_technologies CASCADE;
DROP TABLE IF EXISTS company_technology_partners CASCADE;
DROP TABLE IF EXISTS company_tools_access CASCADE;
DROP TABLE IF EXISTS company_top_customers CASCADE;
DROP TABLE IF EXISTS company_unique_differentiators CASCADE;
DROP TABLE IF EXISTS company_warm_intro_pathways CASCADE;
DROP TABLE IF EXISTS company_weaknesses_gaps CASCADE;
DROP TABLE IF EXISTS company_website_traffic_rank CASCADE;
DROP TABLE IF EXISTS company_work_culture_summary CASCADE;
DROP TABLE IF EXISTS company_work_impact CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

-- Create base tables first (no dependencies)

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  countries_id INT4 PRIMARY KEY,
  country TEXT NOT NULL
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  city_id INT4 PRIMARY KEY,
  countries_id INT4 NOT NULL,
  city TEXT NOT NULL
);

-- Create proficiency_levels table
CREATE TABLE IF NOT EXISTS proficiency_levels (
  proficiency_level_id INT4 PRIMARY KEY,
  proficiency_name VARCHAR NOT NULL,
  proficiency_code VARCHAR NOT NULL,
  proficiency_description TEXT
);

-- Create skill_set_master table
CREATE TABLE IF NOT EXISTS skill_set_master (
  skill_set_id INT4 PRIMARY KEY,
  skill_set_name VARCHAR NOT NULL UNIQUE,
  short_name VARCHAR NOT NULL UNIQUE,
  skill_set_description TEXT
);

-- Create companies table (core company master table)
CREATE TABLE IF NOT EXISTS companies (
  company_id INT4 PRIMARY KEY,
  name TEXT,
  short_name TEXT,
  category TEXT,
  incorporation_year TEXT,
  nature_of_company TEXT,
  headquarters_address TEXT,
  office_count TEXT,
  employee_size TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  primary_contact_email TEXT,
  primary_phone_number TEXT,
  overview_text TEXT,
  vision_statement TEXT,
  mission_statement TEXT,
  legal_issues TEXT,
  carbon_footprint TEXT
);

-- Create parent tables (reference companies)

-- Create company_brand_reputation table (Parent table for brand and reputation metrics)
CREATE TABLE IF NOT EXISTS company_brand_reputation (
  brand_reputation_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  brand_sentiment_score TEXT,
  website_quality TEXT,
  website_rating TEXT,
  social_media_followers TEXT,
  glassdoor_rating TEXT,
  indeed_rating TEXT,
  google_rating TEXT
);

-- Create company_business table (Parent table for business strategy and market data)
CREATE TABLE IF NOT EXISTS company_business (
  company_business_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  sales_motion TEXT,
  innovation_roadmap TEXT,
  future_projections TEXT,
  market_share_percentage TEXT,
  tam TEXT,
  sam TEXT,
  som TEXT,
  customer_concentration_risk TEXT
);

-- Create company_compensation table (Parent table for compensation and benefits data)
CREATE TABLE IF NOT EXISTS company_compensation (
  company_compensation_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  fixed_vs_variable_pay TEXT,
  bonus_predictability TEXT
);

-- Create company_culture table (Parent table for company culture metrics)
CREATE TABLE IF NOT EXISTS company_culture (
  company_culture_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  employee_turnover TEXT,
  avg_retention_tenure TEXT,
  layoff_history TEXT,
  manager_quality TEXT,
  psychological_safety TEXT,
  mission_clarity TEXT,
  crisis_behavior TEXT,
  burnout_risk TEXT
);

-- Create company_financials table (Parent table for financial metrics and performance)
CREATE TABLE IF NOT EXISTS company_financials (
  company_financials_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  annual_revenue TEXT,
  annual_profit TEXT,
  valuation TEXT,
  yoy_growth_rate TEXT,
  profitability_status TEXT,
  total_capital_raised TEXT,
  customer_acquisition_cost TEXT,
  customer_lifetime_value TEXT,
  cac_ltv_ratio TEXT,
  churn_rate TEXT,
  net_promoter_score TEXT,
  burn_rate TEXT,
  runway_months TEXT,
  burn_multiplier TEXT
);

-- Create company_logistics table (Parent table for workplace logistics and location data)
CREATE TABLE IF NOT EXISTS company_logistics (
  company_logistics_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  typical_hours TEXT,
  overtime_expectations TEXT,
  weekend_work TEXT,
  remote_policy_details TEXT,
  location_centrality TEXT,
  airport_commute_time TEXT,
  office_zone_type TEXT
);

-- Create company_people table (Parent table for leadership and contact information)
CREATE TABLE IF NOT EXISTS company_people (
  company_people_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  ceo_linkedin_url TEXT,
  contact_person_name TEXT,
  contact_person_title TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  decision_maker_access TEXT,
  ceo_name TEXT
);

-- Create company_talent_growth table (Parent table for employee development and growth metrics)
CREATE TABLE IF NOT EXISTS company_talent_growth (
  company_talent_growth_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  training_spend TEXT,
  onboarding_quality TEXT,
  internal_mobility TEXT,
  role_clarity TEXT,
  early_ownership TEXT,
  execution_thinking_balance TEXT,
  automation_level TEXT,
  company_maturity TEXT,
  brand_value TEXT,
  skill_relevance TEXT,
  exposure_quality TEXT,
  external_recognition TEXT
);

-- Create company_technologies table (Parent table for technology adoption and R&D data)
CREATE TABLE IF NOT EXISTS company_technologies (
  company_technologies_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  r_and_d_investment TEXT,
  ai_ml_adoption_level TEXT
);

-- Create child tables (reference parent tables)

-- Create company_area_safety table
CREATE TABLE IF NOT EXISTS company_area_safety (
  company_area_safety_id INT4 PRIMARY KEY,
  company_logistics_id INT4 NOT NULL REFERENCES company_logistics(company_logistics_id),
  area_safety TEXT
);

-- Create company_awards_recognitions table
CREATE TABLE IF NOT EXISTS company_awards_recognitions (
  awards_recognitions_id INT4 PRIMARY KEY,
  brand_reputation_id INT4 NOT NULL REFERENCES company_brand_reputation(brand_reputation_id),
  awards_recognitions TEXT
);

-- Create company_benchmark_vs_peers table
CREATE TABLE IF NOT EXISTS company_benchmark_vs_peers (
  company_benchmark_vs_peers_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  benchmark_vs_peers TEXT
);

-- Create company_board_members table
CREATE TABLE IF NOT EXISTS company_board_members (
  company_board_members_id INT4 PRIMARY KEY,
  company_people_id INT4 NOT NULL REFERENCES company_people(company_people_id),
  board_members TEXT
);

-- Create company_cab_policy table
CREATE TABLE IF NOT EXISTS company_cab_policy (
  company_cab_policy_id INT4 PRIMARY KEY,
  company_logistics_id INT4 NOT NULL REFERENCES company_logistics(company_logistics_id),
  cab_policy TEXT
);

-- Create company_case_studies table
CREATE TABLE IF NOT EXISTS company_case_studies (
  company_case_studies_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  case_studies TEXT
);

-- Create company_client_quality table
CREATE TABLE IF NOT EXISTS company_client_quality (
  company_client_quality_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  client_quality TEXT
);

-- Create company_competitive_advantages table
CREATE TABLE IF NOT EXISTS company_competitive_advantages (
  company_competitive_advantages_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  competitive_advantages TEXT
);

-- Create company_core_value_proposition table
CREATE TABLE IF NOT EXISTS company_core_value_proposition (
  company_core_value_proposition_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  core_value_proposition TEXT
);

-- Create company_core_values table
CREATE TABLE IF NOT EXISTS company_core_values (
  core_values_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  core_values TEXT
);

-- Create company_cross_functional_exposure table
CREATE TABLE IF NOT EXISTS company_cross_functional_exposure (
  company_cross_functional_exposure_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  cross_functional_exposure TEXT
);

-- Create company_customer_testimonials table
CREATE TABLE IF NOT EXISTS company_customer_testimonials (
  customer_testimonials_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  customer_testimonials TEXT
);

-- Create company_cybersecurity_posture table
CREATE TABLE IF NOT EXISTS company_cybersecurity_posture (
  company_cybersecurity_posture_id INT4 PRIMARY KEY,
  company_technologies_id INT4 NOT NULL REFERENCES company_technologies(company_technologies_id),
  cybersecurity_posture TEXT
);

-- Create company_diversity_inclusion_score table
CREATE TABLE IF NOT EXISTS company_diversity_inclusion_score (
  company_diversity_inclusion_score_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  diversity_inclusion_score TEXT
);

-- Create company_diversity_metrics table
CREATE TABLE IF NOT EXISTS company_diversity_metrics (
  company_diversity_metrics_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  diversity_metrics TEXT
);

-- Create company_emergency_preparedness table
CREATE TABLE IF NOT EXISTS company_emergency_preparedness (
  company_emergency_preparedness_id INT4 PRIMARY KEY,
  company_logistics_id INT4 NOT NULL REFERENCES company_logistics(company_logistics_id),
  emergency_preparedness TEXT
);

-- Create company_esg_ratings table
CREATE TABLE IF NOT EXISTS company_esg_ratings (
  esg_ratings_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  esg_ratings TEXT
);

-- Create company_esops_incentives table
CREATE TABLE IF NOT EXISTS company_esops_incentives (
  company_esops_incentives_id INT4 PRIMARY KEY,
  company_compensation_id INT4 NOT NULL REFERENCES company_compensation(company_compensation_id),
  esops_incentives TEXT
);

-- Create company_ethical_sourcing table
CREATE TABLE IF NOT EXISTS company_ethical_sourcing (
  ethical_sourcing_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  ethical_sourcing TEXT
);

-- Create company_ethical_standards table
CREATE TABLE IF NOT EXISTS company_ethical_standards (
  company_ethical_standards_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  ethical_standards TEXT
);

-- Create company_event_participation table
CREATE TABLE IF NOT EXISTS company_event_participation (
  event_participation_id INT4 PRIMARY KEY,
  brand_reputation_id INT4 NOT NULL REFERENCES company_brand_reputation(brand_reputation_id),
  event_participation TEXT
);

-- Create company_exit_opportunities table
CREATE TABLE IF NOT EXISTS company_exit_opportunities (
  company_exit_opportunities_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  exit_opportunities TEXT
);

-- Create company_exit_strategy_history table
CREATE TABLE IF NOT EXISTS company_exit_strategy_history (
  company_exit_strategy_history_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  exit_strategy_history TEXT
);

-- Create company_family_health_insurance table
CREATE TABLE IF NOT EXISTS company_family_health_insurance (
  company_family_health_insurance_id INT4 PRIMARY KEY,
  company_compensation_id INT4 NOT NULL REFERENCES company_compensation(company_compensation_id),
  family_health_insurance TEXT
);

-- Create company_feedback_culture table
CREATE TABLE IF NOT EXISTS company_feedback_culture (
  company_feedback_culture_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  feedback_culture TEXT
);

-- Create company_flexibility_level table
CREATE TABLE IF NOT EXISTS company_flexibility_level (
  company_flexibility_level_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  flexibility_level TEXT
);

-- Create company_focus_sectors table
CREATE TABLE IF NOT EXISTS company_focus_sectors (
  company_focus_sectors_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  focus_sectors TEXT
);

-- Create company_geopolitical_risks table
CREATE TABLE IF NOT EXISTS company_geopolitical_risks (
  geopolitical_risks_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  geopolitical_risks TEXT
);

-- Create company_global_exposure table
CREATE TABLE IF NOT EXISTS company_global_exposure (
  company_global_exposure_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  global_exposure TEXT
);

-- Create company_go_to_market_strategy table
CREATE TABLE IF NOT EXISTS company_go_to_market_strategy (
  company_go_to_market_strategy_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  go_to_market_strategy TEXT
);

-- Create company_health_support table
CREATE TABLE IF NOT EXISTS company_health_support (
  company_health_support_id INT4 PRIMARY KEY,
  company_compensation_id INT4 NOT NULL REFERENCES company_compensation(company_compensation_id),
  health_support TEXT
);

-- Create company_hiring_velocity table
CREATE TABLE IF NOT EXISTS company_hiring_velocity (
  company_hiring_velocity_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  hiring_velocity TEXT
);

-- Create company_history table
CREATE TABLE IF NOT EXISTS company_history (
  history__id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  history_timeline TEXT
);

-- Create company_industry_associations table
CREATE TABLE IF NOT EXISTS company_industry_associations (
  company_industry_associations_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  industry_associations TEXT
);

-- Create company_infrastructure_safety table
CREATE TABLE IF NOT EXISTS company_infrastructure_safety (
  company_infrastructure_safety_id INT4 PRIMARY KEY,
  company_logistics_id INT4 NOT NULL REFERENCES company_logistics(company_logistics_id),
  infrastructure_safety TEXT
);

-- Create company_innovation_roadmap table
CREATE TABLE IF NOT EXISTS company_innovation_roadmap (
  company_innovation_roadmap_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  innovation_roadmap TEXT
);

-- Create company_intellectual_property table
CREATE TABLE IF NOT EXISTS company_intellectual_property (
  company_intellectual_property_id INT4 PRIMARY KEY,
  company_technologies_id INT4 NOT NULL REFERENCES company_technologies(company_technologies_id),
  intellectual_property TEXT
);

-- Create company_json table (Stores JSON representations of company data - both short summary and full details)
CREATE TABLE IF NOT EXISTS company_json (
  json_id INT4 PRIMARY KEY,
  short_json JSONB,
  full_json JSONB
);

-- Create company_key_challenges_needs table
CREATE TABLE IF NOT EXISTS company_key_challenges_needs (
  company_key_challenges_needs_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  key_challenges_needs TEXT
);

-- Create company_key_competitors table
CREATE TABLE IF NOT EXISTS company_key_competitors (
  company_key_competitors_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  key_competitors TEXT
);

-- Create company_key_investors table
CREATE TABLE IF NOT EXISTS company_key_investors (
  company_key_investors_id INT4 PRIMARY KEY,
  company_financials_id INT4 NOT NULL REFERENCES company_financials(company_financials_id),
  key_investors TEXT
);

-- Create company_key_leaders table
CREATE TABLE IF NOT EXISTS company_key_leaders (
  company_key_leaders_id INT4 PRIMARY KEY,
  company_people_id INT4 NOT NULL REFERENCES company_people(company_people_id),
  key_leaders TEXT
);

-- Create company_learning_culture table
CREATE TABLE IF NOT EXISTS company_learning_culture (
  company_learning_culture_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  learning_culture TEXT
);

-- Create company_leave_policy table
CREATE TABLE IF NOT EXISTS company_leave_policy (
  company_leave_policy_id INT4 PRIMARY KEY,
  company_compensation_id INT4 NOT NULL REFERENCES company_compensation(company_compensation_id),
  leave_policy TEXT
);

-- Create company_lifestyle_benefits table
CREATE TABLE IF NOT EXISTS company_lifestyle_benefits (
  company_lifestyle_benefits_id INT4 PRIMARY KEY,
  company_compensation_id INT4 NOT NULL REFERENCES company_compensation(company_compensation_id),
  lifestyle_benefits TEXT
);

-- Create company_logo table
CREATE TABLE IF NOT EXISTS company_logo (
  company_logo_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  logo_url TEXT
);

-- Create company_macro_risks table
CREATE TABLE IF NOT EXISTS company_macro_risks (
  macro_risks_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  macro_risks TEXT
);

-- Create company_marketing_videos table
CREATE TABLE IF NOT EXISTS company_marketing_videos (
  marketing_videos_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  marketing_video_url TEXT
);

-- Create company_mentorship_availability table
CREATE TABLE IF NOT EXISTS company_mentorship_availability (
  company_mentorship_availability_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  mentorship_availability TEXT
);

-- Create company_network_strength table
CREATE TABLE IF NOT EXISTS company_network_strength (
  company_network_strength_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  network_strength TEXT
);

-- Create company_offerings_description table
CREATE TABLE IF NOT EXISTS company_offerings_description (
  company_offerings_description_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  offerings_description TEXT
);

-- Create company_pain_points_addressed table
CREATE TABLE IF NOT EXISTS company_pain_points_addressed (
  company_pain_points_addressed_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  pain_points_addressed TEXT
);

-- Create company_partnership_ecosystem table
CREATE TABLE IF NOT EXISTS company_partnership_ecosystem (
  company_partnership_ecosystem_id INT4 PRIMARY KEY,
  company_technologies_id INT4 NOT NULL REFERENCES company_technologies(company_technologies_id),
  partnership_ecosystem TEXT
);

-- Create company_product_pipeline table
CREATE TABLE IF NOT EXISTS company_product_pipeline (
  company_product_pipeline_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  product_pipeline TEXT
);

-- Create company_promotion_clarity table
CREATE TABLE IF NOT EXISTS company_promotion_clarity (
  company_promotion_clarity_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  promotion_clarity TEXT
);

-- Create company_public_transport_access table
CREATE TABLE IF NOT EXISTS company_public_transport_access (
  company_public_transport_access_id INT4 PRIMARY KEY,
  company_logistics_id INT4 NOT NULL REFERENCES company_logistics(company_logistics_id),
  public_transport_access TEXT
);

-- Create company_recent_funding_rounds table
CREATE TABLE IF NOT EXISTS company_recent_funding_rounds (
  company_recent_funding_rounds_id INT4 PRIMARY KEY,
  company_financials_id INT4 NOT NULL REFERENCES company_financials(company_financials_id),
  recent_funding_rounds TEXT
);

-- Create company_recent_news table
CREATE TABLE IF NOT EXISTS company_recent_news (
  recent_news_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  recent_news TEXT
);

-- Create company_regulatory_status table
CREATE TABLE IF NOT EXISTS company_regulatory_status (
  regulatory_status_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  regulatory_status TEXT
);

-- Create company_relocation_support table
CREATE TABLE IF NOT EXISTS company_relocation_support (
  company_relocation_support_id INT4 PRIMARY KEY,
  company_compensation_id INT4 NOT NULL REFERENCES company_compensation(company_compensation_id),
  relocation_support TEXT
);

-- Create company_revenue_mix table
CREATE TABLE IF NOT EXISTS company_revenue_mix (
  company_revenue_mix_id INT4 PRIMARY KEY,
  company_financials_id INT4 NOT NULL REFERENCES company_financials(company_financials_id),
  revenue_mix TEXT
);

-- Create company_safety_policies table
CREATE TABLE IF NOT EXISTS company_safety_policies (
  company_safety_policies_id INT4 PRIMARY KEY,
  company_logistics_id INT4 NOT NULL REFERENCES company_logistics(company_logistics_id),
  safety_policies TEXT
);

-- Create company_strategic_priorities table
CREATE TABLE IF NOT EXISTS company_strategic_priorities (
  company_strategic_priorities_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  strategic_priorities TEXT
);

-- Create company_supply_chain_dependencies table
CREATE TABLE IF NOT EXISTS company_supply_chain_dependencies (
  company_supply_chain_dependencies_id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  supply_chain_dependencies TEXT
);

-- Create company_sustainability_csr table
CREATE TABLE IF NOT EXISTS company_sustainability_csr (
  company_sustainability_csr_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  sustainability_csr TEXT
);

-- Create company_tech_adoption_rating table
CREATE TABLE IF NOT EXISTS company_tech_adoption_rating (
  company_tech_adoption_rating_id INT4 PRIMARY KEY,
  company_technologies_id INT4 NOT NULL REFERENCES company_technologies(company_technologies_id),
  tech_adoption_rating TEXT
);

-- Create company_tech_stack table
CREATE TABLE IF NOT EXISTS company_tech_stack (
  company_tech_stack_id INT4 PRIMARY KEY,
  company_technologies_id INT4 NOT NULL REFERENCES company_technologies(company_technologies_id),
  tech_stack TEXT
);

-- Create company_technology_partners table
CREATE TABLE IF NOT EXISTS company_technology_partners (
  company_technology_partners_id INT4 PRIMARY KEY,
  company_technologies_id INT4 NOT NULL REFERENCES company_technologies(company_technologies_id),
  technology_partners TEXT
);

-- Create company_tools_access table
CREATE TABLE IF NOT EXISTS company_tools_access (
  company_tools_access_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  tools_access TEXT
);

-- Create company_top_customers table
CREATE TABLE IF NOT EXISTS company_top_customers (
  company_top_customers_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  top_customers TEXT
);

-- Create company_unique_differentiators table
CREATE TABLE IF NOT EXISTS company_unique_differentiators (
  company_unique_differentiators_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  unique_differentiators TEXT
);

-- Create company_warm_intro_pathways table
CREATE TABLE IF NOT EXISTS company_warm_intro_pathways (
  company_warm_intro_pathways_id INT4 PRIMARY KEY,
  company_people_id INT4 NOT NULL REFERENCES company_people(company_people_id),
  warm_intro_pathways TEXT
);

-- Create company_weaknesses_gaps table
CREATE TABLE IF NOT EXISTS company_weaknesses_gaps (
  company_weaknesses_gaps_id INT4 PRIMARY KEY,
  company_business_id INT4 NOT NULL REFERENCES company_business(company_business_id),
  weaknesses_gaps TEXT
);

-- Create company_website_traffic_rank table
CREATE TABLE IF NOT EXISTS company_website_traffic_rank (
  website_traffic_rank_id INT4 PRIMARY KEY,
  brand_reputation_id INT4 NOT NULL REFERENCES company_brand_reputation(brand_reputation_id),
  website_traffic_rank TEXT
);

-- Create company_work_culture_summary table
CREATE TABLE IF NOT EXISTS company_work_culture_summary (
  company_work_culture_summary_id INT4 PRIMARY KEY,
  company_culture_id INT4 NOT NULL REFERENCES company_culture(company_culture_id),
  work_culture_summary TEXT
);

-- Create company_work_impact table
CREATE TABLE IF NOT EXISTS company_work_impact (
  company_work_impact_id INT4 PRIMARY KEY,
  company_talent_growth_id INT4 NOT NULL REFERENCES company_talent_growth(company_talent_growth_id),
  work_impact TEXT
);

-- Create skill_set_topics table
CREATE TABLE IF NOT EXISTS skill_set_topics (
  topic_id INT4 PRIMARY KEY,
  skill_set_id INT4 NOT NULL REFERENCES skill_set_master(skill_set_id),
  level_number INT4 NOT NULL,
  topics TEXT NOT NULL,
  created_at TIMESTAMPTZ
);

-- Create company_skill_levels table
CREATE TABLE IF NOT EXISTS company_skill_levels (
  id INT4 PRIMARY KEY,
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  skill_set_id INT4 NOT NULL REFERENCES skill_set_master(skill_set_id),
  required_level INT4 NOT NULL,
  required_proficiency_level_id INT4 NOT NULL REFERENCES proficiency_levels(proficiency_level_id),
  created_at TIMESTAMPTZ
);

-- Create mapping tables (many-to-many)

-- Create company_office_locations_map table (Many-to-many mapping of companies to office location cities)
CREATE TABLE IF NOT EXISTS company_office_locations_map (
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  city_id INT4 NOT NULL REFERENCES cities(city_id),
  PRIMARY KEY (company_id, city_id)
);

-- Create company_operating_countries_map table (Many-to-many mapping of companies to countries they operate in)
CREATE TABLE IF NOT EXISTS company_operating_countries_map (
  company_id INT4 NOT NULL REFERENCES companies(company_id),
  countries_id INT4 NOT NULL REFERENCES countries(countries_id),
  PRIMARY KEY (company_id, countries_id)
);

-- Create JSON tables

-- Create companies_json table
CREATE TABLE IF NOT EXISTS companies_json (
  json_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL UNIQUE,
  short_json JSONB,
  full_json JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  name TEXT
);

-- Create hiring_rounds_json table
CREATE TABLE IF NOT EXISTS hiring_rounds_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL,
  hiring_rounds_json JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create innovx_json table
CREATE TABLE IF NOT EXISTS innovx_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  json_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create job_role_details_json table
CREATE TABLE IF NOT EXISTS job_role_details_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL,
  company_name TEXT,
  job_role_json JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create staging tables

-- Create staging_company table (Staging table for raw company data ingestion. Data is validated and migrated to normalized tables via stored procedures.)
CREATE TABLE IF NOT EXISTS staging_company (
  staging_id INT4 PRIMARY KEY,
  inserted_at TIMESTAMP,
  processed_at TIMESTAMP,
  processing_status TEXT,
  error_message TEXT,
  company_id INT4 NOT NULL,
  name TEXT,
  short_name TEXT,
  logo_url TEXT,
  category TEXT,
  incorporation_year TEXT,
  overview_text TEXT,
  nature_of_company TEXT,
  headquarters_address TEXT,
  operating_countries TEXT,
  office_count TEXT,
  office_locations TEXT,
  employee_size TEXT,
  hiring_velocity TEXT,
  employee_turnover TEXT,
  avg_retention_tenure TEXT,
  pain_points_addressed TEXT,
  focus_sectors TEXT,
  offerings_description TEXT,
  top_customers TEXT,
  core_value_proposition TEXT,
  vision_statement TEXT,
  mission_statement TEXT,
  core_values TEXT,
  unique_differentiators TEXT,
  competitive_advantages TEXT,
  weaknesses_gaps TEXT,
  key_challenges_needs TEXT,
  key_competitors TEXT,
  technology_partners TEXT,
  history_timeline TEXT,
  recent_news TEXT,
  website_url TEXT,
  website_quality TEXT,
  website_rating TEXT,
  website_traffic_rank TEXT,
  social_media_followers TEXT,
  glassdoor_rating TEXT,
  indeed_rating TEXT,
  google_rating TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  ceo_name TEXT,
  ceo_linkedin_url TEXT,
  key_leaders TEXT,
  warm_intro_pathways TEXT,
  decision_maker_access TEXT,
  primary_contact_email TEXT,
  primary_phone_number TEXT,
  contact_person_name TEXT,
  contact_person_title TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  awards_recognitions TEXT,
  brand_sentiment_score TEXT,
  event_participation TEXT,
  regulatory_status TEXT,
  legal_issues TEXT,
  annual_revenue TEXT,
  annual_profit TEXT,
  revenue_mix TEXT,
  valuation TEXT,
  yoy_growth_rate TEXT,
  profitability_status TEXT,
  market_share_percentage TEXT,
  key_investors TEXT,
  recent_funding_rounds TEXT,
  total_capital_raised TEXT,
  esg_ratings TEXT,
  sales_motion TEXT,
  customer_acquisition_cost TEXT,
  customer_lifetime_value TEXT,
  cac_ltv_ratio TEXT,
  churn_rate TEXT,
  net_promoter_score TEXT,
  customer_concentration_risk TEXT,
  burn_rate TEXT,
  runway_months TEXT,
  burn_multiplier TEXT,
  intellectual_property TEXT,
  r_and_d_investment TEXT,
  ai_ml_adoption_level TEXT,
  tech_stack TEXT,
  cybersecurity_posture TEXT,
  supply_chain_dependencies TEXT,
  geopolitical_risks TEXT,
  macro_risks TEXT,
  diversity_metrics TEXT,
  remote_policy_details TEXT,
  training_spend TEXT,
  partnership_ecosystem TEXT,
  exit_strategy_history TEXT,
  carbon_footprint TEXT,
  ethical_sourcing TEXT,
  benchmark_vs_peers TEXT,
  future_projections TEXT,
  strategic_priorities TEXT,
  industry_associations TEXT,
  case_studies TEXT,
  go_to_market_strategy TEXT,
  innovation_roadmap TEXT,
  product_pipeline TEXT,
  board_members TEXT,
  marketing_video_url TEXT,
  customer_testimonials TEXT,
  tech_adoption_rating TEXT,
  tam TEXT,
  sam TEXT,
  som TEXT,
  work_culture_summary TEXT,
  manager_quality TEXT,
  psychological_safety TEXT,
  feedback_culture TEXT,
  diversity_inclusion_score TEXT,
  ethical_standards TEXT,
  typical_hours TEXT,
  overtime_expectations TEXT,
  weekend_work TEXT,
  flexibility_level TEXT,
  leave_policy TEXT,
  burnout_risk TEXT,
  location_centrality TEXT,
  public_transport_access TEXT,
  cab_policy TEXT,
  airport_commute_time TEXT,
  office_zone_type TEXT,
  area_safety TEXT,
  safety_policies TEXT,
  infrastructure_safety TEXT,
  emergency_preparedness TEXT,
  health_support TEXT,
  onboarding_quality TEXT,
  learning_culture TEXT,
  exposure_quality TEXT,
  mentorship_availability TEXT,
  internal_mobility TEXT,
  promotion_clarity TEXT,
  tools_access TEXT,
  role_clarity TEXT,
  early_ownership TEXT,
  work_impact TEXT,
  execution_thinking_balance TEXT,
  automation_level TEXT,
  cross_functional_exposure TEXT,
  company_maturity TEXT,
  brand_value TEXT,
  client_quality TEXT,
  layoff_history TEXT,
  fixed_vs_variable_pay TEXT,
  bonus_predictability TEXT,
  esops_incentives TEXT,
  family_health_insurance TEXT,
  relocation_support TEXT,
  lifestyle_benefits TEXT,
  exit_opportunities TEXT,
  skill_relevance TEXT,
  external_recognition TEXT,
  network_strength TEXT,
  global_exposure TEXT,
  mission_clarity TEXT,
  sustainability_csr TEXT,
  crisis_behavior TEXT
);

-- Create staging_company_skill_levels table (Staging table for importing denormalized company skills from CSV/Excel)
CREATE TABLE IF NOT EXISTS staging_company_skill_levels (
  id INT4 PRIMARY KEY,
  companies TEXT NOT NULL,
  coding TEXT,
  data_structures_and_algorithms TEXT,
  object_oriented_programming_and_design TEXT,
  aptitude_and_problem_solving TEXT,
  communication_skills TEXT,
  ai_native_engineering TEXT,
  devops_and_cloud TEXT,
  sql_and_design TEXT,
  software_engineering TEXT,
  system_design_and_architecture TEXT,
  computer_networking TEXT,
  operating_system TEXT,
  processed BOOL,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ
);

-- Create staging_skill_topics table (Staging table for importing denormalized skill topics from CSV/Excel)
CREATE TABLE IF NOT EXISTS staging_skill_topics (
  id INT4 PRIMARY KEY,
  skill_area TEXT NOT NULL,
  levels TEXT NOT NULL,
  topics TEXT NOT NULL,
  processed BOOL,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ
);

-- Create indexes for performance with 116+ companies and complex JSON queries
CREATE INDEX IF NOT EXISTS idx_companies_id ON companies_json(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_full_json ON companies_json USING GIN (full_json);
CREATE INDEX IF NOT EXISTS idx_companies_short_json ON companies_json USING GIN (short_json);

-- Enable RLS
ALTER TABLE companies_json ENABLE ROW LEVEL SECURITY;

-- Create read policy for all users
DROP POLICY IF EXISTS "Enable read for all users" ON companies_json;
CREATE POLICY "Enable read for all users" ON companies_json
  FOR SELECT USING (true);

-- Enable RLS on other JSON tables
ALTER TABLE innovx_json ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON innovx_json;
CREATE POLICY "Enable read for all users" ON innovx_json
  FOR SELECT USING (true);

ALTER TABLE job_role_details_json ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON job_role_details_json;
CREATE POLICY "Enable read for all users" ON job_role_details_json
  FOR SELECT USING (true);

ALTER TABLE hiring_rounds_json ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON hiring_rounds_json;
CREATE POLICY "Enable read for all users" ON hiring_rounds_json
  FOR SELECT USING (true);
  company_id TEXT NOT NULL REFERENCES companies_json(company_id),
  company_name TEXT,
  job_role_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE job_role_details_json ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON job_role_details_json;
CREATE POLICY "Enable read for all users" ON job_role_details_json
  FOR SELECT USING (true);

-- Create hiring_rounds_json table
CREATE TABLE IF NOT EXISTS hiring_rounds_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies_json(company_id),
  hiring_rounds_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE hiring_rounds_json ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all users" ON hiring_rounds_json;
CREATE POLICY "Enable read for all users" ON hiring_rounds_json
  FOR SELECT USING (true);

-- Insert sample company data
INSERT INTO companies_json (company_id, short_json, full_json) VALUES
  (
    'google',
    '{
      "name": "Google",
      "short_name": "Google",
      "logo_url": "https://logo.clearbit.com/google.com",
      "category": "Marquee",
      "incorporation_year": 1998,
      "nature_of_company": "Product-Based",
      "headquarters_address": "Mountain View, California, USA",
      "employee_size": "190,000+",
      "overview_text": "Google is a multinational technology company that specializes in Internet-related services and products.",
      "focus_sectors": "Search, Advertising, Cloud Computing, AI, Consumer Electronics"
    }'::jsonb,
    '{
      "name": "Google",
      "short_name": "Google",
      "logo_url": "https://logo.clearbit.com/google.com",
      "category": "Marquee",
      "incorporation_year": 1998,
      "nature_of_company": "Product-Based",
      "headquarters_address": "Mountain View, California, USA",
      "operating_countries": "Worldwide",
      "office_count": 100,
      "employee_size": "190,000+",
      "overview_text": "Google is a multinational technology company that specializes in Internet-related services and products.",
      "history_timeline": "Founded in 1998 by Larry Page and Sergey Brin as a research project.",
      "recent_news": "Announced new AI initiatives and quantum computing breakthroughs.",
      "pain_points_addressed": "Information access, advertising efficiency, cloud computing scalability",
      "focus_sectors": "Search, Advertising, Cloud Computing, AI, Consumer Electronics",
      "offerings_description": "Search engine, advertising platforms, cloud services, consumer hardware, enterprise software",
      "core_value_proposition": "Organizing the world''s information and making it universally accessible and useful",
      "unique_differentiators": "Search algorithm dominance, data analytics capabilities, AI integration",
      "competitive_advantages": "First-mover advantage in search, massive data collection, strong brand recognition",
      "strategic_priorities": "AI/ML advancement, quantum computing, sustainable computing",
      "work_culture_summary": "Innovative, data-driven, collaborative environment with emphasis on work-life balance",
      "hiring_velocity": "High",
      "employee_turnover": "Low",
      "manager_quality": "Excellent",
      "psychological_safety": "High",
      "feedback_culture": "Strong",
      "diversity_metrics": "Strong diversity initiatives",
      "ethical_standards": "High ethical standards with transparency reports",
      "mission_clarity": "Clear mission to organize world information",
      "training_spend": "High investment in employee development",
      "onboarding_quality": "Comprehensive onboarding programs",
      "learning_culture": "Continuous learning encouraged",
      "exposure_quality": "High exposure to cutting-edge technologies",
      "mentorship_availability": "Strong mentorship programs",
      "internal_mobility": "Good internal career progression",
      "tools_access": "Access to latest tools and technologies",
      "role_clarity": "Clear role definitions and expectations",
      "early_ownership": "Encourages ownership from early career",
      "work_impact": "High impact work opportunities",
      "execution_thinking_balance": "Good balance between execution and strategic thinking",
      "automation_level": "High automation in processes",
      "cross_functional_exposure": "Strong cross-functional collaboration",
      "exit_opportunities": "Good alumni network and references",
      "skill_relevance": "Skills remain highly relevant",
      "network_strength": "Strong professional network",
      "global_exposure": "Extensive global opportunities",
      "external_recognition": "High brand recognition",
      "annual_revenue": "$280B+",
      "annual_profit": "$76B+",
      "revenue_mix": "Advertising (80%), Cloud (15%), Other (5%)",
      "valuation": "$1.8T+",
      "yoy_growth_rate": "15-20%",
      "profitability_status": "Highly Profitable",
      "key_investors": "Public company",
      "burn_rate": "N/A",
      "runway_months": "N/A",
      "esg_ratings": "Strong ESG performance",
      "regulatory_status": "Compliant with global regulations",
      "supply_chain_dependencies": "Global supply chain with multiple vendors",
      "geopolitical_risks": "Moderate exposure to geopolitical tensions",
      "macro_risks": "Economic downturn sensitivity",
      "tech_stack": "Custom technologies, Kubernetes, Bigtable, Spanner",
      "technology_partners": "Various cloud and AI partners",
      "intellectual_property": "Extensive patent portfolio",
      "r_and_d_investment": "$35B+ annually",
      "ai_ml_adoption_level": "Leader in AI/ML",
      "cybersecurity_posture": "Enterprise-grade security",
      "innovation_roadmap": "AI-first approach, quantum computing, sustainable tech",
      "product_pipeline": "AI products, cloud services, consumer hardware",
      "tech_adoption_rating": "Excellent",
      "partnership_ecosystem": "Extensive partner network",
      "ceo_name": "Sundar Pichai",
      "ceo_linkedin_url": "https://linkedin.com/in/sundarpichai",
      "key_leaders": "Multiple C-level executives with deep tech expertise",
      "board_members": "Experienced board with tech and business leaders",
      "decision_maker_access": "Multiple access points for different roles",
      "primary_contact_email": "careers@google.com",
      "primary_phone_number": "+1-650-253-0000",
      "contact_person_name": "Recruiting Team",
      "contact_person_title": "Global Head of Recruiting",
      "contact_person_email": "recruiting@google.com",
      "contact_person_phone": "+1-650-253-0000",
      "website_url": "https://careers.google.com",
      "website_quality": "Excellent",
      "website_rating": "4.8/5",
      "traffic_rank": "1",
      "social_media_followers": "Millions across platforms",
      "glassdoor_rating": "4.2",
      "indeed_rating": "4.3",
      "google_rating": "4.5",
      "linkedin_url": "https://linkedin.com/company/google",
      "awards_recognitions": "Multiple innovation and workplace awards",
      "brand_sentiment_score": "Very Positive",
      "event_participation": "Major tech conferences and events"
    }'::jsonb
  ),
  (
    'microsoft',
    '{
      "name": "Microsoft",
      "short_name": "MSFT",
      "logo_url": "https://logo.clearbit.com/microsoft.com",
      "category": "Marquee",
      "incorporation_year": 1975,
      "nature_of_company": "Product-Based",
      "headquarters_address": "Redmond, Washington, USA",
      "employee_size": "220,000+",
      "overview_text": "Microsoft is a multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, and personal computers.",
      "focus_sectors": "Software, Cloud Computing, AI, Gaming, Enterprise Solutions"
    }'::jsonb,
    '{
      "name": "Microsoft",
      "short_name": "MSFT",
      "logo_url": "https://logo.clearbit.com/microsoft.com",
      "category": "Marquee",
      "incorporation_year": 1975,
      "nature_of_company": "Product-Based",
      "headquarters_address": "Redmond, Washington, USA",
      "operating_countries": "Worldwide",
      "office_count": 150,
      "employee_size": "220,000+",
      "overview_text": "Microsoft is a multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, and personal computers.",
      "history_timeline": "Founded in 1975 by Bill Gates and Paul Allen.",
      "recent_news": "Major AI initiatives with OpenAI partnership and Copilot launch.",
      "pain_points_addressed": "Enterprise productivity, cloud infrastructure, developer tools",
      "focus_sectors": "Software, Cloud Computing, AI, Gaming, Enterprise Solutions",
      "offerings_description": "Operating systems, productivity software, cloud services, gaming, AI solutions",
      "core_value_proposition": "Empowering every person and organization on the planet to achieve more",
      "unique_differentiators": "Integrated ecosystem, enterprise dominance, developer tools",
      "competitive_advantages": "Market leadership in multiple segments, strong enterprise relationships",
      "strategic_priorities": "AI integration, cloud growth, gaming expansion",
      "work_culture_summary": "Collaborative, innovative culture with focus on inclusion and growth",
      "hiring_velocity": "High",
      "employee_turnover": "Moderate",
      "manager_quality": "Good",
      "psychological_safety": "High",
      "feedback_culture": "Strong",
      "diversity_metrics": "Strong diversity and inclusion programs",
      "ethical_standards": "High ethical standards",
      "mission_clarity": "Clear mission to empower people and organizations",
      "training_spend": "Significant investment in learning",
      "onboarding_quality": "Comprehensive onboarding",
      "learning_culture": "Strong learning culture",
      "exposure_quality": "High exposure to enterprise technologies",
      "mentorship_availability": "Good mentorship programs",
      "internal_mobility": "Excellent internal mobility",
      "tools_access": "Access to Microsoft tools and technologies",
      "role_clarity": "Clear role definitions",
      "early_ownership": "Encourages ownership",
      "work_impact": "High impact opportunities",
      "execution_thinking_balance": "Good balance",
      "automation_level": "High automation",
      "cross_functional_exposure": "Strong cross-functional work",
      "exit_opportunities": "Good exit opportunities",
      "skill_relevance": "Highly relevant skills",
      "network_strength": "Strong professional network",
      "global_exposure": "Extensive global exposure",
      "external_recognition": "High brand recognition",
      "annual_revenue": "$245B+",
      "annual_profit": "$88B+",
      "revenue_mix": "Cloud (30%), Productivity (25%), Gaming (15%), Other (30%)",
      "valuation": "$3.1T+",
      "yoy_growth_rate": "15-18%",
      "profitability_status": "Highly Profitable",
      "key_investors": "Public company",
      "burn_rate": "N/A",
      "runway_months": "N/A",
      "esg_ratings": "Strong ESG performance",
      "regulatory_status": "Compliant",
      "supply_chain_dependencies": "Global supply chain",
      "geopolitical_risks": "Moderate",
      "macro_risks": "Economic sensitivity",
      "tech_stack": ".NET, Azure, SQL Server, TypeScript",
      "technology_partners": "Extensive partner ecosystem",
      "intellectual_property": "Large patent portfolio",
      "r_and_d_investment": "$27B+ annually",
      "ai_ml_adoption_level": "Leader with OpenAI partnership",
      "cybersecurity_posture": "Enterprise-grade",
      "innovation_roadmap": "AI integration, mixed reality, sustainable computing",
      "product_pipeline": "AI products, cloud services, gaming",
      "tech_adoption_rating": "Excellent",
      "partnership_ecosystem": "Extensive",
      "ceo_name": "Satya Nadella",
      "ceo_linkedin_url": "https://linkedin.com/in/satyanadella",
      "key_leaders": "Experienced leadership team",
      "board_members": "Strong board composition",
      "decision_maker_access": "Multiple access points",
      "primary_contact_email": "careers@microsoft.com",
      "primary_phone_number": "+1-425-882-8080",
      "contact_person_name": "Recruiting Team",
      "contact_person_title": "Chief People Officer",
      "contact_person_email": "recruiting@microsoft.com",
      "contact_person_phone": "+1-425-882-8080",
      "website_url": "https://careers.microsoft.com",
      "website_quality": "Excellent",
      "website_rating": "4.4/5",
      "traffic_rank": "2",
      "social_media_followers": "Millions",
      "glassdoor_rating": "4.1",
      "indeed_rating": "4.2",
      "google_rating": "4.3",
      "linkedin_url": "https://linkedin.com/company/microsoft",
      "awards_recognitions": "Multiple workplace and innovation awards",
      "brand_sentiment_score": "Positive",
      "event_participation": "Major industry events"
    }'::jsonb
  ),
  (
    'amazon',
    '{
      "name": "Amazon",
      "short_name": "AMZN",
      "logo_url": "https://logo.clearbit.com/amazon.com",
      "category": "Marquee",
      "incorporation_year": 1994,
      "nature_of_company": "Product-Based",
      "headquarters_address": "Seattle, Washington, USA",
      "employee_size": "1,600,000+",
      "overview_text": "Amazon is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
      "focus_sectors": "E-commerce, Cloud Computing, AI, Logistics, Entertainment"
    }'::jsonb,
    '{
      "name": "Amazon",
      "short_name": "AMZN",
      "logo_url": "https://logo.clearbit.com/amazon.com",
      "category": "Marquee",
      "incorporation_year": 1994,
      "nature_of_company": "Product-Based",
      "headquarters_address": "Seattle, Washington, USA",
      "operating_countries": "Worldwide",
      "office_count": 200,
      "employee_size": "1,600,000+",
      "overview_text": "Amazon is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
      "history_timeline": "Started as an online bookstore in 1994, evolved into e-commerce giant.",
      "recent_news": "Major investments in AI, logistics, and advertising.",
      "pain_points_addressed": "E-commerce efficiency, cloud scalability, logistics optimization",
      "focus_sectors": "E-commerce, Cloud Computing, AI, Logistics, Entertainment",
      "offerings_description": "E-commerce platform, cloud services, streaming, advertising, logistics",
      "core_value_proposition": "Earth''s most customer-centric company",
      "unique_differentiators": "Logistics network, marketplace dominance, AWS",
      "competitive_advantages": "Scale, data, logistics infrastructure",
      "strategic_priorities": "AI/ML, logistics innovation, advertising growth",
      "work_culture_summary": "Fast-paced, customer-obsessed, innovative culture",
      "hiring_velocity": "Very High",
      "employee_turnover": "Moderate to High",
      "manager_quality": "Good",
      "psychological_safety": "Moderate",
      "feedback_culture": "Strong",
      "diversity_metrics": "Improving diversity initiatives",
      "ethical_standards": "High standards with transparency",
      "mission_clarity": "Clear customer-centric mission",
      "training_spend": "Significant training investments",
      "onboarding_quality": "Comprehensive onboarding",
      "learning_culture": "Strong learning culture",
      "exposure_quality": "High exposure to scale challenges",
      "mentorship_availability": "Good mentorship programs",
      "internal_mobility": "Excellent internal mobility",
      "tools_access": "Access to Amazon tools and scale",
      "role_clarity": "Clear role definitions",
      "early_ownership": "Strong ownership culture",
      "work_impact": "High impact opportunities",
      "execution_thinking_balance": "Strong execution focus",
      "automation_level": "High automation",
      "cross_functional_exposure": "Strong cross-functional work",
      "exit_opportunities": "Good exit opportunities",
      "skill_relevance": "Highly relevant skills",
      "network_strength": "Strong professional network",
      "global_exposure": "Extensive global exposure",
      "external_recognition": "High brand recognition",
      "annual_revenue": "$590B+",
      "annual_profit": "$36B+",
      "revenue_mix": "E-commerce (40%), AWS (30%), Advertising (20%), Other (10%)",
      "valuation": "$1.9T+",
      "yoy_growth_rate": "10-15%",
      "profitability_status": "Highly Profitable",
      "key_investors": "Public company",
      "burn_rate": "N/A",
      "runway_months": "N/A",
      "esg_ratings": "Strong ESG initiatives",
      "regulatory_status": "Compliant",
      "supply_chain_dependencies": "Extensive global supply chain",
      "geopolitical_risks": "Moderate",
      "macro_risks": "Economic sensitivity",
      "tech_stack": "Java, Python, AWS services, custom technologies",
      "technology_partners": "Extensive partner network",
      "intellectual_property": "Large IP portfolio",
      "r_and_d_investment": "$45B+ annually",
      "ai_ml_adoption_level": "Leader in AI applications",
      "cybersecurity_posture": "Enterprise-grade",
      "innovation_roadmap": "AI, robotics, drone delivery, quantum computing",
      "product_pipeline": "New AWS services, advertising products, logistics tech",
      "tech_adoption_rating": "Excellent",
      "partnership_ecosystem": "Extensive",
      "ceo_name": "Andy Jassy",
      "ceo_linkedin_url": "https://linkedin.com/in/andy-jassy",
      "key_leaders": "Experienced leadership team",
      "board_members": "Strong board",
      "decision_maker_access": "Multiple access points",
      "primary_contact_email": "amazon.jobs@amazon.com",
      "primary_phone_number": "+1-206-266-1000",
      "contact_person_name": "Recruiting Team",
      "contact_person_title": "VP of Global Talent Acquisition",
      "contact_person_email": "recruiting@amazon.com",
      "contact_person_phone": "+1-206-266-1000",
      "website_url": "https://amazon.jobs",
      "website_quality": "Excellent",
      "website_rating": "4.1/5",
      "traffic_rank": "3",
      "social_media_followers": "Millions",
      "glassdoor_rating": "3.8",
      "indeed_rating": "4.0",
      "google_rating": "4.2",
      "linkedin_url": "https://linkedin.com/company/amazon",
      "awards_recognitions": "Multiple innovation awards",
      "brand_sentiment_score": "Positive",
      "event_participation": "Major industry events"
    }'::jsonb
  ),
  (
    'tcs',
    '{
      "name": "Tata Consultancy Services",
      "short_name": "TCS",
      "logo_url": "https://logo.clearbit.com/tcs.com",
      "category": "SuperDream",
      "incorporation_year": 1968,
      "nature_of_company": "Service-Based",
      "headquarters_address": "Mumbai, Maharashtra, India",
      "employee_size": "600,000+",
      "overview_text": "Tata Consultancy Services is an Indian multinational information technology services and consulting company.",
      "focus_sectors": "IT Services, Consulting, Digital Transformation, Cloud, AI"
    }'::jsonb,
    '{
      "name": "Tata Consultancy Services",
      "short_name": "TCS",
      "logo_url": "https://logo.clearbit.com/tcs.com",
      "category": "SuperDream",
      "incorporation_year": 1968,
      "nature_of_company": "Service-Based",
      "headquarters_address": "Mumbai, Maharashtra, India",
      "operating_countries": "50+ countries",
      "office_count": 300,
      "employee_size": "600,000+",
      "overview_text": "Tata Consultancy Services is an Indian multinational information technology services and consulting company.",
      "history_timeline": "Founded in 1968 as part of Tata Group, became independent IT services company.",
      "recent_news": "Digital transformation initiatives and AI adoption.",
      "pain_points_addressed": "Digital transformation, legacy modernization, cloud migration",
      "focus_sectors": "IT Services, Consulting, Digital Transformation, Cloud, AI",
      "offerings_description": "IT consulting, software development, cloud services, digital solutions",
      "core_value_proposition": "Leading global consulting and IT services company",
      "unique_differentiators": "Tata brand, global delivery model, domain expertise",
      "competitive_advantages": "Scale, brand reputation, delivery capabilities",
      "strategic_priorities": "Digital transformation, cloud, AI, sustainability",
      "work_culture_summary": "Professional, learning-oriented culture with work-life balance",
      "hiring_velocity": "High",
      "employee_turnover": "Low",
      "manager_quality": "Good",
      "psychological_safety": "High",
      "feedback_culture": "Strong",
      "diversity_metrics": "Strong diversity focus",
      "ethical_standards": "High ethical standards",
      "mission_clarity": "Clear mission in technology services",
      "training_spend": "Significant training investments",
      "onboarding_quality": "Comprehensive onboarding",
      "learning_culture": "Strong learning culture",
      "exposure_quality": "High exposure to enterprise projects",
      "mentorship_availability": "Good mentorship programs",
      "internal_mobility": "Good internal mobility",
      "tools_access": "Access to enterprise tools",
      "role_clarity": "Clear role definitions",
      "early_ownership": "Encourages ownership",
      "work_impact": "High impact projects",
      "execution_thinking_balance": "Good balance",
      "automation_level": "Moderate automation",
      "cross_functional_exposure": "Strong cross-functional work",
      "exit_opportunities": "Good exit opportunities",
      "skill_relevance": "Highly relevant skills",
      "network_strength": "Strong professional network",
      "global_exposure": "Extensive global exposure",
      "external_recognition": "High brand recognition",
      "annual_revenue": "$28B+",
      "annual_profit": "$4B+",
      "revenue_mix": "IT Services (90%), Consulting (10%)",
      "valuation": "$150B+",
      "yoy_growth_rate": "8-12%",
      "profitability_status": "Profitable",
      "key_investors": "Public company",
      "burn_rate": "N/A",
      "runway_months": "N/A",
      "esg_ratings": "Strong ESG performance",
      "regulatory_status": "Compliant",
      "supply_chain_dependencies": "Global delivery network",
      "geopolitical_risks": "Low",
      "macro_risks": "Economic sensitivity",
      "tech_stack": "Java, .NET, Cloud platforms, Custom frameworks",
      "technology_partners": "Major technology vendors",
      "intellectual_property": "IP in solutions and frameworks",
      "r_and_d_investment": "$1B+ annually",
      "ai_ml_adoption_level": "Advanced adoption",
      "cybersecurity_posture": "Enterprise-grade",
      "innovation_roadmap": "AI, cloud, digital platforms",
      "product_pipeline": "Digital solutions, platforms",
      "tech_adoption_rating": "Good",
      "partnership_ecosystem": "Extensive",
      "ceo_name": "K. Ananth Krishnan",
      "ceo_linkedin_url": "https://linkedin.com/in/k-ananth-krishnan",
      "key_leaders": "Experienced leadership team",
      "board_members": "Strong board composition",
      "decision_maker_access": "Multiple access points",
      "primary_contact_email": "careers@tcs.com",
      "primary_phone_number": "+91-22-6778-9595",
      "contact_person_name": "HR Team",
      "contact_person_title": "Global Head of Talent Acquisition",
      "contact_person_email": "campusrecruitment@tcs.com",
      "contact_person_phone": "+91-22-6778-9595",
      "website_url": "https://www.tcs.com/careers",
      "website_quality": "Good",
      "website_rating": "4.0/5",
      "traffic_rank": "500",
      "social_media_followers": "Millions",
      "glassdoor_rating": "3.9",
      "indeed_rating": "4.1",
      "google_rating": "4.2",
      "linkedin_url": "https://linkedin.com/company/tcs",
      "awards_recognitions": "Multiple industry awards",
      "brand_sentiment_score": "Positive",
      "event_participation": "Industry conferences"
    }'::jsonb
  ),
  (
    'infosys',
    '{
      "name": "Infosys",
      "short_name": "Infosys",
      "logo_url": "https://logo.clearbit.com/infosys.com",
      "category": "SuperDream",
      "incorporation_year": 1981,
      "nature_of_company": "Service-Based",
      "headquarters_address": "Bengaluru, Karnataka, India",
      "employee_size": "350,000+",
      "overview_text": "Infosys is an Indian multinational corporation that provides business consulting, information technology and next-generation digital services.",
      "focus_sectors": "IT Services, Consulting, Digital Transformation, AI, Cloud"
    }'::jsonb,
    '{
      "name": "Infosys",
      "short_name": "Infosys",
      "logo_url": "https://logo.clearbit.com/infosys.com",
      "category": "SuperDream",
      "incorporation_year": 1981,
      "nature_of_company": "Service-Based",
      "headquarters_address": "Bengaluru, Karnataka, India",
      "operating_countries": "50+ countries",
      "office_count": 150,
      "employee_size": "350,000+",
      "overview_text": "Infosys is an Indian multinational corporation that provides business consulting, information technology and next-generation digital services.",
      "history_timeline": "Founded in 1981, pioneered Global Delivery Model.",
      "recent_news": "AI initiatives and digital transformation focus.",
      "pain_points_addressed": "Digital transformation, automation, cloud migration",
      "focus_sectors": "IT Services, Consulting, Digital Transformation, AI, Cloud",
      "offerings_description": "IT consulting, digital services, cloud solutions, AI services",
      "core_value_proposition": "Navigate your next with Infosys",
      "unique_differentiators": "Global Delivery Model, innovation focus",
      "competitive_advantages": "Delivery excellence, innovation culture",
      "strategic_priorities": "AI, cloud, digital platforms, sustainability",
      "work_culture_summary": "Innovative, collaborative culture with learning focus",
      "hiring_velocity": "High",
      "employee_turnover": "Low",
      "manager_quality": "Good",
      "psychological_safety": "High",
      "feedback_culture": "Strong",
      "diversity_metrics": "Strong diversity initiatives",
      "ethical_standards": "High ethical standards",
      "mission_clarity": "Clear innovation mission",
      "training_spend": "Significant training investments",
      "onboarding_quality": "Comprehensive onboarding",
      "learning_culture": "Strong learning culture",
      "exposure_quality": "High exposure to global projects",
      "mentorship_availability": "Good mentorship programs",
      "internal_mobility": "Good internal mobility",
      "tools_access": "Access to modern tools",
      "role_clarity": "Clear role definitions",
      "early_ownership": "Encourages ownership",
      "work_impact": "High impact opportunities",
      "execution_thinking_balance": "Good balance",
      "automation_level": "High automation",
      "cross_functional_exposure": "Strong cross-functional work",
      "exit_opportunities": "Good exit opportunities",
      "skill_relevance": "Highly relevant skills",
      "network_strength": "Strong professional network",
      "global_exposure": "Extensive global exposure",
      "external_recognition": "High brand recognition",
      "annual_revenue": "$18B+",
      "annual_profit": "$3B+",
      "revenue_mix": "IT Services (85%), Consulting (15%)",
      "valuation": "$80B+",
      "yoy_growth_rate": "8-10%",
      "profitability_status": "Profitable",
      "key_investors": "Public company",
      "burn_rate": "N/A",
      "runway_months": "N/A",
      "esg_ratings": "Strong ESG performance",
      "regulatory_status": "Compliant",
      "supply_chain_dependencies": "Global delivery network",
      "geopolitical_risks": "Low",
      "macro_risks": "Economic sensitivity",
      "tech_stack": "Java, Python, Cloud platforms, AI frameworks",
      "technology_partners": "Major technology partners",
      "intellectual_property": "IP in solutions and frameworks",
      "r_and_d_investment": "$800M+ annually",
      "ai_ml_adoption_level": "Advanced adoption",
      "cybersecurity_posture": "Enterprise-grade",
      "innovation_roadmap": "AI, automation, digital platforms",
      "product_pipeline": "Digital solutions, platforms",
      "tech_adoption_rating": "Good",
      "partnership_ecosystem": "Extensive",
      "ceo_name": "Salil Parekh",
      "ceo_linkedin_url": "https://linkedin.com/in/salil-parekh",
      "key_leaders": "Experienced leadership team",
      "board_members": "Strong board composition",
      "decision_maker_access": "Multiple access points",
      "primary_contact_email": "careers@infosys.com",
      "primary_phone_number": "+91-80-2852-0261",
      "contact_person_name": "HR Team",
      "contact_person_title": "Global Head of Talent Acquisition",
      "contact_person_email": "campusrecruitment@infosys.com",
      "contact_person_phone": "+91-80-2852-0261",
      "website_url": "https://www.infosys.com/careers",
      "website_quality": "Good",
      "website_rating": "4.1/5",
      "traffic_rank": "800",
      "social_media_followers": "Millions",
      "glassdoor_rating": "4.0",
      "indeed_rating": "4.2",
      "google_rating": "4.3",
      "linkedin_url": "https://linkedin.com/company/infosys",
      "awards_recognitions": "Multiple industry awards",
      "brand_sentiment_score": "Positive",
      "event_participation": "Industry conferences"
    }'::jsonb
  );

-- Insert sample hiring rounds data
INSERT INTO hiring_rounds_json (company_id, hiring_rounds_json) VALUES
  ('google', '[
    {
      "round": 1,
      "name": "Online Coding Assessment",
      "type": "Coding",
      "mode": "Online",
      "duration": "2 hours",
      "skills_focused": ["Data Structures", "Algorithms", "Problem Solving"],
      "topics": ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming"],
      "difficulty": "Hard",
      "questions_count": 4,
      "sample_questions": [
        "Solve the N-Queens problem",
        "Implement a LRU Cache",
        "Find the median of two sorted arrays",
        "Maximum path sum in binary tree"
      ]
    },
    {
      "round": 2,
      "name": "Technical Phone Screen",
      "type": "Technical",
      "mode": "Video Call",
      "duration": "45 minutes",
      "skills_focused": ["System Design", "Coding", "Problem Solving"],
      "topics": ["System Design", "Data Structures", "Algorithms"],
      "difficulty": "Medium-Hard",
      "questions_count": 2,
      "sample_questions": [
        "Design a URL shortening service",
        "Implement a thread-safe counter"
      ]
    },
    {
      "round": 3,
      "name": "Onsite Interviews",
      "type": "Technical",
      "mode": "Onsite",
      "duration": "4-5 hours",
      "skills_focused": ["Coding", "System Design", "Behavioral"],
      "topics": ["Advanced Algorithms", "System Design", "Leadership"],
      "difficulty": "Hard",
      "questions_count": 4,
      "sample_questions": [
        "Design Google Maps",
        "Solve complex algorithmic problems",
        "Leadership and behavioral questions"
      ]
    }
  ]'::jsonb),
  ('microsoft', '[
    {
      "round": 1,
      "name": "Online Assessment",
      "type": "Coding",
      "mode": "Online",
      "duration": "90 minutes",
      "skills_focused": ["Data Structures", "Algorithms"],
      "topics": ["Arrays", "Strings", "Trees", "Graphs"],
      "difficulty": "Medium",
      "questions_count": 2,
      "sample_questions": [
        "Two Sum problem variations",
        "Tree traversal problems"
      ]
    },
    {
      "round": 2,
      "name": "Technical Phone Interview",
      "type": "Technical",
      "mode": "Video Call",
      "duration": "1 hour",
      "skills_focused": ["System Design", "Coding"],
      "topics": ["System Design", "Data Structures"],
      "difficulty": "Medium",
      "questions_count": 2,
      "sample_questions": [
        "Design a chat system",
        "Implement data structures"
      ]
    },
    {
      "round": 3,
      "name": "Onsite Interviews",
      "type": "Technical",
      "mode": "Onsite",
      "duration": "4 hours",
      "skills_focused": ["Coding", "System Design", "Behavioral"],
      "topics": ["Advanced Topics", "System Design", "Leadership"],
      "difficulty": "Medium-Hard",
      "questions_count": 4,
      "sample_questions": [
        "Complex algorithmic problems",
        "System design questions",
        "Behavioral interviews"
      ]
    }
  ]'::jsonb);

-- Insert sample INNOVX data
INSERT INTO innovx_json (company_id, name, json_data) VALUES
  ('google', 'Google Innovation', '{
    "industry_trends": [
      {
        "trend": "AI-First Transformation",
        "description": "Companies are increasingly adopting AI as the core of their business strategy",
        "impact": "High",
        "timeline": "2024-2026"
      },
      {
        "trend": "Sustainable Computing",
        "description": "Focus on energy-efficient computing and carbon-neutral operations",
        "impact": "High",
        "timeline": "2024-2027"
      }
    ],
    "competitive_landscape": [
      {
        "competitor": "Microsoft",
        "focus": "Copilot, Enterprise AI Agents",
        "strengths": "Enterprise integration, developer tools"
      },
      {
        "competitor": "OpenAI",
        "focus": "GPT models, API services",
        "strengths": "AI model leadership, research"
      }
    ],
    "innovation_roadmap": {
      "technology": ["Quantum computing", "AI integration", "Sustainable tech"],
      "business": ["Platform economics", "Global expansion", "Partnerships"],
      "experience": ["Immersive interfaces", "Predictive UX", "Accessibility"]
    },
    "student_projects": {
      "foundational": [
        {
          "title": "AI-Powered Code Review Assistant",
          "problem": "Manual code review is time-consuming and error-prone",
          "technologies": ["Python", "TensorFlow", "GitHub API"],
          "impact": "Improve code quality and developer productivity"
        },
        {
          "title": "Sustainable Computing Optimizer",
          "problem": "Data centers consume significant energy",
          "technologies": ["Machine Learning", "Kubernetes", "Monitoring tools"],
          "impact": "Reduce energy consumption by 20-30%"
        }
      ],
      "advanced": [
        {
          "title": "Quantum Algorithm Simulator",
          "problem": "Quantum computing development is limited by access",
          "technologies": ["Qiskit", "Python", "WebAssembly"],
          "impact": "Democratize quantum computing development"
        }
      ],
      "breakthrough": [
        {
          "title": "Autonomous AI Research Agent",
          "problem": "Scientific research is slow and human-limited",
          "technologies": ["Large Language Models", "Automation", "APIs"],
          "impact": "Accelerate scientific discovery"
        }
      ]
    }
  }'::jsonb);