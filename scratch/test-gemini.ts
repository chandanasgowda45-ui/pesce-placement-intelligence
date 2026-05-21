import * as dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

dotenv.config();

async function testGemini(modelName: string) {
  const key = process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("VITE_GEMINI_API_KEY not found in environment variables");
    return false;
  }
  console.log(`\nTesting Gemini model: ${modelName}`);
  try {
    const geminiModel = new ChatGoogleGenerativeAI({
      model: modelName,
      temperature: 0.1,
      apiKey: key,
    });
    console.log(`[PASS] Initialized wrapper for ${modelName}`);
    
    console.log("Sending simple query...");
    const response = await geminiModel.invoke([
      new HumanMessage("Say hello!")
    ]);
    console.log(`[PASS] Success with ${modelName}:`, response.content);
    return true;
  } catch (err: any) {
    console.error(`[FAIL] Error with ${modelName}:`, err.message || err);
    return false;
  }
}

async function main() {
  const models = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash-lite"];
  for (const model of models) {
    const success = await testGemini(model);
    if (success) {
      console.log(`\n🎉 Model '${model}' works perfectly!`);
      break;
    }
  }
}

main().catch(console.error);
