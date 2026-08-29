import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, Award, Target, BookOpen } from 'lucide-react';

export const StudentIntelligenceDashboard = ({ studentId }: { studentId: string }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentIntelligence = async () => {
            try {
                const [historyRes, progressRes] = await Promise.all([
                    fetch(`/api/student/history/${studentId}`),
                    fetch(`/api/student/progress/${studentId}`)
                ]);
                const historyData = await historyRes.json();
                const progressData = await progressRes.json();

                setHistory(historyData.payload || []);
                setProgress(progressData.payload || null);
            } catch (err) {
                console.error("Intelligence Fetch Failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentIntelligence();
    }, [studentId]);

    if (loading) return <div className="p-8 animate-pulse text-cyan-500 font-mono">SYNCHRONIZING_USER_INTELLIGENCE...</div>;

    return (
        <div className="space-y-8 p-6 bg-slate-950 text-slate-200 min-h-screen">
            <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">Intelligence <span className="text-cyan-500">Evolution</span></h1>
                    <p className="text-slate-500 text-xs font-mono">TRACKING REAL-TIME READINESS GROWTH</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">CURRENT_READINESS_INDEX</span>
                    <span className="text-2xl font-black text-cyan-400">{progress?.readiness_score || 0}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Readiness Trend Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
                    <h3 className="text-sm font-bold mb-6 flex items-center gap-2 uppercase">
                        <TrendingUp size={16} className="text-cyan-400" /> Recruiter Compatibility Trend
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="created_at" hide />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="recruiter_compatibility" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Telemetry Column */}
                <div className="space-y-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-purple-400 mb-2">
                            <Target size={18} />
                            <span className="text-[10px] font-black uppercase">Active Focus</span>
                        </div>
                        <p className="text-sm font-medium">{progress?.active_focus || "General Preparation"}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-red-400 mb-2">
                            <AlertCircle size={18} />
                            <span className="text-[10px] font-black uppercase">Rejection Risk</span>
                        </div>
                        <p className="text-sm font-medium">{history[0]?.rejection_risk || "CALCULATING..."}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-green-400 mb-2">
                            <Award size={18} />
                            <span className="text-[10px] font-black uppercase">Top Skill</span>
                        </div>
                        <p className="text-sm font-medium capitalize">{progress?.top_skill || "N/A"}</p>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-xl relative overflow-hidden">
                        <BookOpen className="absolute -right-4 -bottom-4 text-cyan-500/10" size={100} />
                        <h4 className="text-xs font-black text-cyan-400 uppercase mb-2">AI Guidance</h4>
                        <p className="text-xs leading-relaxed italic text-slate-300">
                            "Based on your recent Amazon analysis, focus on System Design for Distributed Systems to bridge the current 12% domain alignment gap."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};