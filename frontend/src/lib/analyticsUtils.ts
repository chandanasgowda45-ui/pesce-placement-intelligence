import { useMemo } from "react";

export interface AnalyticsDataset<T> {
  data: T[];
  isEmpty: boolean;
  isValid: boolean;
}

/**
 * Validates if a dataset is suitable for rendering in a chart.
 */
export function validateDataset<T>(data: T[] | undefined | null): AnalyticsDataset<T> {
  if (!data || !Array.isArray(data)) {
    return { data: [], isEmpty: true, isValid: false };
  }
  
  const isEmpty = data.length === 0;
  
  // Validation: ensure at least one object has numeric data points
  // Even if they are 0, we allow rendering if the structure is correct
  const hasNumericStructure = data.some(item => {
    if (typeof item !== 'object' || item === null) return false;
    return Object.values(item).some(val => typeof val === 'number' && !isNaN(val));
  });

  return {
    data,
    isEmpty,
    isValid: !isEmpty && hasNumericStructure
  };
}

export function useValidatedDataset<T>(
  dataFetcher: () => T[],
  dependencies: any[]
): AnalyticsDataset<T> {
  return useMemo(() => {
    try {
      const data = dataFetcher();
      const validated = validateDataset(data);
      
      // Diagnostics
      if (validated.isValid) {
        console.log(`[PASS] Analytics dataset transformed (${data.length} items)`);
      } else if (validated.isEmpty) {
        console.warn(`[WARNING] Empty filtered dataset`);
      } else {
        console.error(`[FAIL] Invalid numeric transformation or schema mismatch`);
      }
      
      return validated;
    } catch (error) {
      console.error("[CRITICAL] Dataset transformation error:", error);
      return { data: [], isEmpty: true, isValid: false };
    }
  }, dependencies);
}
