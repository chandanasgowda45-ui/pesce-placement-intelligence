/**
 * AI Service for Placement Intelligence
 * Now using OpenRouter API for access to multiple models (including Gemini 2.0 Flash)
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `
You are an AI placement assessor for a technical hiring portal. Your job is to:

1. ANALYZE CV
   - Extract skills, projects, education, experience
   - Rate each skill from 0–100 based on evidence in the CV
   - Identify gaps for the candidate's target role

2. GENERATE ASSESSMENT
   - Create 3 aptitude questions (logical reasoning, quantitative, pattern recognition)
     suited to the candidate's target role and experience level
   - Create 3 coding questions (Easy/Medium/Hard) based on their skill level:
     * Beginner: arrays, strings, basic loops
     * Intermediate: trees, graphs, DP
     * Expert: system design, advanced algorithms

3. EVALUATE RESPONSES
   - Score aptitude: correctness + reasoning quality (0–10 each)
   - Score coding: correctness, time complexity, edge-case handling, code quality (0–10 each)
   - Save all raw answers + scores to backend as structured JSON

4. LEVEL ASSIGNMENT
   Rules:
   * Total score < 40%  → Beginner (needs strong foundation building)
   * Total score 40–70% → Intermediate (ready for mid-tier, needs targeted improvement)
   * Total score > 70%  → Expert (ready for top-tier companies)

5. GENERATE ROADMAP
   Based on level and identified skill gaps, generate a 3-phase personalized roadmap:
   - Phase 1: Fix weakest skill gaps (specific topics + resources)
   - Phase 2: Build real projects + competitive practice (LeetCode targets, GitHub)
   - Phase 3: Interview prep + company targeting

6. COMPANY MATCHING
   Map the candidate's final level + skills to a list of companies they can realistically
   target now, and companies they can target after completing the roadmap.

Always respond in structured JSON with these fields:
{ 
  "level": "string", 
  "aptitude_score": 0, 
  "coding_score": 0, 
  "overall_score": 0, 
  "cv_insights": "string", 
  "skill_gaps": ["string"], 
  "roadmap": [{ "phase": 0, "title": "string", "tasks": ["string"], "duration": "string" }], 
  "companies_now": ["string"], 
  "companies_after_roadmap": ["string"], 
  "performance_summary": "string" 
}
`;

/**
 * Call OpenRouter API with the given prompt and model
 * @param {string} userPrompt - The user's input prompt
 * @param {string} modelName - The model identifier (e.g., "google/gemini-2.0-flash-exp")
 * @returns {Promise<string>} The AI response text
 */
async function askGemini(userPrompt, modelName = "google/gemini-2.5-flash") {
   try {
      const finalPrompt = `
${SYSTEM_PROMPT}

USER INPUT:
${userPrompt}
`;

      const response = await fetch(OPENROUTER_API_URL, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://srm-career-compass.com', // Optional: Your website URL
            'X-Title': 'SRM Career Compass' // Optional: Your app name
         },
         body: JSON.stringify({
            model: modelName,
            messages: [
               {
                  role: 'user',
                  content: finalPrompt
               }
            ],
            temperature: 0.7,
            max_tokens: 4096
         })
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(`OpenRouter API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

   } catch (error) {
      console.error("OpenRouter API Error:", error);
      throw error;
   }
}

async function askGeminiDirect(systemPrompt, userPrompt, modelName = "google/gemini-2.5-flash") {
   try {
      const finalPrompt = `
${systemPrompt}

USER INPUT:
${userPrompt}
`;

      const response = await fetch(OPENROUTER_API_URL, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://srm-career-compass.com',
            'X-Title': 'SRM Career Compass'
         },
         body: JSON.stringify({
            model: modelName,
            messages: [
               {
                  role: 'user',
                  content: finalPrompt
               }
            ],
            temperature: 0.7,
            max_tokens: 4096
         })
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(`OpenRouter API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

   } catch (error) {
      console.error("OpenRouter API Error (Direct):", error);
      throw error;
   }
}

async function getGeminiResponse(userPrompt, modelName = "google/gemini-2.5-flash") {
   return askGemini(userPrompt, modelName);
}

module.exports = { askGemini, getGeminiResponse, askGeminiDirect };