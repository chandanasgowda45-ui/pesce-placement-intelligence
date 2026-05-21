import { getAllCompanies } from './services/companyService';
import { supabase } from './lib/supabase';

async function test() {
  console.log("Starting test...");
  try {
    const data = await getAllCompanies();
    console.log("Data length:", data.length);
  } catch (e) {
    console.error("Test failed:", e);
  }
  process.exit(0);
}
test();
