import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const redirect = searchParams.get('redirect');

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

async function getRoleHome(userId: string, redirect?: string | null): Promise<string> {
  const adminClient = createAdminClient();

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

  const { data: evaluator } = await adminClient
    .from('evaluators')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (evaluator?.role === 'evaluator') return redirect || '/round1';
  if (evaluator?.role === 'jury') return redirect || '/round2';

  return redirect || '/admin';
}