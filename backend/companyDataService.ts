import { supabase } from '../lib/supabase';
import { createUnifiedCompanyRecord } from '../lib/dataNormalizers';

/**
 * Fetches full company data using independent queries to ensure stability.
 */
export async function fetchCompanyFullData(companyId: string | number) {
    const id = companyId.toString();

    // Step 4: Direct Table Queries for maximum reliability
    // This bypasses broken relational joins
    const [
        companyRes,
        hiringRes,
        innovxRes,
        skillsRes
    ] = await Promise.all([
        supabase.from('companies_json').select('*').eq('id', id).single(),
        supabase.from('hiring_rounds_json').select('*').eq('company_id', id),
        supabase.from('innovx_json').select('*').eq('company_id', id).maybeSingle(),
        supabase.from('job_role_details_json').select('*').eq('company_id', id)
    ]);

    if (companyRes.error && !companyRes.data) {
        console.error(`[DataService] Critical failure for ${id}:`, companyRes.error);
        // Step 9: Auto Fallback - Never return undefined
        return createUnifiedCompanyRecord({ id, name: `Error Loading ${id}` }, [], {}, []);
    }

    return createUnifiedCompanyRecord(
        companyRes.data,
        hiringRes.data || [],
        innovxRes.data,
        skillsRes.data || []
    );
}

export async function getAllUnifiedCompanies() {
    const { data: companies } = await supabase.from('companies_json').select('id');
    if (!companies) return [];
    return Promise.all(companies.map(c => fetchCompanyFullData(c.id)));
}