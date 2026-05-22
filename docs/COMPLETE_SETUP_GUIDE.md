# 🚀 Complete Supabase Integration - Full Setup Guide

## ❌ Current Issue: 404 Errors

Your app is showing:
```
GET https://qbkdmeginffcgfofmoav.supabase.co/rest/v1/companies_json?select=* 404 (Not Found)
```

**Why?** The database tables haven't been created in Supabase yet.

**Solution:** Follow the 3 steps below (takes 5 minutes)

---

## 🔥 STEP 1: Create Database Tables (2 minutes)

### 1a. Open Supabase Dashboard
```
Go to: https://app.supabase.com/project/qbkdmeginffcgfofmoav/
```

You'll see the Supabase dashboard with a sidebar on the left.

### 1b. Open SQL Editor

In the LEFT SIDEBAR, click **SQL Editor**:
```
Dashboard
Editor
SQL Editor    ← CLICK HERE
Table Editor
Auth
```

### 1c. Create New Query

In the top right, click **+ New Query** (blue button)

### 1d. Copy the SQL Script

In your project, open: `database_setup.sql`

**Select ALL** content (Ctrl+A)
**Copy** (Ctrl+C)

The file contains this structure:
```sql
-- Create companies_json table
CREATE TABLE IF NOT EXISTS companies_json (...)

-- Create innovx_json table
CREATE TABLE IF NOT EXISTS innovx_json (...)

-- Create job_role_details_json table
CREATE TABLE IF NOT EXISTS job_role_details_json (...)

-- Create hiring_rounds_json table
CREATE TABLE IF NOT EXISTS hiring_rounds_json (...)

-- Insert sample data
INSERT INTO companies_json (company_id, short_json, full_json) VALUES
  ('google', {...}, {...}),
  ('microsoft', {...}, {...}),
  ('amazon', {...}, {...});
```

### 1e. Paste into Supabase

In the Supabase SQL Editor, **PASTE** (Ctrl+V) the entire script

You should see SQL code filling the editor.

### 1f. Run the Script

Click the **▶ Run** button (top right, blue button)

**Wait for completion...**

### Expected Result:
```
✅ 1 query executed successfully
```

Or if you see messages about "policy already exists", that's OK - just ignore them.

---

## ✅ STEP 2: Verify Tables Created (1 minute)

### 2a. Check in Table Editor

In the LEFT SIDEBAR, click **Table Editor**

You should now see **4 new tables**:

```
┌─────────────────────────────────────┐
│ ✓ companies_json                    │
│   └─ 3 rows (Google, MS, Amazon)    │
│                                     │
│ ✓ innovx_json                       │
│   └─ 0 rows (empty, ready for data) │
│                                     │
│ ✓ job_role_details_json             │
│   └─ 0 rows (empty, ready for data) │
│                                     │
│ ✓ hiring_rounds_json                │
│   └─ 0 rows (empty, ready for data) │
└─────────────────────────────────────┘
```

### 2b. Click on `companies_json` to verify data

Click the `companies_json` table in the list.

You should see 3 rows:
```
json_id  company_id    short_json              full_json
1        google        {name: "Google",...}    {name: "Google",...}
2        microsoft     {name: "Microsoft",...} {name: "Microsoft",...}
3        amazon        {name: "Amazon",...}    {name: "Amazon",...}
```

✅ **If you see this, setup is complete!**

---

## 🧪 STEP 3: Test in Your App (2 minutes)

### 3a. Refresh Your App

In your browser where the app is open:
```
Press: F5  (refresh)
```

### 3b. Check Browser Console

Press **F12** to open DevTools

Go to the **Console** tab

You should now see a fancy box:
```
╔════════════════════════════════════════════════════╗
║  🚀 SRM Career Compass - Supabase Integration      ║
╚════════════════════════════════════════════════════╝

📋 Available Testing Commands:

   Complete Test:
   → await DatabaseTests.runFullIntegrationTest()

   Individual Tests:
   → await DatabaseTests.testSupabaseConnection()
   → await DatabaseTests.testDatabaseTables()
   → await DatabaseTests.testCompaniesData()
   → await DatabaseTests.getCompaniesCount()

   Data Management:
   → await dataLoader.verifyDatabaseSetup()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Database is properly configured!

🎯 Next Steps:
   1. Navigate to /companies page
   2. You should see company cards
   3. Run full test: await DatabaseTests.runFullIntegrationTest()
```

If you see this with ✅ checkmarks, **congratulations!** 🎉

### 3c. Run the Integration Test

Copy and paste this into the console:
```javascript
await DatabaseTests.runFullIntegrationTest()
```

Press **Enter**

### Expected Output:

```
╔════════════════════════════════════════════════════╗
║  🚀 SUPABASE INTEGRATION TEST                      ║
╚════════════════════════════════════════════════════╝

⏳ Testing: Supabase Connection
──────────────────────────────────────────────────
✅ Supabase connection successful

⏳ Testing: Database Tables
──────────────────────────────────────────────────
📊 Table Status:
  companies_json: ✅ Exists
  innovx_json: ✅ Exists
  job_role_details_json: ✅ Exists
  hiring_rounds_json: ✅ Exists

⏳ Testing: Companies Data
──────────────────────────────────────────────────
📦 Checking companies data...
✅ Found 3 companies:
   - google: Google
   - microsoft: Microsoft
   - amazon: Amazon

══════════════════════════════════════════════════

🎉 SUCCESS! All tests passed!

✅ Your Supabase integration is working perfectly!

🎯 Next Steps:
   1. Navigate to: /companies
   2. You should see 3 company cards
   3. Click on a company to see details
   4. Try searching for companies
```

---

## 🎉 FINAL STEP: See Your Data

### Click on Companies Page

In your app, click **Companies** in the navigation menu

You should see **3 company cards**:
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   Google     │  │  Microsoft   │  │   Amazon     │
│              │  │              │  │              │
│ Marquee      │  │ Marquee      │  │ Tech Giants  │
│ 190,000+     │  │ 220,000+     │  │ 1,600,000+   │
│              │  │              │  │              │
│ View Details │  │ View Details │  │ View Details │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

✅ **If you see this, the 404 errors are FIXED!**

---

## 🆘 Troubleshooting

### ❌ Still seeing 404 errors?

**Check:**
1. ✅ Did you copy the ENTIRE database_setup.sql?
2. ✅ Did you click the Run button?
3. ✅ Did you wait for completion?
4. ✅ Did you refresh the page (F5)?

**If yes to all:** Try again with fresh copy-paste

### ❌ Seeing "Some tables are missing"?

**Solution:**
1. Go back to Supabase SQL Editor
2. Run the database_setup.sql again
3. Refresh the page (F5)
4. Run test again

### ❌ Seeing "No data found"?

**Solution:**
1. Check Supabase Table Editor
2. Click companies_json table
3. If empty, data wasn't inserted
4. Copy-paste and run database_setup.sql again

### ❌ Console shows no commands?

**Solution:**
1. Refresh the page (F5)
2. Wait 2 seconds
3. Open console again (F12)

---

## ✨ What's Next?

Once integration is working, you can:

1. **Add More Companies**
   ```javascript
   await dataLoader.insertCompany({
     company_id: 'netflix',
     short_json: { name: 'Netflix', ... },
     full_json: { ... }
   })
   ```

2. **Add Hiring Process Data**
   ```javascript
   await dataLoader.insertHiringRounds({
     company_id: 'google',
     hiring_rounds_json: [...]
   })
   ```

3. **Search Companies**
   Navigate to /companies and use the search bar

4. **View Company Details**
   Click on any company card to see full details

---

## 📊 Architecture Overview

```
Your React App
       ↓
useCompanies() Hook
       ↓
React Query
       ↓
Supabase Client
       ↓
Supabase REST API (qbkdmeginffcgfofmoav.supabase.co)
       ↓
PostgreSQL Database
       ↓
companies_json Table
       ↓
Returns JSON Data
       ↓
Displayed as Company Cards
```

---

## 🎯 Summary

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Copy & run database_setup.sql | 2 min | ⏳ Do this |
| 2 | Verify tables created | 1 min | ⏳ Do this |
| 3 | Refresh app & test | 2 min | ⏳ Do this |
| 4 | View companies page | 1 min | ⏳ After 1-3 |

**Total Time: ~5 minutes**

---

## 📞 Need Help?

- **Questions?** Check [FIX_404_ERROR.md](FIX_404_ERROR.md)
- **More details?** See [README_SUPABASE.md](README_SUPABASE.md)
- **Quick setup?** See [QUICKSTART.md](QUICKSTART.md)

---

**Last Updated:** April 23, 2026  
**Status:** Ready for implementation  
**Action Required:** Run SQL script in Supabase

🚀 **You're so close! Just 3 simple steps!**
