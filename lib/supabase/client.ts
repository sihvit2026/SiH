/**
 * Browser Supabase client
 *
 * Use this in Client Components ('use client').
 * Creates a new client per call — do NOT promote to a module-level singleton
 * because the anon key / URL could differ across environments at build time.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
