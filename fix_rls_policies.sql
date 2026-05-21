-- Run this in your Supabase SQL Editor to allow the population script to work

-- companies_json
ALTER TABLE companies_json DISABLE ROW LEVEL SECURITY;
-- Or if you want to keep RLS enabled but allow all actions:
-- CREATE POLICY "Allow all for anon" ON companies_json FOR ALL USING (true) WITH CHECK (true);

-- innovx_json
ALTER TABLE innovx_json DISABLE ROW LEVEL SECURITY;

-- job_role_details_json
ALTER TABLE job_role_details_json DISABLE ROW LEVEL SECURITY;

-- hiring_rounds_json
ALTER TABLE hiring_rounds_json DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to anon/authenticated roles (for development)
GRANT ALL ON companies_json TO anon, authenticated;
GRANT ALL ON innovx_json TO anon, authenticated;
GRANT ALL ON job_role_details_json TO anon, authenticated;
GRANT ALL ON hiring_rounds_json TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
