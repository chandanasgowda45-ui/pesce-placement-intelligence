import { VALID_SUPABASE_FIELDS } from "../src/lib/schemaRegistry";
import { COMPANY_FIELDS } from "../src/agents/phase2-research";

async function main() {
  console.log("=== SCHEMA FIELDS AUDIT ===");
  console.log(`VALID_SUPABASE_FIELDS (schemaRegistry): ${VALID_SUPABASE_FIELDS.size} fields`);
  console.log(`COMPANY_FIELDS (phase2-research): ${COMPANY_FIELDS.length} fields`);

  const registryFields = Array.from(VALID_SUPABASE_FIELDS);
  
  // Find fields in schemaRegistry but not in phase2-research
  const inRegistryButNotAgent = registryFields.filter(f => !COMPANY_FIELDS.includes(f as string));
  console.log(`\nFields in Registry but NOT in Agent (${inRegistryButNotAgent.length}):`);
  inRegistryButNotAgent.forEach(f => console.log(`  - ${f}`));

  // Find fields in agent but not in registry
  const inAgentButNotRegistry = COMPANY_FIELDS.filter(f => !VALID_SUPABASE_FIELDS.has(f as any));
  console.log(`\nFields in Agent but NOT in Registry (${inAgentButNotRegistry.length}):`);
  inAgentButNotRegistry.forEach(f => console.log(`  - ${f}`));
}

main().catch(console.error);
