# 🚀 Supabase Integration - Complete Setup Guide

## 📋 Overview

Your SRM Career Compass app is **ready for Supabase integration**. This guide walks you through the complete process.

### Current Status:
- ✅ Frontend configured with Supabase credentials
- ✅ React hooks ready to fetch data
- ✅ Data validation schemas prepared
- ✅ Testing utilities created
- ⏳ Database tables need to be created (in Supabase)
- ⏳ Sample data needs to be inserted

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Run SQL in Supabase (2 min)

1. Go to: **https://app.supabase.com/project/qbkdmeginffcgfofmoav**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open file: `database_setup.sql` (in project root)
5. **Copy entire content** and paste into Supabase editor
6. Click **Run** button
7. ✅ Confirm: No errors appear

### Step 2: Verify Tables Created (1 min)

1. Click **Table Editor** (left sidebar)
2. You should see:
   - `companies_json` (with 3 sample companies)
   - `innovx_json` (empty, ready for data)
   - `job_role_details_json` (empty, ready for data)
   - `hiring_rounds_json` (empty, ready for data)

### Step 3: Test in Frontend (2 min)

```bash
# Start development server
npm run dev
# or
bun dev
```

Then open: **http://localhost:5173**

**Test in browser console (F12):**
```javascript
// Run the integration test
await DatabaseTests.runFullIntegrationTest()

// Or test individual components
await DatabaseTests.testSupabaseConnection()
await DatabaseTests.testDatabaseTables()
await DatabaseTests.testCompaniesData()
```

Expected output:
```
✅ Supabase connection successful
✅ companies_json: Exists
✅ Found 3 companies: google, microsoft, amazon
🎉 All tests passed!
```

---

## 📚 Detailed Setup Process

### Understanding the Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (useCompanies)     │
└──────────┬──────────┘
           │
           │ Supabase Client Library
           │
┌──────────▼──────────────────┐
│  Supabase API                │
│  (qbkdmeginffcgfofmoav)     │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│  PostgreSQL Database         │
│  ┌────────────────────────┐  │
│  │ companies_json table   │  │
│  │ - company_id (TEXT)    │  │
│  │ - short_json (JSONB)   │  │
│  │ - full_json (JSONB)    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ innovx_json table      │  │
│  │ innovx_json table      │  │
│  └────────────────────────┘  │
│  And 2 more tables...        │
└──────────────────────────────┘
```

### Step 1: Create Database Tables

**File:** `database_setup.sql`

The SQL file creates:

```sql
-- Main companies table with JSONB fields
CREATE TABLE companies_json (
  json_id BIGINT PRIMARY KEY,
  company_id TEXT NOT NULL UNIQUE,
  short_json JSONB,  -- Short form company data
  full_json JSONB,   -- Complete company data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Related data tables
CREATE TABLE innovx_json (...)
CREATE TABLE job_role_details_json (...)
CREATE TABLE hiring_rounds_json (...)

-- Enable RLS (Row Level Security) - allow public read access
ALTER TABLE companies_json ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all users" ...
```

**Run in Supabase:**
1. SQL Editor → New Query
2. Paste entire `database_setup.sql`
3. Click Run

### Step 2: Verify Database Setup

The SQL file automatically inserts sample data:

```json
{
  "company_id": "google",
  "short_json": {
    "name": "Google",
    "category": "Marquee",
    "employee_size": "190,000+",
    ...
  },
  "full_json": {
    "name": "Google",
    "history_timeline": "...",
    "focus_sectors": "Search, Advertising, Cloud...",
    ... (163 fields total)
  }
}
```

**Verify in Supabase:**
- Table Editor → companies_json
- Should show 3 rows (Google, Microsoft, Amazon)

### Step 3: Frontend Data Fetching

The frontend uses React Query + Supabase:

```typescript
// Hook definition - src/hooks/useCompanies.ts
export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies_json")
        .select("*");

      if (error) throw error;

      // Parse JSONB fields and merge into flat object
      return (data || []).map((row) => ({
        company_id: row.company_id,
        ...parseCompanyShortJson(row.short_json),
        ...parseCompanyFullJson(row.full_json),
      }));
    },
  });
}

// Usage in component
export function CompaniesPage() {
  const { data: companies = [] } = useCompanies();
  
  return (
    <div>
      {companies.map(company => (
        <CompanyCard key={company.company_id} company={company} />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing & Debugging

### Testing Tools Created

**File:** `src/lib/databaseDebug.ts`

Available functions:

```javascript
// Test Supabase connection
await DatabaseTests.testSupabaseConnection()

// Check all tables exist
await DatabaseTests.testDatabaseTables()

// Check data in companies table
await DatabaseTests.testCompaniesData()

// Run all tests
await DatabaseTests.runFullIntegrationTest()

// Get company count
await DatabaseTests.getCompaniesCount()

// Debug raw API response
await DatabaseTests.debugFetchRawData('companies_json')

// Check network response
await DatabaseTests.debugAPIResponse()
```

### How to Run Tests

1. Start app: `npm run dev`
2. Open browser at http://localhost:5173
3. Press F12 (DevTools)
4. Go to **Console** tab
5. Run: `await DatabaseTests.runFullIntegrationTest()`

Expected output:
```
🚀 Running full integration test...

⏳ Testing: Supabase Connection
   ✅ Supabase Connection passed

⏳ Testing: Database Tables
   companies_json: ✅ Exists
   innovx_json: ✅ Exists
   job_role_details_json: ✅ Exists
   hiring_rounds_json: ✅ Exists
   ✅ Database Tables passed

⏳ Testing: Companies Data
✅ Found 3 companies:
   - google: Google
   - microsoft: Microsoft
   - amazon: Amazon
   ✅ Companies Data passed

🎉 All tests passed! Your Supabase integration is ready.
```

---

## 📤 Adding More Data

### Option 1: Add via Supabase UI

1. Go to Table Editor
2. Click `companies_json` table
3. Click **+ Insert row**
4. Fill in fields:
   - company_id: "netflix"
   - short_json: `{"name": "Netflix", ...}`
   - full_json: `{...full data...}`

### Option 2: Add via Code

```typescript
import { insertCompany } from '@/services/dataLoader';

// In your app component
async function addNetflix() {
  await insertCompany({
    company_id: 'netflix',
    short_json: {
      name: 'Netflix',
      category: 'Tech Giants',
      employee_size: '12,000+',
      // ... other fields
    },
    full_json: {
      // ... 163 fields
    }
  });
}
```

### Option 3: Bulk Insert via SQL

```sql
INSERT INTO companies_json (company_id, short_json, full_json) VALUES
  ('netflix', '{...}'::jsonb, '{...}'::jsonb),
  ('tesla', '{...}'::jsonb, '{...}'::jsonb);
```

---

## 🔍 Troubleshooting

### Problem: 404 Not Found errors

**Symptom:**
```
GET https://qbkdmeginffcgfofmoav.supabase.co/rest/v1/companies_json?select=* 404 (Not Found)
```

**Solution:**
- Run `database_setup.sql` in Supabase SQL Editor
- Verify tables exist in Table Editor

### Problem: No data showing

**Symptom:**
```javascript
await DatabaseTests.testCompaniesData()
// Output: ✅ Found 0 companies
```

**Solution:**
1. Go to Supabase Table Editor
2. Click `companies_json`
3. Verify rows exist
4. If empty, data wasn't inserted with SQL
5. Re-run database_setup.sql

### Problem: CORS errors

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Not applicable - Supabase handles CORS
- Check that VITE_SUPABASE_URL is correct in .env

### Problem: RLS Policy errors

**Symptom:**
```
401 Unauthorized - Row Level Security
```

**Solution:**
1. Go to Supabase Authentication → Policies
2. Verify "Enable read for all users" policy exists
3. Check policy is set to `FOR SELECT USING (true)`

---

## 📊 Data Schema

### companies_json Table

| Field | Type | Description |
|-------|------|-------------|
| json_id | BIGINT | Auto-generated ID |
| company_id | TEXT | Unique identifier (e.g., "google") |
| short_json | JSONB | Brief company info (~30 fields) |
| full_json | JSONB | Complete info (~163 fields) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### short_json Fields
```json
{
  "name": "Google",
  "short_name": "Google",
  "logo_url": "https://...",
  "category": "Marquee",
  "employee_size": "190,000+",
  "focus_sectors": "Search, Advertising, Cloud...",
  ...
}
```

### full_json Fields
```json
{
  "name": "Google",
  "history_timeline": "Founded in 1998...",
  "recent_news": "...",
  "annual_revenue": "$280B+",
  "hiring_velocity": "High",
  "ceo_name": "Sundar Pichai",
  ... (163 total fields)
}
```

---

## 🎨 Frontend Pages

### Companies Page (`/companies`)

Shows list of all companies:
- Uses `useCompanies()` hook
- Displays company cards
- Search functionality
- Pagination (12 items per page)

### Company Detail Page (`/company/:id`)

Shows detailed company info:
- Uses `useCompany(id)` hook
- Displays full JSON data
- Related hiring info
- InnovX data

---

## 📝 Files Reference

| File | Purpose |
|------|---------|
| `database_setup.sql` | SQL to create all tables and insert sample data |
| `SUPABASE_INTEGRATION_COMPLETE.md` | Detailed integration guide |
| `SETUP_VERIFICATION.md` | Setup checklist |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/databaseDebug.ts` | Testing and debugging utilities |
| `src/hooks/useCompanies.ts` | React Query hooks for data fetching |
| `src/services/dataLoader.ts` | Utilities for data insertion |
| `src/services/companyDataService.ts` | Service for fetching full data packages |
| `src/lib/validation.ts` | JSON schema validation |

---

## ✅ Complete Checklist

- [ ] 1. Run `database_setup.sql` in Supabase SQL Editor
- [ ] 2. Verify tables created in Table Editor
- [ ] 3. Confirm sample data inserted (3 companies)
- [ ] 4. Start dev server: `npm run dev`
- [ ] 5. Run integration test in console
- [ ] 6. Navigate to `/companies` page
- [ ] 7. See company cards displaying
- [ ] 8. Click on company to see details
- [ ] 9. Test search functionality
- [ ] 10. All tests passing! 🎉

---

## 🚀 Next Steps

1. **Setup Database:** Run SQL → Verify tables
2. **Start Development:** `npm run dev`
3. **Test Integration:** Run `DatabaseTests.runFullIntegrationTest()`
4. **Add More Data:** Use dataLoader service or Supabase UI
5. **Deploy:** When ready, deploy to production

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **React Query:** https://tanstack.com/query/latest
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Check Browser Console:** F12 → Console tab for errors

---

**Last Updated:** April 23, 2026  
**Status:** ✅ Ready for Setup  
**Next Action:** Run database_setup.sql in Supabase
