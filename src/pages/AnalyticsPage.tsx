import AppLayout from "@/components/layout/AppLayout";
import { useCompanies } from "@/hooks/useCompanies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
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
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

// Student-friendly color palette
const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16", "#a855f7", "#0ea5e9"
];

// ── Custom Tooltip (Stable definition for HMR) ──
interface TooltipProps {
  active?: boolean;
  payload?: unknown[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="font-bold text-slate-900">{label || String((payload[0] as Record<string, unknown>)?.name ?? "")}</p>
      {payload.map((p: unknown, i: number) => {
        const item = p as Record<string, unknown>;
        return (
          <p  key={i} className="text-slate-600">
            <span className="font-semibold" style={{ color: String(item.color ?? "") }}>{String(item.dataKey ?? item.name ?? "")}:</span> {String(item.value ?? "")}</p>
        );
      })}
    </div>
  );
};

export default function AnalyticsPage() {
  const { data: companies = [] } = useCompanies();
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

  const hiringLevels = ["Very High", "High", "Medium", "Low"];

  // ── Apply global filters ──
  const filtered = useMemo(() => {
    return companies.filter(c => {
      if (sectorFilter !== "all" && c.category !== sectorFilter) return false;
      if (hiringFilter !== "all" && c.hiring_velocity !== hiringFilter) return false;
      if (sizeFilter !== "all" && c.employee_size !== sizeFilter) return false;
      return true;
    });
  }, [companies, sectorFilter, hiringFilter, sizeFilter]);

  // ── KPI summary cards ──
  const kpis = useMemo(() => {
    const total = filtered.length;
    const highHiring = filtered.filter(c => c.hiring_velocity === "Very High" || c.hiring_velocity === "High").length;
    const avgGlassdoor = filtered.reduce((sum, c) => {
      const v = parseFloat(c.glassdoor_rating || "0");
      return sum + (v > 0 ? v : 0);
    }, 0);
    const glassdoorCount = filtered.filter(c => parseFloat(c.glassdoor_rating || "0") > 0).length;
    const avgRating = glassdoorCount > 0 ? (avgGlassdoor / glassdoorCount).toFixed(1) : "N/A";
    const growing = filtered.filter(c => {
      const v = parseFloat((c.yoy_growth_rate || "0").replace(/[^0-9.]/g, ""));
      return v > 10;
    }).length;
    return { total, highHiring, avgRating, growing };
  }, [filtered]);

  // ── Chart 1: Companies by Industry (horizontal bar) ──
  const industryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const cat = (c.category || "Other").split("/")[0].trim();
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  // ── Chart 2: Hiring Velocity Distribution (pie) ──
  const hiringDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const hv = c.hiring_velocity || "Unknown";
      map[hv] = (map[hv] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ── Chart 3: Company Size Distribution (pie) ──
  const sizeDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const sz = c.employee_size || "Unknown";
      map[sz] = (map[sz] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ── Chart 4: Top Companies by Glassdoor Rating (bar) ──
  const topRated = useMemo(() => {
    return filtered
      .map(c => ({
        name: (c.name || "").length > 15 ? (c.name || "").slice(0, 15) + "…" : (c.name || ""),
        rating: parseFloat(c.glassdoor_rating || "0")
      }))
      .filter(c => c.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, [filtered]);

  // ── Chart 5: YoY Growth Leaders (bar) ──
  const growthLeaders = useMemo(() => {
    return filtered
      .map(c => {
        const val = parseFloat((c.yoy_growth_rate || "0").replace(/[^0-9.]/g, ""));
        return {
          name: (c.name || "").length > 15 ? (c.name || "").slice(0, 15) + "…" : (c.name || ""),
          growth: val > 0 && val < 500 ? val : 0
        };
      })
      .filter(c => c.growth > 0)
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 10);
  }, [filtered]);

  // ── Chart 6: Nature of Business (pie) ──
  const natureDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      let nature = (c.nature_of_company || "Other").split("(")[0].trim();
      if (nature.length > 20) nature = nature.slice(0, 20) + "…";
      map[nature] = (map[nature] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  // ── Chart 7: Career Signal Scatter (prestige vs hiring speed) ──
  const careerScatter = useMemo(() => {
    return filtered
      .map(c => {
        const prestige = (
          (parseFloat(c.brand_sentiment_score || "0") +
            parseFloat(c.glassdoor_rating || "0") +
            parseFloat(c.tech_adoption_rating || "0")) / 3
        );
        const speed = c.hiring_velocity === "Very High" ? 90
          : c.hiring_velocity === "High" ? 70
            : c.hiring_velocity === "Medium" ? 50 : 30;
        return {
          name: c.name || "",
          prestige: Math.round(prestige * 10) / 10,
          speed,
          size: c.employee_size?.includes("10,000") ? 200 : 80,
          category: c.category || "Other",
          tier: "—" // Tier data not available
        };
      })
      .filter(d => d.prestige > 0);
  }, [filtered]);

  // ── Chart 8: Industry Radar (sector strength) ──
  const radarData = useMemo(() => {
    const map: Record<string, { count: number; avgRating: number; totalRating: number }> = {};
    filtered.forEach(c => {
      const cat = (c.category || "Other").split("/")[0].trim();
      if (!map[cat]) map[cat] = { count: 0, avgRating: 0, totalRating: 0 };
      map[cat].count += 1;
      const r = parseFloat(c.glassdoor_rating || "0");
      if (r > 0) map[cat].totalRating += r;
    });
    return Object.entries(map)
      .map(([sector, d]) => ({
        sector: sector.length > 12 ? sector.slice(0, 12) + "…" : sector,
        companies: d.count,
        avgRating: d.count > 0 ? Math.round((d.totalRating / d.count) * 10) / 10 : 0
      }))
      .sort((a, b) => b.companies - a.companies)
      .slice(0, 8);
  }, [filtered]);

  // ── Chart 4: Salary Tier Distribution (derived from tier) ──
  const salaryData = useMemo(() => {
    const tiers = {
      "Marquee (20LPA+)": 0,
      "Super Dream (10-20LPA)": 0,
      "Dream (5-10LPA)": 0,
      "Standard (3-5LPA)": 0,
      "Unclassified": 0
    };

    filtered.forEach(c => {
      // Since tier data is not available, categorize by employee size
      const size = c.employee_size || "";
      if (size.includes("100,000") || size.includes("50,000")) tiers["Marquee (20LPA+)"]++;
      else if (size.includes("10,000") || size.includes("5,000")) tiers["Super Dream (10-20LPA)"]++;
      else if (size.includes("1,000") || size.includes("500")) tiers["Dream (5-10LPA)"]++;
      else tiers["Standard (3-5LPA)"]++;
    });

    return Object.entries(tiers)
      .map(([name, value]) => ({ name, value }))
      .filter(t => t.value > 0);
  }, [filtered]);

  // ── Loading ──
  if (companies.length === 0) {
    return (
      <AppLayout>
        <EmptyState title="Loading Analytics" description="Fetching placement data…" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-20">
        {/* ── Header ── */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Placement <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-slate-500 text-lg mt-2 max-w-2xl">
            Understand which companies are hiring, where the best opportunities lie, and how to plan your career path — all from real placement data.
          </p>
        </div>

        {/* ── Global Filters ── */}
        <Card className="border rounded-2xl shadow-sm">
          <CardContent className="py-4 flex flex-wrap gap-4 items-center">
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Filters:</span>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[180px] h-9 rounded-lg text-sm">
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
              <SelectTrigger className="w-[160px] h-9 rounded-lg text-sm">
                <SelectValue placeholder="Hiring Speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hiring Speeds</SelectItem>
                {hiringLevels.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[200px] h-9 rounded-lg text-sm">
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
                className="text-sm text-red-500 font-bold hover:underline ml-2"
              >
                Clear All
              </button>
            )}
          </CardContent>
        </Card>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-black text-primary">{kpis.total}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Companies</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-black text-emerald-600">{kpis.highHiring}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Actively Hiring</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-black text-amber-600">{kpis.avgRating}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Avg. Glassdoor</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-2 border-violet-200 bg-violet-50">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-black text-violet-600">{kpis.growing}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Fast Growing (10%+)</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Student Intelligence: Salary & Package Tiers ── */}
        <Card className="rounded-2xl border-2 border-primary/10 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Institutional Salary Tiers</CardTitle>
                <CardDescription>Aggregate compensation potential across current placement partners</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={salaryData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" fontSize={12} fontStyle="bold" tick={{ fill: "#475569" }} />
                <YAxis fontSize={12} tick={{ fill: "#475569" }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {salaryData.map((entry, index) => (
                    <Cell key={index} fill={
                      entry.name.includes("Marquee") ? "#6366f1" :
                        entry.name.includes("Super Dream") ? "#8b5cf6" :
                          entry.name.includes("Dream") ? "#ec4899" : "#94a3b8"
                    } />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Row 1: Industry Breakdown + Hiring Speed ── */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Companies by Industry */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Companies by Industry</CardTitle>
              <CardDescription>Which sectors have the most placement partners?</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={industryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.08} />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={120} fontSize={11} tick={{ fill: "#475569" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} name="Companies" />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hiring Speed Distribution */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Hiring Speed Breakdown</CardTitle>
              <CardDescription>How fast are companies recruiting from campus?</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hiringDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {hiringDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 2: Top Rated + Growth Leaders ── */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Rated Companies */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Top Rated on Glassdoor</CardTitle>
              <CardDescription>Best employee-reviewed companies hiring on campus</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={topRated} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                  <XAxis dataKey="name" fontSize={10} angle={-35} textAnchor="end" height={60} tick={{ fill: "#475569" }} />
                  <YAxis domain={[0, 5]} fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rating" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} name="Rating" />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Leaders */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Fastest Growing Companies</CardTitle>
              <CardDescription>Companies expanding rapidly — more future roles expected</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={growthLeaders} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.08} />
                  <XAxis dataKey="name" fontSize={10} angle={-35} textAnchor="end" height={60} tick={{ fill: "#475569" }} />
                  <YAxis unit="%" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="growth" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} name="YoY Growth %" />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 3: Company Size + Nature of Business ── */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Size Distribution */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Company Size Distribution</CardTitle>
              <CardDescription>MNCs vs mid-size vs startups in your placement pool</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sizeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name.length > 16 ? name.slice(0, 16) + "…" : name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {sizeDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Nature of Business */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Nature of Business</CardTitle>
              <CardDescription>Product vs service vs consulting — where do opportunities lie?</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={natureDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {natureDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 4: Career Fit Matrix (Scatter) ── */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Career Fit Matrix</CardTitle>
            <CardDescription>
              Plot of company prestige (ratings) vs hiring speed — top-right = dream companies that are actively hiring
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis
                  type="number" dataKey="prestige" name="Prestige"
                  domain={[0, 5]} unit="/5"
                  label={{ value: "Company Prestige (avg rating)", position: "bottom", offset: 0, fontSize: 12 }}
                  fontSize={11}
                />
                <YAxis
                  type="number" dataKey="speed" name="Hiring Speed"
                  domain={[0, 100]} unit="%"
                  label={{ value: "Hiring Speed", angle: -90, position: "insideLeft", fontSize: 12 }}
                  fontSize={11}
                />
                <ZAxis type="number" dataKey="size" range={[40, 400]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm min-w-[200px]">
                        <p className="font-bold text-slate-900 text-base">{d.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{d.category} · Tier: {d.tier}</p>
                        <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Prestige</p>
                            <p className="text-lg font-black text-primary">{d.prestige}/5</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Hiring</p>
                            <p className="text-lg font-black text-emerald-600">{d.speed}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Companies" data={careerScatter}>
                  {careerScatter.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.prestige >= 4 && entry.speed >= 70 ? "#10b981"
                          : entry.speed >= 70 ? "#6366f1"
                            : entry.prestige >= 4 ? "#f59e0b"
                              : "#94a3b8"
                      }
                      fillOpacity={0.8}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Dream (High Prestige + Hiring)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Active Hiring</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Prestigious</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Stable</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Row 5: Sector Strength Radar ── */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Sector Strength Overview</CardTitle>
            <CardDescription>
              How many companies are in each sector — helps identify where the most campus opportunities exist
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid strokeOpacity={0.15} />
                <PolarAngleAxis dataKey="sector" fontSize={11} fontWeight="600" tick={{ fill: "#475569" }} />
                <PolarRadiusAxis fontSize={10} />
                <Radar name="Companies" dataKey="companies" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
