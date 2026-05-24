import React, { useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Network, Zap, Target, ShieldAlert } from "lucide-react";
import { PlacementGraphEngine } from "../../../backend/PlacementGraphEngine";
import { useCompanies } from "@/hooks/useCompanies";

export default function StrategicGraph() {
    const { data: companies = [] } = useCompanies();

    // Placeholder for student data - in production, this comes from CandidateAnalyzer/Auth context
    const studentData = {
        name: "Current Candidate",
        skills: "React, TypeScript, Node.js, System Design",
        cgpa: "8.5"
    };

    const engine = useMemo(() => new PlacementGraphEngine(), []);

    const graphData = useMemo(() => {
        // We simulate syncing with mock experiences for the visualization
        return engine.syncKnowledgeGraph(companies, [], studentData);
    }, [companies, engine]);

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-20 pt-4 px-4">
                <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic flex items-center gap-3">
                            <Network className="h-10 w-10 text-primary" />
                            Strategic <span className="text-primary">Intelligence Graph</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                            Unified Causality & Dependency Network
                        </p>
                    </div>
                    <Badge className="bg-primary animate-pulse text-[10px] font-black uppercase py-1">
                        Live Reasoning Active
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Strategic Insights Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" /> Reasoning Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {graphData?.strategicInsights?.length > 0 ? (
                                    graphData.strategicInsights.map((insight: string, i: number) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10 text-[11px] font-medium leading-relaxed">
                                            {insight}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] italic opacity-50">Awaiting intelligence synchronization...</p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3">Graph Density</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span>Active Nodes</span>
                                    <span>{graphData?.nodes?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span>Causal Edges</span>
                                    <span>{graphData?.edges?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Graph Interface */}
                    <Card className="lg:col-span-3 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden bg-slate-50 relative min-h-[600px]">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                        <CardHeader className="relative z-10 border-b bg-white/80 backdrop-blur-sm">
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> Dependency Mapping
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="relative flex items-center justify-center h-full">
                            {/* This represents the node-link visualization requested in Section 9 */}
                            <div className="relative w-full h-[500px]">
                                {(graphData as any).nodes?.slice(0, 15).map((node: any, i: number) => (
                                    <div
                                        key={node.id}
                                        className="absolute p-2 bg-white border-2 border-slate-900 rounded-xl shadow-sm flex flex-col items-center justify-center animate-in zoom-in-50 duration-500"
                                        style={{
                                            left: `${20 + (i * 15) % 70}%`,
                                            top: `${10 + (i * 12) % 80}%`,
                                            transform: `scale(${0.8 + node.weight * 0.4})`
                                        }}
                                    >
                                        <span className="text-[8px] font-black uppercase text-slate-400 mb-1">{node.type}</span>
                                        <span className="text-[10px] font-bold text-slate-900">{node.label}</span>
                                    </div>
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em] italic">Intelligence Flux Matrix</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}