import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[DEBUG] studio-graph-wrapper initializing...');
console.log('[DEBUG] wrapper __dirname:', __dirname);
console.log('[DEBUG] wrapper __filename:', __filename);

// Dynamic import with full error diagnostics using absolute path
let graphModule;
const graphPath = path.resolve(__dirname, 'graph.ts');
const graphUrl = pathToFileURL(graphPath).href;
console.log('[DEBUG] resolving graph from URL:', graphUrl);

try {
  // Use dynamic import with file:// URL to load the TypeScript module via tsx/esm loader
  const importedModule = await import(graphUrl);
  graphModule = importedModule;
  console.log('[DEBUG] wrapper dynamic import successful');
  console.log('[DEBUG] wrapper module keys:', Object.keys(graphModule));
  console.log('[DEBUG] wrapper module default:', !!graphModule.default);
} catch (importError) {
  console.error('[ERROR] wrapper dynamic import failed:', importError.message);
  console.error('[ERROR] wrapper import error details:', importError);
  
  // Try relative import as fallback
  console.log('[DEBUG] attempting relative import fallback...');
  try {
    const fallbackModule = await import('./graph.ts');
    graphModule = fallbackModule;
    console.log('[DEBUG] fallback import successful');
    console.log('[DEBUG] fallback module keys:', Object.keys(graphModule));
  } catch (fallbackError) {
    console.error('[ERROR] fallback import also failed:', fallbackError.message);
    throw new Error(`Failed to import graph from either URL ${graphUrl} or relative path ./graph.ts: ${importError.message}`);
  }
}

// Resolve the graph from multiple possible export names
const resolvedGraph = 
  graphModule.companyResearchGraph || 
  graphModule.compiledGraph || 
  graphModule.default?.companyResearchGraph || 
  graphModule.default?.compiledGraph ||
  graphModule.graph;

if (!resolvedGraph) {
  console.error('[ERROR] wrapper failed to resolve graph export');
  console.error('[ERROR] available keys in module:', Object.keys(graphModule));
  if (Object.keys(graphModule).length > 0) {
    console.error('[ERROR] module exports:', Object.keys(graphModule).join(', '));
  } else {
    console.error('[ERROR] module is completely empty - import may have failed silently');
  }
  throw new Error('Failed to resolve graph export from graph.ts - no companyResearchGraph, compiledGraph, or graph found');
}

console.log('[DEBUG] wrapper graph resolved successfully');
console.log('[DEBUG] resolved graph type:', typeof resolvedGraph);
console.log('[DEBUG] resolved graph constructor:', resolvedGraph.constructor?.name);
console.log('[PASS] graph export resolved');
export const graph = resolvedGraph;
