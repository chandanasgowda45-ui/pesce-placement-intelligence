import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MessageSquare, ThumbsUp, AlertCircle, Plus } from "lucide-react";
import { InterviewExperience } from "../../../backend/interviewExperienceService";

export default function InterviewExperiences() {
    const [searchTerm, setSearchTerm] = useState("");
    const [experiences, setExperiences] = useState<InterviewExperience[]>([
        // Safe mock data for UI visualization
        {
            id: "1",
            company_name: "Google",
            role: "Software Engineer",
            interview_round: "Technical Interview II",
            difficulty_level: "Hard",
            questions_asked: ["Implement a thread-safe LRU cache", "Explain B-Tree vs B+ Tree"],
            technical_topics: ["System Design", "Concurrency"],
            HR_questions: ["Why Google?"],
            tips_for_juniors: "Focus on fundamentals and edge cases.",
            overall_experience: "Challenging but very structured.",
            selected_or_rejected: "Selected",
            anonymous_option: false,
            upvotes: 42,
            created_at: new Date().toISOString()
        }
    ]);

    const filteredExperiences = experiences.filter(exp =>
        exp.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDifficultyColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'hard': return 'bg-rose-500 text-white';
            case 'medium': return 'bg-amber-500 text-white';
            default: return 'bg-emerald-500 text-white';
        }
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                            Senior <span className="text-primary italic">Interview Insights</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Real experiences shared by seniors to help you clear the bar.</p>
                    </div>
                    <Button className="font-bold uppercase tracking-wider text-xs gap-2">
                        <Plus className="h-4 w-4" /> Share My Experience
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border-2 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by company or role..."
                            className="pl-10 h-11 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-11 gap-2 font-bold text-xs uppercase border-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                </div>

                {/* Main Feed */}
                <div className="space-y-6">
                    {filteredExperiences.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase text-sm">No experiences found matching your search</p>
                        </div>
                    ) : (
                        filteredExperiences.map((exp) => (
                            <Card key={exp.id} className="border-2 shadow-md hover:shadow-lg transition-all bg-white overflow-hidden">
                                <CardHeader className="p-6 border-b flex flex-row items-center justify-between bg-slate-50/50">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest">{exp.company_name}</Badge>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase">{exp.interview_round}</Badge>
                                        </div>
                                        <CardTitle className="text-lg font-black text-slate-800">{exp.role}</CardTitle>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={`uppercase text-[9px] font-black shadow-sm ${getDifficultyColor(exp.difficulty_level)}`}>
                                            {exp.difficulty_level}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {new Date(exp.created_at!).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Questions Asked</h4>
                                                <ul className="space-y-2">
                                                    {exp.questions_asked.map((q, i) => (
                                                        <li key={i} className="flex gap-2 text-xs font-semibold text-slate-700 leading-relaxed">
                                                            <span className="text-primary font-black">•</span> {q}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Topics Covered</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {exp.technical_topics.map((t, i) => (
                                                        <Badge key={i} variant="secondary" className="text-[9px] font-bold bg-slate-100">{t}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-2 tracking-widest">Senior's Tactical Tip</h4>
                                                <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">"{exp.tips_for_juniors}"</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-1">Verdict</h4>
                                                <Badge variant={exp.selected_or_rejected === "Selected" ? "default" : "destructive"} className="font-black text-[9px] uppercase">
                                                    {exp.selected_or_rejected}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span className="text-xs font-bold">{exp.upvotes} Helpful</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="text-xs font-bold">Comments</span>
                                            </button>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            Posted by {exp.anonymous_option ? "Anonymous" : "Senior Mentor"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}