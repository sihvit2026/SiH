import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'password' for password login redirect

  // Handle password login redirect (no code exchange needed — session already set)
  if (type === 'password') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(`${origin}${await getRoleHome(supabase, user.id)}`);
    }
    return NextResponse.redirect(`${origin}/login`);
  }

  // Handle magic link / OAuth code exchange
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return NextResponse.redirect(`${origin}${await getRoleHome(supabase, user.id)}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

/** Resolve a user's home route based on their role. */
async function getRoleHome(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string> {
  // Check profiles table first (admin/data_operator/viewer)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profile?.role === 'data_operator' || profile?.role === 'admin') {
    return '/admin';
  }
  if (profile?.role === 'viewer') {
    return '/reports';
  }

  // Check evaluators table
  const { data: evaluator } = await supabase
    .from('evaluators')
    .select('role')
    .eq('id', userId)
    .single();

  if (evaluator?.role === 'evaluator') return '/round1';
  if (evaluator?.role === 'jury') return '/round2';

  // Default — the admin will handle this user
  return '/admin';
}
