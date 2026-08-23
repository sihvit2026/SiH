import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { ProblemStatementsClientWrapper } from '@/components/admin/ProblemStatementsClientWrapper';
import { ProblemStatementRowActions } from '@/components/admin/ProblemStatementRowActions';
import type { ProblemStatementRow } from '@/lib/schemas';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

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

export default async function AdminProblemStatementsPage() {
  const session = await requireAuth(['admin', 'data_operator']);
  const supabase = createAdminClient();

  // Get active event
  const { data: eventData } = await supabase
    .from('events')
    .select('id, name')
    .in('status', ['upcoming', 'ongoing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const eventId = eventData?.id || '00000000-0000-0000-0000-000000000000'; // Fallback so it doesn't crash if no event

  let problemStatements: ProblemStatementRow[] = [];

  try {
    const { data } = await supabase
      .from('problem_statements')
      .select('*')
      .eq('event_id', eventId)
      .order('statement_code', { ascending: true });

    if (data && data.length > 0) {
      problemStatements = data;
    }
  } catch (err) {
    console.error('Failed to fetch problem statements:', err);
  }

  // Fallback demo data removed

  return (
    <Shell
      title="Problem Statements"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <ProblemStatementsClientWrapper eventId={eventId}>
        {problemStatements.length === 0 ? (
          <EmptyState title="No Problem Statements Found" description="Add problem statements to this event." />
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code & Title</TableHead>
                  <TableHead>Category / Theme</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problemStatements.map((ps) => (
                  <TableRow key={ps.id}>
                    <TableCell>
                      <div className="font-bold text-blue-600 text-xs font-mono">{ps.statement_code}</div>
                      <div className="font-semibold text-slate-900 mt-1">{ps.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        {ps.category && (
                          <Badge variant="slate" className="mr-2">
                            {ps.category}
                          </Badge>
                        )}
                        <div className="text-xs text-slate-600">{ps.theme || '—'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {ps.organization || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProblemStatementRowActions ps={ps} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ProblemStatementsClientWrapper>
    </Shell>
  );
}
