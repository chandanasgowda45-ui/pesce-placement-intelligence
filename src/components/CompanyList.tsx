import { useCompanies } from "@/hooks/useCompanies";
import CompanyCard from "@/components/company/CompanyCard";
import { Skeleton } from "@/components/ui/skeleton";

export const CompanyList: React.FC = () => {
  const { data: companies = [], isLoading, error } = useCompanies();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-xl bg-red-50 text-red-700">
        <p className="font-semibold">Failed to load companies</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return <p className="text-muted-foreground">No companies found.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard key={company.company_id} company={company} />
      ))}
    </div>
  );
};

