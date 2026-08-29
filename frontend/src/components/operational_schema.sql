-- 1. Student Persistence
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 10),
    branch TEXT,
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Analysis History (Persistence for Phase 2)
CREATE TABLE student_analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id),
    company_id UUID REFERENCES companies(company_id),
    recruiter_compatibility INTEGER,
    rejection_risk TEXT,
    domain_alignment INTEGER,
    technical_readiness INTEGER,
    skill_gaps TEXT[],
    strengths TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Resume Intelligence Tracking
CREATE TABLE student_resume_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id),
    extracted_skills TEXT[],
    categorized_skills JSONB,
    parser_confidence INTEGER,
    parser_quality_score INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Real AI Interview Summarization (Phase 4)
CREATE TABLE company_interview_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(company_id) UNIQUE,
    recruiter_behavior_analysis TEXT,
    repeated_technical_expectations TEXT[],
    high_frequency_dsa_themes TEXT[],
    rejection_patterns TEXT,
    preparation_focus TEXT,
    last_ai_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Admin Moderation Layer
ALTER TABLE interview_experiences 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN moderated_by UUID,
ADD COLUMN moderation_notes TEXT;