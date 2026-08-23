import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TeamRow, StudentRow } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const evaluatorNavItems = [
  { label: 'Assigned Teams', href: '/round1', icon: '📝' },
  { label: 'Evaluation Guidelines', href: '#', icon: '📖' },
];

export default async function Round1DashboardPage() {
  const session = await requireAuth(['evaluator', 'admin']);
  let assignedTeams: TeamRow[] = [];

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

  // Fallback demo list removed

  return (
    <Shell
      title="Round 1 Evaluation Workspace"
      roleName="Round 1 Evaluator"
      roleType="evaluator"
      userName={session.name}
      navItems={evaluatorNavItems}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Assigned SIH Teams</h1>
        <p className="text-sm text-slate-500">
          Only teams mapped to your evaluator ID in `round1_assignments` are visible here. Select a team to evaluate.
        </p>
      </div>

      {assignedTeams.length === 0 ? (
        <EmptyState title="No Teams Assigned" description="You have not been assigned any teams for Round 1 evaluation yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedTeams.map((team) => (
            <Card key={team.id} hoverEffect>
              <CardHeader>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-600 font-bold">{team.team_code}</span>
                    <Badge variant={team.status as 'shortlisted' | 'registered' | 'round1_pending' | 'selected' | 'standby'}>
                      {team.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="mt-1 text-lg">{team.team_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                    Team Members:
                  </span>
                  <div className="space-y-1">
                    {team.students && team.students.length > 0 ? (
                      team.students.map((student: StudentRow) => (
                        <div key={student.id} className="text-xs text-slate-700 flex items-center justify-between">
                          <span>{student.name}</span>
                          <span className="font-mono text-slate-500">{student.roll_number}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No student records listed</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Criteria Score Status: Pending</span>
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
      )}
    </Shell>
  );
}
