const fs = require('fs');
const path = require('path');
const { generateEmbedding } = require('./embeddingService');
const { findTopMatches } = require('./similaritySearch');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const vectorStorePath = path.join(__dirname, 'vectorStore.json');

async function getInterviewIntelligence(userQuery) {
    // 1. Load Local "Vector DB"
    const rawData = fs.readFileSync(vectorStorePath);
    const db = JSON.parse(rawData);

    // 2. Generate Query Embedding
    const queryVector = await generateEmbedding(userQuery);

    // 3. Retrieve Top Contexts
    const matches = findTopMatches(queryVector, db, 2);
    const context = matches.map(m => `Company: ${m.company}\nRole: ${m.role}\nExperience: ${m.content}`).join("\n\n---\n\n");

    // 4. Augment Gemini Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are the PESCE Placement Intelligence Engine.
        
        USER QUERY: "${userQuery}"
        
        RELEVANT INSTITUTIONAL CONTEXT:
        ${context}
        
        Based on the institutional memory above and your general knowledge, provide:
        1. Preparation Guidance (Strategic)
        2. Top 5 Important Topics
        3. Likely Questions
        4. A 2-week Accelerated Roadmap
        5. AI Confidence Summary
        
        Format the response in structured JSON with these keys: 
        guidance, topics (array), questions (array), roadmap (array), summary.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up markdown code blocks if Gemini wraps the JSON
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();

    return {
        query: userQuery,
        intelligence: JSON.parse(cleanedJson),
        sourceCount: matches.length,
        topMatchScore: matches[0]?.score.toFixed(4)
    };
}

module.exports = { getInterviewIntelligence };