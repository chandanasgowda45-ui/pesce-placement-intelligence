import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useCompanies, useCompany } from "@/hooks/useCompanies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, Building2, TrendingUp, DollarSign, Brain, Users, Award, Minus } from "lucide-react";

const COMPARE_GROUPS = [
  {
    label: "Core Identity & Structure",
    icon: Building2,
    fields: [
      "name", "short_name", "logo_url", "category", "company_tier", 
      "incorporation_year", "nature_of_company", "headquarters_address", 
      "operating_countries", "office_count", "office_locations", 
      "employee_size", "overview_text", "history_timeline", "recent_news"
    ],
  },
  {
    label: "Business & Market Intelligence",
    icon: TrendingUp,
    fields: [
      "pain_points_addressed", "focus_sectors", "offerings_description", 
      "top_customers", "core_value_proposition", "unique_differentiators", 
      "competitive_advantages", "weaknesses_gaps", "key_challenges_needs", 
      "key_competitors", "tam", "sam", "som", "market_share_percentage", 
      "go_to_market_strategy", "strategic_priorities", "future_projections"
    ],
  },
  {
    label: "Culture, People & Sentiment",
    icon: Users,
    fields: [
      "work_culture_summary", "hiring_velocity", "employee_turnover", 
      "avg_retention_tenure", "manager_quality", "psychological_safety", 
      "feedback_culture", "diversity_metrics", "diversity_inclusion_score", 
      "ethical_standards", "layoff_history", "burnout_risk", "mission_clarity"
    ],
  },
  {
    label: "Learning & Career Velocity",
    icon: Award,
    fields: [
      "training_spend", "onboarding_quality", "learning_culture", 
      "exposure_quality", "mentorship_availability", "internal_mobility", 
      "promotion_clarity", "tools_access", "role_clarity", "early_ownership", 
      "work_impact", "execution_thinking_balance", "automation_level", 
      "cross_functional_exposure", "exit_opportunities", "skill_relevance", 
      "network_strength", "global_exposure", "external_recognition"
    ],
  },
  {
    label: "Financials, Risk & Stability",
    icon: DollarSign,
    fields: [
      "annual_revenue", "annual_profit", "revenue_mix", "valuation", 
      "yoy_growth_rate", "profitability_status", "key_investors", 
      "recent_funding_rounds", "total_capital_raised", "burn_rate", 
      "runway_months", "burn_multiplier", "esg_ratings", "regulatory_status", 
      "legal_issues", "supply_chain_dependencies", "geopolitical_risks", "macro_risks"
    ],
  },
  {
    label: "Technology & Innovation Stack",
    icon: Brain,
    fields: [
      "tech_stack", "technology_partners", "intellectual_property", 
      "r_and_d_investment", "ai_ml_adoption_level", "cybersecurity_posture", 
      "innovation_roadmap", "product_pipeline", "tech_adoption_rating", "partnership_ecosystem"
    ],
  },
  {
    label: "Compensation & Lifestyle",
    icon: DollarSign,
    fields: [
      "fixed_vs_variable_pay", "bonus_predictability", "esops_incentives", 
      "family_health_insurance", "relocation_support", "lifestyle_benefits", 
      "leave_policy", "health_support"
    ],
  },
  {
    label: "Work Logistics & Safety",
    icon: Building2,
    fields: [
      "remote_policy_details", "typical_hours", "overtime_expectations", 
      "weekend_work", "flexibility_level", "location_centrality", 
      "public_transport_access", "cab_policy", "airport_commute_time", 
      "office_zone_type", "area_safety", "safety_policies", 
      "infrastructure_safety", "emergency_preparedness"
    ],
  },
  {
    label: "Leadership & Decision Makers",
    icon: Users,
    fields: [
      "ceo_name", "ceo_linkedin_url", "key_leaders", "board_members", 
      "warm_intro_pathways", "decision_maker_access", "primary_contact_email", 
      "primary_phone_number", "contact_person_name", "contact_person_title", 
      "contact_person_email", "contact_person_phone"
    ],
  },
  {
    label: "Brand & Digital Presence",
    icon: Award,
    fields: [
      "website_url", "website_quality", "website_rating", "website_traffic_rank", 
      "social_media_followers", "glassdoor_rating", "indeed_rating", 
      "google_rating", "linkedin_url", "twitter_handle", "facebook_url", 
      "instagram_url", "marketing_video_url", "customer_testimonials", 
      "awards_recognitions", "brand_sentiment_score", "event_participation"
    ],
  },
];

function humanize(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Tam", "TAM")
    .replace("Sam", "SAM")
    .replace("Som", "SOM");
}

function RenderValue({ value }: { value: any }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/40 italic flex items-center justify-center gap-1"><Minus className="h-3 w-3" /> Not available</span>;
  }
  
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground/40 italic">Not available</span>;
    }
    const rendered = value.map((item) => {
      if (item === null || item === undefined) return "";
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return String(item);
      }
      if (typeof item === "object") {
        const rec = item as Record<string, unknown>;
        const pick = rec.name ?? rec.title ?? rec.role ?? rec.value ?? rec.label;
        return pick ? String(pick) : "";
      }
      return "";
    }).filter(Boolean);
    if (rendered.length > 0) return rendered.join(", ");
    try {
      return JSON.stringify(value);
    } catch {
      return "Not available";
    }
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Not available";
    }
  }

  const valStr = String(value);
  if (valStr.toLowerCase() === "n/a" || valStr.toLowerCase() === "unknown") {
    return <span className="text-muted-foreground/40 italic">Not available</span>;
  }

  return valStr;
}

const FIELD_ALIASES: Record<string, string[]> = {
  yoy_growth_rate: ["yoyGrowthRate", "yoy_growth", "growth_rate"],
  ceo_linkedin_url: ["ceo_linkedin", "ceoLinkedinUrl", "ceo_linkedin"],
  linkedin_url: ["linkedin", "linked_in_url"],
  website_url: ["website", "company_website"],
  tech_adoption_rating: ["tech_rating", "technology_rating"],
  ai_ml_adoption_level: ["aiml_adoption_level", "ai_adoption_level", "ml_adoption_level"],
  r_and_d_investment: ["rnd_investment", "r&d_investment", "research_and_development_investment"],
};

function canonicalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readAnyKey(record: Record<string, unknown>, key: string): unknown {
  if (key in record) return record[key];
  const target = canonicalize(key);
  for (const [k, v] of Object.entries(record)) {
    if (canonicalize(k) === target) return v;
  }
  return undefined;
}

function flattenRecord(input: unknown, prefix = "", depth = 0): Array<[string, unknown]> {
  if (!input || typeof input !== "object" || Array.isArray(input) || depth > 2) return [];
  const out: Array<[string, unknown]> = [];
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    out.push([path, value]);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...flattenRecord(value, path, depth + 1));
    }
  }
  return out;
}

function resolveFieldValue(company: any, field: string): unknown {
  if (!company) return undefined;

  const containers: Record<string, unknown>[] = [];
  if (company && typeof company === "object") containers.push(company);
  if (company?.short_json && typeof company.short_json === "object") containers.push(company.short_json);
  if (company?.full_json && typeof company.full_json === "object") containers.push(company.full_json);

  for (const container of containers) {
    const value = readAnyKey(container, field);
    if (value !== undefined && value !== null && value !== "") return value;
  }

  for (const alias of FIELD_ALIASES[field] || []) {
    for (const container of containers) {
      const value = readAnyKey(container, alias);
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }

  const flattened = containers.flatMap((container) => flattenRecord(container));
  const target = canonicalize(field);
  for (const [path, value] of flattened) {
    const key = canonicalize(path.split(".").pop() || path);
    if ((key.includes(target) || target.includes(key)) && key.length >= 6 && value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

export default function ComparePage() {
  const { data: companies = [] } = useCompanies();
  const [companyA, setCompanyA] = useState("");
  const [companyB, setCompanyB] = useState("");

  const { data: a, isLoading: loadingA, error: errorA } = useCompany(companyA);
  const { data: b, isLoading: loadingB, error: errorB } = useCompany(companyB);

  const isLoading = (companyA && loadingA) || (companyB && loadingB);
  const error = errorA || errorB;
  const totalComparedParams =
    COMPARE_GROUPS.reduce((sum, group) => sum + group.fields.length, 0);

  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Comparison Engine</h1>
          <p className="text-muted-foreground mt-1">
            Decision-grade side-by-side analysis of placement opportunities.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Parameters covered in this comparison: {totalComparedParams}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className={companyA ? "border-primary/50 shadow-md" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Primary Company</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={companyA} onValueChange={setCompanyA}>
                <SelectTrigger className="w-full bg-background border-2 h-12">
                  <SelectValue placeholder="Select first company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={String(c.company_id)} value={String(c.company_id)} disabled={String(c.company_id) === companyB}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className={companyB ? "border-primary/50 shadow-md" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Comparison Target</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={companyB} onValueChange={setCompanyB}>
                <SelectTrigger className="w-full bg-background border-2 h-12">
                  <SelectValue placeholder="Select second company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={String(c.company_id)} value={String(c.company_id)} disabled={String(c.company_id) === companyA}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 rounded-2xl bg-muted/10">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground font-medium italic">Analyzing 163 parameters...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center border-2 border-red-100 rounded-2xl bg-red-50 text-red-700">
            <h2 className="text-lg font-bold mb-1">Intelligence Retrieval Error</h2>
            <p className="text-sm">Failed to fetch deep-dive data. Please try again.</p>
          </div>
        ) : !a || !b ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30">
            <GitCompare className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-foreground/80">Ready to Compare</h2>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
              Select two companies above to see an objective, side-by-side comparison of 163+ data points.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-2 rounded-2xl overflow-hidden bg-card shadow-2xl">
              <div className="sticky top-0 z-20 grid grid-cols-12 gap-4 bg-muted/95 backdrop-blur border-b p-4 text-xs font-black uppercase tracking-tighter">
                <div className="col-span-4 text-muted-foreground/60 flex items-center">Intelligence Criteria</div>
                <div className="col-span-4 text-center text-primary truncate px-2">{a.name}</div>
                <div className="col-span-4 text-center text-primary truncate px-2">{b.name}</div>
              </div>

              {COMPARE_GROUPS.map((group, gIdx) => (
                <div key={group.label} className={gIdx !== 0 ? "border-t-4 border-muted/50" : ""}>
                  <div className="bg-muted/20 p-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                    <group.icon className="h-3.5 w-3.5 text-primary/60" />
                    {group.label}
                  </div>
                  <div className="divide-y divide-muted/50">
                    {group.fields.map((field) => (
                      <div key={field} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/5 transition-colors group">
                        <div className="col-span-4 flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary/70 transition-colors">{humanize(field)}</span>
                        </div>
                        <div className="col-span-4 text-center text-xs font-medium text-foreground/90">
                          <RenderValue value={resolveFieldValue(a, field)} />
                        </div>
                        <div className="col-span-4 text-center text-xs font-medium text-foreground/90">
                          <RenderValue value={resolveFieldValue(b, field)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
