import AppLayout from "@/components/layout/AppLayout";
import CompanyCard from "@/components/company/CompanyCard";
import EmptyState from "@/components/common/EmptyState";
import { useCompanies } from "@/hooks/useCompanies";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";

import { STRATEGIC_CATEGORIES, getStrategicCategory } from "@/lib/categoryUtils";

const CATEGORIES = STRATEGIC_CATEGORIES.map(cat => ({
  ...cat,
  description: 
    cat.id === "tech-giants" ? "Global technology leaders and massive conglomerates with marquee status" :
    cat.id === "product-companies" ? "R&D focused entities building scalable software, cloud, and deep-tech products" :
    cat.id === "service-companies" ? "Global IT services, consulting, and digital transformation partners" :
    "Venture-backed, high-growth startups and scale-up companies"
}));

export default function CategoriesPage() {
  const { data: companies = [] } = useCompanies();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("id") || "";

  const categorizedCompanies = useMemo(() => {
    return companies.map(c => ({
      ...c,
      mappedId: getStrategicCategory(c).id
    }));
  }, [companies]);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      count: categorizedCompanies.filter(c => c.mappedId === cat.id).length
    }));
  }, [categorizedCompanies]);

  const filtered = useMemo(() => {
    if (!selectedCategory) return [];
    return categorizedCompanies.filter(c => c.mappedId === selectedCategory);
  }, [categorizedCompanies, selectedCategory]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Browse by Category</h1>
          <p className="text-muted-foreground mt-2">
            Strategic classification of campus recruitment partners
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categoryStats.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setSearchParams({ id: cat.id })}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group ${
                selectedCategory === cat.id 
                ? "border-primary bg-primary/5 shadow-lg" 
                : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="text-lg font-bold mb-1">{cat.label}</h3>
              <p className="text-2xl font-black text-primary">{cat.count}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="space-y-6 pt-6 border-t animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                <Badge variant="outline" className="ml-2">{filtered.length} entities</Badge>
              </h2>
              <button 
                onClick={() => setSearchParams({})}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                Clear Selection
              </button>
            </div>

            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((c) => (
                  <CompanyCard key={c.company_id} company={c} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No data for this category"
                description="We are still populating entities for this strategic bucket."
              />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
