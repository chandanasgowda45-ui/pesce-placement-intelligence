const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeProfile(data) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
        You are an Expert Technical Recruiter. Analyze this candidate profile:
        Name: ${data.name}
        CGPA: ${data.cgpa}
        Skills: ${data.skills}
        Resume: ${data.resumeText}
        Projects: ${data.projects}
        Profiles: GitHub(${data.githubUrl}), LinkedIn(${data.linkedinUrl}), LeetCode(${data.leetcodeUrl})

        Evaluate the profile quality (0-100) and identify "Estimated Technical Depth".
        Return JSON only:
        {
            "qualityScore": number,
            "estimatedLevel": "Beginner" | "Intermediate" | "Advanced",
            "strengths": string[],
            "redFlags": string[],
            "profileSummary": string
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return JSON.parse(response.replace(/```json|```/g, "").trim());
    } catch (error) {
        console.error("Profile Analysis Error:", error);
        return { qualityScore: 50, estimatedLevel: "Intermediate", strengths: ["Data not processed"], redFlags: [], profileSummary: "Analysis failed." };
    }
}

module.exports = { analyzeProfile };