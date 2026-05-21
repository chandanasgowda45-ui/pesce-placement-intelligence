import * as fs from "fs";

function main() {
  const filePath = "src/types/company.ts";
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract interface Company {...}
  const match = content.match(/export interface Company \{([\s\S]+?)\}/);
  if (!match) {
    console.error("Could not find interface Company");
    return;
  }

  const lines = match[1].split("\n");
  const keys: string[] = [];
  lines.forEach(line => {
    // Match lines like: key?: or key:
    const keyMatch = line.trim().match(/^([a-zA-Z0-9_]+)\??\s*:/);
    if (keyMatch) {
      keys.push(keyMatch[1]);
    }
  });

  console.log(`=== COMPANY INTERFACE KEYS (${keys.length}) ===`);
  keys.sort().forEach((k, i) => {
    console.log(`${i + 1}. ${k}`);
  });
}

main();
