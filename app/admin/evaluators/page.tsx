import React from 'react';
import { revalidatePath } from 'next/cache';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  TableContainer,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { AdminEvaluatorsClientWrapper } from '@/components/admin/AdminEvaluatorsClientWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import type { EvaluatorRow } from '@/lib/schemas';
import { EvaluatorRowActions } from '@/components/admin/EvaluatorRowActions';
import { Pagination } from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

import { adminNavItems } from '@/lib/nav';

async function toggleJuryAttendance(formData: FormData) {
  'use server';

  await requireAuth(['admin', 'data_operator']);

  const evaluatorId = formData.get('evaluatorId') as string;
  const currentAttendance =
    formData.get('currentAttendance') as string;

  const nextAttendance =
    currentAttendance === 'present'
      ? 'absent'
      : 'present';

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('evaluators')
      .update({
        round2_attendance: nextAttendance,
      })
      .eq('id', evaluatorId);

    if (error) {
      throw error;
    }

    revalidatePath('/admin/evaluators');
    revalidatePath('/round2');
  } catch (err) {
    console.error(
      'Failed to toggle attendance:',
      err
    );
  }
}

export default async function AdminEvaluatorsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await requireAuth([
    'admin',
    'data_operator',
  ]);
  
  const resolvedParams = await searchParams;
  const pageStr = resolvedParams?.page || '1';
  const page = parseInt(pageStr, 10) || 1;
  const PAGE_SIZE = 50;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let evaluators: EvaluatorRow[] = [];
  let totalEvaluators = 0;

  try {
    const supabase = createAdminClient();

    const { data: fetchedEvaluators, error, count } =
      await supabase
        .from('evaluators')
        .select('id, name, role, round2_attendance, created_at', { count: 'exact' })
        .order('created_at', {
          ascending: false,
        })
        .range(from, to);

    if (error) {
      console.error(
        'Failed to fetch evaluators:',
        error
      );
    } else if (fetchedEvaluators) {
      evaluators =
        fetchedEvaluators as EvaluatorRow[];
      totalEvaluators = count || fetchedEvaluators.length || 0;
    }
  } catch (err) {
    console.error(
      'Failed to fetch evaluators:',
      err
    );
  }

  return (
    <Shell
      title="Evaluator & Jury Management"
      roleName={
        session.role === 'admin'
          ? 'SIH Super Admin'
          : 'Data Operator'
      }
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <AdminEvaluatorsClientWrapper
        evaluators={evaluators}
      >
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
                  <TableHead>
                    Evaluator / Jury Name
                  </TableHead>

                  <TableHead>
                    Assigned Role
                  </TableHead>

                  <TableHead>
                    Round 2 Attendance State
                  </TableHead>

                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {evaluators.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {person.name}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {person.id}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          person.role === 'jury'
                            ? 'purple'
                            : 'cyan'
                        }
                      >
                        {person.role === 'jury'
                          ? '⚖️ ROUND 2 JURY'
                          : '📝 ROUND 1 EVALUATOR'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {person.role === 'jury' ? (
                        <Badge
                          variant={
                            person.round2_attendance ===
                              'present'
                              ? 'green'
                              : 'rose'
                          }
                        >
                          {person.round2_attendance ===
                            'present'
                            ? 'PRESENT (ELIGIBLE)'
                            : 'ABSENT (LOCKED)'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">
                          N/A (Round 1 Only)
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {person.role === 'jury' && (
                          <form
                            action={
                              toggleJuryAttendance
                            }
                            className="inline-block"
                          >
                            <input
                              type="hidden"
                              name="evaluatorId"
                              value={person.id}
                            />

                            <input
                              type="hidden"
                              name="currentAttendance"
                              value={
                                person.round2_attendance
                              }
                            />

                            <Button
                              type="submit"
                              variant={
                                person.round2_attendance ===
                                  'present'
                                  ? 'danger'
                                  : 'primary'
                              }
                              size="sm"
                            >
                              {person.round2_attendance ===
                                'present'
                                ? 'Mark Absent'
                                : 'Mark Present'}
                            </Button>
                          </form>
                        )}

                        <EvaluatorRowActions
                          evaluatorId={person.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              currentPage={page}
              totalCount={totalEvaluators}
              pageSize={PAGE_SIZE}
              baseUrl="/admin/evaluators"
            />
          </TableContainer>
        )}
      </AdminEvaluatorsClientWrapper>
    </Shell>
  );
}