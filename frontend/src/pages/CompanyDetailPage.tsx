import React from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useCompanyFullData } from "@/hooks/useCompanyFullData";
import { DetailSection } from "@/components/company/DetailSection";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, Briefcase, Heart, GraduationCap,
  DollarSign, Shield, Cpu, UserCircle, Megaphone,
  ArrowLeft, CheckCircle2, FlaskConical, Target, ListChecks
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SafeImage from "@/components/common/SafeImage";
import { getStrategicCategory } from "@/lib/categoryUtils";
import { type FieldDefinition, type Company } from "@/types/company";
import { getDefaultHiringRounds, getDefaultJobRoles } from "@/data/defaultHiringRounds";

function safeEntries(value: unknown): Array<[string, unknown]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  try {
    return Object.entries(value as Record<string, unknown>);
  } catch {
    return [];
  }
}

const routeTabMap: Record<string, string> = {
  skills: "skills",
  process: "hiring",
  innovx: "innovx",
  intelligence: "overview",
  insights: "allparams",
};

function resolveInitialTab(searchTab: string | null, pathname: string) {
  if (searchTab) return searchTab;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  return lastSegment && routeTabMap[lastSegment] ? routeTabMap[lastSegment] : "overview";
}

function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState(() =>
    resolveInitialTab(searchParams.get("tab"), location.pathname)
  );

  React.useEffect(() => {
    setActiveTab(resolveInitialTab(searchParams.get("tab"), location.pathname));
  }, [location.pathname, searchParams]);

  const { data, isLoading, error } = useCompanyFullData(companyId || "");
  const company = data?.company; // Ensure company is not null for subsequent access
  const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;

  console.log("COMPONENT DATA:", data);
  console.log("COMPANY OBJECT:", company);
  console.log("HIRING FROM DATA:", data?.hiringRounds);
  console.log("HIRING FROM COMPANY:", company?.hiring_rounds_json);

  const innovx = React.useMemo(() => {
    if (!company) return null;
    // Defensive extraction for innovx_json, similar to hiringRounds logic
    let rawInnovxJson = (company as any)?.innovx_json;
    let innovxContainer: any = null;

    if (Array.isArray(rawInnovxJson)) {
      if (rawInnovxJson.length === 1 && typeof rawInnovxJson[0] === 'object' && rawInnovxJson[0] !== null) {
        innovxContainer = rawInnovxJson[0];
      } else if (rawInnovxJson.length > 0 && typeof rawInnovxJson[0] === 'object' && (rawInnovxJson[0].overview || rawInnovxJson[0].active_projects)) {
        // If it's an array of innovx objects directly, take the first one as the main payload
        innovxContainer = rawInnovxJson[0];
      }
    } else if (typeof rawInnovxJson === 'object' && rawInnovxJson !== null) {
      innovxContainer = rawInnovxJson;
    }

    // Apply fallback traversal for innovx payload
    const baseInnovx = data?.innovx || innovxContainer?.innovx_json || innovxContainer || {};

    const splitStr = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
      return String(val).split(/[,;\n•]+/).map(s => s.trim()).filter(Boolean);
    };

    let overview = baseInnovx.overview;
    if (!overview && company.innovation_roadmap) {
      overview = company.innovation_roadmap;
    }
    if (!overview && company.overview_text) {
      overview = company.overview_text;
    }
    if (!overview) {
      overview = "Innovation intelligence and forward-looking research profile.";
    }

    // Handle stringified JSON for overview if it somehow ended up as a string
    if (typeof overview === 'string' && overview.trim().startsWith('{')) {
      try {
        const parsedOverview = JSON.parse(overview);
        overview = parsedOverview.text || parsedOverview.summary || overview;
      } catch (e) {
        // Keep original string if parsing fails
      }
    }
    if (typeof overview === 'object' && overview !== null) {
      overview = overview.text || overview.summary || "Innovation intelligence and forward-looking research profile.";
    }
    overview = String(overview);

    const active_projects = baseInnovx.active_projects && baseInnovx.active_projects.length > 0
      ? baseInnovx.active_projects
      : splitStr(company.product_pipeline);

    const lab_locations = baseInnovx.lab_locations && baseInnovx.lab_locations.length > 0
      ? baseInnovx.lab_locations
      : splitStr(company.operating_countries || company.office_locations);

    const patents = baseInnovx.metrics?.patents ||
      String((company as any).patent_count || (company as any).patents || "N/A");

    const r_and_d_spend = baseInnovx.metrics?.r_and_d_spend ||
      String(company.r_and_d_investment || "N/A");

    const innovation_index = baseInnovx.metrics?.innovation_index ||
      String((company as any).innovation_score || company.tech_adoption_rating || "75");

    return {
      overview,
      active_projects: active_projects.length > 0 ? active_projects : ["Core Platform R&D", "AI Automation Projects"],
      lab_locations: lab_locations.length > 0 ? lab_locations : ["Global Centers", "Headquarters Lab"],
      metrics: {
        patents: patents !== "undefined" ? patents : "N/A",
        r_and_d_spend: r_and_d_spend !== "undefined" ? r_and_d_spend : "N/A",
        innovation_index: innovation_index !== "undefined" ? innovation_index : "75"
      }
    };
  }, [data?.innovx, company?.innovx_json, company?.innovation_roadmap, company?.overview_text, company?.product_pipeline, company?.operating_countries, company?.office_locations, (company as any)?.patent_count, (company as any)?.patents, company?.r_and_d_investment, (company as any)?.innovation_score, company?.tech_adoption_rating]);

  const hiringRounds = React.useMemo(() => {
    const source =
      data?.hiringRounds ||
      (company as any)?.hiring_rounds_json ||
      (company as any)?.full_json?.hiring_rounds ||
      [];

    let rounds = source;

    if (!Array.isArray(rounds)) {
      rounds =
        rounds?.hiring_rounds ||
        rounds?.rounds ||
        rounds?.stages ||
        [];
    }

    if (typeof rounds === "string") {
      try {
        rounds = JSON.parse(rounds);
      } catch {
        rounds = [];
      }
    }

    console.log("FINAL ROUNDS:", rounds);

    const mappedRounds = Array.isArray(rounds)
      ? rounds.map((round: any, index: number) => ({
        order: round.order ?? round.round ?? index + 1,
        name: String(round.name || round.title || "Interview Round"),
        type: String(round.type || round.stage || "Interview"),
        duration: String(round.duration || round.timeline || "N/A"),
      }))
      : [];

    if (mappedRounds.length === 0 && company) {
      return getDefaultHiringRounds(company);
    }

    return mappedRounds;
  }, [company, data]);


  const skills = React.useMemo(() => {
    // PRIORITY 1 — REAL BACKEND DATA (Normalized from job_role_details_json) with strengthened validation
    const validSkills = (data?.skills || []).filter(
      (role: any) =>
        role &&
        (role.role || role.role_title) &&
        Array.isArray(role.skills) &&
        role.skills.length > 0
    );

    if (validSkills.length > 0) {
      return validSkills;
    }

    // PRIORITY 2 — COMPANY PAYLOAD (metadata, joined columns, or legacy fields)
    const joined = (Array.isArray((company as any)?.job_role_details_json) ? (company as any).job_role_details_json[0] : (company as any)?.job_role_details_json);
    const joinedPayload = joined?.job_role_json || joined;
    const joinedList = joinedPayload?.job_role_details || (Array.isArray(joinedPayload) ? joinedPayload : null);

    const raw = joinedList || company?.job_roles || (company?.full_json as any)?.job_roles || (company as any)?.top_roles_and_skills;

    let source = raw;
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      try { source = JSON.parse(raw); } catch { source = []; }
    }

    if (Array.isArray(source) && source.length > 0) {
      return source.map((item: any) => {
        if (typeof item === 'string') return { role: item, salary: "Competitive Package", skills: [] };
        return {
          role: String(item.role || item.title || item.name || "Technical Specialist"),
          salary: String(item.salary || item.package || "Competitive Package"),
          skills: Array.isArray(item.skills) ? item.skills.map(String) : []
        };
      });
    }

    // Tech stack check as part of Priority 2
    const tech = String(company?.tech_stack || "").split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (tech.length > 0) {
      return [{ role: "Engineering & Core Technology", salary: "Market Standard", skills: Array.from(new Set(tech)) }];
    }

    // PRIORITY 3 — FALLBACK GENERATOR (Only if everything else fails)
    if (company) {
      return getDefaultJobRoles(company);
    }

    return [];
  }, [data?.skills, company]);

  // Helper to categorize skills for display
  const categorizeSkills = React.useCallback((skills: string[]) => {
    const categories: Record<string, string[]> = {
      "Frontend Development": [],
      "Backend Development": [],
      "Cloud & DevOps": [],
      "Database & Data Management": [],
      "Mobile Development": [],
      "Testing & Quality Assurance": [],
      "Data Science & Machine Learning": [],
      "Project Management & Soft Skills": [],
      "Other Technical Skills": []
    };

    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (["react", "angular", "vue", "javascript", "typescript", "html", "css", "frontend", "ui/ux", "next.js", "redux", "zustand", "web components"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Frontend Development"].push(skill);
      } else if (["python", "java", "node.js", "go", "c#", "spring", "django", "flask", "backend", "api", "microservices", "php", "ruby", "rust", "kotlin (backend)", "scala"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Backend Development"].push(skill);
      } else if (["aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd", "terraform", "ansible", "jenkins", "git", "gitlab", "github actions", "cloudformation", "serverless"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Cloud & DevOps"].push(skill);
      } else if (["sql", "postgresql", "mysql", "mongodb", "redis", "database", "nosql", "oracle", "cassandra", "data warehousing", "etl"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Database & Data Management"].push(skill);
      } else if (["android", "ios", "swift", "kotlin (mobile)", "react native", "flutter", "mobile", "xamarin"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Mobile Development"].push(skill);
      } else if (["qa", "testing", "selenium", "cypress", "jest", "playwright", "junit", "test automation", "performance testing"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Testing & Quality Assurance"].push(skill);
      } else if (["machine learning", "ml", "ai", "artificial intelligence", "data science", "pytorch", "tensorflow", "scikit-learn", "r", "nlp", "computer vision", "big data", "hadoop", "spark"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Data Science & Machine Learning"].push(skill);
      } else if (["agile", "scrum", "project management", "communication", "leadership", "problem solving", "critical thinking"].some(keyword => lowerSkill.includes(keyword))) {
        categories["Project Management & Soft Skills"].push(skill);
      } else {
        categories["Other Technical Skills"].push(skill);
      }
    });
    return Object.entries(categories).filter(([, skillList]) => skillList.length > 0);
  }, []);

  const allParamEntries = React.useMemo(() =>
    company ? safeEntries(company)
      .filter(([key]) => !["company_id", "intelligence", "full_json", "short_json"].includes(key))
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      : [],
    [company]
  );

  const sections: Array<{ id: string; label: string; icon: any; fields: FieldDefinition[] }> = React.useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        icon: Building2,
        fields: [
          { label: "Name", fieldKey: "name" },
          { label: "Short Name", fieldKey: "short_name" },
          { label: "Category", fieldKey: "category" },
          { label: "Incorporation Year", fieldKey: "incorporation_year" },
          { label: "Nature of Company", fieldKey: "nature_of_company" },
          { label: "Headquarters", fieldKey: "headquarters_address" },
          { label: "Employee Size", fieldKey: "employee_size" },
          { label: "Overview", fieldKey: "overview_text" },
        ],
      },
      {
        id: "hiring",
        label: "Hiring Process",
        icon: ListChecks,
        fields: [
          { label: "Hiring Velocity", fieldKey: "hiring_velocity" },
          { label: "Employee Turnover", fieldKey: "employee_turnover" },
          { label: "Rounds", fieldKey: "hiring_rounds" }
        ],
      },
      {
        id: "skills",
        label: "Roles & Skills",
        icon: Target,
        fields: [
          { label: "Tech Stack", fieldKey: "tech_stack" },
          { label: "Skill Relevance", fieldKey: "skill_relevance" }
        ],
      },
      {
        id: "business",
        label: "Business & Market",
        icon: Briefcase,
        fields: [
          { label: "Pain Points Addressed", fieldKey: "pain_points_addressed" },
          { label: "Focus Sectors", fieldKey: "focus_sectors" },
          { label: "Offerings", fieldKey: "offerings_description" },
          { label: "Top Customers", fieldKey: "top_customers" },
          { label: "Core Value Proposition", fieldKey: "core_value_proposition" },
          { label: "Unique Differentiators", fieldKey: "unique_differentiators" },
          { label: "Competitive Advantages", fieldKey: "competitive_advantages" },
          { label: "Weaknesses & Gaps", fieldKey: "weaknesses_gaps" },
          { label: "Key Challenges", fieldKey: "key_challenges_needs" },
          { label: "Key Competitors", fieldKey: "key_competitors" },
          { label: "Market Share %", fieldKey: "market_share_percentage" },
          { label: "Strategic Priorities", fieldKey: "strategic_priorities" },
        ],
      },
      {
        id: "culture",
        label: "Culture & People",
        icon: Heart,
        fields: [
          { label: "Work Culture", fieldKey: "work_culture_summary" },
          { label: "Hiring Velocity", fieldKey: "hiring_velocity" },
          { label: "Employee Turnover", fieldKey: "employee_turnover" },
          { label: "Manager Quality", fieldKey: "manager_quality" },
          { label: "Psychological Safety", fieldKey: "psychological_safety" },
          { label: "Feedback Culture", fieldKey: "feedback_culture" },
          { label: "D&I Score", fieldKey: "diversity_inclusion_score" },
          { label: "Burnout Risk", fieldKey: "burnout_risk" },
        ],
      },
      {
        id: "compensation",
        label: "Compensation",
        icon: DollarSign,
        fields: [
          { label: "Fixed vs Variable Pay", fieldKey: "fixed_vs_variable_pay" },
          { label: "Bonus Predictability", fieldKey: "bonus_predictability" },
          { label: "ESOPs / Incentives", fieldKey: "esops_incentives" },
          { label: "Lifestyle Benefits", fieldKey: "lifestyle_benefits" },
        ],
      },
      {
        id: "tech",
        label: "Technology",
        icon: Cpu,
        fields: [
          { label: "Tech Stack", fieldKey: "tech_stack" },
          { label: "AI/ML Adoption Level", fieldKey: "ai_ml_adoption_level" },
          { label: "Cybersecurity Posture", fieldKey: "cybersecurity_posture" },
          { label: "Innovation Roadmap", fieldKey: "innovation_roadmap" },
          { label: "Tech Adoption Rating", fieldKey: "tech_adoption_rating" },
        ],
      },
      {
        id: "growth",
        label: "Career & Exit",
        icon: GraduationCap,
        fields: [
          { label: "Exit Opportunities", fieldKey: "exit_opportunities" },
          { label: "Skill Relevance", fieldKey: "skill_relevance" },
        ],
      },
    ],
    [company]
  );

  const sectionMap = React.useMemo(
    () => sections.reduce((acc, section) => {
      acc[section.id] = section;
      return acc;
    }, {} as Record<string, { id: string; label: string; icon: any; fields: FieldDefinition[] }>),
    [sections]
  );

  const currentSection = sectionMap[activeTab] ?? null;

  React.useEffect(() => {
    if (!isLoading && data && !currentSection) {
      const customTabs = ["hiring", "skills", "innovx", "allparams"];
      if (!customTabs.includes(activeTab)) {
        console.warn(`[WARN] Missing section mapping for activeTab="${activeTab}"`);
      }
    }
  }, [isLoading, data, activeTab, currentSection]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <EmptyState
          title={isOffline ? "Offline" : "Company not found"}
          description={
            isOffline
              ? "Internet connection unavailable. Please reconnect and try again."
              : error instanceof Error
                ? error.message
                : String(error) || "This company doesn't exist or data hasn't been loaded."
          }
        />
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white overflow-hidden border-2 border-slate-200/60 shadow-sm p-2">
            <SafeImage
              src={company.logo_url || ""}
              alt={company.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">{company.name}</h1>
              <div className="flex items-center gap-2">
                {company.category && <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{company.category}</Badge>}
                <Badge variant="outline" className={`font-black uppercase tracking-widest text-[10px] py-1 px-3 ${getStrategicCategory(company).color}`}>
                  {getStrategicCategory(company).icon} {getStrategicCategory(company).label}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {company.short_name && <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{company.short_name}</span>}
              {company.employee_size && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Users className="h-3.5 w-3.5" /> {company.employee_size} Employees
                </span>
              )}
              {company.headquarters_address && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Building2 className="h-3.5 w-3.5" /> HQ: {company.headquarters_address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
          <div className="border-b overflow-x-auto scrollbar-hide">
            <TabsList className="flex h-auto bg-transparent p-0 justify-start min-w-max text-sm font-medium text-slate-600">
              <TabsTrigger value="overview" className="tab-trigger">Overview</TabsTrigger>
              <TabsTrigger value="hiring" className="tab-trigger">Hiring Process</TabsTrigger>
              <TabsTrigger value="skills" className="tab-trigger">Roles & Skills</TabsTrigger>
              <TabsTrigger value="innovx" className="tab-trigger">InnovX Lab</TabsTrigger>
              <TabsTrigger value="business" className="tab-trigger">Business</TabsTrigger>
              <TabsTrigger value="culture" className="tab-trigger">Culture</TabsTrigger>
              <TabsTrigger value="growth" className="tab-trigger">Career</TabsTrigger>
              <TabsTrigger value="compensation" className="tab-trigger">Compensation</TabsTrigger>
              <TabsTrigger value="tech" className="tab-trigger">Tech Stack</TabsTrigger>
              <TabsTrigger value="allparams" className="tab-trigger">All Params</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-8 space-y-8">
            <DetailSection title="Company Overview" icon={Building2} fields={sectionMap["overview"]?.fields ?? []} company={company} />
            {company.overview_text && (
              <Card className="border-none shadow-none bg-muted/30">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Deep Insights
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{company.overview_text}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hiring" className="mt-8">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Main Rounds Column */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl"><ListChecks className="h-5 w-5 text-primary" /></div>
                  <div><h2 className="text-2xl font-black tracking-tight text-slate-900">Hiring Process & Rounds</h2><p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Candidate Journey Mapping</p></div>
                </div>

                {hiringRounds.length > 0 ? (
                  <div className="grid gap-4">
                    {[...hiringRounds].sort((a, b) => (a.order || 0) - (b.order || 0)).map((round, idx) => (
                      <Card key={idx} className="border-2 hover:border-primary/30 transition-all">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg">{round.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold">{round.type}</Badge>
                              {round.duration && <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> {round.duration}</span>}
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No Hiring Data" description="Detailed hiring process stages haven't been mapped for this company yet." />
                )}
              </div>

              {/* Sidebar Metrics Column */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl"><Briefcase className="h-5 w-5 text-primary" /></div>
                  <div><h2 className="text-2xl font-black tracking-tight text-slate-900">Hiring Indicators</h2><p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Talent Acquisition Metrics</p></div>
                </div>

                <Card className="border-2">
                  <CardContent className="p-6 space-y-6">
                    {company.hiring_velocity && (
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Hiring Velocity</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-primary hover:bg-primary/95 text-xs px-3 py-1 font-bold">
                            {company.hiring_velocity}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {company.employee_turnover && (
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Employee Turnover</span>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{company.employee_turnover}</p>
                      </div>
                    )}

                    {company.work_culture_summary && (
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Work Culture</span>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">{company.work_culture_summary}</p>
                      </div>
                    )}

                    {company.learning_culture && (
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Learning & Development</span>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">{company.learning_culture}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-8 outline-none">
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Job Roles & Skill Taxonomy</h2>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Institutional Talent Requirements</p>
                  </div>
                </div>
                <Badge variant="outline" className="hidden sm:flex border-primary/20 text-primary font-black text-[10px] px-3 py-1 rounded-full bg-primary/5">
                  {skills.length} ACTIVE PATHWAYS
                </Badge>
              </div>

              {skills && skills.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {skills.map((role, idx) => (
                    <Card key={idx} className="group border-2 border-slate-200/60 shadow-md hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white">
                      <CardHeader className="p-5 pb-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 bg-slate-50 group-hover:bg-primary/10 rounded-xl transition-all duration-300 border border-slate-100 group-hover:border-primary/20 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                              HIGH DEMAND
                            </Badge>
                            <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                              TRENDING
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <CardTitle className="text-xl font-black leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                            {role.role}
                          </CardTitle>
                          {role.salary && (
                            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                              {role.salary}
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
                        <div className="h-px bg-gradient-to-r from-slate-100 via-slate-200 to-transparent w-full mb-5" />

                        <div className="flex-1 space-y-5">
                          {categorizeSkills(role.skills || []).map(([category, categorizedSkillList]) => (
                            <div key={category}>
                              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{category}</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {categorizedSkillList.map((skill: string) => (
                                  <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-white hover:border-primary/30 hover:text-primary transition-all cursor-default"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                          {role.skills?.length === 0 && (
                            <div className="text-[10px] text-muted-foreground font-medium italic">
                              Requirement analysis in progress...
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Recruiter Match</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 w-3 rounded-full transition-all duration-500 ${level <= Math.floor(Math.random() * 3) + 3 ? 'bg-primary/60 group-hover:bg-primary' : 'bg-slate-100'}`}
                                style={{ transitionDelay: `${level * 50}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState title="No Skill Mapping" description="Specific skill requirements per job role haven't been integrated yet." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="innovx" className="mt-8">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">InnovX Lab</h2>
                    <p className="text-sm text-muted-foreground font-medium">Strategic R&D & Intelligence Insights</p>
                  </div>
                </div>
                <Badge className="w-fit bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg shadow-indigo-500/20">
                  Active Intelligence
                </Badge>
              </div>

              {innovx ? (
                <div className="grid gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-8 space-y-8">
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                        Research Overview
                      </h3>
                      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-slate-100 p-8 shadow-sm">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-indigo-50/50" />
                        <p className="relative text-slate-600 text-lg leading-relaxed font-medium">
                          {innovx.overview}
                        </p>
                      </div>
                    </section>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Target className="h-4 w-4 text-indigo-500" /> Key Projects
                        </h3>
                        <div className="grid gap-3">
                          {innovx.active_projects?.map((p: string) => (
                            <div key={p} className="group p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-indigo-200 transition-all flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                              <span className="font-bold text-slate-700">{p}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-indigo-500" /> Lab Network
                        </h3>
                        <div className="grid gap-3">
                          {innovx.lab_locations?.map((l: string) => (
                            <div key={l} className="p-4 bg-slate-50/50 border-2 border-transparent rounded-2xl flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                <Shield className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-slate-600">{l}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <Card className="border-2 border-indigo-100 rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/5">
                      <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg font-black text-indigo-900">Lab Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-8">
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Patents</span>
                            <span className="text-3xl font-black text-indigo-600">{innovx.metrics?.patents}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">R&D Spend</span>
                            <span className="text-2xl font-black text-emerald-600">{innovx.metrics?.r_and_d_spend}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t text-center">
                          <div className="inline-flex flex-col items-center p-6 rounded-full bg-indigo-50 border-4 border-white shadow-inner">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Innovation Index</span>
                            <span className="text-5xl font-black text-indigo-700">{innovx.metrics?.innovation_index}</span>
                            <span className="text-xs font-bold text-indigo-400">out of 100</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Cpu className="h-4 w-4 text-indigo-400" />
                      </div>
                      <h4 className="font-bold">Intelligence Feed</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Continuous monitoring of technical patents, open source contributions, and strategic acquisitions.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Lab Access Restricted"
                  description="Detailed innovation intelligence for this entity is currently being processed by our analysis engine."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="business" className="mt-8">
            <DetailSection title="Business & Market Intelligence" icon={Briefcase} fields={sectionMap["business"]?.fields ?? []} company={company} />
          </TabsContent>

          <TabsContent value="culture" className="mt-8">
            <DetailSection title="People & Culture Metrics" icon={Heart} fields={sectionMap["culture"]?.fields ?? []} company={company} />
          </TabsContent>

          <TabsContent value="growth" className="mt-8">
            <DetailSection title="Career & Exit" icon={GraduationCap} fields={sectionMap["growth"]?.fields ?? []} company={company} />
          </TabsContent>

          <TabsContent value="compensation" className="mt-8">
            <DetailSection title="Compensation" icon={DollarSign} fields={sectionMap["compensation"]?.fields ?? []} company={company} />
          </TabsContent>

          <TabsContent value="tech" className="mt-8">
            <DetailSection title="Technology Stack & Infrastructure" icon={Cpu} fields={sectionMap["tech"]?.fields ?? []} company={company} />
          </TabsContent>

          <TabsContent value="allparams" className="mt-8">
            <Card className="border rounded-2xl">
              <CardHeader>
                <CardTitle>All Supabase Parameters</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total parameters available for this company: {allParamEntries.length}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {allParamEntries.map(([key, value]) => (
                    <div key={key} className="space-y-1 rounded-md border p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs whitespace-pre-wrap break-words">
                        {value === null || value === undefined || value === ""
                          ? "Not available"
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default CompanyDetailPage;
