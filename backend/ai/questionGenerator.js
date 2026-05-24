const { getGeminiResponse } = require('./geminiService');

async function generateQuestions(profile) {
    const prompt = `
        Based on this candidate profile: ${JSON.stringify(profile)}
        Generate an adaptive placement test.
        
        Difficulty Level: ${profile.estimatedReadiness > 70 ? 'High' : 'Medium'}

        Requirements:
        - 3 Aptitude (Logical, Quant, Analytical)
        - 3 Coding (DSA, Arrays, Logic)

        Return JSON only:
        {
            "aptitude": [
                { "id": "a1", "question": "string", "type": "Logical" }
            ],
            "coding": [
                { "id": "c1", "question": "string", "topic": "Arrays" }
            ]
        }
    `;
    return await getGeminiResponse(prompt);
}

module.exports = { generateQuestions };