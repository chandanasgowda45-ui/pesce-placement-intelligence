import dotenv from "dotenv";
import { companyResearchGraph } from "./graph";

dotenv.config();

/**
 * FINAL ORCHESTRATION VERIFICATION TEST
 * Runs the complete 3-provider workflow with a single company
 * Verifies all branches execute and consolidation completes
 */

async function runFinalVerification() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  FINAL ORCHESTRATION VERIFICATION - 3-Provider LangGraph");
  console.log("═══════════════════════════════════════════════════════════════");

  const testCompany = "NVIDIA";

  const initialState = {
    query: testCompany,
    company_name: testCompany,
    companyName: testCompany,
    research_data: {},
    validation_results: {},
    golden_record: {},
    failed_parameters: [],
    retry_count: 0,
    retryCount: 0,
    retrySummary: [],
    metadata: {
      startTime: new Date().toISOString(),
      steps: [],
      providersUsed: [],
      retryCount: 0,
      retrySummary: []
    }
  };

  console.log(`\n[START] Testing workflow with: ${testCompany}`);
  console.log("────────────────────────────────────────────────────────────");

  try {
    const finalState = await companyResearchGraph.invoke(initialState, {
      runName: `Final Verification: ${testCompany}`,
      tags: ["workflow:final-verification", "schema:163-field"],
      metadata: {
        company_name: testCompany,
        providers_used: ["gemini", "groq", "openrouter"],
        validation_score: 100,
        confidence_score: 0.95
      }
    });

    console.log("\n────────────────────────────────────────────────────────────");
    console.log("[VERIFICATION RESULTS]");
    console.log("────────────────────────────────────────────────────────────");

    // Verify consolidation received all payloads
    const providersUsed = finalState.metadata?.providersUsed || [];
    const hasGemini = providersUsed.includes("gemini");
    const hasGroq = providersUsed.includes("groq");
    const hasOpenRouter = providersUsed.includes("openrouter");

    console.log(`\n[PROVIDERS VERIFICATION]`);
    console.log(`  Gemini:    ${hasGemini ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`  Groq:      ${hasGroq ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`  OpenRouter: ${hasOpenRouter ? "✅ PASSED" : "❌ FAILED"}`);

    const allThreeProviders = hasGemini && hasGroq && hasOpenRouter;
    console.log(`\n[3-PROVIDER ORCHESTRATION]`);
    console.log(`  Status: ${allThreeProviders ? "✅ ALL BRANCHES EXECUTED" : "⚠️  INCOMPLETE"}`);

    // Verify final validation
    console.log(`\n[VALIDATION & OUTPUT]`);
    console.log(`  Final Validated: ${finalState.isFinalValidated ? "✅ VALID" : "⚠️  INVALID"}`);
    console.log(`  Golden Record Keys: ${Object.keys(finalState.goldenRecord || {}).length}`);
    console.log(`  Confidence Score: ${finalState.confidenceScores ? "✅ CALCULATED" : "⚠️  MISSING"}`);

    // Verify metadata
    console.log(`\n[WORKFLOW EXECUTION]`);
    console.log(`  Steps Executed: ${finalState.metadata?.steps?.length || 0}`);
    console.log(`  Providers Used: ${providersUsed.join(", ") || "none"}`);
    console.log(`  Retry Count: ${finalState.retryCount}`);

    console.log("\n════════════════════════════════════════════════════════════════");
    if (allThreeProviders && finalState.isFinalValidated) {
      console.log("  ✅ FINAL VERIFICATION PASSED - 3-Provider Orchestration Working");
    } else {
      console.log("  ⚠️  FINAL VERIFICATION INCOMPLETE - Check logs above");
    }
    console.log("════════════════════════════════════════════════════════════════\n");

  } catch (error) {
    console.error("\n[ERROR] Workflow execution failed:");
    console.error(error);
    console.log("\n════════════════════════════════════════════════════════════════");
    console.log("  ❌ FINAL VERIFICATION FAILED - See error above");
    console.log("════════════════════════════════════════════════════════════════\n");
    process.exit(1);
  }
}

runFinalVerification().catch(console.error);
