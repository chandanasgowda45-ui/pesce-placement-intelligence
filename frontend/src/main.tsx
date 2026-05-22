import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Export testing utilities for browser console access
import { DatabaseTests } from "./lib/databaseDebug";
import { diagnoseSupabase } from "./lib/supabaseDiagnostic";

if (typeof window !== 'undefined') {
  (window as any).DatabaseTests = DatabaseTests;
  (window as any).SupabaseDiagnostic = { run: diagnoseSupabase };
}

createRoot(document.getElementById("root")!).render(<App />);

