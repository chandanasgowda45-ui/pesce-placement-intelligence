import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Environment variables (compatible with Vite/Node)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export interface CompanyReport {
  run_id: string;
  company_name: string;
  country: string;
  confidence_score: number;
  golden_record: any;
}

/**
 * Saves the generated golden record to Supabase.
 * This operation is non-blocking and will not crash the workflow if it fails.
 */
export async function saveCompanyReport(report: CompanyReport) {
  if (!supabase) {
    logger.warn('Persistence skipped: Supabase credentials missing', { runId: report.run_id });
    return;
  }

  try {
    const { error } = await supabase
      .from('company_reports')
      .insert([{
        run_id: report.run_id,
        company_name: report.company_name,
        country: report.country,
        confidence_score: report.confidence_score,
        golden_record: report.golden_record,
        generated_at: new Date().toISOString()
      }]);

    if (error) {
      logger.error('Supabase persistence failed', error, { runId: report.run_id });
    } else {
      logger.info('Company report persisted successfully', { runId: report.run_id, stage: 'persistence' });
    }
  } catch (err) {
    logger.error('Unexpected error during persistence', err, { runId: report.run_id });
  }
}