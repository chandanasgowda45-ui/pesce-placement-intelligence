import * as fs from "fs";

function main() {
  const content = fs.readFileSync("database_setup.sql", "utf-8");
  
  // Find all matches for "create table"
  const matches = content.match(/create table\s+(\w+)\s*\(([\s\S]+?)\);/gi);
  if (!matches) {
    console.log("No CREATE TABLE statements found");
    return;
  }

  matches.forEach(m => {
    const tableNameMatch = m.match(/create table\s+(\w+)/i);
    if (!tableNameMatch) return;
    const tableName = tableNameMatch[1];
    
    if (tableName === "companies" || tableName === "companies_json") {
      console.log(`\n=== Table: ${tableName} ===`);
      const body = m.replace(/create table\s+\w+\s*\(/i, "").replace(/\);$/i, "");
      const lines = body.split("\n");
      let colCount = 0;
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("--") && !trimmed.startsWith("constraint") && !trimmed.startsWith("primary key")) {
          const parts = trimmed.split(/\s+/);
          if (parts[0]) {
            console.log(`  ${colCount + 1}. ${parts[0]}`);
            colCount++;
          }
        }
      });
      console.log(`Total columns: ${colCount}`);
    }
  });
}

main();
