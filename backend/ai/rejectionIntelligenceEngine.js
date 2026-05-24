const { askGeminiDirect } = require('./geminiService');

/**
 * AI-Powered Candidate Rejection Probability Intelligence Engine
 * Evaluates a candidate profile against target company and job role expectations
 */

const SYSTEM_PROMPT = `
You are a brilliant AI Placement Mentor and Recruiter Intelligence Engine.
Your job is to perform an extremely thorough, honest, and rigorous assessment of a student's profile against a specific target company and job role's hiring expectations.

Evaluate the following eight core dimensions and score them strictly between 0 and 100 based on the evidence provided:
1. **Resume Quality**: Structure, language, visual hierarchy, impact orientation.
2. **ATS Compatibility**: Clean formatting, scan-readiness, use of industry standard headings, lack of parsing blockers.
3. **Technical Skill Match**: Coverage of the company's required skills by the student's listed skills.
4. **Project Relevance**: How well the student's projects align with the company's domain, tech stack, and scale.
5. **Core/Domain Alignment**: Academic foundations (CGPA, degree relevance) and alignment with company tier expectations.
6. **Coding Readiness**: Evidence of strong data structures, algorithms, or programming proficiency from coding profiles (LeetCode/GitHub links).
7. **Communication Readiness**: Confidence, presentation, and text-based clarity in projects and resume summaries.
8. **Company-Role Compatibility**: Overall suitability for this company's hiring bar and culture.

CRITICAL INSTRUCTIONS:
- Do NOT make up fake analysis or hallucinate certifications/skills. Use only the provided student and company details.
- Provide highly specific, actionable, and concrete feedback.
- Be honest and realistic. If a student is a poor fit or lacks critical skills, rate them low on that metric and explain why in the reasoning.
- Suggest exact resume bullet point modifications (original vs. optimized with quantification and action verbs).
- Build a week-by-week roadmap, detailing exact coding topics, project concepts, and interview prep milestones needed to close the gaps.

You MUST respond in JSON format ONLY with this exact structure:
{
  "scores": {
    "resumeQuality": number (0-100),
    "atsCompatibility": number (0-100),
    "technicalSkillMatch": number (0-100),
    "projectRelevance": number (0-100),
    "coreAlignment": number (0-100),
    "codingReadiness": number (0-100),
    "communicationReadiness": number (0-100),
    "companyRoleCompatibility": number (0-100)
  },
  "scoreReasoning": {
    "resumeQuality": "Detailed 2-3 sentence analysis of resume layout and structural depth.",
    "atsCompatibility": "Detailed 2-3 sentence analysis of ATS friendliness, keyword density, and potential parser issues.",
    "technicalSkillMatch": "Detailed 2-3 sentence analysis of skill overlap and missing critical technology.",
    "projectRelevance": "Detailed 2-3 sentence analysis comparing student projects against company engineering domain.",
    "coreAlignment": "Detailed 2-3 sentence analysis of CGPA and core academic indicators.",
    "codingReadiness": "Detailed 2-3 sentence analysis of coding profiles (LeetCode/GitHub activity/repos).",
    "communicationReadiness": "Detailed 2-3 sentence analysis of presentation clarity.",
    "companyRoleCompatibility": "Detailed 2-3 sentence analysis of why this company matches or mismatches the profile."
  },
  "readinessLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert",
  "weaknesses": [
    "Specific weakness 1 (e.g. Low LeetCode count / Missing advanced trees/graphs evidence)",
    "Specific weakness 2 (e.g. Projects lack backend deployment / No cloud experience)"
  ],
  "skillGapAnalysis": [
    { "skill": "Docker", "status": "Missing" | "Matched" | "Partial", "importance": "High" | "Medium" | "Low" }
  ],
  "roadmap": [
    {
      "week": 1,
      "title": "Roadmap Week Title",
      "tasks": ["Concrete, actionable task 1", "Concrete, actionable task 2"],
      "resources": ["Specific course name, book chapter, or website to learn from"]
    }
  ],
  "improvementTimeline": "X Weeks / Y Months",
  "atsScan": {
    "score": number (0-100),
    "formattingReview": "Short critique of resume structure and fonts.",
    "structuralReview": "Short critique of sections hierarchy.",
    "keyIssues": ["Issue 1 (e.g., lack of strong action verbs)", "Issue 2 (e.g., missing metrics/numbers on impact)"]
  },
  "companyPreparation": {
    "rounds": [
      { "name": "Round Name (e.g. Technical Interview 1)", "focus": "Topics to focus on (e.g., Graph Algorithms, System Design)", "strategy": "Practical advice to clear this round" }
    ],
    "tips": "General strategic advice for cracking this specific company's hiring rounds."
  },
  "resumeOptimization": [
    { "original": "Simple description from candidate profile", "suggestion": "Quantified, high-impact description with action verbs and metrics." }
  ],
  "confidenceAnalysis": {
    "overall": number (0-100),
    "technical": number (0-100),
    "projects": number (0-100),
    "experience": number (0-100),
    "education": number (0-100)
  }
}
`;

/**
 * Runs the analysis pipeline
 * @param {Object} studentProfile - Details of the student
 * @param {Object} companyData - Target company details
 * @returns {Promise<Object>} The complete, computed intelligence report
 */
async function analyzeCandidateRejectionProbability(studentProfile, companyData) {
  try {
    console.log(`[REJECTION ENGINE] Evaluating ${studentProfile.name || 'Student'} for ${companyData.name || 'Target Company'}...`);

    const userPrompt = `
STUDENT PROFILE:
- Name: ${studentProfile.name || 'N/A'}
- CGPA: ${studentProfile.cgpa || 'N/A'}
- Preferred Role: ${studentProfile.preferredRole || 'N/A'}
- Skills: ${studentProfile.skills || 'N/A'}
- Projects: ${studentProfile.projects || 'N/A'}
- Certifications: ${studentProfile.certifications || 'N/A'}
- Internship/Work Experience: ${studentProfile.experience || 'N/A'}
- GitHub: ${studentProfile.githubUrl || 'N/A'}
- LeetCode: ${studentProfile.leetcodeUrl || 'N/A'}
- LinkedIn: ${studentProfile.linkedinUrl || 'N/A'}
- Resume Summary: ${studentProfile.resumeSummary || 'N/A'}

COMPANY & ROLE EXPECTATIONS:
- Target Company: ${companyData.name || 'N/A'}
- Selected Role: ${companyData.selectedRole || 'N/A'}
- Required Skills: ${companyData.tech_stack || 'N/A'}
- Hiring Rounds Mapped: ${JSON.stringify(companyData.hiringRounds || [])}
- Focus Sectors: ${companyData.focus_sectors || 'N/A'}
- Overview: ${companyData.overview_text || 'N/A'}
`;

    // Fetch raw AI analysis
    const aiResponse = await askGeminiDirect(SYSTEM_PROMPT, userPrompt);
    
    // Clean and parse response
    const cleaned = aiResponse
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let report;
    try {
      report = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("[REJECTION ENGINE] JSON Parse Error. Raw response was:", aiResponse);
      throw new Error("AI returned invalid JSON format. Please try again.");
    }

    // ============================================
    // WEIGHTED MATHEMATICAL SCORING ENGINE
    // ============================================
    const scores = report.scores || {};
    const resumeQuality = Number(scores.resumeQuality) || 50;
    const atsCompatibility = Number(scores.atsCompatibility) || 50;
    const technicalSkillMatch = Number(scores.technicalSkillMatch) || 50;
    const projectRelevance = Number(scores.projectRelevance) || 50;
    const coreAlignment = Number(scores.coreAlignment) || 50;
    const codingReadiness = Number(scores.codingReadiness) || 50;
    const communicationReadiness = Number(scores.communicationReadiness) || 50;
    const companyRoleCompatibility = Number(scores.companyRoleCompatibility) || 50;

    // Define strict weights
    const WEIGHTS = {
      resumeQuality: 0.15,
      atsCompatibility: 0.10,
      technicalSkillMatch: 0.20,
      projectRelevance: 0.15,
      coreAlignment: 0.10,
      codingReadiness: 0.15,
      communicationReadiness: 0.05,
      companyRoleCompatibility: 0.10
    };

    // Calculate selection probability mathematically
    let selectionProbability = Math.round(
      (resumeQuality * WEIGHTS.resumeQuality) +
      (atsCompatibility * WEIGHTS.atsCompatibility) +
      (technicalSkillMatch * WEIGHTS.technicalSkillMatch) +
      (projectRelevance * WEIGHTS.projectRelevance) +
      (coreAlignment * WEIGHTS.coreAlignment) +
      (codingReadiness * WEIGHTS.codingReadiness) +
      (communicationReadiness * WEIGHTS.communicationReadiness) +
      (companyRoleCompatibility * WEIGHTS.companyRoleCompatibility)
    );

    // Dynamic cut-offs / safety triggers (AI Reasoning overrides)
    // E.g. If student's GPA is extremely low and the company requires a high bar, selection drops automatically.
    const cgpaNum = parseFloat(studentProfile.cgpa);
    if (!isNaN(cgpaNum) && cgpaNum < 6.0 && selectionProbability > 35) {
      console.log("[REJECTION ENGINE] GPA safety override triggered.");
      selectionProbability = Math.max(15, selectionProbability - 25);
    }

    // Ensure range bounds [5, 95]
    selectionProbability = Math.max(5, Math.min(95, selectionProbability));
    const rejectionProbability = 100 - selectionProbability;

    // Attach computed probability to report
    report.selectionChance = selectionProbability;
    report.rejectionRisk = rejectionProbability;

    console.log(`[REJECTION ENGINE] Complete! Selection: ${selectionProbability}%, Rejection: ${rejectionProbability}%`);
    return report;

  } catch (error) {
    console.error("[REJECTION ENGINE ERROR]:", error);
    throw error;
  }
}

module.exports = {
  analyzeCandidateRejectionProbability
};
