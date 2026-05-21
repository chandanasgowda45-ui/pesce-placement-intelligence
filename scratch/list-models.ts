import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const key = process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("VITE_GEMINI_API_KEY not found in environment variables");
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  console.log(`Fetching available models from: https://generativelanguage.googleapis.com/v1beta/models`);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`HTTP Error ${res.status}:`, errText);
      return;
    }
    const data: any = await res.json();
    console.log("Success! Models found:");
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log(data);
    }
  } catch (err: any) {
    console.error("Network error:", err.message || err);
  }
}

main().catch(console.error);
