import { Company } from "@/types/company";

export interface CompanyIntelligence {
  scores: {
    growth: number;
    culture: number;
    tech: number;
    risk: number;
    overall: number;
  };
  insights: string[];
}

/**
 * Normalizes a value to 0-100 range based on a numeric or string input
 */
function normalize(value: string | number | undefined | null, max: number = 100): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return Math.min(100, (value / max) * 100);
  
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  return Math.min(100, (num / max) * 100);
}

export function calculateCompanyIntelligence(company: Company): CompanyIntelligence {
  // 1. Growth Score (Fields: yoy_growth_rate, hiring_velocity, annual_revenue)
  // hiring_velocity is usually 0-100 (percentage)
  const growthRate = normalize(company.yoy_growth_rate, 50); // 50% is "max" growth for score 100
  const hiringSpeed = normalize(company.hiring_velocity, 100);
  const revenueScore = company.annual_revenue ? 80 : 40; // If revenue exists, base is 80
  const growth = Math.round((growthRate * 0.4) + (hiringSpeed * 0.4) + (revenueScore * 0.2));

  // 2. Culture Score (Fields: glassdoor_rating, burnout_risk, avg_retention_tenure)
  const glassdoor = normalize(company.glassdoor_rating, 5); // 5 is max
  const burnout = normalize(company.burnout_risk, 100);
  const retention = normalize(company.avg_retention_tenure, 5); // 5 years is max
  const culture = Math.round((glassdoor * 0.4) + (retention * 0.3) + ((100 - burnout) * 0.3));

  // 3. Tech Score (Fields: tech_adoption_rating, ai_ml_adoption_level, automation_level)
  const techAdoption = normalize(company.tech_adoption_rating, 5);
  const aiScore = normalize(company.ai_ml_adoption_level, 100);
  const automation = normalize(company.automation_level, 100);
  const tech = Math.round((techAdoption * 0.4) + (aiScore * 0.3) + (automation * 0.3));

  // 4. Risk Score (Fields: employee_turnover, burnout_risk, profitability_status)
  const turnover = normalize(company.employee_turnover, 30); // 30% turnover is "high"
  const riskBase = (company.profitability_status === 'profitable') ? 20 : 60;
  const risk = Math.round((turnover * 0.4) + (burnout * 0.4) + (riskBase * 0.2));

  // 5. Overall Score
  const overall = Math.round((growth * 0.3) + (culture * 0.3) + (tech * 0.2) + ((100 - risk) * 0.2));

  // Insight Generation
  const insights: string[] = [];
  if (growth > 85 && risk > 60) insights.push("Hypergrowth with significant burnout risk");
  if (culture > 80 && risk < 30) insights.push("High stability with elite work culture");
  if (tech > 85) insights.push("Leading the industry in tech adoption");
  if (growth < 20 && culture > 80) insights.push("Steady legacy institution with strong WLB");
  if (overall > 85) insights.push("Top-tier career destination");

  return {
    scores: { growth, culture, tech, risk, overall },
    insights
  };
}
