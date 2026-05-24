import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Target, ListChecks, Calendar, Info } from "lucide-react";

export default function InterviewAISearch() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL as string;

        try {
            const response = await fetch(`${API_URL}/api/ai/retrieve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
            const data = await response.json();
            setResult(data);
        } catch (err) {
            // Silent fail for production
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase">
                        AI <span className="text-primary">Retrieval</span> Engine
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                        Institutional Intelligence & Vector-Based Context Retrieval
                    </p>
                </div>

                <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex gap-2 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-xl">
                        <Input
                            placeholder="Search: 'Amazon DSA interview' or 'Google system design'..."
                            className="border-none text-lg h-14 focus-visible:ring-0"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={loading} className="h-14 px-8 font-black uppercase italic tracking-tighter">
                            {loading ? "Retrieving..." : "Ask AI"}
                        </Button>
                    </div>
                </div>

                {result && (
                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Card className="border-2 shadow-2xl bg-slate-900 text-white overflow-hidden">
                            <CardHeader className="border-b border-white/10 bg-white/5">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2 italic uppercase">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Generated Intelligence
                                    </CardTitle>
                                    <Badge variant="secondary" className="font-black">
                                        MATCH SCORE: {result.topMatchScore}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Preparation Guidance
                                    </h3>
                                    <p className="text-xl font-medium leading-relaxed text-slate-200">
                                        {result.intelligence.guidance}
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                            <Target className="h-4 w-4" /> Core Topics
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.intelligence.topics.map((t: string) => (
                                                <Badge key={t} className="bg-white/10 text-white border-none py-2 px-4">{t}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                            <ListChecks className="h-4 w-4" /> Likely Questions
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-400 font-bold">
                                            {result.intelligence.questions.map((q: string) => (
                                                <li key={q} className="flex gap-2"><span className="text-primary">▹</span> {q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}