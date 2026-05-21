import dotenv from "dotenv";
dotenv.config();

import { Client } from "langsmith";
import { RunnableLambda } from "@langchain/core/runnables";

/**
 * MINIMAL LANGSMITH TRACE TEST
 * Tests LangSmith integration using LangChain tracing
 */
async function testLangSmithTrace() {
  console.log("\n🚀 === MINIMAL LANGSMITH TRACE TEST ===\n");

  // ── STEP 1: Environment Setup ──
  console.log("[1] Setting up LangSmith Environment...");
  process.env.LANGCHAIN_TRACING_V2 = "true";
  process.env.LANGCHAIN_API_KEY = process.env.VITE_LANGCHAIN_API_KEY || process.env.LANGCHAIN_API_KEY;
  process.env.LANGCHAIN_PROJECT = process.env.VITE_LANGCHAIN_PROJECT || process.env.LANGCHAIN_PROJECT || "SRM-Company-Intelligence";

  console.log(`LANGCHAIN_TRACING_V2: ${process.env.LANGCHAIN_TRACING_V2}`);
  console.log(`LANGCHAIN_API_KEY: ${process.env.LANGCHAIN_API_KEY ? "***" + process.env.LANGCHAIN_API_KEY.slice(-4) : "NOT SET"}`);
  console.log(`LANGCHAIN_PROJECT: ${process.env.LANGCHAIN_PROJECT}`);

  if (!process.env.LANGCHAIN_API_KEY) {
    console.error(" [FAIL] LANGCHAIN_API_KEY not found");
    process.exit(1);
  }

  // ── STEP 2: Create Traced Function ──
  console.log("\n[2] Creating Traced Function...");
  const testFunction = RunnableLambda.from(async (input: any) => {
    console.log(" [INFO] Executing test function...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
    return {
      result: "LangSmith tracing test successful",
      input: input,
      timestamp: new Date().toISOString()
    };
  });

  // ── STEP 3: Execute with Tracing ──
  console.log("\n[3] Executing with LangSmith Tracing...");
  try {
    const result = await testFunction.invoke(
      { test: "Hello LangSmith" },
      { runName: "Minimal Trace Test" }
    );

    console.log(" [PASS] Function executed successfully");
    console.log(" [PASS] Result:", result.result);

  } catch (error) {
    console.error(" [FAIL] Function execution failed:", error);
    process.exit(1);
  }

  // ── STEP 4: Force Flush ──
  console.log("\n[4] Forcing Trace Flush...");
  try {
    // Wait for traces to flush
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(" [PASS] Flush delay completed");
  } catch (error) {
    console.error(" [FAIL] Flush failed:", error);
  }

  console.log("\n══════════════════════════════════════════════");
  console.log("   ✅ MINIMAL TRACE TEST COMPLETE");
  console.log("   CHECK DASHBOARD: https://smith.langchain.com/");
  console.log(`   PROJECT: ${process.env.LANGCHAIN_PROJECT}`);
  console.log("   LOOK FOR: 'Minimal Trace Test'");
  console.log("══════════════════════════════════════════════\n");
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLangSmithTrace().catch(console.error);
}

export { testLangSmithTrace };