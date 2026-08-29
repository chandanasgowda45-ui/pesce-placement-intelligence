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
    rejection_reason?: string;
    overall_experience: string;
    selected_or_rejected: 'Selected' | 'Rejected' | 'In-Progress';
    anonymous_option: boolean;
    upvotes: number;
    status: 'pending' | 'approved' | 'flagged';
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
            .insert([{ ...exp, status: 'pending', upvotes: 0 }])
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Admin Moderation: Approve experience to feed the AI Engine.
     */
    static async approveExperience(id: string) {
        const { error } = await supabase
            .from('interview_experiences')
            .update({ status: 'approved' })
            .eq('id', id);
        if (error) throw error;
    }

    static async rejectExperience(id: string) {
        const { error } = await supabase
            .from('interview_experiences')
            .update({ status: 'flagged' })
            .eq('id', id);
        if (error) throw error;
    }

    /**
     * Fetch experiences with filtering.
     */
    static async getExperiences(filters: { company?: string; role?: string } = {}) {
        let query = supabase
            .from('interview_experiences')
            .select('*')
            .eq('status', 'approved') // Only fetch moderated data for insights
            .order('created_at', { ascending: false });

        if (filters.company) query = query.ilike('company_name', `%${filters.company}%`);
        if (filters.role) query = query.ilike('role', `%${filters.role}%`);

        const { data, error } = await query;
        if (error || !data) return [];
        return data as InterviewExperience[];
    }

    static async upvoteExperience(id: string) {
        const { error } = await supabase.rpc('increment_upvotes', { row_id: id });
        if (error) console.error('Upvote failed', error);
    }
}
