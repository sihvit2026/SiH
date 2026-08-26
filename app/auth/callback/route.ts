import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'password' for password login redirect
  const redirect = searchParams.get('redirect'); // optional deep-link target

  // Handle password login redirect (no code exchange needed — session already set)
  if (type === 'password') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const redirectPath = await getRoleHome(user.id, redirect);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}

/** Resolve a user's home route based on their role. */
async function getRoleHome(userId: string, redirect?: string | null): Promise<string> {
  const adminClient = createAdminClient();

  // Check profiles table first (admin/data_operator/viewer) - using admin client to bypass RLS
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.role === 'data_operator' || profile?.role === 'admin') {
    return redirect || '/admin';
  }
  if (profile?.role === 'viewer') {
    return redirect || '/reports';
  }

  // Check evaluators table
  const { data: evaluator } = await adminClient
    .from('evaluators')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (evaluator?.role === 'evaluator') return redirect || '/round1';
  if (evaluator?.role === 'jury') return redirect || '/round2';

  // Default — the admin will handle this user
  return redirect || '/admin';
}