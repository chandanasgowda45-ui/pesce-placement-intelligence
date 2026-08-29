import { SupabaseClient } from '@supabase/supabase-js';
import { calculateSkillMatch } from './src/services/skillNormalizer';

export interface CandidateProfile {
    fullName: string;
    gpa: number;
    skills: string[];
    certifications: string[];
    projects: { title: string; tech: string[] }[];
    experience: string;
    resumeText: string;
    codingConfidence: number;
    communicationConfidence: number;
}

export const analyzeRecruiterIntelligence = async (
    profile: CandidateProfile,
    targetCompanyId: string,
    supabase: SupabaseClient
) => {
    // 1. Fetch Company Requirements from Supabase
    const { data: requirements, error } = await supabase
        .from('company_requirements')
        .select('*')
        .eq('company_id', targetCompanyId)
        .single();

    if (error || !requirements) {
        throw new Error('Target company intelligence data unavailable.');
    }

    // 2. Weighted Mathematical Scoring Logic (Non-Random)
    // weights: Skills(30%), GPA(15%), Projects(20%), Confidence(15%), Domain(20%)

    // Phase 2 Upgrade: Normalization Matching
    const skillsMatch = calculateSkillMatch(profile.skills, requirements.desired_skills);

    const gpaScore = profile.gpa >= requirements.min_gpa ? 1 : profile.gpa / requirements.min_gpa;
    const projectScore = Math.min(profile.projects.length / 3, 1);
    const confidenceScore = (profile.codingConfidence + profile.communicationConfidence) / 20;

    // Phase 3 Hardening: Context-Aware Domain Alignment
    // Only give alignment bonus if base technical readiness is above 40%
    const domainAlignment = (skillsMatch > 0.4 && profile.resumeText.toLowerCase().includes(requirements.industry.toLowerCase())) ? 1 : 0.2;

    // Anti-Inflation Logic: Penalty for GPA under requirement
    const gpaPenalty = profile.gpa < requirements.min_gpa ? 0.7 : 1.0;

    const recruiterCompatibilityScore = Math.min(100, Math.round(
        (skillsMatch * 30) +
        (gpaScore * 15) +
        (projectScore * 20) +
        (confidenceScore * 15) +
        (domainAlignment * 20)
    ) * gpaPenalty);

    // 3. Risk Assessment
    const rejectionRisk = recruiterCompatibilityScore > 75 ? 'Low' : recruiterCompatibilityScore > 50 ? 'Medium' : 'High';
    const selectionProbability = Math.max(0, recruiterCompatibilityScore - (rejectionRisk === 'High' ? 20 : 5));

    // 4. Intelligence Payload (Premium Branding)
    return {
        intelligence: {
            recruiterCompatibilityScore,
            hiringReadinessIndex: Math.round(recruiterCompatibilityScore * 0.95),
            technicalReadiness: Math.round(skillsMatch * 100),
            projectRelevance: Math.round(projectScore * 100),
            communicationReadiness: profile.communicationConfidence * 10,
            domainAlignment: Math.round(domainAlignment * 100),
            selectionProbability,
            rejectionRisk,
            recruiterResonance: generateResonanceFeedback(recruiterCompatibilityScore, profile)
        },
        timestamp: new Date().toISOString()
    };
};

function generateResonanceFeedback(score: number, profile: CandidateProfile): string {
    if (score > 80) return `Strong candidate resonance detected for ${profile.fullName}. High technical alignment with core engineering stack.`;
    if (score > 60) return "Candidate shows readiness, but lacks specific domain keywords in project documentation.";
    return "Significant misalignment between resume intelligence and recruiter expectations. Optimization required.";
}