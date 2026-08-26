import React from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
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

    const { data: assignments, error } = await supabase
      .from('round1_assignments')
      .select(`
<<<<<<< HEAD
        id,
        team_id,
        evaluator_id,
        teams(
          id, team_code, status, team_name,
          students(id, name, is_leader, roll_number),
          problem_statement:problem_statements(id, statement_code, title, description, theme, category, organization)
=======
        *,
        teams(
          *,
          students(*),
          problem_statement:problem_statements(*)
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
        )
      `)
      .eq('evaluator_id', session.user.id);

    if (error) {
      console.error(
        'Failed to fetch evaluator assignments:',
        error
      );
    }

    if (assignments && assignments.length > 0) {
      assignedTeams = assignments
        .map((assignment) => assignment.teams)
        .filter(Boolean) as TeamRow[];
    }
  } catch (err) {
    console.error(
      'Failed to fetch evaluator assignments:',
      err
    );
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
        <h1 className="text-2xl font-bold text-slate-900">
          Assigned SIH Teams
        </h1>

        <p className="text-sm text-slate-500">
          Only teams mapped to your evaluator ID are visible here.
          Select a team to evaluate.
        </p>
      </div>

      {assignedTeams.length === 0 ? (
        <EmptyState
          title="No Teams Assigned"
          description="You have not been assigned any teams for Round 1 evaluation yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedTeams.map((team) => (
            <Card key={team.id} hoverEffect>
              <CardHeader>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-600 font-bold">
                      {team.team_code}
                    </span>

                    <Badge
                      variant={
                        team.status as
                        | 'shortlisted'
                        | 'registered'
                        | 'round1_pending'
                        | 'selected'
                        | 'standby'
                      }
                    >
                      {team.status
                        .replaceAll('_', ' ')
                        .toUpperCase()}
                    </Badge>
                  </div>

                  <CardTitle className="mt-1 text-lg">
                    {team.team_name}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Problem Statement */}
                {team.problem_statement ? (
                  <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                      Problem Statement
                    </p>

                    <p className="mt-1 font-mono text-xs font-bold text-blue-900">
                      {team.problem_statement.statement_code}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {team.problem_statement.title}
                    </p>

                    {team.problem_statement.description && (
                      <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-3">
                        {team.problem_statement.description}
                      </p>
                    )}

                    <div className="mt-3 grid grid-cols-1 gap-1">
                      {team.problem_statement.theme && (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-semibold">
                            Theme:
                          </span>{' '}
                          {team.problem_statement.theme}
                        </p>
                      )}

                      {team.problem_statement.category && (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-semibold">
                            Category:
                          </span>{' '}
                          {team.problem_statement.category}
                        </p>
                      )}

                      {team.problem_statement.organization && (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-semibold">
                            Organization:
                          </span>{' '}
                          {team.problem_statement.organization}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-800">
                      No Problem Statement Assigned
                    </p>

                    <p className="mt-1 text-[11px] text-amber-700">
                      Ask the administrator to assign a PS to this team.
                    </p>
                  </div>
                )}

                {/* Team Members */}
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                    Team Members
                  </span>

                  <div className="space-y-1">
                    {team.students && team.students.length > 0 ? (
                      team.students.map(
                        (student: StudentRow) => (
                          <div
                            key={student.id}
                            className="text-xs text-slate-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span>{student.name}</span>

                              {student.is_leader && (
                                <span className="text-[9px] font-semibold text-blue-800">
                                  LEADER
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-slate-500">
                              {student.roll_number}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        No student records listed
                      </span>
                    )}
                  </div>
                </div>

                {/* Evaluation */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Criteria Score Status: Pending
                  </span>

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