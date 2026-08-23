import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { AdminTeamsClientWrapper } from '@/components/admin/AdminTeamsClientWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TeamRow, StudentRow } from '@/lib/schemas';

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

export default async function AdminTeamsPage() {
  const session = await requireAuth(['admin', 'data_operator']);
  let teams: TeamRow[] = [];

  try {
    const supabase = createAdminClient();
    const { data: fetchedTeams } = await supabase
      .from('teams')
      .select('*, students(*)')
      .order('created_at', { ascending: false });

    if (fetchedTeams && fetchedTeams.length > 0) {
      teams = fetchedTeams;
    }
  } catch (err) {
    console.error('Failed to fetch teams:', err);
  }

  // Fallback demo teams removed

  return (
    <Shell
      title="Team & Student Management"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <AdminTeamsClientWrapper>
        {teams.length === 0 ? (
          <EmptyState
            title="No Teams Found"
            description="Import teams via CSV or add them manually to begin."
            icon="👥"
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SIH Code</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Student Members</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-mono font-bold text-blue-600 text-xs">
                      {team.team_code}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{team.team_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {team.id.slice(0, 8)}...</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {team.students && team.students.length > 0 ? (
                          team.students.map((student: StudentRow) => (
                            <div key={student.id} className="text-xs text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>{student.name}</span>
                              {student.roll_number && <span className="font-mono text-[10px] text-slate-500">({student.roll_number})</span>}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No members listed</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.status as 'shortlisted' | 'registered' | 'round1_pending' | 'selected' | 'standby'}>
                        {team.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminTeamsClientWrapper>
    </Shell>
  );
}
