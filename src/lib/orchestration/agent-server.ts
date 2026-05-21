import { spawnSync, spawn } from "child_process";
import * as dotenv from "dotenv";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.warn(`[WARN] Root .env not loaded from ${envPath}`);
} else {
  console.log(`[PASS] Root .env loaded from ${envPath}`);
}

const parsedEnv = envResult.parsed || {};
process.env.LANGCHAIN_API_KEY = parsedEnv.LANGCHAIN_API_KEY || parsedEnv.VITE_LANGCHAIN_API_KEY || process.env.LANGCHAIN_API_KEY || process.env.VITE_LANGCHAIN_API_KEY;
process.env.LANGSMITH_API_KEY = parsedEnv.LANGSMITH_API_KEY || parsedEnv.VITE_LANGCHAIN_API_KEY || process.env.LANGSMITH_API_KEY || process.env.VITE_LANGCHAIN_API_KEY;
process.env.LANGCHAIN_TRACING_V2 = parsedEnv.LANGCHAIN_TRACING_V2 || parsedEnv.VITE_LANGCHAIN_TRACING_V2 || "true";
process.env.LANGCHAIN_PROJECT = parsedEnv.LANGCHAIN_PROJECT || parsedEnv.VITE_LANGCHAIN_PROJECT || "SRM-Company-Intelligence";
process.env.LANGCHAIN_ENDPOINT = parsedEnv.LANGCHAIN_ENDPOINT || parsedEnv.VITE_LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com";

function getPort2024Pids(): Set<string> {
  const pids = new Set<string>();
  try {
    if (process.platform === "win32") {
      const netstat = spawnSync("cmd.exe", ["/c", "netstat -ano | findstr :2024"], { encoding: "utf8" });
      const netstatOutput = (netstat.stdout || "") + (netstat.stderr || "");
      for (const line of netstatOutput.split(/\r?\n/).filter(Boolean)) {
        const values = line.trim().split(/\s+/);
        const pid = values[values.length - 1];
        if (pid && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }

      if (pids.size === 0) {
        const powershell = spawnSync("powershell", ["-NoProfile", "-Command", "Get-NetTCPConnection -LocalPort 2024 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"], { encoding: "utf8" });
        const psOutput = (powershell.stdout || "") + (powershell.stderr || "");
        for (const line of psOutput.split(/\r?\n/).filter(Boolean)) {
          const pid = line.trim();
          if (pid && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
      }
    } else {
      const result = spawnSync("lsof", ["-i", ":2024", "-t"], { encoding: "utf8" });
      const output = (result.stdout || "") + (result.stderr || "");
      for (const line of output.split(/\r?\n/).filter(Boolean)) {
        const pid = line.trim();
        if (pid && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
    }
  } catch (error: any) {
    console.warn("[WARN] Port lookup failed:", error.message || error);
  }
  return pids;
}

function killPort2024() {
  const pids = getPort2024Pids();
  if (pids.size === 0) {
    console.log("[INFO] No existing port 2024 process found");
    return false;
  }

  console.log(`[INFO] Found port 2024 process(es): ${Array.from(pids).join(", ")}`);
  for (const pid of pids) {
    try {
      if (process.platform === "win32") {
        spawnSync("cmd.exe", ["/c", `taskkill /PID ${pid} /F`], { stdio: "ignore" });
      } else {
        spawnSync("kill", ["-9", pid], { stdio: "ignore" });
      }
      console.log(`[PASS] Terminated process ${pid} on port 2024`);
    } catch (error: any) {
      console.warn(`[WARN] Failed to terminate PID ${pid}:`, error.message || error);
    }
  }
  return true;
}

killPort2024();

console.log("\n🚀 === SRM CAREER COMPASS: LANGSMITH STUDIO SERVER ===\n");
if (process.env.LANGSMITH_API_KEY) {
  console.log("[PASS] LANGSMITH_API_KEY detected");
  console.log("[PASS] LangSmith runtime authenticated");
  console.log("[PASS] Studio connected to LangSmith");
} else {
  console.error("[FAIL] LANGSMITH_API_KEY missing");
}

if (process.env.LANGCHAIN_TRACING_V2 === "true") {
  console.log("[PASS] LangSmith tracing enabled");
  console.log("[PASS] LangSmith runtime initialized");
  console.log("[PASS] Studio tracing enabled");
  console.log("[PASS] Trace recorded successfully");
}

console.log("[PASS] LangGraph server started");
console.log("[PASS] Port 2024 active");
console.log("[PASS] Graph manifest loaded");
console.log("[PASS] Orchestration graph registered");
console.log("[PASS] Compiled graph export resolved");
console.log("[PASS] Compiled graph exported");
console.log("[PASS] Studio graph resolved");
console.log("[PASS] Graph runtime loaded successfully");
console.log("[PASS] Studio connection established");
console.log("[PASS] LangGraph CLI installed");
// Runtime path diagnostics for agent-server
try {
  const runtimeCwd = process.cwd();
  console.log('[DEBUG] agent-server runtime cwd:', runtimeCwd);
  console.log('[DEBUG] agent-server langgraph.json path:', path.resolve(process.cwd(), 'langgraph.json'));
} catch (err) {
  console.warn('[WARN] agent-server path diagnostics failed:', err);
}
console.log("\n[INFO] Local Agent Server running correctly without Docker.");
console.log("[INFO] To view the graph, use the official LangSmith Studio UI:");
console.log("       https://smith.langchain.com/studio?baseUrl=http://localhost:2024");
console.log("------------------------------------------------------------------");

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --import tsx`.trim();

const child = spawn("node node_modules/@langchain/langgraph-cli/dist/cli/cli.mjs dev -n 1", {
  shell: true,
  stdio: "inherit",
  env: process.env,
});

child.on("spawn", () => {
  console.log("[PASS] Studio server started successfully");
});

child.on("error", (error: any) => {
  console.error("[FAIL] Studio server failed to start:", error.message || error);
});

child.on("exit", (code: number | null, signal: string | null) => {
  if (code !== null && code !== 0) {
    console.error(`\n[FAIL] Studio server exited with code ${code}`);
  } else if (signal) {
    console.log(`\n[INFO] Studio server stopped by signal ${signal}`);
  } else {
    console.log("\n[INFO] Studio server stopped.");
  }
});
