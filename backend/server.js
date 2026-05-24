require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { analyzeProfile } = require('./ai/profileAnalyzer');
const { generateQuestions } = require('./ai/questionGenerator');
const { evaluateAnswers } = require('./ai/answerEvaluator');
const { generateFinalReport } = require('./ai/reportGenerator');
const { askGemini } = require("./ai/geminiService");
const {
    runPlacementIntelligencePipeline,
    completeEvaluationPipeline
} = require('./ai/placementIntelligenceEngine');
const {
    analyzeCandidateRejectionProbability
} = require('./ai/rejectionIntelligenceEngine');
const app = express();


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Backend server is running successfully'
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'Backend API working'
    });
});
app.post("/api/test-ai", async (req, res) => {

    try {

        const {
            name,
            cgpa,
            skills,
            projects,
            resume
        } = req.body;

        const prompt = `
Candidate Name: ${name}
CGPA: ${cgpa}
Skills: ${skills}
Projects: ${projects}
Resume Summary: ${resume}

Analyze this candidate fully.
`;

        const aiResponse = await askGemini(prompt);

        res.json({
            success: true,
            result: aiResponse
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});
app.post('/api/analyze-candidate', async (req, res) => {
    try {
        const { name, cgpa, skills, projects, resume, github, linkedin, leetcode, gfg, aptitude, communication } = req.body;

        const prompt = `
Candidate Profile Analysis Request:
Name: ${name}, CGPA: ${cgpa}, Skills: ${skills}, Projects: ${projects}, Resume Summary: ${resume}
Current Aptitude: ${aptitude}, Communication Rating: ${communication}
External Profiles: GitHub: ${github}, LinkedIn: ${linkedin}, LeetCode: ${leetcode}, GFG: ${gfg}

Perform a comprehensive placement assessment and generate the intelligence report.
        `;

        const aiResponse = await askGemini(prompt);
        // Clean potential markdown formatting from Gemini
        const cleanJson = aiResponse.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);
        const cleaned = aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);

        res.json(parsedData);
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/ai/analyze-profile', async (req, res) => {
    try {
        const analysis = await analyzeProfile(req.body);
        res.json(analysis);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/generate-test', async (req, res) => {
    try {
        const test = await generateQuestions(req.body);
        res.json(test);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/evaluate-test', async (req, res) => {
    try {
        const { questions, answers, profile } = req.body;
        const evalData = await evaluateAnswers(questions, answers, profile);
        res.json(evalData);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/final-report', async (req, res) => {
    try {
        const { profile, evaluation } = req.body;
        const report = await generateFinalReport(profile, evaluation);
        res.json(report);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// Placement Intelligence Engine API Endpoints
// ============================================

/**
 * POST /api/placement-intelligence/analyze
 * Step 1-2: Analyze CV and generate adaptive assessment
 * Returns: cvAnalysis, assessment questions
 */
app.post('/api/placement-intelligence/analyze', async (req, res) => {
    try {
        const candidateData = req.body;

        // Validate required fields
        const requiredFields = ['name', 'cgpa', 'skills', 'projects', 'resumeSummary'];
        for (const field of requiredFields) {
            if (!candidateData[field]) {
                return res.status(400).json({
                    error: `Missing required field: ${field}`
                });
            }
        }

        console.log("[API] Starting Placement Intelligence Pipeline...");
        const result = await runPlacementIntelligencePipeline(candidateData);

        res.json({
            success: true,
            stage: result.stage,
            cvAnalysis: result.cvAnalysis,
            assessment: result.assessment,
            message: result.message
        });
    } catch (error) {
        console.error("[API ERROR] Placement Intelligence Analyze:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/placement-intelligence/evaluate
 * Step 3-6: Evaluate responses, assign level, generate roadmap, match companies
 * Returns: Complete final report
 */
app.post('/api/placement-intelligence/evaluate', async (req, res) => {
    try {
        const { candidateData, cvAnalysis, assessment, userAnswers } = req.body;

        // Validate required fields
        if (!candidateData || !cvAnalysis || !assessment || !userAnswers) {
            return res.status(400).json({
                error: "Missing required fields: candidateData, cvAnalysis, assessment, userAnswers"
            });
        }

        console.log("[API] Starting Evaluation Pipeline...");
        const report = await completeEvaluationPipeline(
            candidateData,
            cvAnalysis,
            assessment,
            userAnswers
        );

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error("[API ERROR] Placement Intelligence Evaluate:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/placement-intelligence/full-pipeline
 * Complete end-to-end pipeline (for testing/demo purposes)
 * Note: This combines analyze + evaluate in one call
 */
app.post('/api/placement-intelligence/full-pipeline', async (req, res) => {
    try {
        const { candidateData, userAnswers } = req.body;

        if (!candidateData) {
            return res.status(400).json({
                error: "Missing required field: candidateData"
            });
        }

        console.log("[API] Starting Full Pipeline...");

        // Step 1-2: Analyze and generate assessment
        const analysisResult = await runPlacementIntelligencePipeline(candidateData);

        // If no user answers provided, return assessment only
        if (!userAnswers) {
            return res.json({
                success: true,
                stage: "ASSESSMENT_READY",
                cvAnalysis: analysisResult.cvAnalysis,
                assessment: analysisResult.assessment,
                message: "Assessment generated. Submit user answers to complete evaluation."
            });
        }

        // Step 3-6: Complete evaluation
        const finalReport = await completeEvaluationPipeline(
            candidateData,
            analysisResult.cvAnalysis,
            analysisResult.assessment,
            userAnswers
        );

        res.json({
            success: true,
            stage: "COMPLETE",
            report: finalReport
        });
    } catch (error) {
        console.error("[API ERROR] Full Pipeline:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/rejection-intelligence/analyze
 * Evaluates candidate profile against company + role expectations
 */
app.post('/api/rejection-intelligence/analyze', async (req, res) => {
    try {
        const { studentProfile, companyData } = req.body;

        if (!studentProfile || !companyData) {
            return res.status(400).json({
                error: "Missing required fields: studentProfile, companyData"
            });
        }

        console.log("[API] Launching Rejection Probability Intelligence Engine...");
        const result = await analyzeCandidateRejectionProbability(studentProfile, companyData);

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error("[API ERROR] Rejection Probability Analyze:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});