import { useQuery } from "@tanstack/react-query";
import { Company } from "@/types/company";
import { getAllCompanies, getCompaniesByCategory, searchCompanies, getCompanyById } from "@/services/companyService";

export function useCompanies(category?: string) {
  return useQuery<Company[]>({
    queryKey: category ? ["companies", "category", category] : ["companies"],
    retry: false,
    queryFn: async () => {
      return category ? getCompaniesByCategory(category) : getAllCompanies();
    },
  });
}

export function useCompany(companyId?: string) {
  return useQuery<Company | null>({
    queryKey: ["company", companyId],
    enabled: !!companyId,
    retry: false,
    queryFn: async () => {
      if (!companyId) return null;
      return getCompanyById(companyId);
    },
  });
}

export function useSearchCompanies(query: string) {
  return useQuery<Company[]>({
    queryKey: ["companies", "search", query],
    enabled: query.trim().length > 0,
    retry: false,
    queryFn: () => searchCompanies(query),
    placeholderData: [],
  });
}
