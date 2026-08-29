import React, { useState } from 'react';
import { Cpu, Terminal, ShieldCheck, Zap, FileUp, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

// Phase 1: Strong Payload Validation
const candidateSchema = z.object({
    fullName: z.string().min(2, "Full Name required"),
    gpa: z.number().min(0).max(10),
    skills: z.array(z.string()).min(1, "At least one skill required"),
    codingConfidence: z.number().min(1).max(10),
    communicationConfidence: z.number().min(1).max(10),
    resumeText: z.string().min(50, "Resume intelligence too low for analysis"),
});

export const ResumeIntelligence = () => {
    const [scanning, setScanning] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Phase 3: Resume PDF Upload & Parsing
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/api/resume/parse', { method: 'POST', body: formData });
            const data = await response.json();
            // Auto-populate form logic would go here
            console.log("Extracted Intelligence:", data);
        } catch (err) {
            console.error("Resume decoding failure", err);
        } finally {
            setIsParsing(false);
        }
    };

    const handleIntelligenceScan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError(null);
        const formData = new FormData(e.currentTarget);

        // Phase 1: Payload Normalization
        const rawPayload = {
            fullName: formData.get("fullName") as string,
            gpa: Number(formData.get("gpa")),
            skills: (formData.get("skills") as string).split(",").map(s => s.trim()).filter(Boolean),
            codingConfidence: Number(formData.get("codingConfidence")),
            communicationConfidence: Number(formData.get("communicationConfidence")),
            resumeText: formData.get("resumeText") as string || "Placeholder for extracted text from PDF parser",
        };

        const validation = candidateSchema.safeParse(rawPayload);
        if (!validation.success) {
            setValidationError(validation.error.errors[0].message);
            return;
        }

        setScanning(true);
        try {
            const response = await fetch('/api/rejection-intelligence/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validation.data),
            });
            const data = await response.json();
            setResults(data.intelligence);
        } catch (err) {
            console.error("Intelligence scan failed", err);
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
            {/* Processing Console */}
            <div className="lg:col-span-4 bg-black/60 border border-cyan-500/30 p-6 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <div className="flex items-center gap-3 mb-6 border-b border-cyan-900 pb-4">
                    <Terminal className="text-cyan-400 w-5 h-5" />
                    <h3 className="text-sm font-mono text-cyan-400">RESUME_INTELLIGENCE_V2.0</h3>
                </div>

                <form onSubmit={handleIntelligenceScan} className="space-y-4">
                    {/* Phase 3 UI: Resume Upload */}
                    <div className="relative group">
                        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                        <label htmlFor="resume-upload" className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-cyan-900 rounded-lg cursor-pointer hover:border-cyan-500 transition-all bg-cyan-500/5">
                            {isParsing ? <Loader2 className="animate-spin text-cyan-400" /> : <FileUp className="text-cyan-400" />}
                            <span className="text-[10px] font-mono">{isParsing ? 'AI_RESUME_DECODING...' : 'UPLOAD_INTELLIGENCE_PDF'}</span>
                        </label>
                    </div>

                    <input name="fullName" placeholder="FULL NAME" required className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white focus:border-cyan-500 outline-none" />
                    <input name="gpa" type="number" step="0.01" placeholder="GPA" required className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white focus:border-cyan-500 outline-none" />
                    <textarea name="skills" placeholder="SKILLS (COMMA SEPARATED)" required className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white h-24 outline-none" />
                    <textarea name="resumeText" placeholder="RESUME_CONTENT_DATA" className="hidden" />

                    <div className="flex gap-2">
                        <input name="codingConfidence" type="number" min="1" max="10" placeholder="CODING (1-10)" className="w-1/2 bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white outline-none" />
                        <input name="communicationConfidence" type="number" min="1" max="10" placeholder="COMM (1-10)" className="w-1/2 bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white outline-none" />
                    </div>

                    {validationError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] font-mono">
                            ERROR: {validationError.toUpperCase()}
                        </motion.p>
                    )}

                    <button
                        disabled={scanning}
                        className={`w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${scanning ? 'animate-pulse opacity-50' : ''}`}
                    >
                        {scanning ? 'PROCESSING...' : 'INITIALIZE SCAN'}
                    </button>
                </form>
            </div>

            {/* Intelligence Dashboard */}
            <div className="lg:col-span-8">
                {!results && !scanning && (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                        <Cpu className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-tighter">Waiting for candidate intelligence input...</p>
                    </div>
                )}

                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-slate-900/60 p-6 border border-cyan-500/20 rounded-xl">
                            <span className="text-[10px] text-cyan-400 font-mono">RECRUITER_COMPATIBILITY_SCORE</span>
                            <div className="text-5xl font-black text-white mt-2">{results.recruiterCompatibilityScore}%</div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${results.recruiterCompatibilityScore}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-400"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-900/60 p-6 border border-purple-500/20 rounded-xl">
                            <span className="text-[10px] text-purple-400 font-mono">HIRING_READINESS_INDEX</span>
                            <div className="text-5xl font-black text-white mt-2">{results.hiringReadinessIndex}</div>
                            <p className="text-[10px] text-slate-400 mt-4 italic font-mono uppercase tracking-tighter">
                                RECRUITER RESONANCE: {results.recruiterResonance}
                            </p>
                        </div>

                        {/* Technical Telemetry Card */}
                        <div className="md:col-span-2 bg-slate-900/60 p-4 border border-slate-800 rounded-xl flex justify-between items-center font-mono">
                            <div className="flex gap-4">
                                <div className="flex flex-col"><span className="text-slate-500 text-[9px]">RISK</span><span className={results.rejectionRisk === 'Low' ? 'text-green-400' : 'text-red-400'}>{results.rejectionRisk}</span></div>
                                <div className="flex flex-col"><span className="text-slate-500 text-[9px]">PROBABILITY</span><span className="text-cyan-400">{results.selectionProbability}%</span></div>
                            </div>
                            <ShieldCheck className="text-cyan-400/50" size={20} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};