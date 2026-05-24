import React, { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCompanies } from "@/hooks/useCompanies";
import {
  BrainCircuit, Zap, Target, ShieldCheck,
  BarChart3, Rocket, AlertCircle, Loader2,
  Code, ListChecks, Calendar, User, TrendingDown,
  Trophy, Briefcase, BookOpen, CheckCircle,
  Search, FileText, Settings, UserCheck, Sparkles,
  ArrowRight, CheckCircle2, AlertTriangle, TrendingUp,
  FileSpreadsheet
} from "lucide-react";

type Stage = "INPUT" | "SCANNING" | "DASHBOARD";

interface ScoreDetails {
  resumeQuality: number;
  atsCompatibility: number;
  technicalSkillMatch: number;
  projectRelevance: number;
  coreAlignment: number;
  codingReadiness: number;
  communicationReadiness: number;
  companyRoleCompatibility: number;
}

interface ScoreReasoning {
  resumeQuality: string;
  atsCompatibility: string;
  technicalSkillMatch: string;
  projectRelevance: string;
  coreAlignment: string;
  codingReadiness: string;
  communicationReadiness: string;
  companyRoleCompatibility: string;
}

interface SkillGap {
  skill: string;
  status: "Missing" | "Matched" | "Partial";
  importance: "High" | "Medium" | "Low";
}

interface RoadmapWeek {
  week: number;
  title: string;
  tasks: string[];
  resources: string[];
}

interface ATSScan {
  score: number;
  formattingReview: string;
  structuralReview: string;
  keyIssues: string[];
}

interface RoundStrategy {
  name: string;
  focus: string;
  strategy: string;
}

interface CompanyPrep {
  rounds: RoundStrategy[];
  tips: string;
}

interface ResumeOptimization {
  original: string;
  suggestion: string;
}

interface ConfidenceAnalysis {
  overall: number;
  technical: number;
  projects: number;
  experience: number;
  education: number;
}

interface RejectionReport {
  scores: ScoreDetails;
  scoreReasoning: ScoreReasoning;
  readinessLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  weaknesses: string[];
  skillGapAnalysis: SkillGap[];
  roadmap: RoadmapWeek[];
  improvementTimeline: string;
  atsScan: ATSScan;
  companyPreparation: CompanyPrep;
  resumeOptimization: ResumeOptimization[];
  confidenceAnalysis: ConfidenceAnalysis;
  selectionChance: number;
  rejectionRisk: number;
}

export default function RejectionProbability() {
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const [stage, setStage] = useState<Stage>("INPUT");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");

  // Input states initialized with robust, realistic pre-filled demo data to maximize premium feel and immediate testing
  const [studentProfile, setStudentProfile] = useState({
    name: "Chandana S Gowda",
    cgpa: "8.9",
    preferredRole: "Software Engineer",
    skills: "React, Node.js, JavaScript, Python, SQL, REST APIs, Git, Data Structures & Algorithms",
    projects: "SRM Career Compass: Dynamic AI-Powered placement intelligence platform built with React, Express, and OpenRouter Gemini models.\nDistributed Task Scheduler: Microservices-based task scheduling platform optimized with Node.js, Redis queues, and Docker containerization.",
    certifications: "AWS Certified Cloud Practitioner, Oracle Certified Java Associate",
    experience: "Software Engineering Intern at TechCorp (3 months) - Maintained REST APIs, migrated legacy database schemas, and optimized page speed by 22%.",
    githubUrl: "https://github.com/chandanasgowda",
    leetcodeUrl: "https://leetcode.com/chandanasgowda",
    linkedinUrl: "https://linkedin.com/in/chandanasgowda",
    resumeSummary: "Highly motivated Pre-Final Year CSE student at PESCE with robust core capabilities in Full-Stack Web Development, distributed systems, and Data Structures. Passionate about solving complex algorithms and engineering scalable products."
  });

  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [report, setReport] = useState<RejectionReport | null>(null);

  // Dynamically retrieve roles for the selected company
  const companyRoles = useMemo(() => {
    if (!selectedCompanyId) return [];
    const comp = companies.find(c => String(c.company_id) === selectedCompanyId);
    if (!comp) return [];

    // Extract roles from company profile (handling arrays/strings)
    const rawRoles = comp.job_role_details_json || comp.job_roles || [];
    let rolesList: string[] = [];

    if (Array.isArray(rawRoles)) {
      rolesList = rawRoles.map((r: any) => typeof r === "string" ? r : (r.role || r.title || ""));
    } else if (typeof rawRoles === "string") {
      try {
        const parsed = JSON.parse(rawRoles);
        if (Array.isArray(parsed)) {
          rolesList = parsed.map((r: any) => typeof r === "string" ? r : (r.role || r.title || ""));
        }
      } catch {
        rolesList = rawRoles.split(/[,;\n]+/).map(r => r.trim()).filter(Boolean);
      }
    }

    if (rolesList.length === 0 && comp.tech_stack) {
      rolesList = ["Software Engineer", "Frontend Developer", "Backend Engineer"];
    }

    return Array.from(new Set(rolesList)).filter(Boolean);
  }, [selectedCompanyId, companies]);

  const selectedCompany = useMemo(() => {
    return companies.find(c => String(c.company_id) === selectedCompanyId) || null;
  }, [selectedCompanyId, companies]);

  // Handle trigger analysis
  const handleStartAnalysis = async () => {
    if (!selectedCompanyId) {
      alert("Please select a target company.");
      return;
    }
    const finalRole = selectedRole === "custom" ? customRole : selectedRole;
    if (!finalRole) {
      alert("Please select or specify a job role.");
      return;
    }

    setStage("SCANNING");
    setLoadingLogs([]);

    // Progressive status logs simulation for extremely premium, live AI feedback
    const logs = [
      "Initializing AI Placement Intelligence Engine...",
      "Resolving target company parameters from Supabase...",
      "Extracting skills taxonomy and hiring expectations...",
      "Analyzing student profile and credentials...",
      "Scanning resume summary for ATS compatibility metrics...",
      "Parsing GitHub & LeetCode profile links...",
      "Simulating adaptive interview coding rounds comparison...",
      "Running multi-variable weighted evaluation pipeline...",
      "Calculating rejection risk and selection probability mathematically...",
      "Compiling optimized resume bullet recommendations...",
      "Formulating personalized 3-phase improvement roadmap..."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setLoadingLogs(prev => [...prev, logs[i]]);
    }

    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/api/rejection-intelligence/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfile: { ...studentProfile, preferredRole: finalRole },
          companyData: {
            name: selectedCompany?.name || "Target Company",
            selectedRole: finalRole,
            tech_stack: selectedCompany?.tech_stack || "Node.js, React, Data Structures",
            hiringRounds: selectedCompany?.hiring_rounds_json || [],
            focus_sectors: selectedCompany?.focus_sectors || "Technology",
            overview_text: selectedCompany?.overview_text || "Enterprise corporate profile."
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile rejection intelligence report");
      }

      const data = await response.json();
      setReport(data.result);
      setStage("DASHBOARD");
    } catch (e: any) {
      console.error(e);
      alert(`Error running analysis: ${e.message}`);
      setStage("INPUT");
    }
  };

  const getReadinessBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "expert": return "bg-emerald-500 text-white shadow-emerald-500/20";
      case "advanced": return "bg-blue-500 text-white shadow-blue-500/20";
      case "intermediate": return "bg-amber-500 text-white shadow-amber-500/20";
      default: return "bg-rose-500 text-white shadow-rose-500/20";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs px-3 py-1 font-bold">
                Advanced Recruiter Intelligence
              </Badge>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
              AI Placement <span className="text-primary italic">Rejection Probability</span> Engine
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Evaluate your profile against real corporate hiring bars, scan ATS compatibility, and unlock target sidetracks to clear interviews.
            </p>
          </div>
          {stage === "DASHBOARD" && (
            <Button
              onClick={() => setStage("INPUT")}
              variant="outline"
              className="border-2 font-bold uppercase tracking-wider text-xs px-6 hover:bg-slate-50 transition-colors"
            >
              Analyze New Profile
            </Button>
          )}
        </div>

        {/* INPUT STAGE */}
        {stage === "INPUT" && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left: Dynamic Company Selector Selection */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 shadow-lg overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-6">
                  <CardTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Target Selection
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    Specify Target Entity & Focus Role
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Select Company */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      Target Company <span className="text-rose-500">*</span>
                    </label>
                    {loadingCompanies ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading companies...
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          className="w-full h-12 rounded-lg border-2 border-slate-200 px-3 bg-white text-slate-800 font-bold text-sm focus:border-primary focus:outline-none transition-colors appearance-none"
                          value={selectedCompanyId}
                          onChange={(e) => {
                            setSelectedCompanyId(e.target.value);
                            setSelectedRole("");
                          }}
                        >
                          <option value="">-- Choose Company --</option>
                          {companies.map((c) => (
                            <option key={c.company_id} value={c.company_id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Select Role */}
                  {selectedCompanyId && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                          Target Role <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            className="w-full h-12 rounded-lg border-2 border-slate-200 px-3 bg-white text-slate-800 font-bold text-sm focus:border-primary focus:outline-none transition-colors appearance-none"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                          >
                            <option value="">-- Choose Mapped Role --</option>
                            {companyRoles.map((r, i) => (
                              <option key={i} value={r}>
                                {r}
                              </option>
                            ))}
                            <option value="custom">-- Custom Role --</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            ▼
                          </div>
                        </div>
                      </div>

                      {/* Custom Role Input */}
                      {selectedRole === "custom" && (
                        <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                          <label className="text-xs font-black uppercase text-slate-400">Specify Custom Role</label>
                          <Input
                            placeholder="e.g. SDE-1 / Data Scientist"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            className="h-11 border-2"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Company Preview Card */}
                  {selectedCompany && (
                    <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-3 animate-in fade-in duration-500">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-lg border p-1 shrink-0">
                          {selectedCompany.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{selectedCompany.name}</h4>
                          <span className="text-[10px] text-primary font-black uppercase tracking-wider">{selectedCompany.category || "General Tech"}</span>
                        </div>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">EXPECTED TECH STACK:</p>
                        <p className="text-slate-700 font-bold leading-relaxed line-clamp-2">{selectedCompany.tech_stack || "Not specified"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recruitment Advice Panel */}
              <Card className="border-2 shadow-md bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
                <CardContent className="p-6 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-black uppercase italic">ATS Compatiblity Notice</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Most companies leverage automated Application Tracking Systems (ATS) to filter candidate pipelines before human review. Ensure your skills are explicitly highlighted and accomplishments quantified with clear metrics to bypass critical gatekeepers.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Student Profile Entry */}
            <div className="lg:col-span-8">
              <Card className="border-2 shadow-xl bg-white">
                <CardHeader className="border-b bg-slate-50 p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" /> Student Portfolio Details
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-slate-400">
                      Configure your profile parameters to compare against hiring benchmarks.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary font-black text-[10px]">
                    DEMO DATA PRE-LOADED
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Two column personal details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Candidate Name</label>
                      <Input
                        placeholder="Chandana S Gowda"
                        value={studentProfile.name}
                        onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
                        className="h-12 border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">GPA / CGPA</label>
                      <Input
                        placeholder="e.g. 8.9"
                        type="number"
                        step="0.01"
                        value={studentProfile.cgpa}
                        onChange={(e) => setStudentProfile({ ...studentProfile, cgpa: e.target.value })}
                        className="h-12 border-2"
                      />
                    </div>
                  </div>

                  {/* Skills tags entry */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Technical Skills (Comma Separated)</label>
                    <Textarea
                      placeholder="e.g. React, Node.js, Python, SQL..."
                      value={studentProfile.skills}
                      onChange={(e) => setStudentProfile({ ...studentProfile, skills: e.target.value })}
                      className="min-h-[80px] border-2 font-medium"
                    />
                    <p className="text-[10px] text-slate-400 font-semibold">Separate tech stack items using commas for the parsing engine.</p>
                  </div>

                  {/* Projects details */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Major Projects & Details</label>
                    <Textarea
                      placeholder="Describe your engineering projects, technologies used, and core capabilities..."
                      value={studentProfile.projects}
                      onChange={(e) => setStudentProfile({ ...studentProfile, projects: e.target.value })}
                      className="min-h-[120px] border-2 font-medium"
                    />
                  </div>

                  {/* Certifications and Experience */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Certifications</label>
                      <Textarea
                        placeholder="List certifications (e.g. AWS Certified Developer)..."
                        value={studentProfile.certifications}
                        onChange={(e) => setStudentProfile({ ...studentProfile, certifications: e.target.value })}
                        className="min-h-[80px] border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Internship & Experience Details</label>
                      <Textarea
                        placeholder="Describe previous roles, tasks, and durations..."
                        value={studentProfile.experience}
                        onChange={(e) => setStudentProfile({ ...studentProfile, experience: e.target.value })}
                        className="min-h-[80px] border-2"
                      />
                    </div>
                  </div>

                  {/* Coding profiles and LinkedIn URLs */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">GitHub Profile URL</label>
                      <Input
                        placeholder="https://github.com/username"
                        value={studentProfile.githubUrl}
                        onChange={(e) => setStudentProfile({ ...studentProfile, githubUrl: e.target.value })}
                        className="h-11 border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">LeetCode Profile URL</label>
                      <Input
                        placeholder="https://leetcode.com/username"
                        value={studentProfile.leetcodeUrl}
                        onChange={(e) => setStudentProfile({ ...studentProfile, leetcodeUrl: e.target.value })}
                        className="h-11 border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">LinkedIn Profile URL</label>
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        value={studentProfile.linkedinUrl}
                        onChange={(e) => setStudentProfile({ ...studentProfile, linkedinUrl: e.target.value })}
                        className="h-11 border-2"
                      />
                    </div>
                  </div>

                  {/* Resume summary (ATS Scanner Target) */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Full Resume Text / Summary (ATS Scanner Target)
                    </label>
                    <Textarea
                      placeholder="Paste your complete resume content, summary, or highlights here. The ATS scanning algorithm will cross-reference this block against target benchmarks..."
                      value={studentProfile.resumeSummary}
                      onChange={(e) => setStudentProfile({ ...studentProfile, resumeSummary: e.target.value })}
                      className="min-h-[120px] border-2 font-mono text-sm"
                    />
                  </div>
                </CardContent>
                <div className="p-8 bg-slate-50 border-t flex justify-center">
                  <Button
                    onClick={handleStartAnalysis}
                    className="h-16 px-12 text-lg font-black uppercase italic tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Execute Placement Audit <Zap className="ml-2 h-5 w-5 fill-current text-yellow-300" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SCANNING STAGE */}
        {stage === "SCANNING" && (
          <div className="flex flex-col items-center justify-center min-h-[550px] space-y-8 animate-in fade-in duration-300 bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl">
            {/* Glowing neural circle animation */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="h-28 w-28 rounded-full border-4 border-slate-100 border-t-primary border-b-indigo-500 border-l-emerald-500 animate-spin" />
              <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-primary animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Neural Screening Pipeline</h2>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Running Weighted AI Assessment & Audit...</p>
            </div>

            {/* Simulated terminal logs feed */}
            <div className="w-full max-w-xl bg-slate-900 rounded-2xl p-6 font-mono text-xs text-slate-200 border-2 border-slate-800 shadow-2xl h-64 overflow-y-auto space-y-2 flex flex-col justify-end">
              {loadingLogs.map((log, i) => (
                <div key={i} className="flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-emerald-400 font-bold select-none">&gt;&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="flex gap-2 items-center text-primary animate-pulse">
                <span className="text-primary font-bold select-none">&gt;&gt;</span>
                <span>Synthesizing placement report card...</span>
                <span className="inline-block h-3 w-1 bg-primary animate-blink" />
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD STAGE (Report Output) */}
        {stage === "DASHBOARD" && report && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Main Selection/Rejection Gauges Row */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Radial Probability Risk Meter */}
              <Card className="lg:col-span-5 border-2 shadow-xl bg-white overflow-hidden flex flex-col justify-between">
                <CardHeader className="bg-slate-900 text-white p-6">
                  <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2 text-white">
                    <TrendingDown className="h-5 w-5 text-primary" /> Selection Probability
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    Audited Rejection Risk VS Selection Odds
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex flex-col items-center justify-center flex-1 space-y-6">
                  {/* Gauge Drawing (Stunning Double Semicircle SVG Ring) */}
                  <div className="relative w-72 h-36 overflow-hidden flex items-end justify-center select-none">
                    {/* Background Arc */}
                    <svg className="absolute bottom-0 w-72 h-36 transform -rotate-180" viewBox="0 0 100 50">
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      {/* Active Selection Chance Arc */}
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="hsl(142, 76%, 45%)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 - (125.6 * report.selectionChance) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Numeric Indicators */}
                    <div className="text-center pb-2 z-10">
                      <span className="text-5xl font-black tracking-tighter text-slate-900">{report.selectionChance}%</span>
                      <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">SELECTION CHANCE</span>
                    </div>
                  </div>

                  {/* Comparative Badges */}
                  <div className="grid grid-cols-2 gap-4 w-full pt-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-1">
                      <span className="block text-2xl font-black text-emerald-700">{report.selectionChance}%</span>
                      <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-wider">Selection Probability</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center space-y-1">
                      <span className="block text-2xl font-black text-rose-700">{report.rejectionRisk}%</span>
                      <span className="block text-[9px] font-black text-rose-600 uppercase tracking-wider">Rejection Risk</span>
                    </div>
                  </div>

                  {/* Verdict text */}
                  <div className="p-4 rounded-xl bg-slate-50 border w-full text-center text-xs font-semibold text-slate-600 leading-relaxed">
                    {report.rejectionRisk > 40 ? (
                      <span className="flex items-center justify-center gap-1.5 text-rose-600 font-bold">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> High Placement Risk. Targeted roadmap execution highly recommended.
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Strong Fit. Maintain standards and execute final interview checkpoints.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sub-scores Metrics and Readiness Level */}
              <div className="lg:col-span-7 space-y-6">
                {/* Readiness Category */}
                <Card className="border-2 shadow-md bg-white">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center md:text-left space-y-1 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audited Readiness Level</span>
                      <h3 className="text-3xl font-black tracking-tight uppercase text-slate-900 leading-none">
                        Candidate Level: <span className="text-primary italic">{report.readinessLevel}</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Hiring benchmarks set by {selectedCompany?.name || "Target Entity"} classify your profile at this technical threshold.
                      </p>
                    </div>
                    <div className={`h-16 px-8 rounded-2xl flex items-center justify-center text-lg font-black uppercase tracking-widest shadow-lg ${getReadinessBadgeColor(report.readinessLevel)}`}>
                      {report.readinessLevel}
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-scores Bars Grid */}
                <Card className="border-2 shadow-xl bg-white">
                  <CardHeader className="p-6 border-b">
                    <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> Weighted Variable Sub-Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: "Resume Quality (15%)", score: report.scores.resumeQuality, reasoning: report.scoreReasoning.resumeQuality },
                        { label: "ATS Compatibility (10%)", score: report.scores.atsCompatibility, reasoning: report.scoreReasoning.atsCompatibility },
                        { label: "Technical Skill Match (20%)", score: report.scores.technicalSkillMatch, reasoning: report.scoreReasoning.technicalSkillMatch },
                        { label: "Project Relevance (15%)", score: report.scores.projectRelevance, reasoning: report.scoreReasoning.projectRelevance },
                        { label: "Core/Domain Alignment (10%)", score: report.scores.coreAlignment, reasoning: report.scoreReasoning.coreAlignment },
                        { label: "Coding Readiness (15%)", score: report.scores.codingReadiness, reasoning: report.scoreReasoning.codingReadiness },
                        { label: "Communication Readiness (5%)", score: report.scores.communicationReadiness, reasoning: report.scoreReasoning.communicationReadiness },
                        { label: "Company-Role Match (10%)", score: report.scores.companyRoleCompatibility, reasoning: report.scoreReasoning.companyRoleCompatibility }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1.5 p-3 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center text-xs font-black uppercase text-slate-800">
                            <span className="truncate">{item.label}</span>
                            <span className={item.score > 70 ? "text-emerald-600" : item.score > 45 ? "text-amber-600" : "text-rose-600"}>{item.score}/100</span>
                          </div>
                          <Progress
                            value={item.score}
                            className={`h-1.5 ${item.score > 70 ? "bg-emerald-100 [&>div]:bg-emerald-500" : item.score > 45 ? "bg-amber-100 [&>div]:bg-amber-500" : "bg-rose-100 [&>div]:bg-rose-500"}`}
                          />
                          <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 pt-0.5">{item.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ATS SCANNER REPORT CARD */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* ATS Scan Details */}
              <Card className="lg:col-span-7 border-2 shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2 text-white">
                      <FileSpreadsheet className="h-5 w-5 text-primary" /> ATS Report Card
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      Resume Scan & Syntax Analysis
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-primary leading-none">{report.atsScan.score}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">ATS SCORE</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">Formatting Audit</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{report.atsScan.formattingReview}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">Structural Hierarchy</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{report.atsScan.structuralReview}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase text-rose-500 tracking-wider flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Detected ATS Blockers
                    </span>
                    <div className="grid gap-2">
                      {report.atsScan.keyIssues.map((issue, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-900 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Profile Weaknesses */}
              <Card className="lg:col-span-5 border-2 shadow-xl bg-white flex flex-col justify-between">
                <CardHeader className="p-6 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-rose-500">
                    <AlertTriangle className="h-4 w-4" /> Core Placement Weaknesses
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                    High Risk factors causing potential rejection
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-1">
                  <div className="grid gap-3">
                    {report.weaknesses.map((weakness, i) => (
                      <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border-2 border-dashed">
                        <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                          !
                        </div>
                        <div>
                          <p className="text-xs text-slate-700 font-bold leading-relaxed">{weakness}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DYNAMIC COMPARATIVE SKILL GAP ANALYSIS */}
            <Card className="border-2 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Target Role Skill-Gap Audit
                </CardTitle>
                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  Comparing student skills against expected technology profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {report.skillGapAnalysis.map((gap, i) => (
                    <div key={i} className="p-4 rounded-2xl border bg-slate-50 flex items-center justify-between hover:border-slate-300 transition-colors">
                      <div className="space-y-1">
                        <span className="block text-sm font-bold text-slate-800">{gap.skill}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">IMPORTANCE: {gap.importance}</span>
                      </div>
                      <Badge className={
                        gap.status === "Matched" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" :
                          gap.status === "Partial" ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm" :
                            "bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                      }>
                        {gap.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RESUME BULLET OPTIMIZER */}
            <Card className="border-2 shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-6">
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> High-Impact Resume Bullet Optimizer
                </CardTitle>
                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  Quantified, action-verb-enriched improvements to enhance screening compatibility
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {report.resumeOptimization.map((item, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-6 p-5 rounded-2xl border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      {/* Original */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Original Description
                        </span>
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 leading-relaxed font-semibold">
                          {item.original}
                        </div>
                      </div>
                      {/* Suggestion */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> AI Recommended Revision (Quantified)
                        </span>
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 leading-relaxed font-bold shadow-sm">
                          {item.suggestion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ROADMAP & SPRINTS TIMELINE */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Personalized sprint roadmap */}
              <Card className="lg:col-span-8 border-2 shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-primary" /> Personalized Placement Roadmap
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      Weekly sprint structure to systematically close hiring gaps
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary text-white text-xs px-3 py-1 font-bold">
                    EST. TIMELINE: {report.improvementTimeline}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {report.roadmap.map((weekItem, i) => (
                      <div key={i} className="flex gap-6 p-5 rounded-2xl hover:bg-slate-50 transition-colors border">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 shadow-sm border border-primary/20">
                          W{weekItem.week}
                        </div>
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-black text-slate-800 uppercase text-sm tracking-tight">{weekItem.title}</h4>
                            <Badge variant="outline" className="text-[10px]">Sprint Week {weekItem.week}</Badge>
                          </div>

                          {/* Tasks list */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sprint Tasks</span>
                            <ul className="text-xs text-slate-600 space-y-1.5">
                              {weekItem.tasks.map((task, idx) => (
                                <li key={idx} className="flex gap-2 items-start">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended resources */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-dashed text-xs text-slate-600 space-y-1">
                            <span className="block text-[9px] font-black uppercase text-primary tracking-wider">Sprint Resources</span>
                            <p className="font-semibold leading-relaxed">{weekItem.resources.join(", ")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interview Prep Rounds Strategy */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 shadow-xl bg-white overflow-hidden flex flex-col justify-between">
                  <CardHeader className="bg-slate-900 text-white p-6">
                    <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-primary" /> Interview Prep Strategy
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      Round-by-round strategy for {selectedCompany?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 flex-1">
                    <div className="space-y-4">
                      {report.companyPreparation.rounds.map((round, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border space-y-2 hover:border-slate-300 transition-colors">
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary">{round.name}</span>
                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">ROUND FOCUS:</span>
                            <span className="block text-xs font-bold text-slate-700">{round.focus}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">TACTICAL STRATEGY:</span>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{round.strategy}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
                      <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                        <Sparkles className="h-4 w-4" /> Recruiter Strategic Tip
                      </span>
                      <p className="text-xs text-indigo-900 leading-relaxed font-semibold">{report.companyPreparation.tips}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sub-profile Confidence Summary */}
                <Card className="border-2 shadow-xl bg-white">
                  <CardHeader className="p-6 border-b">
                    <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" /> Sub-Profile Confidence Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {[
                      { label: "Overall Profile Confidence", val: report.confidenceAnalysis.overall },
                      { label: "Technical Competence", val: report.confidenceAnalysis.technical },
                      { label: "Projects Verification", val: report.confidenceAnalysis.projects },
                      { label: "Credentials Verification", val: report.confidenceAnalysis.experience },
                      { label: "Education Verification", val: report.confidenceAnalysis.education }
                    ].map((c, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{c.label}</span>
                          <span>{c.val}%</span>
                        </div>
                        <Progress value={c.val} className="h-1.5 [&>div]:bg-emerald-500 bg-emerald-50" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
