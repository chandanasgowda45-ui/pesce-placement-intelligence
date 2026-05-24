import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    User,
    Building2,
    Trophy,
    Lightbulb,
    Search,
    PlusCircle,
    ArrowRight
} from "lucide-react";

interface Experience {
    id: number;
    studentName: string;
    companyName: string;
    role: string;
    difficulty: "Easy" | "Medium" | "Hard";
    roundsCleared: string;
    questions: string;
    tips: string;
    date: string;
}

const INITIAL_EXPERIENCES: Experience[] = [
    {
        id: 1,
        studentName: "Rahul Sharma",
        companyName: "Amazon",
        role: "SDE Intern",
        difficulty: "Hard",
        roundsCleared: "3/4",
        questions: "1. Reverse Nodes in K-Group (LeetCode Hard)\n2. LRU Cache implementation\n3. System design for a URL Shortener.",
        tips: "Focus heavily on Leadership Principles. They are as important as coding rounds.",
        date: "2 days ago"
    },
    {
        id: 2,
        studentName: "Ananya P.",
        companyName: "TCS",
        role: "Digital Engineer",
        difficulty: "Medium",
        roundsCleared: "All Rounds",
        questions: "Basic OOPs concepts, SQL Joins, and one medium string manipulation question.",
        tips: "Be very clear about your projects mentioned in the resume.",
        date: "1 week ago"
    }
];

export default function InterviewExperiences() {
    const [experiences, setExperiences] = useState<Experience[]>(INITIAL_EXPERIENCES);
    const [searchQuery, setSearchQuery] = useState("");

    // Form state
    const [form, setForm] = useState({
        studentName: "",
        companyName: "",
        role: "",
        difficulty: "Medium" as const,
        roundsCleared: "",
        questions: "",
        tips: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newExp: Experience = {
            ...form,
            id: Date.now(),
            date: "Just now"
        };
        setExperiences([newExp, ...experiences]);
        setForm({
            studentName: "",
            companyName: "",
            role: "",
            difficulty: "Medium",
            roundsCleared: "",
            questions: "",
            tips: ""
        });
    };

    const filteredExperiences = experiences.filter(exp =>
        exp.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDiffColor = (diff: string) => {
        if (diff === "Easy") return "bg-emerald-600 text-white border-none font-black";
        if (diff === "Medium") return "bg-amber-500 text-white border-none font-black";
        return "bg-red-600 text-white border-none font-black";
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
                            Interview <span className="text-primary">Experiences</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg uppercase tracking-tighter">
                            Peer-to-Peer Technical Intelligence & Strategic Insights
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by company..."
                            className="pl-10 rounded-xl border-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Submission Form */}
                    <Card className="lg:col-span-1 border-2 shadow-2xl bg-slate-50 h-fit sticky top-24 animate-in fade-in slide-in-from-left-4 duration-700">
                        <CardHeader className="bg-white border-b">
                            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase italic">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Share Yours
                            </CardTitle>
                            <CardDescription className="font-black text-[10px] uppercase tracking-widest text-slate-400">Contribute to institutional wisdom</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                    <Input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="bg-white border-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</label>
                                        <Input required value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="bg-white border-2" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</label>
                                        <Input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="bg-white border-2" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficulty</label>
                                    <div className="flex gap-2">
                                        {["Easy", "Medium", "Hard"].map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setForm({ ...form, difficulty: d as any })}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${form.difficulty === d ? 'border-primary bg-primary/10 text-primary' : 'bg-white border-slate-200 text-slate-400'}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Interview Questions</label>
                                    <Textarea required value={form.questions} onChange={e => setForm({ ...form, questions: e.target.value })} className="bg-white border-2 min-h-[80px]" placeholder="Specific questions, topics, or puzzles..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Preparation Strategy</label>
                                    <Textarea value={form.tips} onChange={e => setForm({ ...form, tips: e.target.value })} className="bg-white border-2 min-h-[80px]" placeholder="Resources, advice, or warnings..." />
                                </div>
                                <Button type="submit" className="w-full font-black py-7 text-lg shadow-xl shadow-primary/20">POST EXPERIENCE</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Experience Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredExperiences.length === 0 ? (
                            <div className="py-20 text-center border-4 border-dashed rounded-3xl bg-slate-50">
                                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-400">No experiences found for your search.</h3>
                            </div>
                        ) : (
                            filteredExperiences.map((exp) => (
                                <Card key={exp.id} className="border-2 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden animate-in fade-in slide-in-from-right-4">
                                    <CardHeader className="bg-slate-900 text-white relative">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-primary/80">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{exp.companyName}</span>
                                                </div>
                                                <CardTitle className="text-3xl font-black italic tracking-tighter">{exp.role}</CardTitle>
                                            </div>
                                            <Badge className={`uppercase font-black text-[10px] px-4 py-1.5 shadow-lg ${getDiffColor(exp.difficulty)}`}>
                                                {exp.difficulty} LEVEL
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-3">
                                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <Trophy className="h-4 w-4 text-primary" /> Technical Questions
                                                </h4>
                                                <p className="text-sm text-slate-600 whitespace-pre-wrap font-bold leading-relaxed bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 italic">"{exp.questions}"</p>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <Lightbulb className="h-4 w-4 text-amber-500" /> Strategic Tips
                                                </h4>
                                                <p className="text-sm text-slate-700 font-black leading-relaxed px-2 border-l-4 border-amber-200">{exp.tips}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase">
                                                <User className="h-3 w-3" /> Shared by {exp.studentName}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{exp.date}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}