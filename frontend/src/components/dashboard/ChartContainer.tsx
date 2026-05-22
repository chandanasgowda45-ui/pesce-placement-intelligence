import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart2 } from "lucide-react";
import { AnalyticsDataset } from "@/lib/analyticsUtils";

interface ChartContainerProps {
  title: string;
  description?: string;
  dataset: AnalyticsDataset<any>;
  isLoading?: boolean;
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  customEmptyMessage?: string;
}

export function ChartContainer({
  title,
  description,
  dataset,
  isLoading,
  children,
  height = 350,
  className = "",
  customEmptyMessage,
}: ChartContainerProps) {
  return (
    <Card className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 relative" style={{ height, minHeight: typeof height === 'number' ? height : 350 }}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col p-6 space-y-4">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ) : !dataset.isValid ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {dataset.isEmpty ? "No Matching Data" : "Insufficient Data"}
            </h4>
            <p className="text-sm text-slate-500 mt-1 max-w-[240px]">
              {customEmptyMessage ? customEmptyMessage : (
                dataset.isEmpty 
                  ? "Try adjusting your filters to see more results for this metric." 
                  : "The available data is currently being verified and will appear soon."
              )}
            </p>
          </div>
        ) : (
          <div className="h-full w-full animate-in fade-in duration-500">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
