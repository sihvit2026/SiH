/**
 * Server Supabase client
 *
 * Use this in Server Components, Route Handlers, and Server Functions.
 * This is an async factory — always `await createClient()` before using it.
 *
 * In Next.js 16, `cookies()` is asynchronous and must be awaited.
 * The `setAll` implementation silently swallows errors when called from a
 * Server Component (where Set-Cookie headers cannot be written). The
 * middleware is responsible for refreshing sessions and writing cookies there.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookies cannot be set here.
            // Middleware (if present) will handle session refresh and cookie writes.
          }
        },
      },
    },
  )
}
