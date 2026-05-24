import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import { CheckCircle2, Target, Zap, MessageSquare } from 'lucide-react';

export default function StudentPlacementTimeline() {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchJourney = async () => {
            if (!user) return;
            const { data: audits } = await supabase.from('student_audits').select('id, company_id, created_at, readiness_level').limit(10);
            const { data: sessions } = await supabase.from('interview_sessions').select('id, company_id, created_at, score').limit(10);

            const combined = [
                ...(audits?.map(a => ({ ...a, type: 'AUDIT', label: `${a.company_id} Audit Completed` })) || []),
                ...(sessions?.map(s => ({ ...s, type: 'INTERVIEW', label: `Mock Interview: ${s.company_id}` })) || [])
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setEvents(combined);
        };
        fetchJourney();
    }, [user]);

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-4xl font-black uppercase italic mb-8">Placement <span className="text-primary">Journey</span></h1>
                <div className="relative border-l-4 border-slate-900 ml-4 space-y-12">
                    {events.length === 0 && <p className="text-slate-400 font-bold uppercase p-4 italic">No intelligence history found yet...</p>}
                    {events.map((event, idx) => (
                        <div key={event.id} className="relative pl-10 group">
                            <div className="absolute -left-[14px] top-1 h-6 w-6 rounded-full bg-slate-900 border-4 border-white group-hover:bg-primary transition-colors" />
                            <div className="bg-white border-2 border-slate-900 p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {new Date(event.created_at).toLocaleDateString()}
                                    </span>
                                    {event.type === 'AUDIT' ? <Zap className="h-4 w-4 text-amber-500" /> : <MessageSquare className="h-4 w-4 text-primary" />}
                                </div>
                                <h3 className="text-xl font-black uppercase leading-tight">{event.label}</h3>
                                <p className="text-xs font-bold text-slate-500 mt-2 italic">
                                    {event.type === 'AUDIT' ? `Readiness: ${event.readiness_level}` : `Score: ${event.score}%`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}