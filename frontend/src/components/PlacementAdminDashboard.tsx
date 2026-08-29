import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Edit3, BarChart3, ShieldAlert, CheckCircle, XCircle, Users, Activity, Eye, Tag, AlertTriangle, Code2 } from 'lucide-react';

export const PlacementAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'companies'>('overview');
    const [stats, setStats] = useState({
        cycles: 0,
        candidates: 0,
        avgReadiness: 0,
        pending: 0
    });
    const [pendingExperiences, setPendingExperiences] = useState<any[]>([]);
    const [selectedExp, setSelectedExp] = useState<any | null>(null);

    // Phase 3 & 6: Real Supabase Aggregation
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard-stats');
                const data = await res.json();
                if (data.success) setStats(data.payload);

                const modRes = await fetch('/api/admin/moderation-queue');
                const modData = await modRes.json();
                if (modData.success) setPendingExperiences(modData.payload);
            } catch (err) {
                console.error("Dashboard Data Failure", err);
            }
        };
        fetchDashboardData();
    }, [activeTab]);

    const handleModerate = async (id: string, action: 'approved' | 'rejected') => {
        await fetch(`/api/admin/moderate/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action })
        });
        setPendingExperiences(prev => prev.filter(ex => ex.id !== id));
    };

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">Placement <span className="text-cyan-500">Operations</span></h1>
                    <p className="text-slate-500 text-xs font-mono uppercase mt-1">System Health: <span className="text-green-500 animate-pulse">Operational</span></p>
                </div>
                <div className="flex gap-2">
                    {['overview', 'moderation', 'companies'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-600 text-black' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Active Cycles', value: stats.cycles.toString(), icon: Activity, color: 'text-cyan-400' },
                        { label: 'Total Candidates', value: stats.candidates.toLocaleString(), icon: Users, color: 'text-purple-400' },
                        { label: 'Avg Readiness', value: `${stats.avgReadiness}%`, icon: BarChart3, color: 'text-green-400' },
                        { label: 'Pending Reviews', value: stats.pending.toString(), icon: ShieldAlert, color: 'text-red-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                            <stat.icon className={`${stat.color} mb-4`} size={24} />
                            <p className="text-[10px] font-mono text-slate-500 uppercase">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeTab === 'moderation' ? (
                    <div className="lg:col-span-3 space-y-4">
                        {pendingExperiences.length === 0 ? (
                            <p className="text-slate-500 font-mono text-xs uppercase p-12 text-center border-2 border-dashed border-slate-800 rounded-xl">Queue Clear: All experiences moderated.</p>
                        ) : pendingExperiences.map((ex) => (
                            <div key={ex.id} className="bg-slate-900 border-2 border-slate-800 p-5 rounded-xl flex justify-between items-center group hover:border-cyan-500/30 transition-all">
                                <div className="flex gap-6 items-center">
                                    <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-cyan-500 font-black italic">
                                        {ex.company_name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-sm text-white">"{ex.role || 'SDE Intern'}"</h4>
                                            <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${ex.difficulty_level === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {ex.difficulty_level || 'Medium'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                            {ex.company_name} • SUBMITTED: {new Date(ex.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {(ex.technical_topics || []).slice(0, 3).map((t: string) => (
                                                <span key={t} className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedExp(ex)}
                                        className="p-2 bg-slate-800 text-slate-400 rounded hover:bg-cyan-600 hover:text-black transition-all shadow-lg"
                                        title="Inspect Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleModerate(ex.id, 'approved')}
                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500 hover:text-black transition-all"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleModerate(ex.id, 'rejected')}
                                        className="p-2 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500 hover:text-black transition-all"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Company Status Card */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl group hover:border-cyan-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><Settings size={20} /></div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Company Manager</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">32 Active Partners</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6">Update company requirements, GPA benchmarks, and hiring branch eligibility.</p>
                            <button className="w-full py-2 bg-cyan-600 text-black font-black text-[10px] tracking-widest uppercase hover:bg-cyan-400 transition-colors">Manage Entities</button>
                        </div>

                        {/* Timeline Orchestrator */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl group hover:border-purple-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Edit3 size={20} /></div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Timeline Orchestrator</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">Live Phase Tracking</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6">Advance companies through hiring stages (Aptitude -> Technical -> Offer).</p>
                            <button className="w-full py-2 bg-purple-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-purple-500 transition-colors">Update Stages</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};