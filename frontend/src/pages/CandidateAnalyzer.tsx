import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BrainCircuit, Zap, Target, ShieldCheck,
    BarChart3, Rocket, AlertCircle, Loader2,
    Code, ListChecks, Calendar, User, TrendingDown,
    Trophy, Briefcase, BookOpen, CheckCircle
} from "lucide-react";

type Step = "INPUT" | "ANALYZING" | "TEST" | "EVALUATING" | "DASHBOARD";

interface SkillAnalysis {
    skill: string;
    rating: number;
    evidence: string;
    category: string;
}

interface AssessmentQuestion {
    id: string;
    question: string;
    type?: string;
    topic?: string;
    difficulty?: string;
    max_score?: number;
}

interface RoadmapPhase {
    phase: number;
    title: string;
    duration: string;
    focus_areas: string[];
    tasks: string[];
    resources: string[];
    success_metrics: string[];
}

interface CompanyMatch {
    name: string;
    category: string;
    typical_role: string;
    match_reason: string;
}

interface FinalReport {
    level: string;
    level_description: string;
    aptitude_score: number;
    coding_score: number;
    overall_score: number;
    cv_insights: string;
    skill_gaps: string[];
    skills_analysis: SkillAnalysis[];
    roadmap: RoadmapPhase[];
    companies_now: CompanyMatch[];
    companies_after_roadmap: CompanyMatch[];
    performance_summary: string;
    strengths: string[];
    weaknesses: string[];
    immediate_recommendations: string[];
    long_term_strategy: string;
}

export default function CandidateAnalyzer() {
    const [step, setStep] = useState<Step>("INPUT");
    const [profile, setProfile] = useState({
        name: "",
        cgpa: "",
        skills: "",
        projects: "",
        resumeSummary: "",
        githubUrl: "",
        linkedinUrl: "",
        leetcodeUrl: "",
        gfgUrl: "",
        aptitude: "70",
        communication: "75"
    });
    const [cvAnalysis, setCvAnalysis] = useState<any>(null);
    const [assessment, setAssessment] = useState<{ aptitude: AssessmentQuestion[], coding: AssessmentQuestion[] } | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [report, setReport] = useState<FinalReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const handleStartAnalysis = async () => {
        setStep("ANALYZING");
        setLoading(true);
        setLoadingMessage("Analyzing CV and generating adaptive assessment...");

        const API_URL = import.meta.env.VITE_API_URL as string;
        try {
            const response = await fetch(`${API_URL}/api/placement-intelligence/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await response.json();
            setCvAnalysis(data.cvAnalysis);
            setAssessment(data.assessment);
            setStep("TEST");
        } catch (e: any) {
            setStep("INPUT");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTest = async () => {
        setStep("EVALUATING");
        setLoading(true);
        setLoadingMessage("Evaluating responses and generating career roadmap...");

        const API_URL = import.meta.env.VITE_API_URL;
        try {
            const response = await fetch(`${API_URL}/api/placement-intelligence/evaluate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    candidateData: profile,
                    cvAnalysis,
                    assessment,
                    userAnswers: answers
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Evaluation failed");
            }

            const data = await response.json();
            setReport(data.report);
            setStep("DASHBOARD");
        } catch (e: any) {
            setStep("TEST");
        } finally {
            setLoading(false);
        }
    };

    const LoadingScreen = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
            <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-primary animate-spin"></div>
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary animate-pulse" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">AI Processing</h2>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{message}</p>
            </div>
        </div>
    );

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "beginner": return "text-amber-600 bg-amber-50 border-amber-200";
            case "intermediate": return "text-blue-600 bg-blue-50 border-blue-200";
            case "expert": return "text-emerald-600 bg-emerald-50 border-emerald-200";
            default: return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-10">
                {step === "INPUT" && (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="text-center space-y-2">
                            <h1 className="text-6xl font-black tracking-tighter uppercase italic">Candidate <span className="text-primary">Intelligence</span></h1>
                            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Neural Assessment Engine</p>
                        </div>
                        <Card className="border-2 shadow-2xl overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 text-white p-8">
                                <CardTitle className="text-3xl font-black italic uppercase flex items-center gap-3">
                                    <User className="h-8 w-8 text-primary" /> Profile Entry
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Input placeholder="Full Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                    <Input placeholder="CGPA" type="number" value={profile.cgpa} onChange={e => setProfile({ ...profile, cgpa: e.target.value })} />
                                    <Input placeholder="Technical Skills (e.g. React, Node, SQL)" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} />
                                    <Input placeholder="LinkedIn URL" value={profile.linkedinUrl} onChange={e => setProfile({ ...profile, linkedinUrl: e.target.value })} />
                                    <Input placeholder="GitHub URL" value={profile.githubUrl} onChange={e => setProfile({ ...profile, githubUrl: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">Aptitude Score</label>
                                            <Input type="number" value={profile.aptitude} onChange={e => setProfile({ ...profile, aptitude: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">Comm. Score</label>
                                            <Input type="number" value={profile.communication} onChange={e => setProfile({ ...profile, communication: e.target.value })} />
                                        </div>
                                    </div>
                                    <Textarea placeholder="Major Projects" className="h-24" value={profile.projects} onChange={e => setProfile({ ...profile, projects: e.target.value })} />
                                    <Textarea placeholder="Resume Summary" className="h-24" value={profile.resumeSummary} onChange={e => setProfile({ ...profile, resumeSummary: e.target.value })} />
                                </div>
                            </CardContent>
                            <div className="p-8 bg-slate-50 border-t flex justify-center">
                                <Button onClick={handleStartAnalysis} className="h-16 px-12 text-xl font-black uppercase italic tracking-wide shadow-xl">
                                    Initialize AI Analysis <Zap className="ml-2 h-5 w-5 fill-current" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {step === "ANALYZING" && loading && <LoadingScreen message={loadingMessage} />}
                {step === "EVALUATING" && loading && <LoadingScreen message={loadingMessage} />}

                {step === "TEST" && assessment && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-10 duration-700">
                        <div className="text-center">
                            <Badge className="mb-2">Phase 02</Badge>
                            <h2 className="text-4xl font-black italic uppercase">AI Adaptive <span className="text-primary">Evaluation</span></h2>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase flex items-center gap-2"><Target className="text-primary" /> Aptitude Reasoning</h3>
                            {assessment.aptitude.map((q) => (
                                <Card key={q.id} className="border-2">
                                    <CardHeader>
                                        <CardDescription className="font-bold text-primary">{q.type}</CardDescription>
                                        <CardTitle>{q.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            placeholder="Explain your logic and reasoning..."
                                            className="min-h-[120px]"
                                            value={answers[q.id] || ""}
                                            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        />
                                    </CardContent>
                                </Card>
                            ))}

                            <h3 className="text-xl font-black uppercase flex items-center gap-2 pt-6"><Code className="text-primary" /> Technical Coding</h3>
                            {assessment.coding.map((q) => (
                                <Card key={q.id} className="border-2 border-slate-900">
                                    <CardHeader>
                                        <CardDescription className="font-bold text-primary">{q.difficulty} - {q.topic}</CardDescription>
                                        <CardTitle>{q.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            placeholder="Write your approach, pseudo-code, or detailed logic..."
                                            className="font-mono min-h-[150px]"
                                            value={answers[q.id] || ""}
                                            onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Button onClick={handleSubmitTest} className="w-full h-20 text-2xl font-black uppercase italic shadow-2xl">
                            Submit for Neural Evaluation
                        </Button>
                    </div>
                )}

                {step === "DASHBOARD" && report && (
                    <div className="grid gap-8 lg:grid-cols-3 animate-in fade-in duration-1000">
                        {/* Left Sidebar: Score & Level */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl font-black italic">{report.level[0]}</div>
                                <CardContent className="p-8 space-y-6 relative z-10">
                                    <p className="text-primary font-black uppercase tracking-widest text-xs">AI Classification</p>
                                    <h2 className="text-6xl font-black italic tracking-tighter">{report.level}</h2>
                                    <p className="text-sm text-slate-300">{report.level_description}</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase"><span>Overall Readiness</span><span>{report.overall_score}%</span></div>
                                        <Progress value={report.overall_score} className="h-2 bg-white/20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2">
                                <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><BarChart3 className="text-primary h-4 w-4" /> Performance Summary</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between font-bold text-sm"><span>Aptitude Score:</span><span>{report.aptitude_score}/100</span></div>
                                    <div className="flex justify-between font-bold text-sm"><span>Coding Score:</span><span>{report.coding_score}/100</span></div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{report.performance_summary}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardHeader><CardTitle className="text-sm font-black uppercase">Skill Gaps Identification</CardTitle></CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {report.skill_gaps.map((s: string) => <Badge key={s} variant="outline" className="border-primary text-primary">{s}</Badge>)}
                                </CardContent>
                            </Card>

                            <Card className="border-2">
                                <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><ShieldCheck className="text-emerald-500 h-4 w-4" /> Strengths</CardTitle></CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {report.strengths.map((s: string, i: number) => <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700">{s}</Badge>)}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-2 shadow-xl border-primary/10">
                                <CardHeader><CardTitle className="text-xl font-black uppercase flex items-center gap-2 italic"><BrainCircuit className="text-primary" /> CV Analysis Insights</CardTitle></CardHeader>
                                <CardContent><p className="text-slate-600 font-medium leading-relaxed">{report.cv_insights}</p></CardContent>
                            </Card>

                            <Card className="border-2 shadow-xl">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-2xl font-black uppercase italic flex items-center gap-2">
                                        <Rocket className="text-primary" /> Career Acceleration Roadmap
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {report.roadmap.map((phase: RoadmapPhase) => (
                                            <div key={phase.phase} className="p-6 flex gap-6 hover:bg-slate-50 transition-colors">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">P{phase.phase}</div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-bold text-slate-900 uppercase text-sm tracking-tight">{phase.title}</p>
                                                        <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {phase.focus_areas.map((area: string, i: number) => (
                                                            <Badge key={i} variant="secondary" className="text-[10px]">{area}</Badge>
                                                        ))}
                                                    </div>
                                                    <ul className="text-sm text-slate-600 space-y-1">
                                                        {phase.tasks.map((task: string, i: number) => (
                                                            <li key={i} className="flex gap-2 items-start">
                                                                <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                                <span>{task}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {phase.resources.length > 0 && (
                                                        <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                                                            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Resources:</p>
                                                            <p className="text-xs text-slate-600">{phase.resources.join(", ")}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-2">
                                    <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Target className="text-emerald-500" /> Realistic Targets (Now)</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        {report.companies_now.map((company: CompanyMatch, i: number) => (
                                            <div key={i} className="p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-slate-900">{company.name}</span>
                                                    <Badge variant="outline" className="text-[10px]">{company.category}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500">{company.typical_role}</p>
                                                <p className="text-xs text-slate-400 mt-1">{company.match_reason}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="border-2">
                                    <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Trophy className="text-yellow-500" /> After Roadmap Targets</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        {report.companies_after_roadmap.map((company: CompanyMatch, i: number) => (
                                            <div key={i} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-slate-900">{company.name}</span>
                                                    <Badge className="bg-yellow-500 text-white text-[10px]">{company.category}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-600">{company.typical_role}</p>
                                                <p className="text-xs text-slate-500 mt-1">{company.match_reason}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-2 border-primary/20 bg-primary/5">
                                <CardHeader><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Briefcase className="text-primary" /> Immediate Recommendations</CardTitle></CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {report.immediate_recommendations.map((rec: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start">
                                                <span className="text-primary font-bold">▹</span>
                                                <span className="text-sm text-slate-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-2 shadow-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                                        <BookOpen className="text-primary" /> Long-Term Strategy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-200 font-medium leading-relaxed">{report.long_term_strategy}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}