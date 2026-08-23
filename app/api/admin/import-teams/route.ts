import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const userSession = await getCurrentUser();

    // Verify role server-side
    if (!userSession || !['admin', 'data_operator'].includes(userSession.role)) {
      return NextResponse.json({ error: 'Unauthorized. Admin or Data Operator role required.' }, { status: 403 });
    }

    const { rows } = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid rows payload.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the current/latest event to link teams
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .in('status', ['upcoming', 'ongoing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'No active event found. Please create an event first.' }, { status: 400 });
    }

    for (const row of rows) {
      if (!row.team_name || !row.team_code) continue;

      // Upsert team
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: team, error: teamErr } = await (supabase.from('teams') as any)
        .upsert({
          event_id: event.id,
          team_name: row.team_name,
          team_code: row.team_code,
          status: 'registered',
        }, { onConflict: 'event_id, team_code' })
        .select('id')
        .single();

      if (teamErr) {
        console.error('Error inserting team row:', teamErr);
        continue;
      }

      // If student info exists, insert student
      if (team && row.student_name) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('students') as any)
          .insert({
            team_id: team.id,
            name: row.student_name,
            roll_number: row.roll_number || null,
            email: row.email || null,
          });
      }
    }

    return NextResponse.json({ success: true, importedCount: rows.length });
  } catch (err) {
    console.error('Import API error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
