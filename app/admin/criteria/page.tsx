import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import type { CriterionRow } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
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

  // Fallback demo criteria list if DB is empty
  if (criteriaList.length === 0) {
    criteriaList = [
      { id: 'c1', name: 'Innovation & Novelty', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c2', name: 'Technical Feasibility', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c3', name: 'Impact & Relevance', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c4', name: 'Presentation & UI', max_score: 25, weight: 1.0, round: 1 },
      { id: 'c5', name: 'Live Working Prototype', max_score: 40, weight: 1.0, round: 2 },
      { id: 'c6', name: 'Scalability & Architecture', max_score: 30, weight: 1.0, round: 2 },
      { id: 'c7', name: 'Jury Q&A Defense', max_score: 30, weight: 1.0, round: 2 },
    ];
  }

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
          <h1 className="text-2xl font-black text-slate-100">Evaluation Criteria & Rubrics</h1>
          <p className="text-xs text-slate-400">Configure independent marking columns, maximum scores, and weights for Round 1 & Round 2</p>
        </div>
        <Button variant="primary" size="sm">+ Add Criterion Column</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round 1 Criteria Card */}
        <Card glowColor="cyan">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-cyan-300">Round 1 Screening Rubric</CardTitle>
                <CardDescription>3-4 marks columns for assigned evaluators</CardDescription>
              </div>
              <Badge variant="cyan" glow>Round 1</Badge>
            </div>
          </CardHeader>
          <CardContent>
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
                      <TableCell className="font-semibold text-slate-200">{c.name}</TableCell>
                      <TableCell className="font-mono text-cyan-400 font-bold">{c.max_score} pts</TableCell>
                      <TableCell className="font-mono text-slate-400">{c.weight}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Round 2 Criteria Card */}
        <Card glowColor="purple">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-purple-300">Round 2 Jury Rubric</CardTitle>
                <CardDescription>Final evaluation criteria for shortlisted teams</CardDescription>
              </div>
              <Badge variant="purple" glow>Round 2</Badge>
            </div>
          </CardHeader>
          <CardContent>
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
                      <TableCell className="font-semibold text-slate-200">{c.name}</TableCell>
                      <TableCell className="font-mono text-purple-400 font-bold">{c.max_score} pts</TableCell>
                      <TableCell className="font-mono text-slate-400">{c.weight}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
