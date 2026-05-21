# Supabase Setup Guide

Your frontend is now properly configured and connected to your Supabase project. To complete the setup, follow these steps:

## 1. Verify Supabase Credentials

Your `.env` file is now correctly configured with:
```
VITE_SUPABASE_URL=https://qbkdmeginffcgfofmoav.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_348YLRa87TbBk1bRgLDk1A_QSRx5a-
```

## 2. Create Required Database Tables

You need to create the following tables in your Supabase project:

### Table: `companies_json`
```sql
CREATE TABLE companies_json (
  json_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL UNIQUE,
  short_json JSONB DEFAULT '{}'::jsonb,
  full_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companies_json ENABLE ROW LEVEL SECURITY;

-- Create read policy for all users
CREATE POLICY "Enable read for all users" ON companies_json
  FOR SELECT USING (true);
```

### Table: `innovx_json`
```sql
CREATE TABLE innovx_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies_json(company_id),
  name TEXT,
  json_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE innovx_json ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all users" ON innovx_json
  FOR SELECT USING (true);
```

### Table: `job_role_details_json`
```sql
CREATE TABLE job_role_details_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies_json(company_id),
  company_name TEXT,
  job_role_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE job_role_details_json ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all users" ON job_role_details_json
  FOR SELECT USING (true);
```

### Table: `hiring_rounds_json`
```sql
CREATE TABLE hiring_rounds_json (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id TEXT NOT NULL REFERENCES companies_json(company_id),
  hiring_rounds_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE hiring_rounds_json ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all users" ON hiring_rounds_json
  FOR SELECT USING (true);
```

## 3. Add Sample Data

Insert sample company data into `companies_json`:
```sql
INSERT INTO companies_json (company_id, short_json, full_json) VALUES
  (
    'company_001',
    '{
      "name": "Tech Corp",
      "short_name": "TC",
      "logo_url": "https://example.com/logo.png",
      "category": "Tech Giants",
      "employee_size": "5000+",
      "hiring_velocity": "High",
      "focus_sectors": "Cloud, AI, DevOps"
    }'::jsonb,
    '{
      "name": "Tech Corp",
      "short_name": "TC",
      "category": "Tech Giants",
      "employee_size": "5000+",
      "headquarters_address": "123 Tech St, San Francisco",
      "annual_revenue": "$5B+"
    }'::jsonb
  );
```

## 4. Verify Connection

After setting up your tables:

1. Start your development server:
```bash
npm run dev
```

2. Open browser console (F12) and run:
```javascript
import { debugSupabaseStatus } from './src/lib/supabaseDebug';
debugSupabaseStatus();
```

You should see ✅ indicators confirming the connection is working.

## 5. Common Issues

### Issue: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
- ✅ **FIXED**: Your `.env` file now has the correct variable names

### Issue: "permission denied for schema"
- Add the RLS policies as shown above

### Issue: "relation does not exist"
- Create the tables using the SQL provided above

## 6. Important Notes

- **JSON Fields**: All data must be stored as JSONB in Supabase
- **Schema Validation**: The app validates all JSON against `/schema/*.schema.json`
- **Real-time Updates**: The app subscribes to Supabase changes automatically
- **No Joins**: All data comes from JSON columns only (no table joins)

## Next Steps

1. ✅ Frontend is now configured
2. 📦 Create database tables (see SQL above)
3. 📝 Insert sample company data
4. 🧪 Test connection using `debugSupabaseStatus()`
5. 🚀 Deploy when ready
