import * as dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

dotenv.config();

export type AIProvider = "openai" | "gemini" | "groq" | "openrouter";

/**
 * Get environment variable supporting both Vite (import.meta.env) and Node (process.env)
 */
function getEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

/**
 * Provider availability registry — checks which providers have API keys at runtime.
 */
export function getProviderAvailability(): Record<AIProvider, boolean> {
  return {
    openai:    !!getEnv("VITE_OPENAI_API_KEY"),
    gemini:    !!getEnv("VITE_GEMINI_API_KEY"),
    groq:      !!getEnv("VITE_GROQ_API_KEY"),
    openrouter: !!(getEnv("OPENROUTER_API_KEY") || getEnv("VITE_OPENROUTER_API_KEY")),
  };
}

/**
 * Returns the list of providers that have valid API keys available.
 */
export function getAvailableProviders(): AIProvider[] {
  const availability = getProviderAvailability();
  return (Object.keys(availability) as AIProvider[]).filter(p => availability[p]);
}

/**
 * Returns the best available provider as a fallback.
 * Priority: gemini > openai > groq > openrouter
 */
export function getBestAvailableProvider(): AIProvider | null {
  const priority: AIProvider[] = ["gemini", "openai", "groq", "openrouter"];
  for (const p of priority) {
    if (p === "openrouter") {
      if (getEnv("OPENROUTER_API_KEY") || getEnv("VITE_OPENROUTER_API_KEY")) return p;
    } else if (getEnv(`VITE_${p.toUpperCase()}_API_KEY`)) {
      return p;
    }
  }
  return null;
}

/**
 * Prints a human-readable provider health summary to the console.
 */
export function printProviderHealthReport(): void {
  const availability = getProviderAvailability();
  console.log("\n[PROVIDER HEALTH REPORT]");
  for (const [provider, available] of Object.entries(availability)) {
    if (available) {
      console.log(` [PASS] ${provider} provider active`);
    } else {
      console.warn(` [WARNING] ${provider} provider unavailable (no API key)`);
    }
  }
  const available = getAvailableProviders();
  if (available.length === 0) {
    console.error(" [CRITICAL] No providers available — cannot execute workflow.");
  } else {
    console.log(` [PASS] ${available.length} provider(s) active: ${available.join(", ")}`);
  }
  console.log("");
}

/**
 * Instantiate a provider. Throws only if the requested provider has no key.
 */
export function getProvider(provider: AIProvider): BaseChatModel {
  const key = provider === "openrouter"
    ? (getEnv("OPENROUTER_API_KEY") || getEnv(`VITE_OPENROUTER_API_KEY`))
    : getEnv(`VITE_${provider.toUpperCase()}_API_KEY`);

  if (!key) {
    throw new Error(`[CRITICAL] ${provider.toUpperCase()}_API_KEY not found in environment variables`);
  }

  console.log(`[DEBUG] Initializing ${provider} provider with API key: ***${key.slice(-4)}`);

  try {
    switch (provider) {
      case "openai":
        const openaiModel = new ChatOpenAI({
          modelName: "gpt-4o",
          temperature: 0.1,
          apiKey: key,
        });
        console.log(`[PASS] OpenAI client initialized for model: gpt-4o`);
        return openaiModel;

      case "gemini":
        const geminiModel = new ChatGoogleGenerativeAI({
          model: "gemini-2.5-flash",
          temperature: 0.1,
          apiKey: key,
        });
        console.log(`[PASS] Gemini initialized`);
        console.log(`[PASS] Gemini client initialized for model: gemini-2.5-flash`);
        return geminiModel;

      case "groq":
        const groqModel = new ChatGroq({
          model: "llama-3.1-8b-instant",
          temperature: 0.1,
          apiKey: key,
        });
        console.log(`[PASS] Groq client initialized for model: llama-3.1-8b-instant`);
        return groqModel;

      case "openrouter":
        const openrouterModel = new ChatOpenAI({
          modelName: "meta-llama/llama-3-8b-instruct",
          temperature: 0.1,
          configuration: { baseURL: "https://openrouter.ai/api/v1" },
          apiKey: key,
        });
        console.log(`[PASS] OpenRouter initialized`);
        return openrouterModel;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`[FAIL] Failed to initialize ${provider} provider:`, error);
    throw error;
  }
}

/**
 * Safe provider getter — falls back to best available provider if requested one is unavailable.
 */
export function getSafeProvider(preferredProvider: AIProvider): BaseChatModel {
  const availability = getProviderAvailability();
  if (availability[preferredProvider]) {
    return getProvider(preferredProvider);
  }
  const fallback = getBestAvailableProvider();
  if (!fallback) {
    throw new Error("[CRITICAL] No providers available. Add at least one AI API key to .env");
  }
  console.warn(` [WARNING] ${preferredProvider} unavailable — falling back to ${fallback}`);
  return getProvider(fallback);
}
