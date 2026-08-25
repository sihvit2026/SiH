import React from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
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
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/EmptyState';
import { CriteriaClientWrapper } from '@/components/admin/CriteriaClientWrapper';
import { CriterionRowActions } from '@/components/admin/CriterionRowActions';
import type { CriterionRow } from '@/lib/schemas';

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

export default async function AdminCriteriaPage() {
  const session = await requireAuth([
    'admin',
    'data_operator',
  ]);

  let criteriaList: CriterionRow[] = [];

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('criteria')
      .select('*')
      .order('round', {
        ascending: true,
      })
      .order('name', {
        ascending: true,
      });

    if (error) {
      console.error(
        'Failed to fetch criteria:',
        error
      );
    } else if (data) {
      criteriaList = data;
    }
  } catch (err) {
    console.error(
      'Failed to fetch criteria:',
      err
    );
  }

  const r1Criteria = criteriaList.filter(
    (criterion) => criterion.round === 1
  );

  const r2Criteria = criteriaList.filter(
    (criterion) => criterion.round === 2
  );

  return (
    <Shell
      title="Configurable Criteria Builder"
      roleName={
        session.role === 'admin'
          ? 'SIH Super Admin'
          : 'Data Operator'
      }
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <CriteriaClientWrapper
        criteria={criteriaList}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Round 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-slate-900">
                    Round 1 Screening Rubric
                  </CardTitle>

                  <CardDescription>
                    Criteria used by assigned evaluators.
                  </CardDescription>
                </div>

                <Badge variant="cyan">
                  Round 1
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {r1Criteria.length === 0 ? (
                <EmptyState
                  title="No Round 1 Criteria"
                  description="Add criteria to configure the Round 1 scorecard."
                />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          Criterion
                        </TableHead>

                        <TableHead>
                          Max Marks
                        </TableHead>

                        <TableHead>
                          Weight
                        </TableHead>

                        <TableHead className="text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {r1Criteria.map((criterion) => (
                        <TableRow key={criterion.id}>
                          <TableCell className="font-semibold text-slate-900">
                            {criterion.name}
                          </TableCell>

                          <TableCell className="font-mono text-blue-600 font-bold">
                            {criterion.max_score}
                          </TableCell>

                          <TableCell className="font-mono text-slate-600">
                            {criterion.weight}x
                          </TableCell>

                          <TableCell className="text-right">
                            <CriterionRowActions
                              criterionId={criterion.id}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Round 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-slate-900">
                    Round 2 Jury Rubric
                  </CardTitle>

                  <CardDescription>
                    Final evaluation criteria for shortlisted teams.
                  </CardDescription>
                </div>

                <Badge variant="purple">
                  Round 2
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {r2Criteria.length === 0 ? (
                <EmptyState
                  title="No Round 2 Criteria"
                  description="Add criteria to configure the Round 2 scorecard."
                />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          Criterion
                        </TableHead>

                        <TableHead>
                          Max Marks
                        </TableHead>

                        <TableHead>
                          Weight
                        </TableHead>

                        <TableHead className="text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {r2Criteria.map((criterion) => (
                        <TableRow key={criterion.id}>
                          <TableCell className="font-semibold text-slate-900">
                            {criterion.name}
                          </TableCell>

                          <TableCell className="font-mono text-purple-700 font-bold">
                            {criterion.max_score}
                          </TableCell>

                          <TableCell className="font-mono text-slate-600">
                            {criterion.weight}x
                          </TableCell>

                          <TableCell className="text-right">
                            <CriterionRowActions
                              criterionId={criterion.id}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

        </div>
      </CriteriaClientWrapper>
    </Shell>
  );
}