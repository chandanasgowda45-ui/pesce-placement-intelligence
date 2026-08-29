import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, PlayCircle, AlertCircle } from 'lucide-react';

const STAGES = [
    { key: 'Hiring Open', label: 'Hiring Open' },
    { key: 'Resume Screening', label: 'Resume Screening' },
    { key: 'Aptitude Round', label: 'Aptitude Round' },
    { key: 'Coding Round', label: 'Coding Round' },
    { key: 'Technical Interview', label: 'Technical Round' },
    { key: 'HR Interview', label: 'HR Round' },
    { key: 'Offer Released', label: 'Offer Released' },
    { key: 'Hiring Closed', label: 'Hiring Closed' }
];

export const PlacementTimeline = ({ companyId }: { companyId: string }) => {
    const [status, setStatus] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await fetch(`/api/placement/status/${companyId}`).timeout(5000);
                const rawData = await response.json();
                // Defensive parsing
                setStatus(rawData?.success ? rawData.payload : null);
            } catch (err) {
                console.error("Timeline Feed Interrupted", err);
                setStatus(null);
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [companyId]);

    if (loading) return <div className="animate-pulse text-cyan-400">CONNECTING TO PLACEMENT SERVER...</div>;
    if (!status) return (
        <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center">
            <AlertCircle className="mx-auto text-slate-500 mb-2" />
            <p className="text-xs font-black uppercase text-slate-500">Timeline Data Offline</p>
        </div>
    );

    const currentIndex = STAGES.findIndex(s => s.key === status.current_stage);

    return (
        <div className="p-6 bg-slate-900/40 backdrop-blur-xl border-2 border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white tracking-tighter uppercase">
                    Live Roadmap: <span className="text-cyan-400">{status.company_name}</span>
                </h2>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 ${status.urgency === 'Critical' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    }`}>
                    {status.urgency === 'Critical' && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                    {status.urgency} Urgency
                </div>
            </div>

            {/* Intelligence Radar Telemetry */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <span className="text-[8px] text-slate-500 uppercase font-black">Estimated Package</span>
                    <p className="text-xs font-bold text-green-400">{status.salary_range || "6 - 12 LPA"}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <span className="text-[8px] text-slate-500 uppercase font-black">Hiring Velocity</span>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-cyan-400">{status.velocity || "High"}</p>
                        <TrendingUp size={10} className="text-cyan-500" />
                    </div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <span className="text-[8px] text-slate-500 uppercase font-black">Rejection Ratio</span>
                    <p className="text-xs font-bold text-red-400">{status.rejection_ratio ? `${status.rejection_ratio}%` : "50%"}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <span className="text-[8px] text-slate-500 uppercase font-black">Eligibility</span>
                    <p className="text-xs font-bold text-indigo-400 line-clamp-1">{status.eligibility?.join('/') || "CSE/ISE/ECE"}</p>
                </div>
            </div>

            <div className="relative space-y-6">
                {STAGES.map((stageObj, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    const stage = stageObj.label;

                    return (
                        <motion.div
                            key={stage}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-start gap-4 transition-all ${isActive ? 'scale-105 z-20' : isCompleted ? 'opacity-80' : 'opacity-30'}`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="z-10">
                                    {isCompleted ? <CheckCircle2 className="text-emerald-500 w-6 h-6 shadow-lg shadow-emerald-500/20" /> :
                                        isActive ? <div className="relative"><PlayCircle className="text-cyan-400 w-6 h-6" /><div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-25" /></div> :
                                            <Circle className="text-slate-700 w-6 h-6" />}
                                </div>
                                {index !== STAGES.length - 1 && (
                                    <div className={`w-1 h-12 rounded-full ${isCompleted ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                                )}
                            </div>

                            <div className="pt-0.5">
                                <p className={`text-sm font-black tracking-tight ${isActive ? 'text-cyan-300' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {stage.toUpperCase()}
                                </p>
                                {isActive && (
                                    <div className="mt-1">
                                        <p className="text-[10px] text-cyan-500/80 font-mono">ESTIMATED COMPLETION: {status.eta || 'TBD'}</p>
                                        <span className="inline-block mt-2 text-[9px] font-black bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-0.5 rounded-full uppercase tracking-widest">Active Stage</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-500">
                <span>SYNC_ID: {status.id?.split('-')[0] || "OFFLINE"}</span>
                <span>LAST_UPDATED: {status.updated_at ? new Date(status.updated_at).toLocaleTimeString() : "N/A"}</span>
            </div>
        </div>
    );
};