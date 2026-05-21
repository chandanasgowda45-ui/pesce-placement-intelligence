import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve('.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function searchAll() {
  console.log("Searching companies_json...");
  const { data: companies } = await supabase.from('companies_json').select('*');
  for (const c of companies || []) {
    const str = JSON.stringify(c);
    if (str.toLowerCase().includes("online assessment") || str.toLowerCase().includes("technical round") || str.toLowerCase().includes("managerial round")) {
      console.log(`Found in companies_json for ID=${c.company_id}, Name=${c.short_json?.name}`);
      console.log("Keys in full_json:", Object.keys(c.full_json || {}));
      if (c.full_json?.hiring_rounds) {
        console.log("Hiring rounds in full_json:", JSON.stringify(c.full_json.hiring_rounds, null, 2));
      }
      console.log("-----------------------------------------");
    }
  }

  console.log("Searching hiring_rounds_json...");
  const { data: hiring } = await supabase.from('hiring_rounds_json').select('*');
  for (const h of hiring || []) {
    const str = JSON.stringify(h);
    if (str.toLowerCase().includes("online assessment") || str.toLowerCase().includes("technical round") || str.toLowerCase().includes("managerial round")) {
      console.log(`Found in hiring_rounds_json for ID=${h.company_id}, Name=${h.hiring_rounds_json?.company_name}`);
      console.log(JSON.stringify(h.hiring_rounds_json, null, 2));
      console.log("-----------------------------------------");
    }
  }
}

searchAll();
