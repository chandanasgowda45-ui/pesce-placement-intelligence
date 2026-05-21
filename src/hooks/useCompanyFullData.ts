import { useQuery } from "@tanstack/react-query";
import { CompanyDataPackage, fetchCompanyFullData } from "@/services/companyDataService";
import { isRetryableNetworkError } from "@/lib/supabase";

export function useCompanyFullData(companyId?: string) {
  const queryResult = useQuery<CompanyDataPackage | null>({
    queryKey: ["company-full", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID is required");
      return fetchCompanyFullData(companyId);
    },
    enabled: !!companyId,
    retry: (failureCount, error) => {
      return failureCount < 2 && isRetryableNetworkError(error);
    },
    retryDelay: attempt => 500 * attempt,
  });

  console.log("HOOK DATA:", queryResult.data);
  return queryResult;
}
