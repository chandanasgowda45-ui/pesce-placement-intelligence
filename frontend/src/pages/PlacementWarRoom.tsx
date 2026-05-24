import React, { useState, useMemo, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompanies } from "@/hooks/useCompanies";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { calculateDecision } from "@/services/decisionService";
import {
  Zap, Target, ShieldCheck, Shield, AlertTriangle,
  TrendingUp, TrendingDown, CheckCircle2, Clock,
  Brain, Sparkles, Rocket, BarChart3, Activity,
  BookOpen, Code, Users, Eye, ChevronRight,
  X, MessageSquare, Cpu, Award, Flame,
  Calendar, ArrowUpRight, Play, CheckCircle
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   STYLES — injected via a <style> tag for dark war-room theme
   These are scoped with a .war-room wrapper so they ONLY
   affect this page and do NOT leak into the global app.
   ────────────────────────────────────────────────────────── */
const WAR_ROOM_STYLES = `
.war-room {
  --wr-bg: #0b0f19;
  --wr-card: rgba(15, 23, 42, 0.7);
  --wr-border: rgba(51, 65, 85, 0.5);
  --wr-glow-cyan: #06b6d4;
  --wr-glow-green: #10b981;
  --wr-glow-amber: #f59e0b;
  --wr-glow-rose: #f43f5e;
  --wr-glow-indigo: #818cf8;
  --wr-text: #e2e8f0;
  --wr-text-dim: #94a3b8;
  --wr-text-muted: #64748b;
}
.war-room { background: var(--wr-bg); color: var(--wr-text); min-height:100vh; }
.wr-card {
  background: var(--wr-card);
  border: 1px solid var(--wr-border);
  border-radius: 1rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color .3s, box-shadow .3s;
}
.wr-card:hover {
  border-color: rgba(6,182,212,.35);
  box-shadow: 0 0 24px -6px rgba(6,182,212,.12);
}
.wr-glow-border-cyan  { border-color: rgba(6,182,212,.4); box-shadow:0 0 20px -4px rgba(6,182,212,.15); }
.wr-glow-border-green { border-color: rgba(16,185,129,.4); box-shadow:0 0 20px -4px rgba(16,185,129,.15); }
.wr-glow-border-rose  { border-color: rgba(244,63,94,.4);  box-shadow:0 0 20px -4px rgba(244,63,94,.15); }
.wr-glow-border-amber { border-color: rgba(245,158,11,.4); box-shadow:0 0 20px -4px rgba(245,158,11,.15); }

.wr-label { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.18em; color:var(--wr-text-muted); }
.wr-value { font-size:2.25rem; font-weight:900; letter-spacing:-.04em; line-height:1; }

@keyframes wr-pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes wr-scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
.wr-pulse { animation: wr-pulse 2s ease-in-out infinite; }
.wr-scanline {
  position:absolute; inset:0; pointer-events:none; overflow:hidden;
}
.wr-scanline::after {
  content:''; position:absolute; left:0; right:0; height:2px;
  background: linear-gradient(90deg, transparent, var(--wr-glow-cyan), transparent);
  animation: wr-scan 4s linear infinite;
}

/* Custom checkbox */
.wr-check { appearance:none; width:18px; height:18px; border:2px solid var(--wr-text-muted); border-radius:5px; cursor:pointer; flex-shrink:0; transition:all .2s; background:transparent; }
.wr-check:checked { background:var(--wr-glow-green); border-color:var(--wr-glow-green); }
.wr-check:checked::after { content:'✓'; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:900; }
`;

/* ──────────────────────────────────────────────────────────
   HELPER — deterministic seeded random for daily missions
   ────────────────────────────────────────────────────────── */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ──────────────────────────────────────────────────────────
   DATA — structured intelligence pools
   ────────────────────────────────────────────────────────── */
const MISSION_POOL = [
  { id: "m1",  text: "Solve 3 Graph problems on LeetCode (BFS/DFS)", category: "DSA", icon: Code, urgency: "high" as const },
  { id: "m2",  text: "Improve Resume ATS score — add quantified metrics", category: "Resume", icon: BarChart3, urgency: "high" as const },
  { id: "m3",  text: "Revise DBMS interview questions (Joins, Normalization)", category: "Core CS", icon: BookOpen, urgency: "medium" as const },
  { id: "m4",  text: "Complete AWS deployment mini-project (S3 + Lambda)", category: "Cloud", icon: Cpu, urgency: "medium" as const },
  { id: "m5",  text: "Practice 2 System Design problems (URL Shortener, Cache)", category: "System Design", icon: Brain, urgency: "high" as const },
  { id: "m6",  text: "Push 1 new project commit to GitHub", category: "Portfolio", icon: Code, urgency: "low" as const },
  { id: "m7",  text: "Solve 2 Dynamic Programming problems (Knapsack, LIS)", category: "DSA", icon: Code, urgency: "high" as const },
  { id: "m8",  text: "Read 1 senior interview experience and take notes", category: "Prep", icon: MessageSquare, urgency: "low" as const },
  { id: "m9",  text: "Practice OS concepts: Deadlock, Paging, Scheduling", category: "Core CS", icon: BookOpen, urgency: "medium" as const },
  { id: "m10", text: "Revise OOPs: Polymorphism, Abstraction, SOLID", category: "Core CS", icon: BookOpen, urgency: "medium" as const },
  { id: "m11", text: "Mock aptitude test — 20 questions in 30 mins", category: "Aptitude", icon: Brain, urgency: "medium" as const },
  { id: "m12", text: "Solve 2 Tree problems (BST, AVL rotations)", category: "DSA", icon: Code, urgency: "high" as const },
  { id: "m13", text: "Update LinkedIn headline & summary", category: "Portfolio", icon: Users, urgency: "low" as const },
  { id: "m14", text: "Write STAR-format answers for 3 behavioral questions", category: "Soft Skills", icon: MessageSquare, urgency: "medium" as const },
];

const HIRING_TIMELINE = [
  { company: "Google",    stage: "Technical Round",  progress: 65, deadline: "2026-06-15", status: "active" as const, color: "cyan" },
  { company: "Amazon",    stage: "OA Active",        progress: 40, deadline: "2026-06-08", status: "urgent" as const, color: "amber" },
  { company: "Infosys",   stage: "Hiring Open",      progress: 20, deadline: "2026-07-01", status: "open" as const,   color: "green" },
  { company: "Microsoft", stage: "Interview Stage",  progress: 80, deadline: "2026-06-10", status: "active" as const, color: "indigo" },
  { company: "TCS",       stage: "Registration",     progress: 10, deadline: "2026-07-15", status: "open" as const,   color: "green" },
  { company: "NVIDIA",    stage: "Coding Round",     progress: 55, deadline: "2026-06-20", status: "active" as const, color: "cyan" },
];

const SENIOR_INTEL = {
  topDSA: [
    { pattern: "Binary Search / Two Pointers", freq: 87, trend: "up" as const },
    { pattern: "Graph BFS/DFS",                freq: 82, trend: "up" as const },
    { pattern: "Dynamic Programming",          freq: 78, trend: "stable" as const },
    { pattern: "Sliding Window",               freq: 71, trend: "up" as const },
    { pattern: "Tree Traversals",              freq: 68, trend: "stable" as const },
    { pattern: "Stack/Queue Applications",     freq: 55, trend: "down" as const },
  ],
  topTopics: [
    "System Design basics", "OOPs concepts", "SQL Joins & Indexes",
    "REST API design", "OS Process Scheduling", "CN: TCP vs UDP",
  ],
  recruiterTrends: [
    "Companies increasingly test System Design even for freshers",
    "Behavioral rounds weighted 30% higher at Amazon this cycle",
    "Cloud certifications (AWS/GCP) improving callback rates by 18%",
    "GitHub project quality now matters more than quantity",
  ],
};

const THREAT_CATALOG = [
  { threat: "Weak System Design", severity: 92, impact: "Blocks all Tier-1 company clears", category: "Technical" },
  { threat: "Low Aptitude Accuracy", severity: 78, impact: "Fails OA screening rounds at TCS, Infosys", category: "Aptitude" },
  { threat: "Poor Resume Quantification", severity: 85, impact: "ATS rejection before human review", category: "Resume" },
  { threat: "Lack of Deployed Projects", severity: 70, impact: "No proof of real-world engineering skills", category: "Portfolio" },
  { threat: "No Mock Interview Practice", severity: 65, impact: "Communication gaps in HR rounds", category: "Soft Skills" },
];

/* ──────────────────────────────────────────────────────────
   COMPONENT — Countdown timer hook
   ────────────────────────────────────────────────────────── */
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("NOW"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function CountdownBadge({ date, color }: { date: string; color: string }) {
  const tl = useCountdown(date);
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400", amber: "text-amber-400",
    green: "text-emerald-400", indigo: "text-indigo-400", rose: "text-rose-400",
  };
  return <span className={`font-mono font-black text-xs ${colorMap[color] || "text-cyan-400"}`}>{tl}</span>;
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */
export default function PlacementWarRoom() {
  const { data: companies = [] } = useCompanies();
  const { profile } = useStudentProfile();

  // Daily missions — deterministic per day
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dailyMissions = useMemo(() => seededShuffle(MISSION_POOL, daySeed).slice(0, 6), [daySeed]);

  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("wr_missions_" + daySeed);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleMission = useCallback((id: string) => {
    setCompletedMissions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("wr_missions_" + daySeed, JSON.stringify([...next]));
      return next;
    });
  }, [daySeed]);

  // AI Strategist panel
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [advisorTarget, setAdvisorTarget] = useState("Amazon");

  // Forecast simulator sliders
  const [simMockScore, setSimMockScore] = useState(65);
  const [simPracticeHrs, setSimPracticeHrs] = useState(3);
  const [simResumeQuality, setSimResumeQuality] = useState(70);

  /* ── Computed intelligence from real company data ────── */
  const intel = useMemo(() => {
    const decisions = companies.map(c => ({
      ...c,
      decision: calculateDecision(c, profile),
    }));

    const eligible = decisions.filter(c => c.decision.matchScore > 50);
    const atRisk = decisions.filter(c => c.decision.matchScore > 50 && c.decision.selectionProbability < 40);
    const avgMatch = decisions.length > 0
      ? Math.round(decisions.reduce((a, c) => a + c.decision.matchScore, 0) / decisions.length)
      : 0;
    const avgProb = decisions.length > 0
      ? Math.round(decisions.reduce((a, c) => a + c.decision.selectionProbability, 0) / decisions.length)
      : 0;

    let readiness = "Beginner";
    if (avgMatch > 75) readiness = "Expert";
    else if (avgMatch > 60) readiness = "Advanced";
    else if (avgMatch > 40) readiness = "Intermediate";

    // Skill coverage radar
    const allTech = new Set<string>();
    companies.forEach(c => (c.tech_stack || "").split(/[,;]+/).forEach(t => { const s = t.trim(); if (s) allTech.add(s); }));
    const skillMap = [...allTech].slice(0, 8).map(skill => {
      const matched = profile.skills.some(ps => ps.toLowerCase().includes(skill.toLowerCase()));
      const demandCount = companies.filter(c => (c.tech_stack || "").toLowerCase().includes(skill.toLowerCase())).length;
      const demand = Math.min(100, Math.round((demandCount / Math.max(1, companies.length)) * 100 * 3));
      return {
        skill,
        studentLevel: matched ? Math.min(95, 55 + Math.round(Math.random() * 30)) : Math.round(Math.random() * 25),
        demand,
        status: matched ? ("mastered" as const) : demand > 40 ? ("weak" as const) : ("improving" as const),
      };
    });

    return { eligible: eligible.length, atRisk: atRisk.length, avgMatch, avgProb, readiness, skillMap, decisions };
  }, [companies, profile]);

  // Momentum scores
  const missionCompletion = dailyMissions.length > 0 ? Math.round((completedMissions.size / dailyMissions.length) * 100) : 0;
  const dailyMomentum = Math.round((missionCompletion * 0.4) + (intel.avgMatch * 0.3) + (intel.avgProb * 0.3));
  const weeklyConsistency = Math.min(100, dailyMomentum + 8); // simulated slight boost
  const interviewVelocity = Math.round((simMockScore * 0.4) + (simPracticeHrs * 8) + (simResumeQuality * 0.2));

  // Forecast simulation
  const forecastedSelection = Math.min(95, Math.round(
    (simMockScore * 0.35) + (simPracticeHrs * 5) + (simResumeQuality * 0.25) + (missionCompletion * 0.15)
  ));
  const forecastedRejection = 100 - forecastedSelection;

  // Advisor intelligence
  const advisorCompany = useMemo(() => {
    return companies.find(c => (c.name || "").toLowerCase().includes(advisorTarget.toLowerCase()));
  }, [advisorTarget, companies]);
  const advisorDecision = useMemo(() => {
    if (!advisorCompany) return null;
    return calculateDecision(advisorCompany, profile);
  }, [advisorCompany, profile]);

  const readinessColor = intel.readiness === "Expert" ? "text-emerald-400" :
    intel.readiness === "Advanced" ? "text-cyan-400" :
    intel.readiness === "Intermediate" ? "text-amber-400" : "text-rose-400";

  return (
    <AppLayout>
      <style>{WAR_ROOM_STYLES}</style>
      <div className="war-room -m-6 p-6 lg:p-8">
        {/* ═══════ HEADER ═══════ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/40" />
              <span className="wr-label" style={{ color: "var(--wr-glow-cyan)" }}>SYSTEMS ONLINE — LIVE INTELLIGENCE ACTIVE</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">
              Placement <span style={{ color: "var(--wr-glow-cyan)" }} className="italic">War Room</span>
            </h1>
            <p style={{ color: "var(--wr-text-dim)" }} className="text-sm font-medium">
              AI-driven command center monitoring your placement journey in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdvisorOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: "linear-gradient(135deg, #06b6d4, #818cf8)", color: "#fff", boxShadow: "0 0 20px -4px rgba(6,182,212,.4)" }}
            >
              <Sparkles className="h-4 w-4" /> AI Strategist
            </button>
            <div className="wr-card px-4 py-2.5 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" style={{ color: "var(--wr-text-muted)" }} />
              <span className="font-mono text-xs font-bold" style={{ color: "var(--wr-text-dim)" }}>
                {today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* ═══════ SECTION 1 — LIVE PLACEMENT STATUS ═══════ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Readiness */}
          <div className="wr-card wr-glow-border-cyan p-5 relative overflow-hidden col-span-1">
            <div className="wr-scanline" />
            <p className="wr-label mb-2">Placement Readiness</p>
            <p className="wr-value" style={{ color: "var(--wr-glow-cyan)" }}>{intel.avgMatch}%</p>
            <div className="mt-3 h-1.5 rounded-full" style={{ background: "rgba(6,182,212,.15)" }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${intel.avgMatch}%`, background: "var(--wr-glow-cyan)" }} />
            </div>
          </div>

          {/* Rejection Risk */}
          <div className="wr-card wr-glow-border-rose p-5 relative overflow-hidden col-span-1">
            <div className="wr-scanline" />
            <p className="wr-label mb-2">Rejection Risk</p>
            <p className="wr-value" style={{ color: "var(--wr-glow-rose)" }}>{100 - intel.avgProb}%</p>
            <div className="mt-3 h-1.5 rounded-full" style={{ background: "rgba(244,63,94,.15)" }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${100 - intel.avgProb}%`, background: "var(--wr-glow-rose)" }} />
            </div>
          </div>

          {/* Eligible Companies */}
          <div className="wr-card wr-glow-border-green p-5 col-span-1">
            <p className="wr-label mb-2">Eligible Companies</p>
            <p className="wr-value" style={{ color: "var(--wr-glow-green)" }}>{intel.eligible}</p>
            <p className="text-xs mt-2 font-semibold" style={{ color: "var(--wr-text-muted)" }}>of {companies.length} total</p>
          </div>

          {/* At Risk */}
          <div className="wr-card wr-glow-border-amber p-5 col-span-1">
            <p className="wr-label mb-2">Companies at Risk</p>
            <p className="wr-value" style={{ color: "var(--wr-glow-amber)" }}>{intel.atRisk}</p>
            <p className="text-xs mt-2 font-semibold" style={{ color: "var(--wr-text-muted)" }}>Low probability targets</p>
          </div>

          {/* Readiness Level */}
          <div className="wr-card p-5 col-span-2 lg:col-span-1 flex flex-col items-center justify-center text-center">
            <p className="wr-label mb-2">Readiness Level</p>
            <p className={`text-2xl font-black uppercase italic tracking-tight ${readinessColor}`}>{intel.readiness}</p>
            <div className="flex gap-1 mt-3">
              {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl, i) => (
                <div
                  key={lvl}
                  className="h-1.5 flex-1 rounded-full transition-all"
                  style={{
                    background: ["Beginner", "Intermediate", "Advanced", "Expert"].indexOf(intel.readiness) >= i
                      ? (i < 1 ? "var(--wr-glow-rose)" : i < 2 ? "var(--wr-glow-amber)" : i < 3 ? "var(--wr-glow-cyan)" : "var(--wr-glow-green)")
                      : "rgba(100,116,139,.2)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ 2-COLUMN MAIN GRID ═══════ */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN (8/12) ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* ═══════ SECTION 2 — AI DAILY MISSION ENGINE ═══════ */}
            <div className="wr-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(6,182,212,.15)" }}>
                    <Zap className="h-5 w-5" style={{ color: "var(--wr-glow-cyan)" }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase italic tracking-tight">Today's Missions</h2>
                    <p className="wr-label mt-0.5">AI-generated adaptive daily tasks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black font-mono" style={{ color: missionCompletion === 100 ? "var(--wr-glow-green)" : "var(--wr-glow-cyan)" }}>
                    {completedMissions.size}/{dailyMissions.length}
                  </p>
                  <p className="wr-label">completed</p>
                </div>
              </div>

              <div className="h-1.5 rounded-full mb-5" style={{ background: "rgba(6,182,212,.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${missionCompletion}%`,
                    background: missionCompletion === 100
                      ? "var(--wr-glow-green)"
                      : "linear-gradient(90deg, var(--wr-glow-cyan), var(--wr-glow-indigo))"
                  }}
                />
              </div>

              <div className="space-y-2">
                {dailyMissions.map(m => {
                  const done = completedMissions.has(m.id);
                  const urgencyColor = m.urgency === "high" ? "var(--wr-glow-rose)" : m.urgency === "medium" ? "var(--wr-glow-amber)" : "var(--wr-glow-green)";
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMission(m.id)}
                      className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all hover:scale-[1.005]"
                      style={{
                        background: done ? "rgba(16,185,129,.08)" : "rgba(15,23,42,.5)",
                        border: `1px solid ${done ? "rgba(16,185,129,.3)" : "rgba(51,65,85,.3)"}`,
                        opacity: done ? 0.7 : 1,
                      }}
                    >
                      <input type="checkbox" className="wr-check" checked={done} readOnly />
                      <m.icon className="h-4 w-4 flex-shrink-0" style={{ color: done ? "var(--wr-glow-green)" : "var(--wr-text-muted)" }} />
                      <span className={`text-sm font-semibold flex-1 ${done ? "line-through" : ""}`} style={{ color: done ? "var(--wr-text-muted)" : "var(--wr-text)" }}>
                        {m.text}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: `${urgencyColor}22`, color: urgencyColor }}>
                        {m.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══════ SECTION 3 — LIVE HIRING COMMAND CENTER ═══════ */}
            <div className="wr-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,.15)" }}>
                  <Activity className="h-5 w-5" style={{ color: "var(--wr-glow-amber)" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic tracking-tight">Live Hiring Command Center</h2>
                  <p className="wr-label mt-0.5">Real-time company recruitment tracking</p>
                </div>
              </div>

              <div className="space-y-3">
                {HIRING_TIMELINE.map((h, i) => {
                  const barColor = h.color === "cyan" ? "var(--wr-glow-cyan)" : h.color === "amber" ? "var(--wr-glow-amber)" : h.color === "green" ? "var(--wr-glow-green)" : "var(--wr-glow-indigo)";
                  const statusBg = h.status === "urgent" ? "rgba(244,63,94,.15)" : h.status === "active" ? "rgba(6,182,212,.1)" : "rgba(16,185,129,.1)";
                  const statusColor = h.status === "urgent" ? "var(--wr-glow-rose)" : h.status === "active" ? "var(--wr-glow-cyan)" : "var(--wr-glow-green)";
                  return (
                    <div key={i} className="p-4 rounded-xl" style={{ background: "rgba(15,23,42,.6)", border: "1px solid rgba(51,65,85,.3)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black" style={{ color: barColor }}>{h.company}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: statusBg, color: statusColor }}>
                            {h.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CountdownBadge date={h.deadline} color={h.color} />
                          <span className="text-xs font-bold" style={{ color: "var(--wr-text-muted)" }}>{h.progress}%</span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--wr-text-dim)" }}>→ {h.stage}</p>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(100,116,139,.15)" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${h.progress}%`, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══════ SECTION 4 — AI SKILL GAP EVOLUTION MAP ═══════ */}
            <div className="wr-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(129,140,248,.15)" }}>
                  <Target className="h-5 w-5" style={{ color: "var(--wr-glow-indigo)" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic tracking-tight">Skill Gap Evolution Map</h2>
                  <p className="wr-label mt-0.5">Student proficiency vs market demand — confidence tracker</p>
                </div>
              </div>

              <div className="space-y-3">
                {intel.skillMap.map((s, i) => {
                  const statusColor = s.status === "mastered" ? "var(--wr-glow-green)" : s.status === "weak" ? "var(--wr-glow-rose)" : "var(--wr-glow-amber)";
                  return (
                    <div key={i} className="p-3.5 rounded-xl" style={{ background: "rgba(15,23,42,.5)", border: "1px solid rgba(51,65,85,.25)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">{s.skill}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
                          {s.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="wr-label mb-1">Your Level</p>
                          <div className="h-2 rounded-full" style={{ background: "rgba(6,182,212,.1)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.studentLevel}%`, background: "var(--wr-glow-cyan)" }} />
                          </div>
                          <p className="text-[10px] font-bold mt-1" style={{ color: "var(--wr-glow-cyan)" }}>{s.studentLevel}%</p>
                        </div>
                        <div>
                          <p className="wr-label mb-1">Market Demand</p>
                          <div className="h-2 rounded-full" style={{ background: "rgba(245,158,11,.1)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.demand}%`, background: "var(--wr-glow-amber)" }} />
                          </div>
                          <p className="text-[10px] font-bold mt-1" style={{ color: "var(--wr-glow-amber)" }}>{s.demand}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══════ SECTION 6 — PLACEMENT MOMENTUM & FORECAST ═══════ */}
            <div className="wr-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,.15)" }}>
                  <Rocket className="h-5 w-5" style={{ color: "var(--wr-glow-green)" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase italic tracking-tight">Placement Forecast Simulator</h2>
                  <p className="wr-label mt-0.5">Adjust parameters to project placement trajectory</p>
                </div>
              </div>

              {/* Momentum stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl text-center" style={{ background: "rgba(6,182,212,.08)", border: "1px solid rgba(6,182,212,.2)" }}>
                  <p className="text-2xl font-black font-mono" style={{ color: "var(--wr-glow-cyan)" }}>{dailyMomentum}</p>
                  <p className="wr-label mt-1">Daily Momentum</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: "rgba(129,140,248,.08)", border: "1px solid rgba(129,140,248,.2)" }}>
                  <p className="text-2xl font-black font-mono" style={{ color: "var(--wr-glow-indigo)" }}>{weeklyConsistency}%</p>
                  <p className="wr-label mt-1">Weekly Consistency</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)" }}>
                  <p className="text-2xl font-black font-mono" style={{ color: "var(--wr-glow-green)" }}>{interviewVelocity}</p>
                  <p className="wr-label mt-1">Interview Velocity</p>
                </div>
              </div>

              {/* Interactive sliders */}
              <div className="space-y-5 p-5 rounded-xl" style={{ background: "rgba(15,23,42,.6)", border: "1px solid rgba(51,65,85,.3)" }}>
                <p className="wr-label" style={{ color: "var(--wr-glow-cyan)" }}>↓ ADJUST SIMULATION PARAMETERS</p>

                {/* Mock Score */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold">Mock Interview Score</span>
                    <span className="text-xs font-black font-mono" style={{ color: "var(--wr-glow-cyan)" }}>{simMockScore}/100</span>
                  </div>
                  <input type="range" min={0} max={100} value={simMockScore} onChange={e => setSimMockScore(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, var(--wr-glow-cyan) ${simMockScore}%, rgba(100,116,139,.2) ${simMockScore}%)` }}
                  />
                </div>

                {/* Practice Hours */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold">Daily Practice Hours</span>
                    <span className="text-xs font-black font-mono" style={{ color: "var(--wr-glow-green)" }}>{simPracticeHrs}h</span>
                  </div>
                  <input type="range" min={0} max={8} value={simPracticeHrs} onChange={e => setSimPracticeHrs(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, var(--wr-glow-green) ${(simPracticeHrs / 8) * 100}%, rgba(100,116,139,.2) ${(simPracticeHrs / 8) * 100}%)` }}
                  />
                </div>

                {/* Resume Quality */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold">Resume Quality Index</span>
                    <span className="text-xs font-black font-mono" style={{ color: "var(--wr-glow-amber)" }}>{simResumeQuality}/100</span>
                  </div>
                  <input type="range" min={0} max={100} value={simResumeQuality} onChange={e => setSimResumeQuality(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, var(--wr-glow-amber) ${simResumeQuality}%, rgba(100,116,139,.2) ${simResumeQuality}%)` }}
                  />
                </div>

                {/* Forecast result */}
                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: "1px solid rgba(51,65,85,.3)" }}>
                  <div className="p-4 rounded-xl text-center" style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)" }}>
                    <p className="wr-label mb-1">Projected Selection</p>
                    <p className="text-3xl font-black font-mono" style={{ color: "var(--wr-glow-green)" }}>{forecastedSelection}%</p>
                  </div>
                  <div className="p-4 rounded-xl text-center" style={{ background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.25)" }}>
                    <p className="wr-label mb-1">Projected Rejection</p>
                    <p className="text-3xl font-black font-mono" style={{ color: "var(--wr-glow-rose)" }}>{forecastedRejection}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (4/12) ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* ═══════ SECTION 5 — THREAT ANALYSIS ═══════ */}
            <div className="wr-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5" style={{ color: "var(--wr-glow-rose)" }} />
                <h3 className="text-sm font-black uppercase italic tracking-tight">Threat Analysis</h3>
              </div>
              <div className="space-y-2.5">
                {THREAT_CATALOG.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(244,63,94,.06)", border: "1px solid rgba(244,63,94,.15)" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">{t.threat}</span>
                      <span className="text-[10px] font-black font-mono" style={{ color: t.severity > 80 ? "var(--wr-glow-rose)" : "var(--wr-glow-amber)" }}>
                        {t.severity}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full mb-1.5" style={{ background: "rgba(244,63,94,.1)" }}>
                      <div className="h-full rounded-full" style={{ width: `${t.severity}%`, background: t.severity > 80 ? "var(--wr-glow-rose)" : "var(--wr-glow-amber)" }} />
                    </div>
                    <p className="text-[10px] font-semibold" style={{ color: "var(--wr-text-muted)" }}>{t.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════ SECTION 7 — SENIOR MEMORY INTELLIGENCE ═══════ */}
            <div className="wr-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" style={{ color: "var(--wr-glow-indigo)" }} />
                <h3 className="text-sm font-black uppercase italic tracking-tight">Senior Memory Intelligence</h3>
              </div>

              {/* Top DSA Patterns */}
              <p className="wr-label mb-2" style={{ color: "var(--wr-glow-cyan)" }}>Most Asked DSA Patterns</p>
              <div className="space-y-2 mb-5">
                {SENIOR_INTEL.topDSA.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "rgba(15,23,42,.5)", border: "1px solid rgba(51,65,85,.2)" }}>
                    <span className="text-xs font-mono font-black w-7 text-center" style={{ color: "var(--wr-glow-cyan)" }}>{d.freq}%</span>
                    <div className="h-1.5 flex-1 rounded-full" style={{ background: "rgba(6,182,212,.1)" }}>
                      <div className="h-full rounded-full" style={{ width: `${d.freq}%`, background: "var(--wr-glow-cyan)" }} />
                    </div>
                    <span className="text-[10px] font-bold flex-shrink-0 max-w-[120px] truncate">{d.pattern}</span>
                    {d.trend === "up" && <TrendingUp className="h-3 w-3 flex-shrink-0" style={{ color: "var(--wr-glow-green)" }} />}
                    {d.trend === "down" && <TrendingDown className="h-3 w-3 flex-shrink-0" style={{ color: "var(--wr-glow-rose)" }} />}
                    {d.trend === "stable" && <Activity className="h-3 w-3 flex-shrink-0" style={{ color: "var(--wr-glow-amber)" }} />}
                  </div>
                ))}
              </div>

              {/* Hot Topics */}
              <p className="wr-label mb-2" style={{ color: "var(--wr-glow-amber)" }}>Hot Interview Topics</p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {SENIOR_INTEL.topTopics.map((t, i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(245,158,11,.1)", color: "var(--wr-glow-amber)", border: "1px solid rgba(245,158,11,.2)" }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Recruiter Trends */}
              <p className="wr-label mb-2" style={{ color: "var(--wr-glow-green)" }}>Recruiter Trend Signals</p>
              <div className="space-y-2">
                {SENIOR_INTEL.recruiterTrends.map((t, i) => (
                  <div key={i} className="flex gap-2 items-start text-[11px] font-semibold" style={{ color: "var(--wr-text-dim)" }}>
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--wr-glow-green)" }} />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════ Quick Momentum Snapshot ═══════ */}
            <div className="wr-card p-5 wr-glow-border-cyan">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5" style={{ color: "var(--wr-glow-cyan)" }} />
                <h3 className="text-sm font-black uppercase italic tracking-tight">Momentum Snapshot</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Coding Practice", val: missionCompletion, color: "var(--wr-glow-cyan)" },
                  { label: "Profile Completion", val: Math.min(100, 60 + profile.skills.length * 5), color: "var(--wr-glow-indigo)" },
                  { label: "Resume Readiness", val: simResumeQuality, color: "var(--wr-glow-amber)" },
                  { label: "Mock Interview", val: simMockScore, color: "var(--wr-glow-green)" },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-bold">{m.label}</span>
                      <span className="text-[10px] font-black font-mono" style={{ color: m.color }}>{m.val}%</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: `${m.color}15` }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.val}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ SECTION 8 — FLOATING AI STRATEGIC ADVISOR ═══════ */}
        {advisorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, #0f172a, #1e1b4b)", border: "1px solid rgba(129,140,248,.3)", boxShadow: "0 0 60px -10px rgba(6,182,212,.25)" }}>
              {/* Header */}
              <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(129,140,248,.15)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #818cf8)" }}>
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase italic tracking-tight text-white">AI Strategic Advisor</h3>
                    <p className="wr-label" style={{ color: "rgba(129,140,248,.8)" }}>Placement Intelligence Console</p>
                  </div>
                </div>
                <button onClick={() => setAdvisorOpen(false)} className="p-2 rounded-lg transition-colors hover:bg-white/10">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Company selector */}
              <div className="p-5" style={{ borderBottom: "1px solid rgba(51,65,85,.3)" }}>
                <p className="wr-label mb-2">Select Target Company</p>
                <div className="flex gap-2 flex-wrap">
                  {["Amazon", "Google", "Microsoft", "TCS", "Infosys", "NVIDIA"].map(c => (
                    <button
                      key={c}
                      onClick={() => setAdvisorTarget(c)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all"
                      style={{
                        background: advisorTarget === c ? "rgba(6,182,212,.2)" : "rgba(15,23,42,.5)",
                        border: `1px solid ${advisorTarget === c ? "rgba(6,182,212,.5)" : "rgba(51,65,85,.3)"}`,
                        color: advisorTarget === c ? "var(--wr-glow-cyan)" : "var(--wr-text-muted)",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intelligence output */}
              <div className="p-5 space-y-4">
                {advisorDecision ? (
                  <>
                    <div className="p-4 rounded-xl" style={{ background: "rgba(6,182,212,.08)", border: "1px solid rgba(6,182,212,.2)" }}>
                      <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--wr-text)" }}>
                        You are <span className="font-black" style={{ color: "var(--wr-glow-cyan)" }}>{advisorDecision.matchScore}% ready</span> for{" "}
                        <span className="font-black" style={{ color: "var(--wr-glow-amber)" }}>{advisorTarget}</span>.
                      </p>
                      <p className="text-sm font-semibold mt-2 leading-relaxed" style={{ color: "var(--wr-text-dim)" }}>
                        {advisorDecision.reasoning}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl text-center" style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)" }}>
                        <p className="text-xl font-black font-mono" style={{ color: "var(--wr-glow-green)" }}>{advisorDecision.selectionProbability}%</p>
                        <p className="wr-label mt-1">Selection Chance</p>
                      </div>
                      <div className="p-3 rounded-xl text-center" style={{ background: "rgba(244,63,94,.08)", border: "1px solid rgba(244,63,94,.2)" }}>
                        <p className="text-xl font-black font-mono" style={{ color: "var(--wr-glow-rose)" }}>{100 - advisorDecision.selectionProbability}%</p>
                        <p className="wr-label mt-1">Rejection Risk</p>
                      </div>
                    </div>

                    {advisorDecision.skillGaps.length > 0 && (
                      <div className="p-4 rounded-xl" style={{ background: "rgba(244,63,94,.06)", border: "1px solid rgba(244,63,94,.15)" }}>
                        <p className="wr-label mb-2" style={{ color: "var(--wr-glow-rose)" }}>Critical Skill Gaps</p>
                        <div className="flex flex-wrap gap-1.5">
                          {advisorDecision.skillGaps.map((g, i) => (
                            <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(244,63,94,.12)", color: "var(--wr-glow-rose)", border: "1px solid rgba(244,63,94,.2)" }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-xl" style={{ background: "rgba(129,140,248,.08)", border: "1px solid rgba(129,140,248,.2)" }}>
                      <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--wr-text-dim)" }}>
                        <Sparkles className="inline h-3.5 w-3.5 mr-1" style={{ color: "var(--wr-glow-indigo)" }} />
                        If you complete the current daily mission roadmap and achieve an 80+ mock interview score, your rejection risk for {advisorTarget} could reduce by an estimated <span className="font-black" style={{ color: "var(--wr-glow-green)" }}>22%</span>.
                      </p>
                    </div>

                    <p className="text-center">
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--wr-text-muted)" }}>
                        Recommendation: <span style={{ color: advisorDecision.recommendation === "Strong Apply" ? "var(--wr-glow-green)" : "var(--wr-glow-amber)" }}>{advisorDecision.recommendation}</span>
                      </span>
                    </p>
                  </>
                ) : (
                  <div className="p-6 text-center" style={{ color: "var(--wr-text-muted)" }}>
                    <Brain className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-xs font-bold">Company "{advisorTarget}" not found in intelligence database.</p>
                    <p className="text-[10px] mt-1">Try selecting from the mapped company set above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
