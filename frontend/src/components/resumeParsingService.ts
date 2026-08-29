import { z } from 'zod';

const SKILL_CATEGORIES = {
    frontend: ['react', 'nextjs', 'tailwind', 'vue', 'angular', 'css', 'html', 'typescript'],
    backend: ['nodejs', 'express', 'python', 'django', 'flask', 'golang', 'java', 'spring'],
    cloud: ['aws', 'azure', 'docker', 'kubernetes', 'terraform', 'gcp', 'serverless'],
    dsa: ['algorithms', 'data structures', 'competitive programming', 'leetcode', 'c++'],
    ai_ml: ['pytorch', 'tensorflow', 'scikit-learn', 'nlp', 'llm', 'pandas', 'numpy']
};

export const cleanAndCategorizeSkills = (rawSkills: string[]) => {
    if (!Array.isArray(rawSkills)) return { frontend: [], backend: [], cloud: [], dsa: [], ai_ml: [], other: [] };

    // 1. Cleanup: Lowercase, remove special chars, trim
    const clean = rawSkills
        .filter(s => typeof s === 'string')
        .map(s => s.toLowerCase().replace(/[^a-z0-9+#]/g, '').trim());

    // 2. Remove Duplicates
    const uniqueSkills = Array.from(new Set(clean));

    // 3. Categorization
    const categorized: Record<string, string[]> = {
        frontend: [], backend: [], cloud: [], dsa: [], ai_ml: [], other: []
    };

    uniqueSkills.forEach(skill => {
        let matched = false;
        for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
            if (keywords.includes(skill)) {
                categorized[category].push(skill);
                matched = true;
                break;
            }
        }
        if (!matched) categorized.other.push(skill);
    });

    return categorized;
};

export const calculateParserConfidence = (text: string, skills: string[]) => {
    const safeText = text || "";
    let score = 0;
    if (safeText.length > 500) score += 30; // Length check
    if (Array.isArray(skills) && skills.length > 5) score += 40;  // Content check
    if (/education|university|college/i.test(safeText)) score += 15;
    if (/experience|projects/i.test(safeText)) score += 15;

    return Math.min(score, 100);
};

export const parseEducationFallback = (text: string) => {
    const gpaMatch = text.match(/GPA:?\s*(\d\.\d+)/i);
    const universityMatch = text.match(/(SRM|VIT|IIT|University)\s+[\w\s]+/i);

    return {
        extractedGpa: gpaMatch ? parseFloat(gpaMatch[1]) : null,
        institution: universityMatch ? universityMatch[0] : "Unknown Institution"
    };
};