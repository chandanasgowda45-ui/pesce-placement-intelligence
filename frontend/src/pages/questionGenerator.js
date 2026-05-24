const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateTest(profileAnalysis, skills) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
        Generate an adaptive placement test for a candidate with ${profileAnalysis.estimatedLevel} expertise.
        Focus on these skills: ${skills}.
        
        Requirement:
        - 3 Aptitude Questions (Logical, Quant, Analytical)
        - 3 Coding Questions (DSA, Arrays, Logic)

        Return JSON only:
        {
            "aptitude": [
                {"id": 1, "question": string, "type": "Logical" | "Quant"},
                ...
            ],
            "coding": [
                {"id": 4, "question": string, "topic": string},
                ...
            ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
    } catch (error) {
        return {
            aptitude: [
                { id: 1, question: "If A > B and B > C, is A > C?", type: "Logical" }
            ],
            coding: [
                { id: 4, question: "Write a function to reverse a string.", topic: "Strings" }
            ]
        };
    }
}
module.exports = { generateTest };