import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/EmptyState';
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
  const session = await requireAuth(['admin', 'data_operator']);
  let criteriaList: CriterionRow[] = [];

  try {
    const supabase = createAdminClient();
    const { data: fetchedCriteria } = await supabase
      .from('criteria')
      .select('*')
      .order('round', { ascending: true });

    if (fetchedCriteria && fetchedCriteria.length > 0) {
      criteriaList = fetchedCriteria;
    }
  } catch (err) {
    console.error('Failed to fetch criteria:', err);
  }

  // Fallback demo criteria list removed

  const r1Criteria = criteriaList.filter((c) => c.round === 1);
  const r2Criteria = criteriaList.filter((c) => c.round === 2);

  return (
    <Shell
      title="Configurable Criteria Builder"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evaluation Criteria & Rubrics</h1>
          <p className="text-sm text-slate-500 mt-1">Configure independent marking columns, maximum scores, and weights for Round 1 & Round 2</p>
        </div>
        <Button variant="primary" size="sm">+ Add Criterion Column</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round 1 Criteria Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-slate-900">Round 1 Screening Rubric</CardTitle>
                <CardDescription>3-4 marks columns for assigned evaluators</CardDescription>
              </div>
              <Badge variant="cyan">Round 1</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {r1Criteria.length === 0 ? (
              <EmptyState title="No Round 1 Criteria" description="Add criteria to configure the Round 1 scoring rubric." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criterion Label</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {r1Criteria.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold text-slate-900">{c.name}</TableCell>
                        <TableCell className="font-mono text-blue-600 font-bold">{c.max_score} pts</TableCell>
                        <TableCell className="font-mono text-slate-600">{c.weight}x</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Round 2 Criteria Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-slate-900">Round 2 Jury Rubric</CardTitle>
                <CardDescription>Final evaluation criteria for shortlisted teams</CardDescription>
              </div>
              <Badge variant="purple">Round 2</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {r2Criteria.length === 0 ? (
              <EmptyState title="No Round 2 Criteria" description="Add criteria to configure the Round 2 scoring rubric." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criterion Label</TableHead>
                      <TableHead>Max Marks</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {r2Criteria.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold text-slate-900">{c.name}</TableCell>
                        <TableCell className="font-mono text-blue-600 font-bold">{c.max_score} pts</TableCell>
                        <TableCell className="font-mono text-slate-600">{c.weight}x</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
