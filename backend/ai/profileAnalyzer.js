const { getGeminiResponse } = require('./geminiService');

async function analyzeProfile(data) {
    const prompt = `
        You are a Senior Placement Intelligence Officer. Analyze this candidate:
        Name: ${data.name}
        CGPA: ${data.cgpa}
        Skills: ${data.skills}
        Resume: ${data.resumeSummary}
        Projects: ${data.projects}
        URLs: GitHub(${data.githubUrl}), LinkedIn(${data.linkedinUrl}), LeetCode(${data.leetcodeUrl}), GFG(${data.gfgUrl})

        Evaluate their technical depth and placement readiness.
        Return JSON only:
        {
            "summary": "Professional summary...",
            "strengths": ["string"],
            "weaknesses": ["string"],
            "estimatedReadiness": number (0-100),
            "technicalFocus": "string"
        }
    `;
    return await getGeminiResponse(prompt);
}

module.exports = { analyzeProfile };