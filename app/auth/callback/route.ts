import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const overallStart = performance.now();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'password' for password login redirect

  // Handle password login redirect (no code exchange needed — session already set)
  if (type === 'password') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const redirectPath = await getRoleHome(user.id);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}

/** Resolve a user's home route based on their role. */
async function getRoleHome(userId: string): Promise<string> {
  const adminClient = createAdminClient();

  // Check profiles table first (admin/data_operator/viewer) - using admin client to bypass RLS
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.role === 'data_operator' || profile?.role === 'admin') {
    return '/admin';
  }
  if (profile?.role === 'viewer') {
    return '/reports';
  }

  // Check evaluators table
  const { data: evaluator } = await adminClient
    .from('evaluators')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (evaluator?.role === 'evaluator') return '/round1';
  if (evaluator?.role === 'jury') return '/round2';

  // Default — the admin will handle this user
  return '/admin';
}
