import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { require } from 'tsx/cjs/api';

const sourceFile = path.resolve(process.cwd(), 'src/lib/orchestration/studio-graph.ts');
console.log('[DEBUG] wrapper loaded');
console.log('[DEBUG] wrapper cwd:', process.cwd());
console.log('[DEBUG] wrapper sourceFile:', sourceFile);

const mod = require(sourceFile);
console.log('[DEBUG] wrapper cjs required module keys:', Object.keys(mod));
console.log('[DEBUG] wrapper cjs required module:', mod);

const graph = mod?.graph;
if (!graph) {
  console.error('[DEBUG] wrapper failed to resolve graph export via cjs require');
  throw new Error('Failed to resolve graph export from studio-graph.ts via cjs require');
}

console.log('[DEBUG] graph export resolved via cjs');
export { graph };