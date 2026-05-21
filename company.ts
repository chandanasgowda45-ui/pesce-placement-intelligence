export interface CompanyIntelligenceScores {
  growth: number;
  culture: number;
  tech: number;
  risk: number;
  overall: number;
}

export interface CompanyIntelligence {
  scores: CompanyIntelligenceScores;
  insights: string[];
  overview?: string; // Assuming overview is optional based on your request
  // Add other intelligence-related fields here
}

export interface Company {
  company_id: string;
  name: string;
  logo_url?: string;
  category?: string;
  focus_sectors?: string;
  tech_stack?: string;
  company_tier?: string;
  intelligence?: CompanyIntelligence; // Make intelligence optional as it might not always be present or loaded
  // Add other top-level company fields here
}