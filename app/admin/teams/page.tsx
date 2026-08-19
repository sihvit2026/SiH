import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { AdminTeamsClientWrapper } from '@/components/admin/AdminTeamsClientWrapper';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓' },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯' },
  { label: 'Round 1 Mapping', href: '/admin/assignments', icon: '📌' },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];

export default async function AdminTeamsPage() {
  const session = await requireAuth(['admin', 'data_operator']);
  let teams: any[] = [];

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

  // Fallback demo teams if database is empty
  if (teams.length === 0) {
    teams = [
      {
        id: 'team-1',
        team_name: 'CyberGuard AI',
        team_code: 'SIH2026-001',
        status: 'shortlisted',
        students: [
          { id: 's1', name: 'Aarav Sharma', roll_number: '21BCE012', email: 'aarav@vit.ac.in' },
          { id: 's2', name: 'Ananya Verma', roll_number: '21BCE045', email: 'ananya@vit.ac.in' },
        ],
      },
      {
        id: 'team-2',
        team_name: 'Neural Grid Tech',
        team_code: 'SIH2026-002',
        status: 'round1_pending',
        students: [
          { id: 's3', name: 'Rohan Patel', roll_number: '21BCE102', email: 'rohan@vit.ac.in' },
        ],
      },
      {
        id: 'team-3',
        team_name: 'Quantum BioMed',
        team_code: 'SIH2026-003',
        status: 'selected',
        students: [
          { id: 's4', name: 'Priya Nair', roll_number: '21ECE088', email: 'priya@vit.ac.in' },
        ],
      },
      {
        id: 'team-4',
        team_name: 'AgriSense IoT',
        team_code: 'SIH2026-004',
        status: 'standby',
        students: [
          { id: 's5', name: 'Karan Singh', roll_number: '21MECH014', email: 'karan@vit.ac.in' },
        ],
      },
    ];
  }

  return (
    <Shell
      title="Team & Student Management"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      <AdminTeamsClientWrapper>
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
                  <TableCell className="font-mono font-bold text-cyan-400 text-xs">
                    {team.team_code}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-100">{team.team_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {team.id.slice(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {team.students && team.students.length > 0 ? (
                        team.students.map((student: any) => (
                          <div key={student.id} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
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
                    <Badge variant={team.status as any} glow>
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
      </AdminTeamsClientWrapper>
    </Shell>
  );
}
