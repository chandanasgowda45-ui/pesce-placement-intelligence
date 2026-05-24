const { getGeminiResponse } = require('./geminiService');

async function evaluateAnswers(questions, answers, profile) {
    const prompt = `
        Evaluate the candidate's responses.
        Profile: ${JSON.stringify(profile)}
        Questions: ${JSON.stringify(questions)}
        Answers: ${JSON.stringify(answers)}

        Analyze: Correctness, Code Logic, Communication Clarity, Depth.

        Return JSON only:
        {
            "aptitudeScore": number,
            "codingScore": number,
            "reasoningRating": number,
            "evalSummary": "string",
            "critique": {
                "aptitude": "string",
                "coding": "string"
            }
        }
    `;
    return await getGeminiResponse(prompt);
}

module.exports = { evaluateAnswers };