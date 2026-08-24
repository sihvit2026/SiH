import React from 'react';
import { Shell } from '@/components/layout/Shell';
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

  // Find the current event
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('id, name, status')
    .in('status', ['upcoming', 'ongoing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let problemStatements: ProblemStatementRow[] = [];

  // Only query problem statements when a real event exists.
  if (eventData?.id) {
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .eq('event_id', eventData.id)
      .order('statement_code', { ascending: true });

    if (error) {
      console.error('Failed to fetch problem statements:', error);
    } else {
      problemStatements = data ?? [];
    }
  } else if (eventError) {
    console.error('Failed to fetch active event:', eventError);
  }

  return (
    <Shell
      title="Problem Statements"
      roleName={
        session.role === 'admin'
          ? 'SIH Super Admin'
          : 'Data Operator'
      }
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      {eventData?.id ? (
        <ProblemStatementsClientWrapper eventId={eventData.id}>
          {problemStatements.length === 0 ? (
            <EmptyState
              title="No Problem Statements Found"
              description="Import the SIH problem statement CSV or add a problem statement manually."
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PS Number</TableHead>
                    <TableHead>Problem Statement</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {problemStatements.map((ps) => (
                    <TableRow key={ps.id}>

                      {/* PS Number */}
                      <TableCell>
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {ps.statement_code}
                        </span>
                      </TableCell>

                      {/* Problem Statement */}
                      <TableCell>
                        <div className="font-semibold text-slate-900">
                          {ps.title}
                        </div>

                        {ps.description && (
                          <div className="mt-1 text-xs text-slate-500 line-clamp-2 max-w-xl">
                            {ps.description}
                          </div>
                        )}
                      </TableCell>

                      {/* Organization */}
                      <TableCell className="text-sm text-slate-700">
                        {ps.organization || '—'}
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        {ps.category ? (
                          <Badge variant="slate">
                            {ps.category}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      {/* Theme */}
                      <TableCell className="text-sm text-slate-600">
                        {ps.theme || '—'}
                      </TableCell>

                      {/* Actions */}
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
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="No Active Event"
            description="Create an upcoming or ongoing event before importing problem statements."
          />
        </div>
      )}
    </Shell>
  );
}