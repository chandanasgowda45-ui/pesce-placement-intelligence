/**
 * Production-grade data normalization utilities to ensure consistent payloads.
 */

export type HiringStage = "Hiring Open" | "OA Round Active" | "Technical Interview Stage" | "HR Round" | "Offer Released" | "Hiring Closed";

const DEFAULT_TIMELINE = {
    current_stage: "Hiring Open" as HiringStage,
    stage_status: "Active",
    start_date: new Date().toISOString(),
    expected_end_date: null,
    active_roles: ["SDE-1", "Data Analyst"]
};

const safeParse = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return null; }
    }
    return val;
};

export const normalizeCompany = (data: any) => ({
    id: data?.id?.toString() || Math.random().toString(36).substr(2, 9),
    company_id: (data?.company_id || data?.id)?.toString() || '0',
    name: data?.name || 'Unknown Company',
    logo_url: data?.logo_url || '/fallback-company.png',
    industry: data?.industry || data?.category || 'Technology',
    overview: data?.overview || data?.description || '',
    location: data?.location || 'Not Specified',
    metadata: safeParse(data?.metadata) || {}
});

export const normalizeHiring = (rounds: any[]) => {
    const list = Array.isArray(rounds) ? rounds : [];
    return list
        .filter(r => r !== null && typeof r === 'object')
        .sort((a, b) => (Number(a?.order_index) || 0) - (Number(b?.order_index) || 0))
        .map(r => ({
            round_name: r.round_name || r.name || 'Standard Round',
            details: safeParse(r.details) || {},
            duration: r.duration || '60 mins',
            order: r.order_index || 0
        }));
};

export const normalizeInnovx = (data: any) => {
    // Safely handle nested "data" wrapper often found in Supabase payloads
    const raw = data?.data ?? data;
    const payload = safeParse(raw) || {};
    return {
        innovation_score: payload.innovation_score || 0,
        tech_stack: Array.isArray(payload.tech_stack) ? payload.tech_stack : [],
        intelligence: payload.intelligence || payload.overview || 'No intelligence data available.',
        market_position: payload.market_position || 'N/A'
    };
};

export const normalizeInterviewIntelligence = (data: any) => {
    const payload = safeParse(data) || {};
    return {
        technical_focus: Array.isArray(payload.technical_focus) ? payload.technical_focus : [],
        hr_patterns: Array.isArray(payload.hr_patterns) ? payload.hr_patterns : [],
        rejection_reasons: Array.isArray(payload.rejection_reasons) ? payload.rejection_reasons : [],
        preparation_focus: Array.isArray(payload.preparation_focus) ? payload.preparation_focus : [],
        high_frequency_topics: Array.isArray(payload.high_frequency_topics) ? payload.high_frequency_topics : [],
        difficulty_level: payload.difficulty_level || "Moderate",
        recruiter_behavior: payload.recruiter_behavior || "Standard behavioral evaluation.",
        ai_summary: payload.ai_summary || "Insufficient data for detailed AI analysis."
    };
};

export const normalizeSkills = (skillsData: any[]) => {
    if (!Array.isArray(skillsData)) return [];
    return skillsData.map(s => ({
        role: s.role_name || 'Generalist',
        required_skills: Array.isArray(s.skills) ? s.skills : (safeParse(s.skills) || [])
    }));
};

export const normalizeTimeline = (company: any) => {
    // Recursive safety for company payloads
    if (!company) return { ...DEFAULT_TIMELINE, timeline_events: [] };

    const rawMeta = company?.metadata ?? company?.full_json?.metadata;
    const metadata = safeParse(rawMeta) || {};

    const currentStage = (company?.current_stage || metadata.current_stage || DEFAULT_TIMELINE.current_stage) as HiringStage;
    return {
        current_stage: currentStage,
        stage_status: company?.stage_status || metadata.stage_status || DEFAULT_TIMELINE.stage_status,
        start_date: company?.start_date || company?.created_at || DEFAULT_TIMELINE.start_date,
        expected_end_date: company?.expected_end_date || null,
        hiring_velocity: company?.hiring_velocity || metadata.hiring_velocity || "Standard",
        urgency: company?.urgency || metadata.urgency || "Normal",
        active_roles: Array.isArray(company?.job_roles) ? company.job_roles : DEFAULT_TIMELINE.active_roles,
        timeline_events: metadata.timeline_events || []
    };
};

export const createUnifiedCompanyRecord = (company: any, hiring: any[], innovx: any, skills: any[]) => {
    return {
        company: normalizeCompany(company),
        hiringRounds: normalizeHiring(hiring),
        innovx: normalizeInnovx(innovx),
        skills: normalizeSkills(skills),
        timeline: normalizeTimeline(company),
        analytics: {
            is_complete: !!(company && hiring?.length),
            score: (innovx?.innovation_score || 0)
        },
        metadata: {
            timestamp: new Date().toISOString(),
            source: 'supabase_unified_pipeline'
        }
    };
};