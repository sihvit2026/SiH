import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const userSession = await getCurrentUser();

    if (!userSession || !['admin', 'data_operator'].includes(userSession.role)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { topN } = await req.json();
    const count = parseInt(topN, 10);

    if (isNaN(count) || count <= 0) {
      return NextResponse.json({ error: 'Top N count must be a positive integer.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Query team round1 average view
    const { data: rankings, error: rankErr } = await (supabase.from('team_round1_average') as any)
      .select('team_id, avg_score')
      .order('avg_score', { ascending: false })
      .limit(count);

    if (rankErr) {
      return NextResponse.json({ error: rankErr.message }, { status: 500 });
    }

    if (rankings && rankings.length > 0) {
      const shortlistedIds = rankings.map((r: any) => r.team_id);

      // Update shortlisted teams status
      await (supabase.from('teams') as any)
        .update({ status: 'shortlisted' })
        .in('id', shortlistedIds);
    }

    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
