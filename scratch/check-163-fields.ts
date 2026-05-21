import * as fs from "fs";

function main() {
  const content = fs.readFileSync("database_setup.sql", "utf-8");
  const stagingStart = content.indexOf("CREATE TABLE IF NOT EXISTS staging_company");
  if (stagingStart === -1) {
    console.error("Could not find staging_company table in SQL");
    return;
  }
  const stagingEnd = content.indexOf(");", stagingStart);
  const stagingTableBody = content.substring(stagingStart, stagingEnd);
  
  const rawFields: string[] = [];
  const lines = stagingTableBody.split("\n");
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("staging_id") || trimmed.startsWith("inserted_at") || trimmed.startsWith("processed_at") || trimmed.startsWith("processing_status") || trimmed.startsWith("error_message")) {
      return; // metadata columns
    }
    const match = trimmed.match(/^(\w+)\s+TEXT/i) || trimmed.match(/^(\w+)\s+INT/i);
    if (match) {
      rawFields.push(match[1]);
    }
  });

  console.log(`Found ${rawFields.length} data fields in staging_company:`);
  console.log(JSON.stringify(rawFields, null, 2));
}

main();
