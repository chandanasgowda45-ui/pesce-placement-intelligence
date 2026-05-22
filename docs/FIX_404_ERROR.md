# 🚨 URGENT: Complete These Steps to Fix 404 Errors

Your frontend is trying to fetch data but the **database tables don't exist yet**.

## 🔥 FIX THE 404 ERROR - Do This RIGHT NOW (2 minutes)

### Step 1️⃣: Open Supabase Dashboard
```
Go to: https://app.supabase.com/project/qbkdmeginffcgfofmoav/
```

### Step 2️⃣: Open SQL Editor

Look at the LEFT SIDEBAR:
```
┌─────────────────────┐
│  Dashboard          │
│  Editor             │
│  SQL Editor    ← CLICK HERE
│  Table Editor       │
│  Auth               │
└─────────────────────┘
```

Click **SQL Editor**

### Step 3️⃣: Create New Query

Click the **+ New Query** button (top right)

### Step 4️⃣: Copy the SQL Script

Open: `database_setup.sql` (in your project root)

**SELECT ALL** (Ctrl+A) and **COPY** (Ctrl+C)

### Step 5️⃣: Paste into Supabase

In the Supabase SQL Editor, **PASTE** (Ctrl+V) the entire script

You should see SQL code like:
```sql
-- SRM Career Compass Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create companies_json table
CREATE TABLE IF NOT EXISTS companies_json (
  json_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ...
```

### Step 6️⃣: Run the Script

Click the **▶ Run** button (blue button, top right of editor)

Wait for completion...

Expected result:
```
✅ 1 query executed successfully
```

**If you see errors about "policy already exists"**: That's OK! Just ignore them.

### Step 7️⃣: Verify Tables Were Created

Click **Table Editor** (left sidebar)

You should see 4 new tables:
```
✓ companies_json       (with Google, Microsoft, Amazon)
✓ innovx_json
✓ job_role_details_json
✓ hiring_rounds_json
```

---

## ✅ Verify in Your App

Once tables are created:

1. **Refresh your app** (F5 in browser)
2. **Press F12** (open DevTools)
3. **Go to Console tab**
4. **Run this command:**
   ```javascript
   await DatabaseTests.runFullIntegrationTest()
   ```

**Expected output:**
```
✅ Supabase connection successful
✅ Database Tables
   companies_json: ✅ Exists
✅ Found 3 companies: google, microsoft, amazon
🎉 All tests passed!
```

---

## 🎯 That's All!

Once you see ✅ All tests passed, the 404 errors are GONE and your app is working!

Then navigate to `/companies` and you'll see the company cards.

---

## ⚠️ Still Getting 404?

If you still see 404 errors:

1. **Did you run the SQL?** → Run it again
2. **Did you click Run button?** → Make sure you clicked the blue ▶ Run button
3. **Did you copy entire file?** → Paste the ENTIRE database_setup.sql
4. **Did you wait for completion?** → Wait a few seconds after clicking Run
5. **Did you refresh the app?** → Press F5 in browser to reload

---

## 📝 What the SQL Does

The script:
1. ✅ Creates `companies_json` table
2. ✅ Creates `innovx_json` table
3. ✅ Creates `job_role_details_json` table
4. ✅ Creates `hiring_rounds_json` table
5. ✅ Sets up security policies (RLS)
6. ✅ Inserts sample data (Google, Microsoft, Amazon)

---

**Time to fix:** ~2 minutes  
**Difficulty:** Easy (just copy & paste & click)  
**Result:** 404 errors gone, app working! ✨

🔥 **DO THIS NOW AND THE 404 ERRORS WILL BE FIXED!**
