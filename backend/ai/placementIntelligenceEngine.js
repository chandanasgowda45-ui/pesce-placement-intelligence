const { getGeminiResponse } = require('./geminiService');

/**
 * Placement Intelligence Engine
 * Complete end-to-end assessment pipeline following the system prompt requirements
 */

/**
 * Step 1: Analyze CV and extract skills, projects, education, experience
 * Rates each skill from 0-100 based on evidence
 */
async function analyzeCV(candidateData) {
  const prompt = `
You are a Senior Technical Recruiter and Placement Assessor. Analyze this candidate's profile comprehensively:

CANDIDATE DATA:
- Name: ${candidateData.name}
- CGPA: ${candidateData.cgpa}
- Technical Skills: ${candidateData.skills}
- Projects: ${candidateData.projects}
- Resume Summary: ${candidateData.resumeSummary}
- GitHub: ${candidateData.githubUrl}
- LinkedIn: ${candidateData.linkedinUrl}
- LeetCode: ${candidateData.leetcodeUrl}
- GeeksForGeeks: ${candidateData.gfgUrl}
- Self-rated Aptitude: ${candidateData.aptitude}/100
- Self-rated Communication: ${candidateData.communication}/100

TASKS:
1. Extract and list all technical skills with evidence from CV
2. Rate each skill from 0-100 based on:
   - Project evidence (40% weight)
   - Duration/experience mentioned (30% weight)
   - Complexity of applications (30% weight)
3. Identify education details and academic achievements
4. Extract work experience if any
5. Identify gaps for typical software development roles

Return JSON only with this exact structure:
{
  "cv_insights": "Comprehensive 3-4 sentence analysis of the candidate's profile",
  "skills_analysis": [
    { "skill": "string", "rating": number (0-100), "evidence": "string", "category": "Frontend|Backend|Database|Tools|Soft Skills" }
  ],
  "education": { "degree": "string", "institution": "string", "year": "number", "achievements": ["string"] },
  "experience": { "total_months": number, "roles": ["string"], "companies": ["string"] },
  "projects_analysis": [{ "name": "string", "complexity": "Beginner|Intermediate|Advanced", "technologies": ["string"] }],
  "skill_gaps": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "target_role_recommendation": "string"
}
`;
  return await getGeminiResponse(prompt, "google/gemini-2.0-flash-exp");
}

/**
 * Step 2: Generate adaptive assessment based on candidate's level
 */
async function generateAssessment(cvAnalysis) {
  const targetRole = cvAnalysis.target_role_recommendation || "Software Developer";
  const avgSkillLevel = cvAnalysis.skills_analysis.reduce((sum, s) => sum + s.rating, 0) / cvAnalysis.skills_analysis.length;

  let difficultyLevel, codingTopics;
  if (avgSkillLevel < 40) {
    difficultyLevel = "Beginner";
    codingTopics = "arrays, strings, basic loops, simple patterns, basic math";
  } else if (avgSkillLevel < 70) {
    difficultyLevel = "Intermediate";
    codingTopics = "trees, graphs, dynamic programming, recursion, data structures";
  } else {
    difficultyLevel = "Expert";
    codingTopics = "system design, advanced algorithms, optimization, concurrency, distributed systems";
  }

  const prompt = `
You are an Assessment Designer for a technical hiring platform. Create an adaptive placement test.

CANDIDATE PROFILE:
- Target Role: ${targetRole}
- Experience Level: ${difficultyLevel}
- Average Skill Level: ${Math.round(avgSkillLevel)}/100
- Key Skills: ${cvAnalysis.skills_analysis.slice(0, 5).map(s => s.skill).join(", ")}
- Skill Gaps: ${cvAnalysis.skill_gaps.slice(0, 3).join(", ")}

REQUIREMENTS:
1. APTITUDE SECTION (3 questions):
   - 1 Logical Reasoning question (patterns, sequences, deductions)
   - 1 Quantitative Aptitude question (math, percentages, ratios)
   - 1 Pattern Recognition question (series, analogies)
   - Difficulty: Suited for ${difficultyLevel} level candidate
   - Format: Open-ended requiring explanation of logic

2. CODING SECTION (3 questions):
   - 1 Easy question (fundamentals, basic implementation)
   - 1 Medium question (data structures, algorithms)
   - 1 Hard question (complex problem-solving, optimization)
   - Topics: ${codingTopics}
   - Format: Problem statement requiring pseudo-code or detailed logic

Return JSON only with this exact structure:
{
  "aptitude": [
    {
      "id": "apt_1",
      "question": "string",
      "type": "Logical Reasoning|Quantitative|Pattern Recognition",
      "expected_answer_hint": "string (for evaluator reference)",
      "max_score": 10
    }
  ],
  "coding": [
    {
      "id": "code_1",
      "question": "string",
      "difficulty": "Easy|Medium|Hard",
      "topic": "string",
      "expected_approach": "string (key concepts to look for)",
      "evaluation_criteria": ["correctness", "time_complexity", "edge_cases", "code_quality"],
      "max_score": 10
    }
  ],
  "total_questions": 6,
  "recommended_time_minutes": 45
}
`;
  return await getGeminiResponse(prompt, "google/gemini-2.0-flash-exp");
}

/**
 * Step 3: Evaluate responses with detailed scoring
 */
async function evaluateResponses(assessment, userAnswers, cvAnalysis) {
  const prompt = `
You are a Technical Evaluator. Score the candidate's responses comprehensively.

CANDIDATE BACKGROUND:
${JSON.stringify({
    target_role: cvAnalysis.target_role_recommendation,
    skill_level: cvAnalysis.skills_analysis.reduce((sum, s) => sum + s.rating, 0) / cvAnalysis.skills_analysis.length,
    key_skills: cvAnalysis.skills_analysis.slice(0, 3).map(s => s.skill)
  }, null, 2)}

ASSESSMENT QUESTIONS:
${JSON.stringify(assessment, null, 2)}

CANDIDATE RESPONSES:
${JSON.stringify(userAnswers, null, 2)}

EVALUATION CRITERIA:
1. APTITUDE SCORING (per question):
   - Correctness: 0-5 points
   - Reasoning Quality: 0-5 points
   - Total per question: 0-10

2. CODING SCORING (per question):
   - Correctness: 0-2.5 points
   - Time Complexity: 0-2.5 points
   - Edge Case Handling: 0-2.5 points
   - Code Quality: 0-2.5 points
   - Total per question: 0-10

Return JSON only with this exact structure:
{
  "aptitude_evaluation": [
    {
      "question_id": "string",
      "correctness_score": number (0-5),
      "reasoning_score": number (0-5),
      "total_score": number (0-10),
      "feedback": "string"
    }
  ],
  "coding_evaluation": [
    {
      "question_id": "string",
      "correctness_score": number (0-2.5),
      "time_complexity_score": number (0-2.5),
      "edge_cases_score": number (0-2.5),
      "code_quality_score": number (0-2.5),
      "total_score": number (0-10),
      "feedback": "string"
    }
  ],
  "aptitude_score": number (0-100),
  "coding_score": number (0-100),
  "overall_score": number (0-100),
  "performance_summary": "2-3 sentence summary of performance",
  "strengths_during_test": ["string"],
  "areas_for_improvement": ["string"]
}
`;
  return await getGeminiResponse(prompt, "google/gemini-2.0-flash-exp");
}

/**
 * Step 4: Determine level based on scores
 */
function assignLevel(evaluation) {
  const totalScore = evaluation.overall_score;
  let level, description;

  if (totalScore < 40) {
    level = "Beginner";
    description = "Needs strong foundation building. Focus on core fundamentals and basic problem-solving.";
  } else if (totalScore < 70) {
    level = "Intermediate";
    description = "Ready for mid-tier companies. Needs targeted improvement in specific areas.";
  } else {
    level = "Expert";
    description = "Ready for top-tier companies. Can handle complex technical challenges.";
  }

  return {
    level,
    description,
    score: totalScore,
    aptitude_score: evaluation.aptitude_score,
    coding_score: evaluation.coding_score
  };
}

/**
 * Step 5: Generate personalized 3-phase roadmap
 */
async function generateRoadmap(cvAnalysis, evaluation, levelInfo) {
  const prompt = `
You are a Career Coach and Learning Path Designer. Create a personalized 3-phase roadmap.

CANDIDATE PROFILE:
- Current Level: ${levelInfo.level}
- Overall Score: ${levelInfo.score}/100
- Skill Gaps: ${cvAnalysis.skill_gaps.join(", ")}
- Weakest Skills: ${cvAnalysis.skills_analysis
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 3)
      .map(s => `${s.skill} (${s.rating}/100)`)
      .join(", ")}
- Strengths: ${cvAnalysis.strengths.slice(0, 2).join(", ")}
- Target Role: ${cvAnalysis.target_role_recommendation}

EVALUATION INSIGHTS:
- Test Performance: ${evaluation.performance_summary}
- Areas for Improvement: ${evaluation.areas_for_improvement.join(", ")}

ROADMAP REQUIREMENTS:
Phase 1 (Weeks 1-4): Fix weakest skill gaps
- Focus on 2-3 weakest areas identified
- Specific topics and learning resources
- Daily/weekly targets

Phase 2 (Weeks 5-8): Build real projects + competitive practice
- 2-3 project ideas matching skill level
- LeetCode/HackerRank targets (specific numbers)
- GitHub portfolio building

Phase 3 (Weeks 9-12): Interview prep + company targeting
- Mock interview preparation
- Company-specific preparation
- Resume and LinkedIn optimization

Return JSON only with this exact structure:
{
  "roadmap": [
    {
      "phase": 1,
      "title": "string",
      "duration": "Weeks 1-4",
      "focus_areas": ["string"],
      "tasks": ["string (specific, actionable tasks)"],
      "resources": ["string (course names, book titles, websites)"],
      "success_metrics": ["string (how to measure progress)"]
    },
    {
      "phase": 2,
      "title": "string",
      "duration": "Weeks 5-8",
      "focus_areas": ["string"],
      "tasks": ["string"],
      "resources": ["string"],
      "success_metrics": ["string"]
    },
    {
      "phase": 3,
      "title": "string",
      "duration": "Weeks 9-12",
      "focus_areas": ["string"],
      "tasks": ["string"],
      "resources": ["string"],
      "success_metrics": ["string"]
    }
  ],
  "estimated_improvement": "Expected score improvement after completing roadmap"
}
`;
  return await getGeminiResponse(prompt, "google/gemini-2.0-flash-exp");
}

/**
 * Step 6: Company matching based on level and skills
 */
async function matchCompanies(cvAnalysis, levelInfo, roadmap) {
  const prompt = `
You are a Career Placement Specialist. Match candidate to realistic company targets.

CANDIDATE PROFILE:
- Current Level: ${levelInfo.level}
- Score: ${levelInfo.score}/100
- Key Skills: ${cvAnalysis.skills_analysis
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(s => s.skill)
      .join(", ")}
- Target Role: ${cvAnalysis.target_role_recommendation}
- Experience: ${cvAnalysis.experience.total_months} months

ROADMAP COMPLETION PROJECTION:
- After completing the 12-week roadmap, candidate will have improved skills in: ${roadmap.roadmap
      .flatMap(p => p.focus_areas)
      .slice(0, 4)
      .join(", ")}

COMPANY MATCHING CRITERIA:
1. COMPANIES NOW (realistic targets at current level):
   - Match current skill level and experience
   - Include service companies, startups, mid-sized product companies
   - Focus on companies with realistic hiring bars

2. COMPANIES AFTER ROADMAP (stretch targets after improvement):
   - Include top-tier product companies
   - Include well-funded startups
   - Include companies with higher hiring bars

Return JSON only with this exact structure:
{
  "companies_now": [
    {
      "name": "string",
      "category": "Service|Startup|Mid-size Product|Enterprise",
      "typical_role": "string",
      "match_reason": "string (why they're a good fit now)"
    }
  ],
  "companies_after_roadmap": [
    {
      "name": "string",
      "category": "Top Product|Unicorn|FAANG|High-growth Startup",
      "typical_role": "string",
      "match_reason": "string (why they'll be ready after roadmap)"
    }
  ],
  "immediate_recommendations": ["string (3-5 actionable steps to start applying now)"],
  "long_term_strategy": "string (overall career strategy)"
}
`;
  return await getGeminiResponse(prompt, "google/gemini-2.0-flash-exp");
}

/**
 * Main orchestrator function - runs the complete pipeline
 */
async function runPlacementIntelligencePipeline(candidateData) {
  try {
    console.log("[PIPELINE] Starting Placement Intelligence Engine...");

    // Step 1: Analyze CV
    console.log("[PIPELINE] Step 1/6: Analyzing CV...");
    const cvAnalysis = await analyzeCV(candidateData);

    // Step 2: Generate Assessment
    console.log("[PIPELINE] Step 2/6: Generating adaptive assessment...");
    const assessment = await generateAssessment(cvAnalysis);

    // Return intermediate result for frontend to show test
    return {
      stage: "ASSESSMENT_READY",
      cvAnalysis,
      assessment,
      message: "Assessment generated. Awaiting candidate responses."
    };
  } catch (error) {
    console.error("[PIPELINE ERROR]:", error);
    throw error;
  }
}

/**
 * Complete evaluation pipeline - runs after candidate submits test
 */
async function completeEvaluationPipeline(candidateData, cvAnalysis, assessment, userAnswers) {
  try {
    console.log("[PIPELINE] Starting Evaluation Phase...");

    // Step 3: Evaluate Responses
    console.log("[PIPELINE] Step 3/6: Evaluating responses...");
    const evaluation = await evaluateResponses(assessment, userAnswers, cvAnalysis);

    // Step 4: Assign Level
    console.log("[PIPELINE] Step 4/6: Assigning level...");
    const levelInfo = assignLevel(evaluation);

    // Step 5: Generate Roadmap
    console.log("[PIPELINE] Step 5/6: Generating roadmap...");
    const roadmap = await generateRoadmap(cvAnalysis, evaluation, levelInfo);

    // Step 6: Match Companies
    console.log("[PIPELINE] Step 6/6: Matching companies...");
    const companyMatching = await matchCompanies(cvAnalysis, levelInfo, roadmap);

    // Compile final report
    const finalReport = {
      level: levelInfo.level,
      level_description: levelInfo.description,
      aptitude_score: levelInfo.aptitude_score,
      coding_score: levelInfo.coding_score,
      overall_score: levelInfo.score,
      cv_insights: cvAnalysis.cv_insights,
      skill_gaps: cvAnalysis.skill_gaps,
      skills_analysis: cvAnalysis.skills_analysis,
      roadmap: roadmap.roadmap,
      companies_now: companyMatching.companies_now,
      companies_after_roadmap: companyMatching.companies_after_roadmap,
      performance_summary: evaluation.performance_summary,
      strengths: cvAnalysis.strengths,
      weaknesses: cvAnalysis.weaknesses,
      immediate_recommendations: companyMatching.immediate_recommendations,
      long_term_strategy: companyMatching.long_term_strategy
    };

    console.log("[PIPELINE] Complete! Report generated.");
    return finalReport;
  } catch (error) {
    console.error("[PIPELINE ERROR]:", error);
    throw error;
  }
}

module.exports = {
  analyzeCV,
  generateAssessment,
  evaluateResponses,
  assignLevel,
  generateRoadmap,
  matchCompanies,
  runPlacementIntelligencePipeline,
  completeEvaluationPipeline
};