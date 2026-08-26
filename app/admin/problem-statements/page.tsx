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
import { getCachedActiveEvent } from '@/lib/cached-queries';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

import { adminNavItems } from '@/lib/nav';

export default async function AdminProblemStatementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await requireAuth(['admin', 'data_operator']);
  
  const supabase = createAdminClient();

  const resolvedParams = await searchParams;
  const pageStr = resolvedParams?.page || '1';
  const page = parseInt(pageStr, 10) || 1;
  const PAGE_SIZE = 50;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [eventData, psRes] = await Promise.all([
    getCachedActiveEvent(),
    supabase
      .from('problem_statements')
      .select(
        'id, statement_code, title, description, organization, category, theme, event_id, created_at, updated_at',
        { count: 'exact' }
      )
      .order('statement_code', { ascending: true })
      .range(from, to),
  ]);

  let problemStatements: ProblemStatementRow[] = [];
  let totalStatements = 0;

  if (psRes.error) {
    console.error('Failed to fetch problem statements:', psRes.error);
  } else if (psRes.data) {
    problemStatements = psRes.data;
    totalStatements = psRes.count || psRes.data.length || 0;
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
              <Pagination
                currentPage={page}
                totalCount={totalStatements}
                pageSize={PAGE_SIZE}
                baseUrl="/admin/problem-statements"
              />
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