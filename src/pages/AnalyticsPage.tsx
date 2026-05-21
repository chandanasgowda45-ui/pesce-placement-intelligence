import AppLayout from "@/components/layout/AppLayout";
import { useCompanies } from "@/hooks/useCompanies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { useValidatedDataset } from "@/lib/analyticsUtils";

// Student-friendly color palette
const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16", "#a855f7", "#0ea5e9"
];

// ── Custom Tooltip ──
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="font-bold text-slate-900">{label || payload[0]?.name || ""}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-600">
          <span className="font-semibold" style={{ color: p.color || p.fill }}>{p.dataKey || p.name || ""}:</span> {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { data: companies = [], isLoading: isPageLoading } = useCompanies();
  const navigate = useNavigate();

  // ── Global filter state ──
  const [sectorFilter, setSectorFilter] = useState("all");
  const [hiringFilter, setHiringFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");

  // ── Derived filter options ──
  const allSectors = useMemo(() => {
    return Array.from(new Set(companies.map(c => c.category).filter(Boolean))).sort() as string[];
  }, [companies]);

  const allSizes = useMemo(() => {
    return Array.from(new Set(companies.map(c => c.employee_size).filter(Boolean))).sort() as string[];
  }, [companies]);

  const allHiringSpeeds = useMemo(() => {
    return Array.from(new Set(companies.map(c => c.hiring_velocity).filter(Boolean))).sort() as string[];
  }, [companies]);

  // ── Apply global filters ──
  const filtered = useMemo(() => {
    const result = companies.filter(c => {
      if (sectorFilter !== "all" && c.category !== sectorFilter) return false;
      if (hiringFilter !== "all" && c.hiring_velocity !== hiringFilter) return false;
      if (sizeFilter !== "all" && c.employee_size !== sizeFilter) return false;
      return true;
    });

    // Diagnostics
    if (companies.length > 0 && result.length === 0) {
      console.warn(`[WARNING] Filter reduced dataset from ${companies.length} to 0. Active Filters: Sector=${sectorFilter}, Hiring=${hiringFilter}, Size=${sizeFilter}`);
    }

    return result;
  }, [companies, sectorFilter, hiringFilter, sizeFilter]);

  // ── KPI summary cards ──
  const kpis = useMemo(() => {
    const total = filtered.length;
    const highHiring = filtered.filter(c => c.hiring_velocity === "Very High" || c.hiring_velocity === "High").length;
    const avgGlassdoor = filtered.reduce((sum, c) => {
      const v = parseFloat(String(c.glassdoor_rating || "0"));
      return sum + (v > 0 && !isNaN(v) ? v : 0);
    }, 0);
    const glassdoorCount = filtered.filter(c => {
      const v = parseFloat(String(c.glassdoor_rating || "0"));
      return v > 0 && !isNaN(v);
    }).length;
    const avgRating = glassdoorCount > 0 ? (avgGlassdoor / glassdoorCount).toFixed(1) : "N/A";
    const growing = filtered.filter(c => {
      const v = parseFloat(String(c.yoy_growth_rate || "0").replace(/[^0-9.]/g, ""));
      return v > 10 && !isNaN(v);
    }).length;
    return { total, highHiring, avgRating, growing };
  }, [filtered]);

  // ── Analytics Datasets ──
  
  const industryData = useValidatedDataset(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const cat = (c.category || "Other").split("/")[0].trim();
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ 
        name: name.length > 18 ? name.slice(0, 18) + "…" : name, 
        count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  const hiringData = useValidatedDataset(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const hv = c.hiring_velocity || "Unknown";
      map[hv] = (map[hv] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const workModelData = useValidatedDataset(() => {
    const map: Record<string, number> = { "Remote": 0, "Hybrid": 0, "Onsite": 0 };
    filtered.forEach(c => {
      const policy = (c.remote_policy_details || "").toLowerCase();
      if (policy.includes("remote") || policy.includes("work from home")) map["Remote"]++;
      else if (policy.includes("hybrid") || policy.includes("partial")) map["Hybrid"]++;
      else map["Onsite"]++;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const techStackData = useValidatedDataset(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const stack = String(c.tech_stack || "").split(/[,|;]/);
      stack.forEach(s => {
        const tech = s.trim();
        if (tech && tech.length > 1 && tech.length < 20) {
          map[tech] = (map[tech] || 0) + 1;
        }
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  const radarData = useValidatedDataset(() => {
    const map: Record<string, { count: number; totalRating: number; totalTech: number; totalCulture: number }> = {};
    filtered.forEach(c => {
      const cat = (c.category || "Other").split("/")[0].trim();
      if (!map[cat]) map[cat] = { count: 0, totalRating: 0, totalTech: 0, totalCulture: 0 };
      map[cat].count += 1;
      map[cat].totalRating += parseFloat(c.glassdoor_rating || "0");
      map[cat].totalTech += parseFloat(c.tech_adoption_rating || "0");
      map[cat].totalCulture += parseFloat(c.diversity_inclusion_score || "0") / 20;
    });
    const result = Object.entries(map)
      .map(([sector, d]) => ({
        sector: sector.length > 12 ? sector.slice(0, 12) + "…" : sector,
        "Employee Rating": d.count > 0 ? Math.max(0, Math.round((d.totalRating / d.count) * 10) / 10) : 0,
        "Tech Strength": d.count > 0 ? Math.max(0, Math.round((d.totalTech / d.count) * 10) / 10) : 0,
        "Culture Score": d.count > 0 ? Math.max(0, Math.round((d.totalCulture / d.count) * 10) / 10) : 0
      }))
      .filter(item => !isNaN(item["Employee Rating"]) && !isNaN(item["Tech Strength"]))
      .sort((a, b) => b["Employee Rating"] - a["Employee Rating"])
      .slice(0, 8);

    if (filtered.length > 0 && result.length === 0) {
      console.warn("[WARNING] Radar dataset reduced to 0 despite having filtered companies");
    }
    return result;
  }, [filtered]);

  const salaryData = useValidatedDataset(() => {
    const tiers = {
      "Marquee (20LPA+)": 0,
      "Super Dream (10-20LPA)": 0,
      "Dream (5-10LPA)": 0,
      "Standard (3-5LPA)": 0
    };

    filtered.forEach(c => {
      // Try to get max salary from intelligence or full_json
      const roles = (c as any).full_json?.job_roles || (c as any).intelligence?.job_roles || [];
      let maxSalary = 0;
      
      roles.forEach((r: any) => {
        const rawSalary = String(r.salary || "0");
        // Extract numbers from strings like "10-20 LPA" or "15 LPA"
        const matches = rawSalary.match(/(\d+)/g);
        if (matches) {
          const values = matches.map(m => parseInt(m));
          const highestInRole = Math.max(...values);
          if (highestInRole > maxSalary) maxSalary = highestInRole;
        }
      });

      const tierStr = (c.company_tier || "").toLowerCase();
      if (maxSalary >= 20 || tierStr.includes("marquee")) tiers["Marquee (20LPA+)"]++;
      else if (maxSalary >= 10 || tierStr.includes("super dream")) tiers["Super Dream (10-20LPA)"]++;
      else if (maxSalary >= 5 || tierStr.includes("dream")) tiers["Dream (5-10LPA)"]++;
      else tiers["Standard (3-5LPA)"]++;
    });

    const result = Object.entries(tiers)
      .map(([name, value]) => ({ name, value }))
      .filter(t => !isNaN(t.value));

    if (filtered.length > 0 && result.length === 0) {
      console.warn("[WARNING] Salary dataset reduced to 0 despite having filtered companies");
    }
    return result;
  }, [filtered]);

  // ── Final Dataset Audits (Diagnostics) ──

  // ── Render Logic ──
  if (isPageLoading && companies.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-slate-500 font-medium">Analyzing placement ecosystem...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Placement <span className="text-primary">Analytics</span>
            </h1>
            <p className="text-slate-500 text-lg mt-2 max-w-2xl">
              Data-driven insights into the hiring ecosystem, salary potential, and company performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border">
            <Info className="h-4 w-4" />
            Live Market Signals
          </div>
        </div>

        {/* Global Filters */}
        <Card className="border rounded-2xl shadow-sm bg-white/50 backdrop-blur-sm sticky top-20 z-10">
          <CardContent className="py-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 mr-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Filters:</span>
            </div>
            
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[180px] h-10 rounded-xl text-sm border-slate-200">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {allSectors.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={hiringFilter} onValueChange={setHiringFilter}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl text-sm border-slate-200">
                <SelectValue placeholder="Hiring Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hiring Speeds</SelectItem>
                {allHiringSpeeds.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[180px] h-10 rounded-xl text-sm border-slate-200">
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {allSizes.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(sectorFilter !== "all" || hiringFilter !== "all" || sizeFilter !== "all") && (
              <button
                onClick={() => { setSectorFilter("all"); setHiringFilter("all"); setSizeFilter("all"); }}
                className="text-xs text-red-500 font-black hover:bg-red-50 px-3 py-2 rounded-lg transition-colors ml-auto uppercase tracking-tighter"
              >
                Reset Filters
              </button>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="rounded-[2rem] border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
            <CardContent className="pt-8 pb-6 text-center">
              <p className="text-5xl font-black text-primary tracking-tighter">{kpis.total}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Ecosystem Size</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-transparent shadow-sm">
            <CardContent className="pt-8 pb-6 text-center">
              <p className="text-5xl font-black text-emerald-600 tracking-tighter">{kpis.highHiring}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">High Velocity</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-2 border-amber-100 bg- gradient-to-br from-amber-50 to-transparent shadow-sm">
            <CardContent className="pt-8 pb-6 text-center">
              <p className="text-5xl font-black text-amber-600 tracking-tighter">{kpis.avgRating}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Avg Sentiment</p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-2 border-violet-100 bg-gradient-to-br from-violet-50 to-transparent shadow-sm">
            <CardContent className="pt-8 pb-6 text-center">
              <p className="text-5xl font-black text-violet-600 tracking-tighter">{kpis.growing}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Hypergrowth</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Salary Tiers */}
          <div className="lg:col-span-12">
            <ChartContainer
              title="Institutional Salary Tiers"
              description="Aggregate compensation potential across verified placement partners"
              dataset={salaryData}
              isLoading={isPageLoading}
              height={400}
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <ReBarChart data={salaryData.data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="name" fontSize={10} tick={{ fill: "#475569", fontWeight: 700 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis fontSize={12} tick={{ fill: "#475569" }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {salaryData.data.map((entry: any, index: number) => (
                      <Cell key={index} fill={
                        entry.name.includes("Marquee") ? "#6366f1" :
                          entry.name.includes("Super Dream") ? "#8b5cf6" :
                            entry.name.includes("Dream") ? "#ec4899" : "#94a3b8"
                      } />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Industry Penetration */}
          <div className="lg:col-span-7">
            <ChartContainer
              title="Industry Penetration"
              description="Sectors with the highest concentration of placement partners"
              dataset={industryData}
              isLoading={isPageLoading}
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <ReBarChart data={industryData.data} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.08} />
                  <XAxis type="number" fontSize={11} hide />
                  <YAxis dataKey="name" type="category" width={140} fontSize={11} tick={{ fill: "#475569", fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
                </ReBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Hiring Velocity */}
          <div className="lg:col-span-5">
            <ChartContainer
              title="Hiring Velocity"
              description="Distribution of campus recruitment speeds"
              dataset={hiringData}
              isLoading={isPageLoading}
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <PieChart>
                  <Pie
                    data={hiringData.data}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {hiringData.data.map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Work Model Mix */}
          <div className="lg:col-span-6">
            <ChartContainer
              title="Work Model Mix"
              description="Distribution of remote, hybrid, and onsite policies"
              dataset={workModelData}
              isLoading={isPageLoading}
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <PieChart>
                  <Pie
                    data={workModelData.data}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {workModelData.data.map((entry: any, i: number) => (
                      <Cell key={i} fill={
                        entry.name === "Remote" ? "#10b981" :
                        entry.name === "Hybrid" ? "#6366f1" : "#94a3b8"
                      } />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Tech Stack Popularity */}
          <div className="lg:col-span-6">
            <ChartContainer
              title="Tech Stack Popularity"
              description="Most common technologies used by placement partners"
              dataset={techStackData}
              isLoading={isPageLoading}
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <ReBarChart data={techStackData.data} margin={{ left: 10, right: 10, bottom: 60, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                  <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" interval={0} tick={{ fill: "#475569", fontWeight: 600 }} />
                  <YAxis fontSize={11} width={30} tick={{ fill: "#475569" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={25} />
                </ReBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Sector Strength Radar */}
          <div className="lg:col-span-12">
            <ChartContainer
              title="Sector Strength Radar"
              description="Multi-dimensional analysis of industry sectors"
              dataset={radarData}
              isLoading={isPageLoading}
              height={450}
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData.data}>
                  <PolarGrid strokeOpacity={0.2} />
                  <PolarAngleAxis dataKey="sector" fontSize={11} fontWeight="700" tick={{ fill: "#475569" }} />
                  <PolarRadiusAxis fontSize={10} angle={30} domain={[0, 5]} axisLine={false} tick={false} />
                  <Radar name="Employee Rating" dataKey="Employee Rating" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Radar name="Tech Strength" dataKey="Tech Strength" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Radar name="Culture Score" dataKey="Culture Score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="diamond" />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-3xl font-black tracking-tight">Need specific intelligence?</h3>
              <p className="text-slate-400 font-medium max-w-xl">
                Our database is constantly updating with real-time feedback and salary data. If you see missing information, it's usually because the data points are still being verified for accuracy.
              </p>
            </div>
            <button 
              onClick={() => navigate('/companies')}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all shadow-xl whitespace-nowrap active:scale-95"
            >
              Explore All Companies
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
