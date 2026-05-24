import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useCompanies } from "@/hooks/useCompanies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Briefcase, ChevronRight, Clock, CheckCircle2 } from "lucide-react";

const STAGES = [
  "Hiring Open",
  "OA Round Active",
  "Technical Interview Stage",
  "HR Round",
  "Offer Released",
  "Hiring Closed"
];

const getStageProgress = (stage: string) => {
  const index = STAGES.indexOf(stage);
  return index === -1 ? 0 : ((index + 1) / STAGES.length) * 100;
};

export default function PlacementTimeline() {
  const { data: companies = [], isLoading } = useCompanies();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4">
        <div className="border-b pb-6">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Placement <span className="text-primary italic">Timeline Tracker</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Real-time status updates from our corporate partners.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => {
              // Using helper data mapping with safe fallbacks as requested
              const timeline = company.timeline || {
                current_stage: "Hiring Open",
                stage_status: "Active",
                hiring_velocity: company.hiring_velocity || "Medium"
              };
              const progress = getStageProgress(timeline.current_stage);

              return (
                <Card key={company.company_id} className="border-2 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50 border-b p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center font-bold text-lg">
                          {company.name[0]}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-black uppercase tracking-tight">{company.name}</CardTitle>
                          <span className="text-[10px] font-bold text-primary uppercase">{company.category}</span>
                        </div>
                      </div>
                      <Badge variant={timeline.stage_status === "Active" ? "default" : "secondary"} className="text-[9px] uppercase font-black">
                        {timeline.stage_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Hiring Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Current: {timeline.current_stage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>Started: {new Date(timeline.start_date || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                        <Briefcase className="h-2.5 w-2.5" /> Active Roles
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(timeline.active_roles || ["Generalist"]).slice(0, 3).map((role: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[9px] border-slate-200">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-dashed">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Velocity</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">{timeline.hiring_velocity}</span>
                      </div>
                      <button className="text-[10px] font-black uppercase text-primary flex items-center hover:underline">
                        View History <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}