import * as fs from "fs";

function main() {
  const content = fs.readFileSync("src/migrate_companies.ts", "utf-8");
  const start = content.indexOf("const fullJson = {");
  if (start === -1) {
    console.error("Could not find fullJson definition");
    return;
  }
  const end = content.indexOf("};", start);
  const body = content.substring(start, end);
  
  const keys: string[] = [];
  const lines = body.split("\n");
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("...c") || trimmed.startsWith("const fullJson") || !trimmed) {
      return;
    }
    const parts = trimmed.split(":");
    if (parts[0]) {
      keys.push(parts[0].trim());
    }
  });

  console.log(`Found ${keys.length} keys in fullJson inside migrate_companies.ts:`);
  console.log(JSON.stringify(keys, null, 2));
}

main();
