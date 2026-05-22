import { createClient } from '@supabase/supabase-js';

const metaEnv: any = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
const rawSupabaseUrl = ((metaEnv && metaEnv.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = ((metaEnv && (metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY)) || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

function validateSupabaseUrl(url: string): string | null {
  if (!url) {
    console.error('[FAIL] Supabase URL missing');
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      console.error('[FAIL] Supabase URL must use https://');
      return null;
    }
    console.log('[PASS] Supabase URL valid');
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    console.error(`[FAIL] Malformed Supabase URL: ${url}`);
    return null;
  }
}

function getSupabaseKey(): string | null {
  if (!rawSupabaseAnonKey) {
    console.error('[FAIL] Supabase anonymous key missing');
    return null;
  }

  console.log('[PASS] Environment variables loaded');
  return rawSupabaseAnonKey;
}

export const supabaseUrl = validateSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = getSupabaseKey();
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function isBrowserOffline() {
  return typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

function getErrorMessage(error: unknown): string {
  if (!error) return String(error);
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isRetryableNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return /Failed to fetch|NetworkError|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|DNS|ENOTFOUND|ECONNREFUSED|ECONNRESET/i.test(message);
}

function isDnsResolutionError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return /ERR_NAME_NOT_RESOLVED|ENOTFOUND|DNS/i.test(message);
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeSupabaseRequest<T>(
  operation: string,
  requestFn: () => PromiseLike<T> | T
): Promise<T> {
  if (isBrowserOffline()) {
    console.error('[FAIL] Internet connection unavailable');
    throw new Error('Internet connection unavailable');
  }

  if (!isSupabaseConfigured) {
    throw new Error('Supabase configuration invalid or missing');
  }

  const maxAttempts = 3;
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      if (isRetryableNetworkError(error) && attempt < maxAttempts - 1) {
        attempt += 1;
        console.warn(`[WARNING] Retrying failed request (${attempt}/${maxAttempts - 1}) for ${operation}`);
        await delay(500 * attempt);
        continue;
      }

      if (isDnsResolutionError(error)) {
        console.error('[FAIL] DNS resolution failed');
      }

      throw error;
    }
  }

  throw lastError;
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'srm-career-compass',
      },
    },
  }
);
