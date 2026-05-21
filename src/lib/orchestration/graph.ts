import { logger } from "./logger";
import { StateGraph, START, END } from "@langchain/langgraph";
import path from "path";
import { fileURLToPath } from "url";
import { RunnableLambda } from "@langchain/core/runnables";
import * as state from "./state";
import * as providers from "./providers";
import { validateCompanyRecord } from "./validators";
import { consolidateProviderResults } from "./consolidation";
import { identifyRetryFields, getRetrySummary } from "./retry";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { COMPANY_FIELDS } from "../../agents/phase2-research";
import { findCompanyByName } from "@/lib/companyBackend";
import { saveCompanyReport } from "./persistence";

const { OrchestrationStateAnnotation } = state;
const { getSafeProvider, getAvailableProviders, getBestAvailableProvider } = providers;
type AIProvider = providers.AIProvider;

function formatProviderName(provider: AIProvider): string {
  return provider === "openrouter"
    ? "OpenRouter"
    : provider.charAt(0).toUpperCase() + provider.slice(1);
}

// Runtime path diagnostics
try {
  const runtimeCwd = process.cwd();
} catch (err) {
}

function safeParseProviderResponse(providerName: any, response: any): any {
  if (!response) {
    return {};
  }

  let content = response.content ?? response.output ?? response.output_text ?? response.text;
  if (typeof content === "object" && content !== null) {
    return content;
  }

  if (typeof content !== "string") {
    content = String(content || "{}");
  }

  const cleaned = content.replace(/```json|```/g, "").trim();
  if (!cleaned) return {};

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error(`[FAIL] ${formatProviderName(providerName)} response parse failed:`, parseError);
    return {};
  }
}

function normalizeMetadata(metadata: any) {
  const incoming = metadata || {};
  const steps = Array.isArray(incoming.steps) ? incoming.steps : [];
  const providersUsed = Array.isArray(incoming.providersUsed) ? incoming.providersUsed : [];
  const retrySummary = Array.isArray(incoming.retrySummary) ? incoming.retrySummary : [];
  const failedProviders = Array.isArray(incoming.failedProviders) ? incoming.failedProviders : [];
  return {
    ...incoming,
    steps,
    providersUsed,
    retrySummary,
    failedProviders,
    retryCount: typeof incoming.retryCount === "number" ? incoming.retryCount : 0,
    startTime: incoming.startTime || new Date().toISOString()
  };
}

// ── 1. ENTRY NODE ──
async function entryNode(state: any, config?: any) {
  const runId = config?.run_id || Math.random().toString(36).substring(7);
  logger.info("Workflow started: Normalizing request", { 
    runId, 
    stage: "entry", 
    companyName: state.company_name || state.query 
  });

  const companyName =
  state?.company_name ||
  state?.companyName ||
  state?.query;

const country =
  state?.country ||
  "Global";

if (!companyName) {
  logger.error("Request normalization failed: company_name missing", { runId, stage: "entry" });
  throw new Error("company_name is required");
}

const query = companyName;
  
  
  const metadata = normalizeMetadata(state.metadata);
  const safeState: any = {
    ...state,
    query,
    companyName,
    company_name: companyName,
    research_data: state.research_data || {},
    validation_results: state.validation_results || {},
    golden_record: state.golden_record || state.goldenRecord || {},
    failed_parameters: state.failed_parameters || [],
    retry_count: typeof state.retry_count === "number" ? state.retry_count : (state.retryCount || 0),
    metadata: { ...metadata, runId, steps: [...metadata.steps, "entry"] }
  };

  // If a company name was provided, validate against backend companies
  try {
    if (companyName && String(companyName).trim() !== "") {
      const companyRecord = await findCompanyByName(String(companyName));
      if (companyRecord) {
        // Handle country filter
        if (state.country) {
          const fullJson = companyRecord.full_json || {};
          const headquarters = String(fullJson.headquarters_address || '').toLowerCase();
          const operating = String(fullJson.operating_countries || '').toLowerCase();
          const filterCountry = String(state.country).toLowerCase();
          
          if (headquarters.includes(filterCountry) || operating.includes(filterCountry)) {
          }
        }

        safeState.company_id = companyRecord.company_id;
        safeState.company_record = { short: companyRecord.short_json, full: companyRecord.full_json };
        safeState.companyName = companyRecord.name;
        safeState.company_name = companyRecord.name;
        safeState.metadata = { ...safeState.metadata, steps: [...(safeState.metadata.steps || []), 'company_lookup'] };
      } else {
        logger.error(`Company not found in database: ${companyName}`, { runId, stage: "entry" });
        throw new Error(`Company not found in backend: ${companyName}`);
      }
    }
  } catch (err: any) {
    logger.error('Backend company lookup failed', err, { runId, stage: "entry" });
    throw err;
  }
  return safeState;
}

// ── 2. RESEARCH NODE (Factory) — uses safe provider fallback ──
function createResearchNode(providerName: AIProvider) {
  return async (state: any) => {
    const runId = state.metadata?.runId;
    const startTime = logger.startTimer();
    logger.info(`Provider started: ${providerName}`, { runId, stage: "research", provider: providerName });

    let model;
    try {
      model = getSafeProvider(providerName);
    } catch (err) {
      logger.error(`No provider available for ${providerName}`, err, { runId, stage: "research" });
      const metadata = state.metadata ?? { steps: [], providersUsed: [], retrySummary: [], retryCount: 0, startTime: new Date().toISOString() };
      return {
        providerResults: {},
        metadata
      };
    }

    // Provider-specific JSON enforcement
    let systemPrompt: string;
    let responseFormat: any = undefined;
    let jsonMode: boolean = false;

    switch (providerName) {
      case "gemini":
        systemPrompt = `You are an elite corporate research agent. Research the company: ${state.query || "Target Company"}.

CRITICAL: You MUST return ONLY a valid JSON object with exactly these field names as keys: ${COMPANY_FIELDS.join(", ")}.

RESPONSE FORMAT:
{
  "name": "string",
  "industry": "string", 
  "hiring_velocity": "string",
  "salary_range": "string",
  "tech_stack": ["array", "of", "strings"],
  // ... all 163 fields with appropriate types
}

STRICT RULES:
- Return ONLY JSON, no markdown, no code blocks, no explanations
- No conversational text or introductions
- No "Here is the data:" or similar prefixes
- Values must be strings, numbers, arrays, or null
- If unknown, use null (not empty string)
- Arrays should contain strings only`;
        break;

      case "groq":
        systemPrompt = `You are an elite corporate research agent. Research the company: ${state.query || "Target Company"}.

CRITICAL: You MUST return ONLY a valid JSON object with exactly these field names as keys: ${COMPANY_FIELDS.join(", ")}.

RESPONSE FORMAT:
{
  "name": "string",
  "industry": "string",
  "hiring_velocity": "string", 
  "salary_range": "string",
  "tech_stack": ["array", "of", "strings"],
  // ... all 163 fields with appropriate types
}

STRICT RULES:
- Return ONLY JSON, no markdown, no code blocks, no explanations
- No conversational text or introductions  
- No "Here is the data:" or similar prefixes
- Values must be strings, numbers, arrays, or null
- If unknown, use null (not empty string)
- Arrays should contain strings only`;
        jsonMode = true;
        break;

      case "openrouter":
        systemPrompt = `You are an elite corporate research agent. Research the company: ${state.query || "Target Company"}.

CRITICAL: You MUST return ONLY a valid JSON object with exactly these field names as keys: ${COMPANY_FIELDS.join(", ")}.

RESPONSE FORMAT:
{
  "name": "string",
  "industry": "string",
  "hiring_velocity": "string",
  "salary_range": "string", 
  "tech_stack": ["array", "of", "strings"],
  // ... all 163 fields with appropriate types
}

STRICT RULES:
- Return ONLY JSON, no markdown, no code blocks, no explanations
- No conversational text or introductions
- No "Here is the data:" or similar prefixes
- Values must be strings, numbers, arrays, or null
- If unknown, use null (not empty string)
- Arrays should contain strings only

IMPORTANT: Your response must be parseable JSON starting with { and ending with }.`;
        break;

      default:
        systemPrompt = `You are an elite corporate research agent. Research the company: ${state.query || "Target Company"}.
    You MUST generate data for exactly these fields: ${COMPANY_FIELDS.join(", ")}.
    Return ONLY a JSON object where keys are the field names.
    Ensure values match expected types (strings, numbers, URLs, lists).
    DO NOT hallucinate. If unknown, use null.`;
    }

    try {
      const tags = [`provider:${providerName}`, "stage:research"];
      const runMetadata = { provider: providerName, companyName: state.query };
      
      const invokeOptions: any = { 
        tags, 
        metadata: { ...runMetadata, schema: "163-field" }, 
        runName: `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Research Node` 
      };

      // Add provider-specific options
      if (jsonMode) {
        invokeOptions.response_format = { type: "json_object" };
      }
      if (responseFormat) {
        invokeOptions.response_format = responseFormat;
      }

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Generate full 163-field dossier for ${state.query}`)
      ], invokeOptions);

      const duration = logger.getDuration(startTime);
      logger.info(`Provider completed: ${providerName}`, { runId, stage: "research", provider: providerName, duration });

      let data = safeParseProviderResponse(providerName, response);
      
      // Retry once for malformed JSON responses
      if (Object.keys(data).length === 0) {
        logger.warn(`${providerName} returned malformed JSON, attempting retry`, { runId, stage: "research" });
        
        const retryResponse = await model.invoke([
          new SystemMessage(systemPrompt + "\n\nCRITICAL: Previous response was not valid JSON. Return ONLY parseable JSON starting with { and ending with }."),
          new HumanMessage(`Generate full 163-field dossier for ${state.query} - RETRY: Return ONLY JSON`)
        ], invokeOptions);
        
        data = safeParseProviderResponse(providerName, retryResponse);
      }

      const validation = validateCompanyRecord(data);

      const result: any = { provider: providerName, data, validation };

      const metadata = normalizeMetadata(state.metadata);
      return {
        providerResults: { [providerName]: result },
        research_data: { ...(state.research_data || {}), [providerName]: result },
        metadata
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Provider failed: ${providerName}`, error, { runId, stage: "research", provider: providerName });

      const metadata = normalizeMetadata(state.metadata);
      // Return empty result but don't crash orchestration
      return {
        providerResults: {
          [providerName]: {
            provider: providerName,
            data: {},
            validation: { isValid: false, errors: [`Provider execution failed: ${errorMessage}`], validatedFields: [] }
          }
        },
        research_data: { ...(state.research_data || {}), [providerName]: { provider: providerName, data: {}, validation: { isValid: false, errors: [`Provider execution failed: ${errorMessage}`], validatedFields: [] } } },
        metadata
      };
    }
  };
}

// ── 4. CONSOLIDATION NODE ──
async function consolidationNode(state: any) {
  const runId = state.metadata?.runId;
  const { goldenRecord, confidenceScores } = consolidateProviderResults(state.providerResults);

  const metadata = normalizeMetadata(state.metadata);

  // Collect all providers that were actually used (had successful results)
  const allProviders = Object.keys(state.providerResults);
  const providersUsed = allProviders.filter(p => Object.keys(state.providerResults[p].data || {}).length > 0);
  const failedProviders = allProviders.filter(p => Object.keys(state.providerResults[p].data || {}).length === 0);

  const steps = [...metadata.steps, "consolidation"];
  
  logger.info("Consolidation completed", { runId, stage: "consolidation", providersUsed, failedProviders });

  return {
    goldenRecord,
    golden_record: goldenRecord,
    confidenceScores,
    metadata: { ...metadata, steps, providersUsed, failedProviders }
  };
}

// ── 5. FINAL VALIDATION NODE ──
async function finalValidationNode(state: any) {
  const runId = state.metadata?.runId;
  const validation = validateCompanyRecord(state.goldenRecord as any);
  const metadata = normalizeMetadata(state.metadata);
  const steps = [...metadata.steps, "final_validation"];

  logger.info("Validation completed", { runId, stage: "validation", isValid: validation.isValid, errorCount: validation.errors.length });

  return {
    isFinalValidated: validation.isValid,
    finalValidationErrors: validation.errors,
    validation_results: {
      isValid: validation.isValid,
      errors: validation.errors,
      validatedFields: validation.validatedFields,
      hallucinatedFields: validation.hallucinatedFields
    },
    metadata: { ...metadata, steps }
  };
}

// ── 6. RETRY ROUTER ──
function retryRouter(state: any) {
  if (state.isFinalValidated || state.retryCount >= 2) return "output";
  const retryFields = identifyRetryFields(state);
  if (retryFields.length === 0) return "output";
  return "retry";
}

// ── 7. RETRY NODE — uses best available provider ──
async function retryNode(state: any) {
  const runId = state.metadata?.runId;
  logger.info("Retry started", { runId, stage: "retry", retryCount: state.retryCount + 1 });
  const retryFields = identifyRetryFields(state);
  const summary = getRetrySummary(state.retryCount + 1, retryFields);

  try {
    const activeProvider = getBestAvailableProvider() || "openai";
    const model = getSafeProvider("openai");
    const systemPrompt = `You are correcting a company research dossier.
    Focus ONLY on these failed fields: ${retryFields.join(", ")}.
    Context: ${state.query}.
    Provide valid, verified data for these fields in JSON format.`;

    const tags = [`provider:${activeProvider}`, "stage:retry"];
    const runMetadata = { companyName: state.query, retryCount: state.retryCount + 1, provider: activeProvider };
    
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Fix missing/invalid data for ${state.query}`)
    ], { tags, metadata: runMetadata, runName: "Retry Engine" });
    
    let retryData = {};
    try {
      const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      const cleaned = content.replace(/```json|```/g, "").trim();
      retryData = JSON.parse(cleaned);
    } catch (e) {
      retryData = {};
    }

    const updatedRecord = { ...state.goldenRecord, ...retryData };
    const metadata = state.metadata ?? { steps: [], providersUsed: [], retrySummary: [], retryCount: 0, startTime: new Date().toISOString() };

    return {
      goldenRecord: updatedRecord,
      golden_record: updatedRecord,
      retryCount: state.retryCount + 1,
      retry_count: state.retry_count + 1 || state.retryCount + 1,
      failed_parameters: retryFields,
      retrySummary: summary,
      metadata: { ...metadata, steps: [...metadata.steps, `retry_${state.retryCount + 1}`] }
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Retry failed", error, { runId, stage: "retry" });

    const metadata = normalizeMetadata(state.metadata);
    // Return state unchanged but increment retry count to prevent infinite loops
    return {
      goldenRecord: state.goldenRecord,
      golden_record: state.goldenRecord,
      retryCount: state.retryCount + 1,
      retry_count: state.retry_count + 1 || state.retryCount + 1,
      failed_parameters: retryFields,
      retrySummary: [...summary, `Retry ${state.retryCount + 1} failed: ${errorMessage}`],
      metadata: { ...metadata, steps: [...metadata.steps, `retry_${state.retryCount + 1}_failed`] }
    };
  }
}

// ── 8. OUTPUT NODE ──
async function outputNode(state: any) {
  const runId = state.metadata?.runId;
  const metadata = normalizeMetadata(state.metadata);
  const steps = [...metadata.steps, "output"];

  const confScores = state.confidenceScores || {};
  const avgConf = Object.keys(confScores).length > 0 
    ? Object.values(confScores).reduce((a: any, b: any) => a + b, 0) / Object.keys(confScores).length 
    : 0;

  const startTimeMs = new Date(metadata.startTime).getTime();
  const durationMs = new Date().getTime() - startTimeMs;

  logger.info("Workflow completed", { runId, stage: "output", duration: durationMs });

  // Non-blocking persistence trigger
  saveCompanyReport({
    run_id: runId,
    company_name: state.company_name || state.companyName || state.query,
    country: state.country || "Global",
    confidence_score: parseFloat(avgConf.toFixed(2)),
    golden_record: state.golden_record || state.goldenRecord || {}
  }).catch(err => {
    logger.error("Persistence background task failed", err, { runId });
  });

  return {
    company_name: state.company_name || state.companyName || state.query,
    research_data: state.research_data || {},
    validation_results: state.validation_results || {},
    golden_record: state.golden_record || state.goldenRecord || {},
    failed_parameters: state.failed_parameters || [],
    retry_count: typeof state.retry_count === "number" ? state.retry_count : state.retryCount || 0,
    metadata: {
      ...metadata,
      steps,
      endTime: new Date().toISOString(),
      companyName: state.query,
      validationScore: state.isFinalValidated ? 100 : 0,
      confidenceScore: parseFloat(avgConf.toFixed(2)),
      retryCount: state.retryCount,
      schemaValidationStatus: state.isFinalValidated ? "Valid" : "Invalid",
      orchestrationStatus: "Completed",
      providerCount: metadata.providersUsed?.length || 0,
      executionDuration: `${(durationMs / 1000).toFixed(2)}s`
    }
  };
}

// ── BUILD GRAPH DYNAMICALLY based on available providers ──
function buildGraph() {
  const available = getAvailableProviders();
  
  // Determine which provider nodes to include
  const providerNodes: AIProvider[] = (["gemini", "openai", "groq", "openrouter"] as AIProvider[]).filter(
    p => available.includes(p) || available.length === 0 // if none available, include all (will soft-fail at runtime)
  );

  // Fallback: include at least one node so the graph is valid
  const activeNodes = providerNodes.length > 0 ? providerNodes : (["gemini"] as AIProvider[]);

  const graph = new StateGraph(OrchestrationStateAnnotation)
    .addNode("entry", RunnableLambda.from(entryNode).withConfig({ 
      runName: "Entry - Normalize Request",
      tags: ["stage:entry", "critical"],
      metadata: { displayName: "Entry Point", nodeType: "start" }
    }))

  graph
    .addNode("consolidation", RunnableLambda.from(consolidationNode).withConfig({ 
      tags: ["stage:consolidation", "critical"], 
      runName: "Consolidation Engine",
      metadata: { displayName: "Provider Consolidation", nodeType: "merge" }
    }))
    .addNode("validation", RunnableLambda.from(finalValidationNode).withConfig({ 
      tags: ["stage:validation", "critical"], 
      runName: "Validation Engine",
      metadata: { displayName: "Final Validation", nodeType: "decision" }
    }))
    .addNode("retry", RunnableLambda.from(retryNode).withConfig({ 
      tags: ["stage:retry"], 
      runName: "Retry Engine",
      metadata: { displayName: "Retry Recovery", nodeType: "recovery" }
    }))
    .addNode("output", RunnableLambda.from(outputNode).withConfig({ 
      runName: "Output - Generate Golden Record",
      tags: ["stage:output", "critical"],
      metadata: { displayName: "Final Output", nodeType: "end" }
    }));

  // Add provider research nodes with readable names
  for (const provider of activeNodes) {
    const nodeName = `research_${provider}`;
    const providerDisplayName = provider === "openrouter" 
      ? "OpenRouter Research" 
      : `${provider.charAt(0).toUpperCase() + provider.slice(1)} Research`;
    
    const taggedNode = RunnableLambda.from(createResearchNode(provider)) as any;
    const taggedConfigNode = taggedNode.withConfig({ 
      tags: [`provider:${provider}`, "stage:research"], 
      runName: "Research Pipeline",
      metadata: { 
        displayName: providerDisplayName, 
        nodeType: "research",
        provider: provider
      }
    });
    graph.addNode(nodeName, taggedConfigNode);
  }

  graph.addEdge(START, "entry");

  // Fan out to available research nodes
  for (const provider of activeNodes) {
    const nodeName = `research_${provider}`;
    graph.addEdge("entry", nodeName as any);
    graph.addEdge(nodeName as any, "consolidation");
  }

  graph
    .addEdge("consolidation", "validation")
    .addConditionalEdges("validation", retryRouter, {
      retry: "retry",
      output: "output"
    })
    .addEdge("retry", "validation")
    .addEdge("output", END);

  try {
    const compiledGraph = graph.compile();
    return compiledGraph;
  } catch (compileErr) {
    throw compileErr;
  }
}

// ── INITIALIZATION ──
export let companyResearchGraph: any;
export let compiledGraph: any;
export let graph: any;

try {
  const result = buildGraph();
  companyResearchGraph = result;
  compiledGraph = result;
  graph = result;
} catch (err) {
  throw err;
}
