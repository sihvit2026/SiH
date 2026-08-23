/**
 * ⚠️  SERVER-ONLY — never import this into a Client Component or any file
 * that is bundled for the browser. This client uses the service-role key,
 * which bypasses ALL Row-Level Security policies.
 *
 * Safe usage: Route Handlers, Server Functions, migration scripts,
 * background jobs, and any file that only ever runs on the server.
 *
 * The client is a lazy singleton — initialised once on first access so that
 * the environment variable is only read at runtime, not at build time.
 */
import { createClient as _createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

// SupabaseClient<Database> is used explicitly because
// `ReturnType<typeof _createClient<Database>>` is not valid TypeScript —
// generic arguments cannot be passed inside a `typeof` expression.
let _adminClient: SupabaseClient<Database> | null = null

export function createAdminClient(): SupabaseClient<Database> {
  if (_adminClient) return _adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'These must be set in .env.local (server-only).',
    )
  }

  _adminClient = _createClient<Database>(url, serviceRoleKey, {
    auth: {
      // The admin client should not persist sessions or auto-refresh tokens.
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _adminClient
}
