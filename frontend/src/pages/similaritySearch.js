/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function findTopMatches(queryVector, vectorDB, topK = 3) {
    return vectorDB
        .map(item => ({
            ...item,
            score: cosineSimilarity(queryVector, item.embedding)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

module.exports = { findTopMatches };