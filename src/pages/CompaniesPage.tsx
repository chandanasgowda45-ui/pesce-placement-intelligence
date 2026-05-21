import AppLayout from "@/components/layout/AppLayout";
import CompanyCard from "@/components/company/CompanyCard";
import SearchBar from "@/components/search/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import { useCompanies, useSearchCompanies } from "@/hooks/useCompanies";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

export default function CompaniesPage() {
  const { data: companies = [] } = useCompanies();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter companies based on category, tier, and search
  let filteredCompanies = companies;

  // Apply filters from URL search params
  const tierFilter = searchParams.get("tier") || searchParams.get("category");
  
  if (tierFilter) {
    const normalize = (s: string | undefined) => (s || "").toLowerCase().replace(/\s+/g, '');
    const filterNorm = normalize(tierFilter);
    
    filteredCompanies = filteredCompanies.filter(c => 
      normalize(c.category) === filterNorm || normalize(c.company_tier) === filterNorm
    );
  }

  // Apply search filter
  const { data: searchResults } = useSearchCompanies(searchQuery);
  if (searchQuery) {
    filteredCompanies = searchResults || [];
  }

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">PESCE Corporate Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tierFilter ? `Browsing ${tierFilter} companies` : "Browse and search the institutional placement database"}
          </p>
        </div>

        <SearchBar onSearch={(q) => { setSearchQuery(q); setCurrentPage(1); }} />

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {filteredCompanies.length} ENTITIES FOUND
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >Previous</Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >Next</Button>
            </div>
          )}
        </div>

        {paginatedCompanies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCompanies.map((c) => (
              <CompanyCard key={c.company_id} company={c} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No companies found"
            description={searchQuery ? "Try a different search term." : "No companies match the current filters."}
          />
        )}
      </div>
    </AppLayout>
  );
}