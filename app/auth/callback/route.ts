import { createClient } from '@/lib/supabase/server';
<<<<<<< HEAD
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const overallStart = performance.now();
=======
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'password' for password login redirect

  // Handle password login redirect (no code exchange needed — session already set)
  if (type === 'password') {
    const supabase = await createClient();
<<<<<<< HEAD

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const redirectPath = await getRoleHome(user.id);
=======
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const redirectPath = await getRoleHome(supabase, user.id);
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}

/** Resolve a user's home route based on their role. */
<<<<<<< HEAD
async function getRoleHome(userId: string): Promise<string> {
  const adminClient = createAdminClient();

  // Check profiles table first (admin/data_operator/viewer) - using admin client to bypass RLS
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
=======
async function getRoleHome(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string> {
  // Check profiles table first (admin/data_operator/viewer)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59

  if (profile?.role === 'data_operator' || profile?.role === 'admin') {
    return '/admin';
  }
  if (profile?.role === 'viewer') {
    return '/reports';
  }

  // Check evaluators table
<<<<<<< HEAD
  const { data: evaluator } = await adminClient
    .from('evaluators')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
=======
  const { data: evaluator } = await supabase
    .from('evaluators')
    .select('role')
    .eq('id', userId)
    .single();
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59

  if (evaluator?.role === 'evaluator') return '/round1';
  if (evaluator?.role === 'jury') return '/round2';

  // Default — the admin will handle this user
  return '/admin';
}
