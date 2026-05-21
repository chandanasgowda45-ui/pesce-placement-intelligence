import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "";
const key = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(url, key);

async function main() {
  console.log("=== INSPECTING DATABASE FIELDS ===");
  
  // 1. Fetch one company record
  const { data: companies, error } = await supabase
    .from("companies_json")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching company:", error);
    return;
  }

  if (!companies || companies.length === 0) {
    console.log("No companies found in companies_json!");
    return;
  }

  const company = companies[0];
  console.log("\nTop-level fields on row:");
  const topLevel = Object.keys(company);
  topLevel.forEach(k => console.log(`  - ${k}`));

  console.log(`\nshort_json present: ${!!company.short_json}`);
  let shortKeys: string[] = [];
  if (company.short_json) {
    shortKeys = Object.keys(company.short_json);
    console.log(`short_json has ${shortKeys.length} fields:`);
    shortKeys.sort().forEach(k => console.log(`  - ${k}`));
  }

  console.log(`\nfull_json present: ${!!company.full_json}`);
  let fullKeys: string[] = [];
  if (company.full_json) {
    fullKeys = Object.keys(company.full_json);
    console.log(`full_json has ${fullKeys.length} fields:`);
    fullKeys.sort().forEach(k => console.log(`  - ${k}`));
  }

  // Combine all keys
  const allKeys = new Set<string>();
  topLevel.forEach(k => {
    if (k !== "short_json" && k !== "full_json") {
      allKeys.add(k);
    }
  });
  shortKeys.forEach(k => allKeys.add(k));
  fullKeys.forEach(k => allKeys.add(k));
  
  // Add relational fields
  allKeys.add("innovx");
  allKeys.add("hiring_rounds");
  allKeys.add("job_roles");

  console.log(`\nTotal unique fields in row + short_json + full_json + relational: ${allKeys.size}`);
  console.log("Keys in alphabetical order:");
  Array.from(allKeys).sort().forEach(k => console.log(`  - ${k}`));
}

main().catch(console.error);
