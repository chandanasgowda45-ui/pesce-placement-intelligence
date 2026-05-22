# Complete Supabase Integration Guide

## ✅ Step 1: Verify Supabase Credentials

Your frontend is already configured with:
```
VITE_SUPABASE_URL=https://qbkdmeginffcgfofmoav.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_348YLRa87TbBk1bRgLDk1A_QSRx5a-H
```

## ✅ Step 2: Create Database Tables (REQUIRED)

1. Go to: https://app.supabase.com/project/qbkdmeginffcgfofmoav
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `database_setup.sql` from the root folder
5. Paste into the SQL editor
6. Click **Run** to execute all at once
7. Verify success - no errors should appear

**⚠️ IMPORTANT**: If you get any errors about policies already existing, that's fine - the DROP IF EXISTS commands will handle it.

## ✅ Step 3: Populate Sample Data

The `database_setup.sql` file already includes:
- Google company data with full details
- Microsoft company data with full details  
- Amazon company data with full details

These will be inserted when you run the SQL script.

## ✅ Step 4: Verify Data in Supabase

1. Go to **Table Editor** in Supabase
2. You should see 4 new tables:
   - `companies_json` (with Google, Microsoft, Amazon)
   - `innovx_json` (empty, ready for data)
   - `job_role_details_json` (empty, ready for data)
   - `hiring_rounds_json` (empty, ready for data)

## ✅ Step 5: Test Frontend Connection

### Option A: Run in Browser Console
1. Start the dev server: `npm run dev` or `bun dev`
2. Open your app at http://localhost:5173
3. Open DevTools (F12)
4. Go to Console tab
5. Run: `testDatabaseConnection()` (the function is loaded from test-db.js)
6. You should see: ✅ companies_json table accessible, Found 3 companies

### Option B: Check React Query DevTools
1. The app uses React Query for data fetching
2. Open React Query DevTools (bottom right corner)
3. You should see `companies` query with 3 data rows

### Option C: Check Network Tab
1. Open DevTools → Network tab
2. Look for requests to: `qbkdmeginffcgfofmoav.supabase.co/rest/v1/companies_json`
3. Should return status 200 with JSON data

## 🔄 Step 6: Add More Data (Optional)

To add company data to `innovx_json`, `job_role_details_json`, or `hiring_rounds_json`:

### Add InnovX Data
```sql
INSERT INTO innovx_json (company_id, name, json_data) VALUES
  ('google', 'Google InnovX', '{
    "innovation_score": 9.5,
    "ai_initiatives": 15,
    "research_labs": 8,
    "patents_filed": 2500
  }'::jsonb);
```

### Add Hiring Process Data
```sql
INSERT INTO hiring_rounds_json (company_id, hiring_rounds_json) VALUES
  ('google', '[
    {
      "round_name": "Phone Screen",
      "duration_minutes": 45,
      "focus_areas": ["Problem Solving", "Communication"]
    },
    {
      "round_name": "Technical Interview",
      "duration_minutes": 60,
      "focus_areas": ["Coding", "System Design"]
    }
  ]'::jsonb);
```

### Add Job Role Details
```sql
INSERT INTO job_role_details_json (company_id, company_name, job_role_json) VALUES
  ('google', 'Google', '[
    {
      "job_title": "Software Engineer",
      "level": "L3-L5",
      "focus_areas": ["Backend", "Frontend", "Full Stack"],
      "required_skills": ["Problem Solving", "Coding", "Communication"],
      "average_salary_usd": 200000,
      "bonus_percentage": 20
    }
  ]'::jsonb);
```

## 🛠️ Troubleshooting

### Issue: 404 errors for companies_json
**Solution**: Tables haven't been created. Run database_setup.sql in Supabase SQL Editor.

### Issue: 403 Forbidden errors
**Solution**: RLS policies might be incorrect. Go to Supabase → Authentication → Policies and verify "Enable read for all users" exists for all tables.

### Issue: Network shows requests but no data
**Solution**: Check if data was actually inserted. Go to Table Editor and click on each table to see if rows exist.

### Issue: useCompanies hook returns empty array
**Solution**: 
1. Check React Query DevTools for error state
2. Open browser console for error messages
3. Verify database has data using Supabase Table Editor

## 📊 Expected Output After Integration

When you navigate to `/companies` page:
- Should see 3 company cards (Google, Microsoft, Amazon)
- Each card shows company name, logo, category, and brief description
- Clicking on a card should show detailed company information
- Search should work if data is properly populated

## ✨ Frontend Hooks Ready

These hooks are already configured to fetch from Supabase:
- `useCompanies()` - Fetches all companies from `companies_json`
- `useCompany(id)` - Fetches a single company by ID
- `useSearchCompanies(query)` - Searches companies
- Services handle data transformation and validation

## 📝 Next Steps

1. ✅ Run database_setup.sql in Supabase
2. ✅ Verify data appears in Table Editor
3. ✅ Test frontend with `npm run dev`
4. ✅ Check browser console for connection status
5. ✅ Add more company data as needed
6. ✅ Deploy to production when ready

---

**Need Help?**
- Check Supabase Documentation: https://supabase.com/docs
- Review React Query: https://tanstack.com/query/latest
- Check Error Messages in Browser Console (F12 → Console tab)
