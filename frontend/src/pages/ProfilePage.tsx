import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState(profile?.skills?.join(', ') || "");

    const handleSave = async () => {
        setLoading(true);
        const skillArray = skills.split(',').map(s => s.trim());
        await supabase.from('student_profiles').update({ skills: skillArray }).eq('auth_user_id', user?.id);
        setLoading(false);
        alert("AI Identity Updated");
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto p-8 space-y-8">
                <div className="border-b-4 border-slate-900 pb-4">
                    <h1 className="text-5xl font-black uppercase italic">User <span className="text-primary">Identity</span></h1>
                </div>

                <div className="space-y-6 bg-slate-50 p-8 rounded-3xl border-2 border-slate-200">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest">Technical Arsenal (Comma Separated)</label>
                        <Input
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="h-14 border-2 border-slate-900 rounded-xl font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest">LinkedIn URL</label>
                            <Input placeholder="https://..." className="border-2 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest">GitHub URL</label>
                            <Input placeholder="https://..." className="border-2 rounded-xl" />
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={loading} className="w-full py-8 text-xl font-black uppercase italic tracking-tighter">
                        {loading ? "Syncing..." : "Sync AI Identity"}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}