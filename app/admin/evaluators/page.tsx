import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { AdminEvaluatorsClientWrapper } from '@/components/admin/AdminEvaluatorsClientWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import type { EvaluatorRow } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Problem Statements', href: '/admin/problem-statements', icon: '📋' },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓' },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯' },
  { label: 'Round 1 Mapping', href: '/admin/assignments', icon: '📌' },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];

async function toggleJuryAttendance(formData: FormData) {
  'use server';
  await requireAuth(['admin', 'data_operator']);
  const evaluatorId = formData.get('evaluatorId') as string;
  const currentAttendance = formData.get('currentAttendance') as string;
  const nextAttendance = currentAttendance === 'present' ? 'absent' : 'present';

  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('evaluators') as any)
      .update({ round2_attendance: nextAttendance })
      .eq('id', evaluatorId);

    revalidatePath('/admin/evaluators');
  } catch (err) {
    console.error('Failed to toggle attendance:', err);
  }
}

export default async function AdminEvaluatorsPage() {
  const session = await requireAuth(['admin', 'data_operator']);
  let evaluators: EvaluatorRow[] = [];

  try {
    const supabase = createAdminClient();
    const { data: fetchedEvaluators } = await supabase
      .from('evaluators')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchedEvaluators && fetchedEvaluators.length > 0) {
      evaluators = fetchedEvaluators as EvaluatorRow[];
    }
  } catch (err) {
    console.error('Failed to fetch evaluators:', err);
  }

  // Fallback demo list removed

  return (
    <Shell
      title="Evaluator & Jury Management"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <AdminEvaluatorsClientWrapper>
        {evaluators.length === 0 ? (
          <EmptyState
            title="No Evaluators or Jury Found"
            description="Add evaluator and jury accounts to begin assignments."
            icon="🎓"
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluator / Jury Name</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Round 2 Attendance State</TableHead>
                  <TableHead className="text-right">Attendance Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluators.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{person.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {person.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={person.role === 'jury' ? 'purple' : 'cyan'}>
                        {person.role === 'jury' ? '⚖️ ROUND 2 JURY' : '📝 ROUND 1 EVALUATOR'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {person.role === 'jury' ? (
                        <Badge variant={person.round2_attendance === 'present' ? 'green' : 'rose'}>
                          {person.round2_attendance === 'present' ? 'PRESENT (ELIGIBLE)' : 'ABSENT (LOCKED)'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">N/A (Round 1 Only)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {person.role === 'jury' ? (
                        <form action={toggleJuryAttendance} className="inline-block">
                          <input type="hidden" name="evaluatorId" value={person.id} />
                          <input type="hidden" name="currentAttendance" value={person.round2_attendance} />
                          <Button
                            type="submit"
                            variant={person.round2_attendance === 'present' ? 'danger' : 'primary'}
                            size="sm"
                          >
                            {person.round2_attendance === 'present' ? 'Mark Absent' : 'Mark Present'}
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminEvaluatorsClientWrapper>
    </Shell>
  );
}
