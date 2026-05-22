import AppLayout from "@/components/layout/AppLayout";
import CompanyCard from "@/components/company/CompanyCard";
import SearchBar from "@/components/search/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import { useCompanies, useSearchCompanies } from "@/hooks/useCompanies";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company, CompanySortField } from "@/types/company";
import { Badge } from "@/components/ui/badge";

function sortCompanies(companies: Company[], field: CompanySortField, dir: "asc" | "desc"): Company[] {
  return [...companies].sort((a, b) => {
    const aVal = String((a as any)[field] ?? "");
    const bVal = String((b as any)[field] ?? "");
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function ExplorePage() {
  const { data: companies = [] } = useCompanies();
  const [query, setQuery] = useState("");
  const { data: searchResults } = useSearchCompanies(query);
  const [sortField, setSortField] = useState<CompanySortField>("name");
  const [profitabilityFilter, setProfitabilityFilter] = useState("");

  const list = query ? searchResults || [] : companies;
  const filtered = profitabilityFilter ? list.filter((c) => c.profitability_status === profitabilityFilter) : list;
  const sorted = sortCompanies(filtered, sortField, "asc");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explore Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and search all companies in the placement database
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar onSearch={setQuery} />
          <Select value={sortField} onValueChange={(v) => setSortField(v as CompanySortField)}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="employee_size">Employee Size</SelectItem>
              <SelectItem value="yoy_growth_rate">YoY Growth</SelectItem>
            </SelectContent>
          </Select>
          <Select value={profitabilityFilter} onValueChange={(v) => setProfitabilityFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Profitability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Profitable">Profitable</SelectItem>
              <SelectItem value="Non-Profitable">Non-Profitable</SelectItem>
              <SelectItem value="Break-even">Break-even</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">{sorted.length} companies</p>

        {sorted.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((c) => (
              <CompanyCard key={c.company_id} company={c} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </AppLayout>
  );
}
