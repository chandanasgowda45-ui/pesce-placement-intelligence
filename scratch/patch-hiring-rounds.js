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
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Standard hiring rounds templates based on company nature
function getProductBasedRounds(companyName) {
  return [
    {
      round: 1,
      name: "Online Assessment",
      type: "Coding",
      mode: "Online",
      duration: "90-120 minutes",
      skills_focused: ["Data Structures", "Algorithms", "Problem Solving"],
      topics: ["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming"],
      difficulty: "Medium-Hard",
      questions_count: 3,
      sample_questions: ["Optimized search algorithms", "Graph traversal problems", "Dynamic programming challenges"]
    },
    {
      round: 2,
      name: "Technical Interview",
      type: "Technical",
      mode: "Video Call / Onsite",
      duration: "45-60 minutes",
      skills_focused: ["System Design", "Coding", "Problem Solving"],
      topics: ["System Design", "Data Structures", "Algorithms", "Low-Level Design"],
      difficulty: "Hard",
      questions_count: 2,
      sample_questions: ["Design a scalable distributed system", "Implement a data structure with specific constraints"]
    },
    {
      round: 3,
      name: "HR Round",
      type: "Behavioral",
      mode: "Video Call / Onsite",
      duration: "30-45 minutes",
      skills_focused: ["Communication", "Cultural Fit", "Leadership"],
      topics: ["Behavioral Questions", "Situational Judgment", "Company Values"],
      difficulty: "Medium",
      questions_count: 5,
      sample_questions: ["Tell me about a challenging project", "How do you handle conflict in a team?", "Why do you want to work here?"]
    },
    {
      round: 4,
      name: "Managerial Round",
      type: "Managerial",
      mode: "Video Call / Onsite",
      duration: "30-45 minutes",
      skills_focused: ["Leadership", "Strategic Thinking", "Problem Solving"],
      topics: ["Project Management", "Team Dynamics", "Career Goals"],
      difficulty: "Medium",
      questions_count: 4,
      sample_questions: ["Describe a time you led a project", "How do you prioritize tasks?", "Where do you see yourself in 5 years?"]
    }
  ];
}

function getServiceBasedRounds(companyName) {
  return [
    {
      round: 1,
      name: "Online Assessment",
      type: "Aptitude + Coding",
      mode: "Online",
      duration: "60-90 minutes",
      skills_focused: ["Aptitude", "Logical Reasoning", "Basic Coding"],
      topics: ["Quantitative Aptitude", "Verbal Ability", "Coding Fundamentals"],
      difficulty: "Medium",
      questions_count: 30,
      sample_questions: ["Aptitude and reasoning problems", "Basic programming questions", "English comprehension"]
    },
    {
      round: 2,
      name: "Technical Round",
      type: "Technical",
      mode: "Video Call / Onsite",
      duration: "30-45 minutes",
      skills_focused: ["Core CS Fundamentals", "DBMS", "OOP"],
      topics: ["Data Structures", "DBMS", "Operating Systems", "OOP Concepts", "Networking"],
      difficulty: "Medium",
      questions_count: 5,
      sample_questions: ["Explain normalization in DBMS", "Difference between process and thread", "OOP principles with examples"]
    },
    {
      round: 3,
      name: "HR Round",
      type: "Behavioral",
      mode: "Video Call / Onsite",
      duration: "20-30 minutes",
      skills_focused: ["Communication", "Cultural Fit", "Teamwork"],
      topics: ["Self Introduction", "Strengths and Weaknesses", "Company Knowledge"],
      difficulty: "Easy-Medium",
      questions_count: 5,
      sample_questions: ["Tell me about yourself", "Why this company?", "What are your strengths?"]
    },
    {
      round: 4,
      name: "Managerial Round",
      type: "Managerial",
      mode: "Video Call / Onsite",
      duration: "20-30 minutes",
      skills_focused: ["Leadership", "Decision Making", "Adaptability"],
      topics: ["Project Experience", "Situational Questions", "Career Aspirations"],
      difficulty: "Medium",
      questions_count: 4,
      sample_questions: ["Describe a difficult decision you made", "How do you handle pressure?", "What motivates you?"]
    }
  ];
}

async function patchAllHiringRounds() {
  // Step 1: Fetch all companies to know their nature
  console.log("Fetching all companies...");
  const { data: companies, error: compErr } = await supabase
    .from('companies_json')
    .select('company_id, short_json');

  if (compErr) {
    console.error("Error fetching companies:", compErr);
    return;
  }

  console.log(`Found ${companies.length} companies. Patching hiring rounds...`);

  let successCount = 0;
  let failCount = 0;

  for (const company of companies) {
    const companyId = company.company_id;
    const companyName = company.short_json?.name || company.short_json?.short_name || 'Unknown';
    const nature = (company.short_json?.nature_of_company || '').toLowerCase();
    const isServiceBased = nature.includes('service');

    const rounds = isServiceBased
      ? getServiceBasedRounds(companyName)
      : getProductBasedRounds(companyName);

    // Try UPDATE first
    const { data: updated, error: updateErr } = await supabase
      .from('hiring_rounds_json')
      .update({ hiring_rounds_json: rounds })
      .eq('company_id', companyId)
      .select('id');

    if (updateErr) {
      console.error(`  ✗ [${companyId}] ${companyName}: UPDATE failed:`, updateErr.message);
      failCount++;
      continue;
    }

    if (updated && updated.length > 0) {
      console.log(`  ✓ [${companyId}] ${companyName}: Updated (${isServiceBased ? 'Service' : 'Product'}-Based)`);
      successCount++;
    } else {
      // No existing row — try INSERT
      const { error: insertErr } = await supabase
        .from('hiring_rounds_json')
        .insert({ company_id: companyId, hiring_rounds_json: rounds });

      if (insertErr) {
        console.error(`  ✗ [${companyId}] ${companyName}: INSERT failed:`, insertErr.message);
        failCount++;
      } else {
        console.log(`  + [${companyId}] ${companyName}: Inserted (${isServiceBased ? 'Service' : 'Product'}-Based)`);
        successCount++;
      }
    }
  }

  console.log(`\nDone. Success: ${successCount}, Failed: ${failCount}`);

  // Verify a sample
  console.log("\n--- Verification: Google (company_id=4) ---");
  const { data: verify } = await supabase
    .from('hiring_rounds_json')
    .select('hiring_rounds_json')
    .eq('company_id', '4')
    .maybeSingle();

  if (verify) {
    const rounds = verify.hiring_rounds_json;
    if (Array.isArray(rounds)) {
      console.log(`Rounds count: ${rounds.length}`);
      rounds.forEach(r => console.log(`  Round ${r.round}: ${r.name} (${r.type})`));
    } else {
      console.log("Still hollow:", JSON.stringify(rounds).substring(0, 200));
    }
  }
}

patchAllHiringRounds();
