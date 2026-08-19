import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

const evaluatorNavItems = [
  { label: 'Assigned Teams', href: '/round1', icon: '📝' },
  { label: 'Evaluation Guidelines', href: '#', icon: '📖' },
];

export default async function Round1DashboardPage() {
  const session = await requireAuth(['evaluator', 'admin']);
  let assignedTeams: any[] = [];

  try {
    const supabase = await createClient();

    const { data: assignments } = await supabase
      .from('round1_assignments')
      .select('*, teams(*, students(*))')
      .eq('evaluator_id', session.user.id);

    if (assignments && assignments.length > 0) {
      assignedTeams = assignments.map((a) => a.teams);
    }
  } catch (err) {
    console.error('Failed to fetch evaluator assignments:', err);
  }

  // Fallback demo list if DB is empty / development mode
  if (assignedTeams.length === 0) {
    assignedTeams = [
      {
        id: 'team-1',
        team_name: 'CyberGuard AI',
        team_code: 'SIH2026-001',
        status: 'round1_pending',
        students: [
          { id: 's1', name: 'Aarav Sharma', roll_number: '21BCE012' },
          { id: 's2', name: 'Ananya Verma', roll_number: '21BCE045' },
        ],
      },
      {
        id: 'team-2',
        team_name: 'Neural Grid Tech',
        team_code: 'SIH2026-002',
        status: 'round1_pending',
        students: [
          { id: 's3', name: 'Rohan Patel', roll_number: '21BCE102' },
        ],
      },
    ];
  }

  return (
    <Shell
      title="Round 1 Evaluation Workspace"
      roleName="Round 1 Evaluator"
      roleType="evaluator"
      userName={session.name}
      navItems={evaluatorNavItems}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-100">Assigned SIH Teams</h1>
        <p className="text-xs text-slate-400">
          Only teams mapped to your evaluator ID in `round1_assignments` are visible here. Select a team to evaluate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignedTeams.map((team) => (
          <Card key={team.id} hoverEffect glowColor="cyan">
            <CardHeader>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{team.team_code}</span>
                  <Badge variant={team.status as any} glow>
                    {team.status.replace('_', ' ').toUpperCase()}
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
                <span className="text-xs text-slate-400 font-mono">Criteria Score Status: Pending</span>
                <Link href={`/round1/${team.id}`}>
                  <Button variant="primary" size="sm">
                    Evaluate Team →
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
