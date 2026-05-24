import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar,
    Search,
    Clock,
    Briefcase,
    DollarSign,
    CheckCircle2,
    XCircle,
    Timer,
    Trophy
} from "lucide-react";

interface CompanyWithTimeline {
    company_id: string;
    name: string;
    category: string;

    placement_timelines: Array<{
        final_status: string;
        registration_deadline: string;
        aptitude_date: string;
        technical_date: string;
        hr_date: string;
        package: string;
        role: string;
    }>;
}
const STATUS_CONFIG = {
    Upcoming: "bg-blue-600 text-white border-none",
    Ongoing: "bg-amber-400 text-amber-950 border-none",
    Completed: "bg-emerald-600 text-white border-none",
    Rejected: "bg-red-600 text-white border-none",
    Selected: "bg-purple-600 text-white border-none shadow-lg shadow-purple-200"
};

export default function PlacementTimeline() {
    const [timelines, setTimelines] = useState<CompanyWithTimeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetchTimelines();
    }, []);

    const fetchTimelines = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("companies")
            .select(`
            *,
            placement_timelines (
                final_status,
                registration_deadline,
                aptitude_date,
                technical_date,
                hr_date,
                package,
                role
            )
        `);

        if (!error && data) {
            setTimelines(data);
        }

        setLoading(false);
    };

    const filteredData = useMemo(() => {
        return timelines.filter((company) => {
            const timeline = company.placement_timelines?.[0];

            const currentStatus =
                timeline?.final_status || "Upcoming";

            const matchesSearch =
                (company.name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||

                (timeline?.role || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "All" ||
                currentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [timelines, searchQuery, statusFilter]);

    const getProgressWidth = (status: string) => {
        switch (status) {
            case "Upcoming": return "w-[20%]";
            case "Ongoing": return "w-[60%]";
            case "Completed": return "w-[100%]";
            case "Selected":
            case "Rejected": return "w-full";
            default: return "w-0";
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Timer className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Loading Placement Intelligence...
                    </p>
                </div>
            </AppLayout>
        );
    }
    return (
        <AppLayout>
            <div className="space-y-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
                            Placement <span className="text-primary">Timeline</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg uppercase tracking-tighter">
                            Recruitment Lifecycle & Milestone Intelligence
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm">
                        <Timer className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live Feed</span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-3 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by company or role..."
                            className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 font-bold text-slate-700">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Entities</SelectItem>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Selected">Selected</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 min-h-[400px]">
                    {filteredData.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-4 border-dashed rounded-3xl bg-slate-50">
                            <Search className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No matching placement timelines found</h3>
                            <p className="text-sm text-slate-400">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        filteredData.map((company) => {
                            const timeline = company.placement_timelines?.[0];
                            const currentStatus = timeline?.final_status || "Upcoming";

                            return (
                                <Card key={company.company_id} className="group overflow-hidden border-2 hover:border-primary transition-all duration-500 shadow-sm hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                                    <div className="h-3 w-full bg-slate-100 relative overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${currentStatus === 'Rejected' ? 'bg-red-500' : currentStatus === 'Selected' ? 'bg-purple-600' : 'bg-primary'
                                                } ${getProgressWidth(currentStatus)}`}
                                        />
                                    </div>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 pt-6">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{company.name}</h3>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Briefcase className="h-4 w-4" />
                                                <span className="text-sm font-bold uppercase tracking-tight">{timeline?.role || "Position TBD"}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`font-black uppercase tracking-widest text-[10px] py-1.5 px-3 ${STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Upcoming}`}>
                                            {currentStatus}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 group-hover:bg-white group-hover:border-primary/10 transition-all">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Package</p>
                                                <div className="flex items-center gap-1 text-emerald-600 font-black">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>{timeline?.package || "N/A"}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 group-hover:bg-white group-hover:border-primary/10 transition-all">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <span>{timeline?.registration_deadline || "TBD"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative space-y-4">
                                            <div className="absolute left-[11px] top-2 bottom-2 w-1 bg-slate-100 rounded-full" />

                                            <div className="flex items-center gap-4 relative">
                                                <div className={`h-6 w-6 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-md transition-colors duration-500 ${timeline?.aptitude_date && new Date(timeline.aptitude_date) < new Date() ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    {timeline?.aptitude_date && new Date(timeline.aptitude_date) < new Date() && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase tracking-tight text-slate-600 italic">Aptitude Round</span>
                                                    <span className="text-xs font-black text-slate-400">{timeline?.aptitude_date || "TBD"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 relative">
                                                <div className={`h-6 w-6 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-md transition-colors duration-500 ${timeline?.technical_date && new Date(timeline.technical_date) < new Date() ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    {timeline?.technical_date && new Date(timeline.technical_date) < new Date() && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase tracking-tight text-slate-600 italic">Technical Round</span>
                                                    <span className="text-xs font-black text-slate-400">{timeline?.technical_date || "TBD"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 relative">
                                                <div className={`h-6 w-6 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-md transition-colors duration-500 ${currentStatus === 'Selected' ? 'bg-purple-600' : currentStatus === 'Rejected' ? 'bg-red-500' : 'bg-slate-200'}`}>
                                                    {currentStatus === 'Selected' && <Trophy className="h-3 w-3 text-white" />}
                                                    {currentStatus === 'Rejected' && <XCircle className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="text-xs font-black uppercase tracking-tight text-slate-600 italic">Final & HR Result</span>
                                                    <span className="text-xs font-black text-slate-400">{timeline?.hr_date || "TBD"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
}