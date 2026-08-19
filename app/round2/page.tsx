export const dynamic = 'force-dynamic';
import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

const juryNavItems = [
  { label: 'Shortlisted Teams', href: '/round2', icon: '⚖️' },
  { label: 'Jury Rules', href: '#', icon: '📖' },
];

export default async function Round2DashboardPage() {
  const session = await requireAuth(['jury', 'admin']);
  let shortlistedTeams: any[] = [];
  let isAttendancePresent = session.round2Attendance === 'present' || session.role === 'admin';

  try {
    const supabase = await createClient();

    // Query shortlisted teams for Round 2
    const { data: teams } = await supabase
      .from('teams')
      .select('*, students(*)')
      .eq('status', 'shortlisted');

    if (teams && teams.length > 0) {
      shortlistedTeams = teams;
    }
  } catch (err) {
    console.error('Failed to fetch jury data:', err);
  }

  // Fallback demo state if database record not present
  if (shortlistedTeams.length === 0) {
    shortlistedTeams = [
      {
        id: 'team-1',
        team_name: 'CyberGuard AI',
        team_code: 'SIH2026-001',
        status: 'shortlisted',
        students: [
          { id: 's1', name: 'Aarav Sharma', roll_number: '21BCE012' },
          { id: 's2', name: 'Ananya Verma', roll_number: '21BCE045' },
        ],
      },
      {
        id: 'team-3',
        team_name: 'Quantum BioMed',
        team_code: 'SIH2026-003',
        status: 'shortlisted',
        students: [
          { id: 's4', name: 'Priya Nair', roll_number: '21ECE088' },
        ],
      },
    ];
    isAttendancePresent = true; // Default present for demo visibility
  }

  return (
    <Shell
      title="Round 2 Jury Evaluation Panel"
      roleName="Round 2 Jury"
      roleType="jury"
      userName={session.name}
      navItems={juryNavItems}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Round 2 Shortlisted Teams</h1>
          <p className="text-xs text-slate-400">
            Final Jury panel evaluation for shortlisted teams. Enforces `evaluators.round2_attendance = &apos;present&apos;`
          </p>
        </div>
        <Badge variant={isAttendancePresent ? 'green' : 'rose'} glow>
          {isAttendancePresent ? '🟢 ATTENDANCE: PRESENT (ACTIVE)' : '🔴 ATTENDANCE: ABSENT (LOCKED)'}
        </Badge>
      </div>

      {!isAttendancePresent && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs space-y-1">
          <span className="font-bold block">⚠️ Attendance Required for Round 2 Scoring</span>
          <p>
            Your `round2_attendance` state is currently marked as `absent`. RLS security policies prevent inserting or updating Round 2 scores until the Admin updates your status to `present`.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shortlistedTeams.map((team) => (
          <Card key={team.id} hoverEffect glowColor="purple">
            <CardHeader>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-purple-400 font-bold">{team.team_code}</span>
                  <Badge variant="shortlisted" glow>
                    SHORTLISTED
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-lg">{team.team_name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Team Members:
                </span>
                <div className="space-y-1">
                  {team.students && team.students.length > 0 ? (
                    team.students.map((student: any) => (
                      <div key={student.id} className="text-xs text-slate-300 flex items-center justify-between">
                        <span>{student.name}</span>
                        <span className="font-mono text-slate-500">{student.roll_number}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No student records listed</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Round 2 Jury Scorecard</span>
                <Link href={`/round2/${team.id}`}>
                  <Button variant="accent" size="sm" disabled={!isAttendancePresent}>
                    Evaluate Jury Score →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
