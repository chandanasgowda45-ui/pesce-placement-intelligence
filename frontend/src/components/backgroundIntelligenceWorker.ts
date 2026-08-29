import { createClient } from '@supabase/supabase-js';
import { AIService } from '../services/aiService'; // Wraps Gemini/OpenRouter logic

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const refreshCompanyIntelligence = async () => {
    console.log(`[WORKER] [${new Date().toISOString()}] Initializing Global Intelligence Refresh...`);

    // 1. Get all companies with approved experiences
    const { data: companies } = await supabase.from('companies').select('company_id, name');
    if (!companies || companies.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (const company of companies || []) {
        try {
            // 2. Fetch approved experiences
            const { data: experiences, error: fetchError } = await supabase
                .from('interview_experiences')
                .select('*')
                .eq('company_id', company.company_id)
                .eq('status', 'approved')
                .timeout(10000); // 10s timeout protection

            if (fetchError || !experiences || experiences.length < 3) {
                console.log(`[WORKER] Skipping ${company.name}: Insufficient data (${experiences?.length || 0}/3)`);
                continue;
            }

            // 3. Orchestrate AI with Retry Logic (Exponential Backoff)
            let summary = null;
            let retries = 3;
            while (retries > 0 && !summary) {
                try {
                    summary = await AIService.generatePlacementSummary(company.name, experiences);
                } catch (aiErr) {
                    retries--;
                    if (retries === 0) throw new Error('AI Service max retries exceeded');
                    console.warn(`[WORKER] AI Retry for ${company.name} (${3 - retries}/3)...`);
                    await new Promise(res => setTimeout(res, Math.pow(2, 3 - retries) * 1000));
                }
            }

            if (!summary) continue;

            // 4. Persist to company_interview_intelligence (Phase 4)
            const { error: upsertError } = await supabase.from('company_interview_intelligence').upsert({
                company_id: company.company_id,
                // Storing the new structured schema
                intelligence_json: {
                    technical_focus: Array.isArray(summary.tech_topics) ? summary.tech_topics : [],
                    hr_patterns: Array.isArray(summary.hr_patterns) ? summary.hr_patterns : [],
                    rejection_reasons: Array.isArray(summary.rejection_causes) ? summary.rejection_causes : [],
                    preparation_focus: Array.isArray(summary.focus_advice) ? summary.focus_advice : [],
                    difficulty_level: summary.difficulty || "Moderate"
                },
                ai_summary: summary.ai_summary || "Intelligence report pending additional community submissions.",
                last_ai_update: new Date().toISOString()
            });

            if (upsertError) throw upsertError;

            console.log(`[WORKER] Successfully refreshed intelligence for: ${company.name}`);
            successCount++;
        } catch (error) {
            console.error(`[WORKER] Critical failure for ${company.name}:`, error);
            failCount++;
            // Continue to next company: Isolation Principle
        }
    }
    console.log(`[WORKER] Intelligence Sync Cycle Complete. Success: ${successCount}, Failed: ${failCount}`);
};

// Scheduled to run every 12 hours in production env
// cron.schedule('0 */12 * * *', refreshCompanyIntelligence);