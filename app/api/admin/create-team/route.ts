import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const userSession = await getCurrentUser();

    if (!userSession || !['admin', 'data_operator'].includes(userSession.role)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { team_name, team_code, status } = await req.json();

    if (!team_name || !team_code) {
      return NextResponse.json({ error: 'Team name and SIH code are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await (supabase.from('teams') as any)
      .insert({
        team_name,
        team_code,
        status: status || 'registered',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, team: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
