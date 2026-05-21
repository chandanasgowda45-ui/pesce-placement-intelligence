import AppLayout from "@/components/layout/AppLayout";
import SearchBar from "@/components/search/SearchBar";
import CompanyCard from "@/components/company/CompanyCard";
import EmptyState from "@/components/common/EmptyState";
import { useCompanies, useSearchCompanies } from "@/hooks/useCompanies";
import { Building2, TrendingUp, Sparkles, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { calculateDecision } from "@/services/decisionService";
import SafeImage from "@/components/common/SafeImage";
import { STRATEGIC_CATEGORIES, getStrategicCategory } from "@/lib/categoryUtils";


const CATEGORY_MAP = STRATEGIC_CATEGORIES.map(cat => ({
  ...cat,
  count: 0,
  color:
    cat.id === "tech-giants"        ? "border-indigo-500/20 bg-indigo-500/5 text-indigo-700" :
    cat.id === "product-companies" ? "border-blue-500/20 bg-blue-500/5 text-blue-700" :
    cat.id === "service-companies" ? "border-slate-500/20 bg-slate-500/5 text-slate-700" :
    "border-amber-500/20 bg-amber-500/5 text-amber-700",
}));

export default function HomePage() {
  const { data: companies = [] } = useCompanies();
  const { profile } = useStudentProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchCompanies(searchQuery);
  const navigate = useNavigate();

  // Personalized Recommendations Engine
  const recommendations = useMemo(() => {
    return companies
      .map(c => ({
        ...c,
        decision: calculateDecision(c, profile)
      }))
      .filter(c => c.decision.matchScore > 65)
      .sort((a, b) => b.decision.matchScore - a.decision.matchScore)
      .slice(0, 4);
  }, [companies, profile]);

  const displayCompanies = searchQuery ? searchResults || [] : [];

  const normalize = (s: string | undefined) => (s || "").toLowerCase().trim();

  // Advanced Ecosystem Metrics
  const metrics = useMemo(() => {
    const total = companies.length;
    const growthLeaders = companies.filter(c => {
      const rate = parseFloat(
  String(c.yoy_growth_rate || "0")
    .replace(/[^0-9.]/g, '')
);
      return rate > 20 && rate < 1000;
    }).length;
    
    const avgSignal = companies.reduce((acc, c) => {
      const s = ((parseFloat(c.brand_sentiment_score || "0") + parseFloat(c.glassdoor_rating || "0") + parseFloat(c.tech_adoption_rating || "0")) / 3);
      return acc + s;
    }, 0) / (total || 1);

    const marqueeCount = companies.filter(c => normalize(c.company_tier).includes("marquee") || normalize(c.company_tier).includes("tier 1")).length;

    return { total, growthLeaders, avgSignal: avgSignal.toFixed(1), marqueeCount };
  }, [companies]);

  const categoryStats = useMemo(() => {
    return CATEGORY_MAP.map(cat => {
      const count = companies.filter(c => getStrategicCategory(c).id === cat.id).length;
      return { ...cat, count };
    });
  }, [companies]);

  return (
    <AppLayout>
      <div className="space-y-10 pb-20">
        {/* Institutional Hero */}
        <div className="relative py-12 px-8 lg:px-10 rounded-[2rem] bg-slate-900 text-white overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/30 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="relative z-10 space-y-6 max-w-3xl">
            <Badge className="bg-primary hover:bg-primary text-white border-none px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
              PESCE Institutional Intelligence
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9]">
              Bridge the <span className="text-primary italic">Enterprise</span> Gap.
            </h1>
            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-snug max-w-xl">
              Data-driven market signals and institutional placement velocity for the PESCE ecosystem.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <button 
                onClick={() => navigate('/analytics')}
                className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:scale-[1.03] transition-all shadow-xl shadow-primary/30 active:scale-95"
              >
                Launch Intelligence Suite
              </button>
              <button 
                onClick={() => navigate('/skill-mapping')}
                className="px-8 py-3.5 bg-white/5 text-white backdrop-blur-xl rounded-xl font-bold text-sm hover:bg-white/15 transition-all border border-white/10 active:scale-95"
              >
                Map My Skills
              </button>
            </div>
          </div>
        </div>

        {/* Global Market Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group p-6 rounded-2xl border bg-background shadow-sm hover:border-primary/50 transition-all hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 group-hover:text-primary transition-colors">Ecosystem Depth</p>
            <div className="flex items-end gap-1.5">
              <h2 className="text-4xl font-black tracking-tighter">{metrics.total}</h2>
              <span className="text-sm font-bold mb-1 opacity-30">Vetted</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Institutional corporate entities</p>
          </div>
          <div className="group p-6 rounded-2xl border bg-background shadow-sm hover:border-blue-500/50 transition-all hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 group-hover:text-blue-600 transition-colors">Market Leaders</p>
            <div className="flex items-end gap-1.5 text-blue-600">
              <h2 className="text-4xl font-black tracking-tighter">{metrics.marqueeCount}</h2>
              <span className="text-sm font-bold mb-1 opacity-30">Elite</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Marquee & Tier 1 institutions</p>
          </div>
          <div className="group p-6 rounded-2xl border bg-background shadow-sm hover:border-emerald-500/50 transition-all hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 group-hover:text-emerald-600 transition-colors">Growth Highs</p>
            <div className="flex items-end gap-1.5 text-emerald-600">
              <h2 className="text-4xl font-black tracking-tighter">{metrics.growthLeaders}</h2>
              <span className="text-sm font-bold mb-1 opacity-30">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">&gt;20% YoY hiring velocity</p>
          </div>
          <div className="group p-6 rounded-2xl border bg-background shadow-sm hover:border-amber-500/50 transition-all hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 group-hover:text-amber-600 transition-colors">Aggregate Signal</p>
            <div className="flex items-end gap-1.5 text-amber-600">
              <h2 className="text-4xl font-black tracking-tighter">{metrics.avgSignal}</h2>
              <span className="text-sm font-bold mb-1 opacity-30">/5.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Institutional career sentiment</p>
          </div>
        </div>

        {/* Strategic Readiness Widget */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-indigo-600 rounded-2xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase">Market Pulse</Badge>
                <h3 className="text-3xl font-black leading-tight">Your Strategic Readiness.</h3>
                <p className="text-indigo-100 text-lg font-medium">
                  The ecosystem is currently seeing a <span className="text-white font-bold underline">High Velocity</span> in AI-Native Engineering and Product Management roles.
                </p>
                <Link to="/skill-mapping">
                  <button className="mt-4 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg">
                    Run Skill Gap Analysis
                  </button>
                </Link>
              </div>
              <div className="w-36 h-36 rounded-full border-[6px] border-white/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[6px] border-white border-t-transparent animate-spin-slow" />
                <div className="text-center">
                  <span className="text-4xl font-black block">84%</span>
                  <span className="text-[10px] font-bold uppercase opacity-70">Market Health</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-between border border-slate-800">
            <div className="space-y-4">
              <div className="p-4 bg-white/10 w-fit rounded-2xl">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black">Top Sector</h3>
              <p className="text-slate-400 font-medium">Tech Giants continue to lead institutional hiring, representing 42% of marquee offers this cycle.</p>
            </div>
            <Link to="/analytics" className="group flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mt-8">
              Explore Salary Tiers <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

        {/* Personalized Recommendations */}
        <div className="space-y-8">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary/50 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Decision Engine</Badge>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Recommended for <span className="text-primary underline">YOU</span></h2>
              <p className="text-muted-foreground text-lg font-medium">Top matches based on your skills ({profile.skills.join(", ")})</p>
            </div>
            <Link to="/compare" className="text-xs font-black text-primary hover:underline underline-offset-8 uppercase tracking-widest">Compare Matches →</Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((c) => (
              <Card 
                key={c.company_id} 
                onClick={() => navigate(`/companies/${c.company_id}`)}
                className="group relative bg-white rounded-2xl p-6 border-slate-200/60 shadow-sm hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                    {c.decision.selectionProbability}% PROBABILITY
                  </div>
                </div>
                
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 mb-4 group-hover:bg-primary/10 transition-colors">
                  {c.logo_url ? (
                    <SafeImage 
                      src={c.logo_url} 
                      alt={c.name} 
                      className="h-10 w-10 object-contain" 
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-black truncate">{c.name}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{c.category}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                    <span>{c.decision.recommendation}</span>
                    <span className="opacity-40">{c.decision.matchScore}% Match</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        </div>

        {/* Strategic Sectors */}
        <div className="space-y-10">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Institutional Clusters</h2>
              <p className="text-muted-foreground text-lg font-medium">Segmented intelligence across four strategic pillars</p>
            </div>
            <Link to="/categories" className="text-xs font-black text-primary hover:underline underline-offset-8 uppercase tracking-widest">VIEW ALL SECTORS</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categoryStats.map((cat) => (
              <Link key={cat.id} to={`/categories?id=${cat.id}`}>
                <div className={`group p-7 rounded-2xl border-2 transition-all hover:scale-[1.03] hover:shadow-xl cursor-pointer ${cat.color} relative overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 text-7xl opacity-10 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <div className="text-4xl mb-4 relative z-10">{cat.icon}</div>
                  <h3 className="font-black text-xl mb-1.5 relative z-10">{cat.label}</h3>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-2xl font-black">{cat.count}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified Entities</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Intelligence */}
        <div className="space-y-5 bg-slate-50 p-7 rounded-2xl border">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Entity Search</h2>
              <p className="text-muted-foreground text-sm font-medium">Access deep intelligence records for any company.</p>
            </div>
          </div>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search Amazon, TCS, NVIDIA, Zomato..."
          />
          
          {searchQuery && (
            <div className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Search Results ({displayCompanies.length})
              </p>
              {displayCompanies.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayCompanies.map((c) => (
                    <div key={c.company_id} className="relative">
                      {typeof c.intelligence === "object" && c.intelligence?.scores && (
                        <div className="absolute -top-3 -right-2 z-20 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-xl ring-4 ring-background">
                          {c.intelligence.scores.overall}% SCORE
                        </div>
                      )}
                      <CompanyCard company={c} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No matches in database" description="Refine your query or check the categories." />
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
