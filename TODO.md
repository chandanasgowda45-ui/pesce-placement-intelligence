# Supabase Frontend Integration TODO

## Critical Fixes
- [x] Refactor `src/components/CompanyList.tsx` to use `useCompanies` hook — **ALREADY DONE**
- [ ] Fix `activeView` undefined variable in `src/pages/CompanyDetailPage.tsx` — causes runtime crash
- [ ] Fix nested React hook useMemo violation in `src/pages/CompanyDetailPage.tsx` sections array
- [ ] Fix duplicate fields in CompanyDetailPage "growth" section
- [ ] Fix `any` types in `src/pages/CompanyDetailPage.tsx`
- [ ] Fix `any` types in `src/pages/SkillMappingPage.tsx`
- [ ] Fix `any` types in `src/pages/HiringSkillSetPage.tsx`
- [ ] Fix `any` types in `src/pages/ComparePage.tsx`
- [ ] Fix minor lint issues (empty blocks, prefer-const)

## Verification
- [ ] Run `eslint` and confirm errors are reduced
- [ ] Run `npm run build` successfully
- [ ] Verify data loads from Supabase on Home, Companies, and Detail pages

## Plan

### Step 1: Fix `CompanyDetailPage.tsx`
- Add `useLocation` import to derive `activeView` from URL path
- Remove duplicate fields in the "growth" section
- Extract the `metadataFields` computation out of the nested `useMemo`
- Replace all `company?.full_json` typeUnsafe accesses with proper typing

### Step 2: Fix `SkillMappingPage.tsx`
- Replace `(company as any).full_json?.tech_stack` with typed accessor
- Replace `(company as any).full_json?.focus_sectors` with typed accessor

### Step 3: Fix `HiringSkillSetPage.tsx`
- Replace `(company as any).full_json?.skills` with typed accessor
- Clean up type assertions

### Step 4: Fix `ComparePage.tsx`
- Replace `(a as Record<string, unknown>)` pattern with safer access
- Replace `(a.full_json as Record<string, unknown>)` with typed helper

### Step 5: Lint & Build Verification
- Run `npm run lint`
- Run `npm run build`

### Step 6: Create Seeding Guide
- Document steps to seed all 116 companies into Supabase using `seed_116_companies.sql`

