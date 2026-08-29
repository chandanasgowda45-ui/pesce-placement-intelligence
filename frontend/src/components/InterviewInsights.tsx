import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BrainCircuit, Target, ShieldAlert, Zap, TrendingUp, Search, Info } from 'lucide-react';
import { normalizeInterviewIntelligence } from '../../../backend/dataNormalizers';
import { motion } from 'framer-motion';

export default function InterviewInsights() {
    const { companyId } = useParams();
    const [intelligence, setIntelligence] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntelligence = async () => {
            try {
                const res = await fetch(`/api/interview-insights/${companyId}`);
                const data = await res.json();
                if (data.success) {
                    setIntelligence(normalizeInterviewIntelligence(data.payload.intelligence_json));
                }
            } catch (err) {
                console.error("Intelligence Feed Failure", err);
            } finally {
                setLoading(false);
            }
        };
        fetchIntelligence();
    }, [companyId]);

    if (loading) return <div className="p-20 text-cyan-500 animate-pulse font-black uppercase tracking-widest">Infiltrating Recruiter Databases...</div>;
    if (!intelligence) return <div className="p-20 text-slate-500 text-center uppercase font-bold">Insufficient community data to generate AI insights.</div>;

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200">
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                    <BrainCircuit className="text-cyan-500" size={40} /> Recruiter <span className="text-cyan-500">Intelligence</span> Radar
                </h1>
                <p className="text-slate-500 font-bold uppercase text-xs mt-2 tracking-widest flex items-center gap-2">
                    <Zap size={12} className="text-amber-500" /> Semantic analysis of moderated community experiences
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Technical Heatmap */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Code2 size={80} /></div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                        <Target className="text-cyan-500" size={14} /> Technical Focus Heatmap
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {intelligence.technical_focus.map((topic: string) => (
                            <span key={topic} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase rounded-full shadow-lg shadow-cyan-500/5 transition-all hover:scale-110">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recruiter Behavior */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl md:col-span-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-purple-500" size={14} /> Recruiter Radar Traits
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {intelligence.hr_patterns.map((trait: string) => (
                            <div key={trait} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
                                <Zap size={16} className="text-amber-500 mb-2" />
                                <p className="text-[10px] font-black uppercase text-white tracking-tighter">{trait}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rejection Intelligence */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                        <ShieldAlert className="text-rose-500" size={14} /> Rejection Pattern Analysis
                    </h3>
                    <div className="space-y-3">
                        {intelligence.rejection_reasons.map((reason: string) => (
                            <div key={reason} className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <p className="text-[11px] font-bold text-slate-300 leading-tight">{reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preparation Focus */}
                <div className="bg-slate-950 border-2 border-slate-800 p-6 rounded-2xl md:col-span-2 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-black uppercase text-cyan-500 flex items-center gap-2">
                            <Zap size={14} /> Preparation Directive
                        </h3>
                        <div className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-mono text-slate-400">
                            Difficulty: <span className="text-white font-bold">{intelligence.difficulty_level}</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {intelligence.preparation_focus.map((tip: string) => (
                            <div key={tip} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors">
                                <p className="text-[11px] text-slate-300 italic">" {tip} "</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg"><Info className="text-cyan-400" size={18} /></div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white italic">AI Synthesis Overview</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {intelligence.ai_summary}
                </p>
            </div>
        </div>
    );
}