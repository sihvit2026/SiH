/**
 * SERVER-ONLY Supabase admin client.
 *
 * Uses the Supabase service-role key and therefore bypasses RLS.
 * Never import this file into Client Components.
 */

import {
  createClient as _createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

let _adminClient: SupabaseClient<Database> | null = null;

export function createAdminClient(): SupabaseClient<Database> {
  if (_adminClient) {
    return _adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'These must be set in .env.local or Vercel environment variables.',
    );
  }

  _adminClient = _createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}