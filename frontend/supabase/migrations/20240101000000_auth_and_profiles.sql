-- ============================================================
-- PESCE Placement Intelligence - Authentication & Profile Migration
-- ============================================================
-- Execute this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This migration extends the existing student_profiles table and adds RLS policies.
-- ============================================================

-- 1. Extend student_profiles table with additional fields
-- The existing table from operational_schema.sql is preserved.
-- We add columns that don't already exist.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'email') THEN
    ALTER TABLE student_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'phone') THEN
    ALTER TABLE student_profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'profile_photo') THEN
    ALTER TABLE student_profiles ADD COLUMN profile_photo TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'registration_number') THEN
    ALTER TABLE student_profiles ADD COLUMN registration_number TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'department') THEN
    ALTER TABLE student_profiles ADD COLUMN department TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'year') THEN
    ALTER TABLE student_profiles ADD COLUMN year TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'section') THEN
    ALTER TABLE student_profiles ADD COLUMN section TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'college') THEN
    ALTER TABLE student_profiles ADD COLUMN college TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'skills') THEN
    ALTER TABLE student_profiles ADD COLUMN skills TEXT[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'bio') THEN
    ALTER TABLE student_profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'resume_url') THEN
    ALTER TABLE student_profiles ADD COLUMN resume_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE student_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 2. Ensure the existing id column uses uuid_generate_v4() if not already set
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'id' AND column_default IS NULL) THEN
    ALTER TABLE student_profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();
  END IF;
END $$;

-- 2b. Add unique constraint on auth_user_id to prevent duplicate profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'student_profiles' AND column_name = 'auth_user_id') THEN
    ALTER TABLE student_profiles ADD CONSTRAINT student_profiles_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
END $$;

-- 2c. Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_profiles (auth_user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2d. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. Enable Row Level Security on student_profiles
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Users can delete their own profile (optional - can be removed if not needed)
CREATE POLICY "Users can delete own profile" ON student_profiles
  FOR DELETE USING (auth.uid() = auth_user_id);

-- ============================================================
-- Storage buckets (execute in Supabase Dashboard > Storage)
-- ============================================================
-- Create two private storage buckets:
--   - "avatars"  : for profile photos
--   - "resumes"  : for resume files
--
-- After creating the buckets, run these policies in the Storage section:
--
-- AVATARS bucket policies:
--   INSERT: auth.uid() = owner_id (set via folder path: {user_id}/...)
--   SELECT: auth.uid() = owner_id
--   UPDATE: auth.uid() = owner_id
--   DELETE: auth.uid() = owner_id
--
-- RESUMES bucket policies:
--   INSERT: auth.uid() = owner_id
--   SELECT: auth.uid() = owner_id
--   UPDATE: auth.uid() = owner_id
--   DELETE: auth.uid() = owner_id
--
-- Note: Supabase Storage RLS uses the file path as the owner identifier.
--       Store files at path: {auth.uid()}/{filename}
--       Then use: (storage.foldername().name = auth.uid()::text)
-- ============================================================
