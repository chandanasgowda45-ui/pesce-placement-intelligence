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

async function findGoogleRounds() {
  console.log("Searching for company_id = '4' in hiring_rounds_json...");
  const { data, error } = await supabase.from('hiring_rounds_json').select('*').eq('company_id', '4');
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("Found records count:", data.length);
  console.log(JSON.stringify(data, null, 2));
}

findGoogleRounds();
