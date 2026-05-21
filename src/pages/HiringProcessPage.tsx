import AppLayout from "@/components/layout/AppLayout";
import CompanyCard from "@/components/company/CompanyCard";
import SearchBar from "@/components/search/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import { useCompanies, useSearchCompanies } from "@/hooks/useCompanies";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HiringProcessPage() {
  const { data: companies = [] } = useCompanies();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchCompanies(searchQuery);
  const navigate = useNavigate();

  const displayCompanies = searchQuery ? searchResults || [] : companies.slice(0, 12); // Show first 12 by default

  const handleCompanyClick = (companyId: string) => {
    navigate(`/companies/${companyId}/process`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hiring Rounds</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore company-specific hiring processes and selection stages
          </p>
        </div>

        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search company by name (e.g., Google, Infosys, Amazon)"
        />

        <p className="text-sm text-muted-foreground">
          {displayCompanies.length} companies
        </p>

        {displayCompanies.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayCompanies.map((c) => (
              <CompanyCard
                key={c.company_id}
                company={c}
                onClick={() => handleCompanyClick(c.company_id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No companies found"
            description={searchQuery ? "Try a different search term." : "No companies available."}
          />
        )}
      </div>
    </AppLayout>
  );
}