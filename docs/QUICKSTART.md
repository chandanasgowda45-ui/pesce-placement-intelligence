# 🚀 Quick Start - Supabase Integration (5 Minutes)

## 3 Simple Steps

### ✅ Step 1: Run SQL in Supabase (2 min)

```
1. Open: https://app.supabase.com/project/qbkdmeginffcgfofmoav
2. Click: SQL Editor → New Query
3. Open: database_setup.sql (in project root)
4. Copy ALL content → Paste into Supabase editor
5. Click: Run
6. Success: No errors appear ✅
```

### ✅ Step 2: Verify Tables Created (1 min)

```
1. In Supabase: Click Table Editor
2. See 4 new tables: ✅
   ✓ companies_json (with Google, Microsoft, Amazon)
   ✓ innovx_json
   ✓ job_role_details_json
   ✓ hiring_rounds_json
```

### ✅ Step 3: Test in App (2 min)

```bash
npm run dev
```

Then:
1. Open: http://localhost:5173
2. Press F12 (DevTools)
3. Go to Console tab
4. Run: `await DatabaseTests.runFullIntegrationTest()`
5. You see: ✅ All tests passed!

---

## ✨ That's It!

Your Supabase integration is **LIVE** 🎉

Navigate to `/companies` and see the company cards!

---

## 📚 Need More Help?

- **Setup Issues?** → See `README_SUPABASE.md`
- **Testing Tools?** → Run `DatabaseTests.runFullIntegrationTest()`
- **Add Data?** → Use `src/services/dataLoader.ts`
- **Debug?** → Open console (F12) and check for errors

---

**Status:** ✅ Ready to use!  
**Time:** ~5 minutes to complete  
**Result:** Full Supabase integration working
