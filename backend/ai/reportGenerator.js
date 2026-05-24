const { getGeminiResponse } = require('./geminiService');

async function generateFinalReport(profile, evaluation) {
    const prompt = `
        Generate a Final Placement Intelligence Report.
        Profile: ${JSON.stringify(profile)}
        Evaluation: ${JSON.stringify(evaluation)}

        Return JSON only:
        {
            "level": "Beginner" | "Low" | "Medium" | "High" | "Excellent",
            "rejectionProbability": number,
            "hiringConfidence": number,
            "missingSkills": ["string"],
            "roadmap": ["string"],
            "weeklySprint": [
                { "week": 1, "tasks": ["string"] }
            ],
            "interviewReadiness": "string",
            "recommendedTech": ["string"],
            "suggestedProjects": ["string"]
        }
    `;
    return await getGeminiResponse(prompt, "google/gemini-2.0-flash-exp"); // Use Flash for final report logic (faster, cheaper)
}

module.exports = { generateFinalReport };