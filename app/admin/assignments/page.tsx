import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓' },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯' },
  { label: 'Round 1 Mapping', href: '/admin/assignments', icon: '📌' },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];

export default async function AdminAssignmentsPage() {
  const session = await requireAuth(['admin', 'data_operator']);
  let assignments: any[] = [];

  try {
    const supabase = createAdminClient();
    const { data: fetchedAssignments } = await supabase
      .from('round1_assignments')
      .select('*, teams(team_name, team_code), evaluators(name, role)')
      .order('assigned_at', { ascending: false });

    if (fetchedAssignments && fetchedAssignments.length > 0) {
      assignments = fetchedAssignments;
    }
  } catch (err) {
    console.error('Failed to fetch assignments:', err);
  }

  // Fallback demo mapping list if DB is empty
  if (assignments.length === 0) {
    assignments = [
      { id: 'a1', team_code: 'SIH2026-001', team_name: 'CyberGuard AI', evaluator_name: 'Dr. Ramesh Kumar' },
      { id: 'a2', team_code: 'SIH2026-001', team_name: 'CyberGuard AI', evaluator_name: 'Prof. Sunita Rao' },
      { id: 'a3', team_code: 'SIH2026-002', team_name: 'Neural Grid Tech', evaluator_name: 'Dr. Ramesh Kumar' },
      { id: 'a4', team_code: 'SIH2026-003', team_name: 'Quantum BioMed', evaluator_name: 'Prof. Sunita Rao' },
    ];
  }

  return (
    <Shell
      title="Round 1 Evaluator Mapping"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Round 1 Team-to-Evaluator Assignments</h1>
          <p className="text-xs text-slate-400">Map internal/external evaluators to specific teams (`round1_assignments` mapping)</p>
        </div>
        <Button variant="primary" size="sm">+ Map Evaluator to Team</Button>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Code</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Assigned Evaluator</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-cyan-400 font-bold text-xs">
                  {item.teams?.team_code || item.team_code}
                </TableCell>
                <TableCell className="font-semibold text-slate-100">
                  {item.teams?.team_name || item.team_name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-slate-200 font-medium">{item.evaluators?.name || item.evaluator_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300">
                    Unassign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Shell>
  );
}
