import { supabase } from '../src/lib/supabase';

export interface InterviewExperience {
    id?: string;
    company_name: string;
    role: string;
    interview_round: string;
    difficulty_level: 'Easy' | 'Medium' | 'Hard';
    questions_asked: string[];
    technical_topics: string[];
    HR_questions?: string[];
    tips_for_juniors: string;
    overall_experience: string;
    selected_or_rejected: 'Selected' | 'Rejected' | 'Pending';
    anonymous_option: boolean;
    upvotes: number;
    created_at?: string;
}

/**
 * Service to handle Interview Experience sharing (CRUD).
 */
export class InterviewExperienceService {
    /**
     * Submit a new experience.
     */
    static async submitExperience(exp: Partial<InterviewExperience>) {
        const { data, error } = await supabase
            .from('interview_experiences')
            .insert([exp])
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Fetch experiences with filtering.
     */
    static async getExperiences(filters: { company?: string; role?: string } = {}) {
        let query = supabase
            .from('interview_experiences')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.company) query = query.ilike('company_name', `%${filters.company}%`);
        if (filters.role) query = query.ilike('role', `%${filters.role}%`);

        const { data, error } = await query;
        if (error) return [];
        return data as InterviewExperience[];
    }

    static async upvoteExperience(id: string) {
        const { error } = await supabase.rpc('increment_upvotes', { row_id: id });
        if (error) console.error('Upvote failed', error);
    }
}
