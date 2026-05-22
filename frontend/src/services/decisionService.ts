import { Company } from "@/types/company";
import { StudentProfile } from "@/hooks/useStudentProfile";

export interface DecisionIntelligence {
  matchScore: number;
  selectionProbability: number;
  recommendation: "Strong Apply" | "Target" | "Long Shot" | "Back-up";
  reasoning: string;
  skillGaps: string[];
}

export function calculateDecision(company: Company, profile: StudentProfile): DecisionIntelligence {
  // 1. Skill Match Calculation
  const companyTech = (company.tech_stack || "").toLowerCase();
  const matchedSkills = profile.skills.filter(skill => companyTech.includes(skill.toLowerCase()));
  const skillMatchScore = (matchedSkills.length / Math.max(1, profile.skills.length)) * 100;

  // 2. Selection Probability
  // Factors: Hiring Velocity (50%), Brand Competition (20%), Skill Match (30%)
  const velocity = parseFloat(String(company.hiring_velocity || "0").replace(/[^0-9.]/g, '')) || 50;
  const probability = Math.round((velocity * 0.5) + (skillMatchScore * 0.3) + (20)); // Base 20 for baseline odds

  // 3. Match Score (Goal Alignment)
  let goalAlignment = 50;
  const tier = (company.company_tier || "").toLowerCase();
  if (profile.goal === "marquee" && tier.includes("marquee")) goalAlignment = 100;
  if (profile.goal === "startup" && company.nature_of_company?.toLowerCase().includes("startup")) goalAlignment = 100;
  if (profile.goal === "corporate" && tier.includes("tier 1")) goalAlignment = 100;

  const matchScore = Math.round((skillMatchScore * 0.6) + (goalAlignment * 0.4));

  // 4. Recommendation & Reasoning
  let recommendation: DecisionIntelligence["recommendation"] = "Target";
  let reasoning = "";

  if (matchScore > 80 && probability > 60) {
    recommendation = "Strong Apply";
    reasoning = "High skill alignment and active hiring velocity make this a prime target.";
  } else if (probability < 30) {
    recommendation = "Long Shot";
    reasoning = "Highly competitive or low hiring velocity. Focus on backup options first.";
  } else if (matchScore < 40) {
    recommendation = "Back-up";
    reasoning = "Low skill alignment, but potentially easier entry due to hiring volume.";
  } else {
    recommendation = "Target";
    reasoning = "Balanced profile match. Worth pursuing with targeted preparation.";
  }

  // 5. Skill Gaps (Mock logic: skills in company tech stack but not in profile)
  const commonTech = ["AWS", "Docker", "System Design", "Microservices", "Kubernetes", "Redis", "Kafka"];
  const skillGaps = commonTech.filter(tech => 
    companyTech.includes(tech.toLowerCase()) && 
    !profile.skills.some(s => s.toLowerCase() === tech.toLowerCase())
  ).slice(0, 3);

  return {
    matchScore,
    selectionProbability: Math.min(95, probability),
    recommendation,
    reasoning,
    skillGaps
  };
}
