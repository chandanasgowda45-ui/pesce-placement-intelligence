import { pathToFileURL } from 'node:url';
import path from 'node:path';

async function inspect() {
  const sourceFile = path.resolve(process.cwd(), 'src/lib/orchestration/studio-graph.ts');
  console.log('[INSPECT] process.cwd()', process.cwd());
  console.log('[INSPECT] resolving', sourceFile);
  try {
    const mod = await import(pathToFileURL(sourceFile).toString());
    console.log('[INSPECT] imported module keys:', Object.keys(mod));
    console.log('[INSPECT] module.default keys:', mod.default ? Object.keys(mod.default) : 'no default');
  } catch (err) {
    console.error('[INSPECT] import failed:', err);
  }
}

inspect();