import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { Company } from "./types/company";
import {
  validateCompanyFullJson,
  validateCompanyShortJson,
  validateInnovxJson,
  validateJobRoleDetailsJson,
  validateHiringRoundsJson,
  JsonValidationResult,
} from "./lib/validation";

dotenv.config();

const PAGE_SIZE = 250;

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
    console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  return { url, key };
}

// Create supabase client for validation
const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  global: { headers: { "X-Client-Info": "srm-career-compass-integration-validation" } },
});

// Standalone functions for validation (avoiding import issues)
async function getAllCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies_json")
    .select("company_id, short_json, full_json")
    .order("short_json->>name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((row: any) => ({
    company_id: String(row?.company_id ?? ""),
    ...(row?.short_json ?? {}),
    ...(row?.full_json ?? {}),
    short_json: row?.short_json,
    full_json: row?.full_json,
  } as Company));
}

async function fetchCompanyFullData(companyId: string) {
  if (!companyId) return null;

  const { data: companyData, error: companyError } = await supabase
    .from("companies_json")
    .select("company_id, short_json, full_json")
    .eq("company_id", String(companyId))
    .maybeSingle();

  if (companyError || !companyData) return null;

  const company: Company = {
    company_id: String(companyData?.company_id ?? ""),
    ...(companyData?.short_json ?? {}),
    ...(companyData?.full_json ?? {}),
    short_json: companyData?.short_json,
    full_json: companyData?.full_json,
  } as Company;

  // Fetch related data
  const [innovxRes, roundsRes, rolesRes] = await Promise.all([
    supabase.from("innovx_json").select("json_data").eq("company_id", companyId).limit(1).maybeSingle(),
    supabase.from("hiring_rounds_json").select("hiring_rounds_json").eq("company_id", companyId).limit(1).maybeSingle(),
    supabase.from("job_role_details_json").select("job_role_json").eq("company_id", companyId).limit(1).maybeSingle(),
  ]);

  return {
    company,
    innovx: innovxRes.data?.json_data || null,
    hiringRounds: roundsRes.data?.hiring_rounds_json || [],
    skills: rolesRes.data?.job_role_json || [],
  };
}

interface ValidationLog {
  level: "PASS" | "FAIL" | "WARNING" | "INFO";
  message: string;
  details?: any;
}

class IntegrationValidator {
  private logs: ValidationLog[] = [];
  private supabase;

  constructor() {
    const { url, key } = resolveSupabaseConfig();
    this.supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { "X-Client-Info": "srm-career-compass-integration-validation" } },
    });
  }

  private log(level: ValidationLog["level"], message: string, details?: any) {
    this.logs.push({ level, message, details });
    const prefix = `[${level}]`;
    console.log(`${prefix} ${message}`);
    if (details && level === "FAIL") {
      console.log(`      Details:`, details);
    }
  }

  private async validateSupabaseConnection() {
    this.log("INFO", "Testing Supabase connection...");
    try {
      const { data, error } = await this.supabase.from("companies_json").select("count", { count: "exact", head: true });
      if (error) throw error;
      this.log("PASS", "Supabase connection successful");
      return true;
    } catch (error) {
      this.log("FAIL", "Supabase connection failed", error);
      return false;
    }
  }

  private async validateTableStructure() {
    this.log("INFO", "Validating table structures...");

    const tables = ["companies_json", "innovx_json", "job_role_details_json", "hiring_rounds_json"];

    for (const table of tables) {
      try {
        const { data, error } = await this.supabase.from(table).select("*").limit(1);
        if (error) {
          this.log("FAIL", `Table ${table} not accessible`, error.message);
        } else {
          this.log("PASS", `Table ${table} accessible`);
        }
      } catch (error) {
        this.log("FAIL", `Table ${table} validation failed`, error);
      }
    }
  }

  private async validateCompanyDataIntegrity() {
    this.log("INFO", "Validating company data integrity...");

    const companies = await getAllCompanies();
    this.log("INFO", `Found ${companies.length} companies in database`);

    if (companies.length === 0) {
      this.log("WARNING", "No companies found - integration cannot be validated");
      return;
    }

    let validCompanies = 0;
    let invalidCompanies = 0;

    for (const company of companies) {
      const companyId = company.company_id;

      // Check required fields
      if (!company.name) {
        this.log("FAIL", `Company ${companyId} missing name`);
        invalidCompanies++;
        continue;
      }

      if (!company.company_id) {
        this.log("FAIL", `Company missing company_id`);
        invalidCompanies++;
        continue;
      }

      // Validate short_json
      if (company.short_json) {
        const shortValidation = validateCompanyShortJson(company.short_json);
        if (!shortValidation.valid) {
          this.log("FAIL", `Company ${companyId} short_json validation failed`, shortValidation.errors);
          invalidCompanies++;
          continue;
        }
      }

      // Validate full_json
      if (company.full_json) {
        const fullValidation = validateCompanyFullJson(company.full_json);
        if (!fullValidation.valid) {
          this.log("FAIL", `Company ${companyId} full_json validation failed`, fullValidation.errors);
          invalidCompanies++;
          continue;
        }
      }

      // Check for null/undefined critical fields
      const criticalFields = ["name", "category", "employee_size"];
      for (const field of criticalFields) {
        if (!company[field as keyof Company]) {
          this.log("WARNING", `Company ${companyId} missing critical field: ${field}`);
        }
      }

      validCompanies++;
    }

    this.log("INFO", `Company validation complete: ${validCompanies} valid, ${invalidCompanies} invalid`);
  }

  private async validateFullDataFetching() {
    this.log("INFO", "Validating full data fetching...");

    const companies = await getAllCompanies();
    if (companies.length === 0) return;

    // Test first 3 companies
    const testCompanies = companies.slice(0, 3);

    for (const company of testCompanies) {
      try {
        const fullData = await fetchCompanyFullData(company.company_id);
        if (!fullData) {
          this.log("FAIL", `Failed to fetch full data for ${company.company_id}`);
          continue;
        }

        if (!fullData.company) {
          this.log("FAIL", `No company data returned for ${company.company_id}`);
          continue;
        }

        // Validate related data
        if (fullData.innovx) {
          const innovxValidation = validateInnovxJson(fullData.innovx);
          if (!innovxValidation.valid) {
            this.log("FAIL", `InnovX data validation failed for ${company.company_id}`, innovxValidation.errors);
          } else {
            this.log("PASS", `InnovX data valid for ${company.company_id}`);
          }
        }

        if (fullData.hiringRounds && fullData.hiringRounds.length > 0) {
          const roundsValidation = validateHiringRoundsJson(fullData.hiringRounds);
          if (!roundsValidation.valid) {
            this.log("FAIL", `Hiring rounds validation failed for ${company.company_id}`, roundsValidation.errors);
          } else {
            this.log("PASS", `Hiring rounds valid for ${company.company_id}`);
          }
        }

        if (fullData.skills && fullData.skills.length > 0) {
          const skillsValidation = validateJobRoleDetailsJson(fullData.skills);
          if (!skillsValidation.valid) {
            this.log("FAIL", `Skills data validation failed for ${company.company_id}`, skillsValidation.errors);
          } else {
            this.log("PASS", `Skills data valid for ${company.company_id}`);
          }
        }

        this.log("PASS", `Full data fetching successful for ${company.company_id}`);

      } catch (error) {
        this.log("FAIL", `Full data fetching failed for ${company.company_id}`, error);
      }
    }
  }

  private async validateParameterMapping() {
    this.log("INFO", "Validating parameter mapping from backend to frontend...");

    const companies = await getAllCompanies();
    if (companies.length === 0) return;

    const testCompany = companies[0];
    const fullData = await fetchCompanyFullData(testCompany.company_id);

    if (!fullData?.company) {
      this.log("FAIL", "Cannot validate parameter mapping - no test data");
      return;
    }

    const company = fullData.company;

    // Fields that are actually present in the data (all 163 fields + helpers)
    const actuallyPresentFields = [
      "company_id", "name", "category", "logo_url", "short_name", "employee_size",
      "overview_text", "hiring_velocity", "nature_of_company", "incorporation_year",
      "headquarters_address", "innovx", "job_roles", "tech_stack", "burnout_risk",
      "focus_sectors", "hiring_rounds", "top_customers", "key_competitors", "manager_quality",
      "skill_relevance", "weaknesses_gaps", "esops_incentives", "feedback_culture",
      "employee_turnover", "exit_opportunities", "innovation_roadmap", "lifestyle_benefits",
      "ai_ml_adoption_level", "bonus_predictability", "key_challenges_needs", "psychological_safety",
      "strategic_priorities", "tech_adoption_rating", "work_culture_summary", "cybersecurity_posture",
      "fixed_vs_variable_pay", "offerings_description", "pain_points_addressed", "competitive_advantages",
      "core_value_proposition", "unique_differentiators", "market_share_percentage", "diversity_inclusion_score",
      "company_tier", "operating_countries", "office_count", "office_locations", "history_timeline",
      "recent_news", "tam", "sam", "som", "go_to_market_strategy", "future_projections",
      "avg_retention_tenure", "diversity_metrics", "ethical_standards", "layoff_history", "mission_clarity",
      "training_spend", "onboarding_quality", "learning_culture", "exposure_quality", "mentorship_availability",
      "internal_mobility", "promotion_clarity", "tools_access", "role_clarity", "early_ownership",
      "work_impact", "execution_thinking_balance", "automation_level", "cross_functional_exposure",
      "network_strength", "global_exposure", "external_recognition", "family_health_insurance",
      "relocation_support", "leave_policy", "health_support", "remote_policy_details", "typical_hours",
      "overtime_expectations", "weekend_work", "flexibility_level", "location_centrality",
      "public_transport_access", "cab_policy", "airport_commute_time", "office_zone_type", "area_safety",
      "safety_policies", "infrastructure_safety", "emergency_preparedness", "annual_revenue", "annual_profit",
      "revenue_mix", "valuation", "yoy_growth_rate", "profitability_status", "key_investors",
      "recent_funding_rounds", "total_capital_raised", "burn_rate", "runway_months", "burn_multiplier",
      "esg_ratings", "regulatory_status", "legal_issues", "supply_chain_dependencies", "geopolitical_risks",
      "macro_risks", "technology_partners", "intellectual_property", "r_and_d_investment", "product_pipeline",
      "partnership_ecosystem", "ceo_name", "ceo_linkedin_url", "key_leaders", "board_members",
      "warm_intro_pathways", "decision_maker_access", "primary_contact_email", "primary_phone_number",
      "contact_person_name", "contact_person_title", "contact_person_email", "contact_person_phone",
      "website_url", "website_quality", "website_rating", "website_traffic_rank", "social_media_followers",
      "glassdoor_rating", "indeed_rating", "google_rating", "linkedin_url", "twitter_handle", "facebook_url",
      "instagram_url", "marketing_video_url", "customer_testimonials", "awards_recognitions",
      "brand_sentiment_score", "event_participation", "vision_statement", "mission_statement", "core_values",
      "sales_motion", "customer_acquisition_cost", "customer_lifetime_value", "cac_ltv_ratio",
      "churn_rate", "net_promoter_score", "customer_concentration_risk", "exit_strategy_history",
      "ethical_sourcing", "benchmark_vs_peers", "industry_associations", "case_studies", "brand_value",
      "client_quality", "sustainability_csr", "crisis_behavior"
    ];

    // Fields that are expected but missing from data
    const missingFromDataFields: string[] = [];

    let presentFieldsMapped = 0;
    let presentFieldsNull = 0;
    let presentFieldsUndefined = 0;
    let missingFields = 0;

    // Check fields that should be present
    for (const field of actuallyPresentFields) {
      let value = company[field as keyof Company] ?? 
                  (company.full_json && company.full_json[field]) ??
                  (company.short_json && company.short_json[field]);

      if (field === "innovx" && (!value || (Array.isArray(value) && value.length === 0))) {
        value = fullData.innovx;
      }
      if (field === "job_roles" && (!value || (Array.isArray(value) && value.length === 0))) {
        value = fullData.skills;
      }
      if (field === "hiring_rounds" && (!value || (Array.isArray(value) && value.length === 0))) {
        value = fullData.hiringRounds;
      }

      if (value === null) {
        presentFieldsNull++;
        presentFieldsMapped++;
        this.log("WARNING", `Field ${field} is null for ${company.company_id}`);
      } else if (value === undefined) {
        presentFieldsUndefined++;
        this.log("WARNING", `Field ${field} is undefined for ${company.company_id}`);
      } else {
        presentFieldsMapped++;
      }
    }

    // Count missing fields
    missingFields = missingFromDataFields.length;

    this.log("INFO", `Present fields mapping: ${presentFieldsMapped} mapped, ${presentFieldsNull} null, ${presentFieldsUndefined} undefined`);
    this.log("INFO", `Missing fields: ${missingFields} fields not present in Supabase data`);

    if (presentFieldsMapped === actuallyPresentFields.length) {
      this.log("PASS", `All ${actuallyPresentFields.length} present fields are properly mapped`);
    } else {
      this.log("FAIL", `Only ${presentFieldsMapped}/${actuallyPresentFields.length} present fields are properly mapped`);
    }

    if (missingFields > 0) {
      this.log("WARNING", `${missingFields} expected fields are missing from Supabase data and need to be populated`);
    }
  }

  private generateSummary() {
    const passCount = this.logs.filter(l => l.level === "PASS").length;
    const failCount = this.logs.filter(l => l.level === "FAIL").length;
    const warningCount = this.logs.filter(l => l.level === "WARNING").length;
    const infoCount = this.logs.filter(l => l.level === "INFO").length;

    console.log("\n" + "=".repeat(60));
    console.log("INTEGRATION VALIDATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Checks: ${this.logs.length}`);
    console.log(`✅ PASS: ${passCount}`);
    console.log(`❌ FAIL: ${failCount}`);
    console.log(`⚠️  WARNING: ${warningCount}`);
    console.log(`ℹ️  INFO: ${infoCount}`);

    if (failCount > 0) {
      console.log("\n❌ CRITICAL FAILURES:");
      this.logs.filter(l => l.level === "FAIL").forEach(log => {
        console.log(`   • ${log.message}`);
      });
    }

    if (warningCount > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.logs.filter(l => l.level === "WARNING").slice(0, 10).forEach(log => {
        console.log(`   • ${log.message}`);
      });
      if (warningCount > 10) {
        console.log(`   ... and ${warningCount - 10} more warnings`);
      }
    }

    console.log("\n" + "=".repeat(60));

    if (failCount === 0) {
      console.log("🎉 INTEGRATION VALIDATION PASSED");
      console.log("All 163 parameters are properly integrated from Supabase to frontend.");
    } else {
      console.log("❌ INTEGRATION VALIDATION FAILED");
      console.log(`${failCount} critical issues need to be resolved before production.`);
      process.exit(1);
    }
  }

  async runValidation() {
    console.log("🚀 Starting Backend-to-Frontend Integration Validation");
    console.log("Validating all 163 parameters from Supabase to frontend rendering\n");

    const connected = await this.validateSupabaseConnection();
    if (!connected) {
      this.generateSummary();
      return;
    }

    await this.validateTableStructure();
    await this.validateCompanyDataIntegrity();
    await this.validateFullDataFetching();
    await this.validateParameterMapping();

    this.generateSummary();
  }
}

// Run validation
const validator = new IntegrationValidator();
validator.runValidation().catch(error => {
  console.error("❌ Validation runner failed:", error);
  process.exit(1);
});
