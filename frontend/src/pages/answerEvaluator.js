const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateTest(questions, answers, profile) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
        Evaluate a candidate's test performance.
        Context: ${JSON.stringify(profile)}
        Questions: ${JSON.stringify(questions)}
        Answers: ${JSON.stringify(answers)}

        Analyze correctness, logic, and depth.
        Classify level as: Beginner, Low, Medium, High, Excellent.
        Generate a detailed placement readiness report.

        Return JSON only:
        {
            "scores": { "aptitude": number, "technical": number, "overall": number },
            "classification": string,
            "readinessScore": number,
            "rejectionProbability": number,
            "hiringConfidence": number,
            "strengths": string[],
            "weakAreas": string[],
            "missingSkills": string[],
            "companyFit": string,
            "roadmap": string[],
            "weeklySprint": [
                {"week": 1, "focus": string, "tasks": string[]},
                {"week": 2, "focus": string, "tasks": string[]},
                {"week": 3, "focus": string, "tasks": string[]},
                {"week": 4, "focus": string, "tasks": string[]}
            ],
            "suggestedProjects": string[],
            "interviewReadiness": string
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
    } catch (error) {
        console.error(error);
        return { classification: "Medium", readinessScore: 60, roadmap: ["Review DSA"] };
    }
}

module.exports = { evaluateTest };