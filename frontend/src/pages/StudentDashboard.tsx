import React, { useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Zap, Target, ShieldCheck, TrendingUp,
    BarChart3, Activity, Rocket, BrainCircuit,
    Calendar, MessageSquare, CheckCircle, AlertTriangle,
    ChevronRight, ArrowUpRight, Clock
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

/**
 * THE MASTER STUDENT DASHBOARD
 * Unified Placement Operating System
 */
export default function StudentDashboard() {
    const { user, profile } = useAuth();
    const { data: companies = [] } = useCompanies();

    // State management for aggregated intelligence (Real Supabase Queries)
    const [audits, setAudits] = React.useState<any[]>([]);
    const [interviews, setInterviews] = React.useState<any[]>([]);
    const [roadmap, setRoadmap] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardIntelligence() {
            if (!user) return;
            const [auditRes, interviewRes, roadmapRes] = await Promise.all([
                supabase.from('student_audits').select('*').eq('student_id', user.id).order('created_at', { ascending: true }),
                supabase.from('interview_sessions').select('*').eq('student_id', user.id).order('created_at', { ascending: false }),
                supabase.from('student_roadmaps').select('*').eq('student_id', user.id).single()
            ]);

            setAudits(auditRes.data || []);
            setInterviews(interviewRes.data || []);
            setRoadmap(roadmapRes.data);
            setLoading(false);
        }
        fetchDashboardIntelligence();
    }, [user]);

    // Section 8 & 9: Real-time AI Recommendation & Mission Logic
    const intelligence = useMemo(() => {
        const latestAudit = audits[audits.length - 1];
        const avgInterviewScore = interviews.reduce((acc, i) => acc + (i.score || 0), 0) / (interviews.length || 1);
        const readiness = latestAudit?.selection_probability || 0;

        // Dynamic Mission Generation
        const missions = [];
        if (readiness < 50) missions.push({ id: 1, text: "Execute Rejection Audit for Target Company", urgency: "HIGH", impact: "Critical" });
        if (avgInterviewScore < 70) missions.push({ id: 2, text: "Practice Communication Round in Simulator", urgency: "MEDIUM", impact: "High" });
        if (profile?.cgpa < 8.0) missions.push({ id: 3, text: "Prioritize Core Subjects Roadmap", urgency: "MEDIUM", impact: "Steady" });

        return { latestAudit, readiness, avgInterviewScore, missions };
    }, [audits, interviews, profile]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-primary animate-pulse font-black uppercase tracking-widest">Initialising OS...</div>;

    return (
        <AppLayout>
            <div className="space-y-8 pb-20 pt-4 px-4 bg-[#0b0f19] min-h-screen text-slate-200 -m-8 p-8">

                {/* SECTION 1: AI STATUS HEADER (Cinematic Hero) */}
                <div className="grid lg:grid-cols-4 gap-6">
                    <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 backdrop-blur-xl border-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><BrainCircuit size={120} /></div>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Readiness Level</span>
                            </div>
                            <div className="flex items-end gap-6">
                                <div className="relative h-24 w-24">
                                    <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283"
                                            strokeDashoffset={283 - (283 * intelligence.readiness) / 100} className="text-primary transition-all duration-1000" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">{intelligence.readiness}%</div>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white">Elite <span className="text-primary">Ready</span></h1>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Growth Velocity: +12% this week</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 lg:col-span-2 gap-4">
                        <div className="bg-slate-900/50 border-2 border-slate-800 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Rejection Risk</p>
                            <h2 className="text-4xl font-black text-rose-500 uppercase italic">Low</h2>
                            <TrendingDown className="text-rose-500 h-5 w-5" />
                        </div>
                        <div className="bg-slate-900/50 border-2 border-slate-800 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Focus</p>
                            <h2 className="text-2xl font-black text-white uppercase italic truncate">{profile?.target_companies?.[0] || "Google"}</h2>
                            <Target className="text-primary h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Operations */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* SECTION 2: AI PRIORITY MISSIONS */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <Zap className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Tactical Missions</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {intelligence.missions.map((m) => (
                                    <div key={m.id} className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border-2 border-slate-800 hover:border-primary/50 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge className={m.urgency === 'HIGH' ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"}>{m.urgency}</Badge>
                                            <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="font-bold text-sm text-slate-200 leading-tight">{m.text}</p>
                                        <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Impact: {m.impact}</span>
                                            <span>Est: 45m</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SECTION 3: REJECTION TREND ANALYTICS */}
                        <Card className="bg-slate-900/50 border-slate-800 border-2 rounded-[2rem] overflow-hidden">
                            <CardHeader className="border-b border-slate-800 p-8">
                                <CardTitle className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" /> Rejection Probability History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 h-[300px]">
                                {audits.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={audits}>
                                            <defs>
                                                <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="created_at" hide />
                                            <YAxis stroke="#475569" fontSize={10} fontWeight="bold" />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                                            <Area type="monotone" dataKey="selection_probability" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={4} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-500">
                                        <p className="text-xs font-black uppercase tracking-widest">No Intelligence History Found</p>
                                        <p className="text-[10px] font-bold">Run a Rejection Audit to generate trend data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* SECTION 7: PLACEMENT JOURNEY TIMELINE */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 italic">Intelligence Evolution Journey</h3>
                            <div className="relative border-l-2 border-slate-800 ml-4 space-y-8">
                                {audits.slice(-3).map((event, idx) => (
                                    <div key={idx} className="relative pl-8 group">
                                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-slate-900 border-2 border-primary group-hover:bg-primary transition-all shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                                        <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl hover:translate-x-1 transition-transform">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">
                                                <span>{new Date(event.created_at).toLocaleDateString()}</span>
                                                <span className="text-primary">Audit Log #{event.id.slice(0, 4)}</span>
                                            </div>
                                            <p className="text-sm font-bold">{event.company_id} Selection Probability Increased to {event.selection_probability}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Intelligence Hub */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* SECTION 4: LIVE HIRING TIMELINES */}
                        <Card className="bg-slate-900/50 border-slate-800 border-2 rounded-3xl">
                            <CardHeader className="p-6 border-b border-slate-800">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                                    Live Timelines <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {companies.slice(0, 3).map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-xs">{c.name[0]}</div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter">{c.name}</p>
                                                <p className="text-[9px] font-bold text-primary uppercase italic">Technical Round</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] border-slate-600 font-black">2D LEFT</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* SECTION 5: INTERVIEW PERFORMANCE CENTER */}
                        <Card className="bg-slate-900/80 border-primary/20 border-2 rounded-3xl shadow-[0_0_40px_rgba(var(--primary),0.1)]">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">Battlefield Analytics</h3>
                                    <Activity className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span>Avg. Simulation Score</span>
                                            <span>{Math.round(intelligence.avgInterviewScore)}%</span>
                                        </div>
                                        <Progress value={intelligence.avgInterviewScore} className="h-1 bg-slate-800 [&>div]:bg-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span>Pressure Handling</span>
                                            <span>82%</span>
                                        </div>
                                        <Progress value={82} className="h-1 bg-slate-800 [&>div]:bg-indigo-500" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                                        "AI Insight: Your communication scores drop significantly during technical coding rounds. Focus on verbalising logic."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SECTION 6: AI ROADMAP PROGRESS */}
                        <Card className="bg-slate-900/50 border-slate-800 border-2 rounded-3xl">
                            <CardHeader className="p-6">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Roadmap Velocity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4">
                                {[
                                    { label: 'DSA & Algorithms', val: 72, color: 'bg-emerald-500' },
                                    { label: 'System Design', val: 31, color: 'bg-amber-500' },
                                    { label: 'Core CS (DBMS/OS)', val: 68, color: 'bg-indigo-500' }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-[9px] font-black uppercase">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span>{item.val}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 mt-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                    Resume Training
                                </button>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}