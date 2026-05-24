const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a 768-dimension vector for the given text
 */
async function generateEmbedding(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Embedding Generation Failed:", error);
        // Fallback or rethrow
        throw new Error("Could not connect to Gemini Embedding API");
    }
}

module.exports = { generateEmbedding };