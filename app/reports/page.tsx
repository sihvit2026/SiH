import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { ReportsExportActions } from '@/components/reports/ReportsExportActions';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Round1AverageRow, Round2AverageRow } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

<<<<<<< HEAD
import { adminNavItems as reportsNavItems } from '@/lib/nav';
export default async function ReportsPage() {
  const session = await requireAuth();
  
=======
const reportsNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Problem Statements', href: '/admin/problem-statements', icon: '📋' },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓' },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯' },
  { label: 'Round 1 / Round 2 Mapping', href: '/admin/assignments', icon: '📌' },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];
export default async function ReportsPage() {
  const session = await requireAuth();
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
  let round1Averages: Round1AverageRow[] = [];
  let round2Averages: Round2AverageRow[] = [];

  try {
    const supabase = createAdminClient();

    // Query database views
    const [{ data: r1Data }, { data: r2Data }] = await Promise.all([
<<<<<<< HEAD
      supabase.from('team_round1_average').select('team_id, team_name, event_id, avg_score, evaluator_count, score_count').order('avg_score', { ascending: false }),
      supabase.from('team_round2_average').select('team_id, team_name, event_id, avg_score, jury_count, score_count').order('avg_score', { ascending: false }),
=======
      supabase.from('team_round1_average').select('*').order('avg_score', { ascending: false }),
      supabase.from('team_round2_average').select('*').order('avg_score', { ascending: false }),
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
    ]);

    if (r1Data) round1Averages = r1Data;
    if (r2Data) round2Averages = r2Data;
  } catch (err) {
    console.error('Failed to fetch reports view data:', err);
  }

  // Fallback demo rankings removed

  return (
    <Shell
      title="Merit Leaderboards & Official Reports"
      roleName="SIH Executive Report"
      roleType="admin"
      userName={session.name}
      navItems={reportsNavItems}
      actions={<ReportsExportActions />}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">SIH Official Merit Standings</h1>
        <p className="text-sm text-slate-500">
          Aggregated scores calculated from database views `team_round1_average` and `team_round2_average`
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round 1 Ranking Leaderboard */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-slate-900">Round 1 Screening Leaderboard</CardTitle>
              <CardDescription>Average Evaluator Score per Team across all criteria</CardDescription>
            </div>
            <Badge variant="slate">View: team_round1_average</Badge>
          </CardHeader>
          <CardContent>
            {round1Averages.length === 0 ? (
              <EmptyState title="No Round 1 Scores Yet" description="Once evaluators submit scores, the leaderboard will appear here." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Evaluators</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {round1Averages.map((row, index) => (
                      <TableRow key={row.team_id || index}>
                        <TableCell className="font-mono text-slate-600 font-bold">#{index + 1}</TableCell>
                        <TableCell className="font-semibold text-slate-900">{row.team_name}</TableCell>
                        <TableCell className="font-mono font-bold text-slate-700">
                          {row.avg_score ?? 'N/A'} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {row.evaluator_count || 0} Evaluators
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Round 2 Jury Final Merit List */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-slate-900">Round 2 Final Merit Ranking</CardTitle>
              <CardDescription>Jury Average Score (VIT Model: Target 45 Selected + 5 Standby)</CardDescription>
            </div>
            <Badge variant="slate">View: team_round2_average</Badge>
          </CardHeader>
          <CardContent>
            {round2Averages.length === 0 ? (
              <EmptyState title="No Final Jury Scores Yet" description="Once jury members submit scores, the final rankings will appear here." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merit Rank</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Jury Avg</TableHead>
                      <TableHead>Final Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {round2Averages.map((row, index) => (
                      <TableRow key={row.team_id || index}>
                        <TableCell className="font-mono text-slate-600 font-bold">#{index + 1}</TableCell>
                        <TableCell className="font-semibold text-slate-900">{row.team_name}</TableCell>
                        <TableCell className="font-mono font-bold text-slate-700">
                          {row.avg_score ?? 'N/A'} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(row.result || (index === 2 ? 'standby' : 'selected')) as 'selected' | 'standby'}>
                            {(row.result || (index === 2 ? 'standby' : 'selected')).toUpperCase()}
                          </Badge>
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
    </Shell>
  );
}
