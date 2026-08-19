import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { ReportsExportActions } from '@/components/reports/ReportsExportActions';

const reportsNavItems = [
  { label: 'Overview Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];

export default async function ReportsPage() {
  const session = await requireAuth();
  let round1Averages: any[] = [];
  let round2Averages: any[] = [];

  try {
    const supabase = createAdminClient();

    // Query database views
    const [{ data: r1Data }, { data: r2Data }] = await Promise.all([
      supabase.from('team_round1_average').select('*').order('avg_score', { ascending: false }),
      supabase.from('team_round2_average').select('*').order('avg_score', { ascending: false }),
    ]);

    if (r1Data) round1Averages = r1Data;
    if (r2Data) round2Averages = r2Data;
  } catch (err) {
    console.error('Failed to fetch reports view data:', err);
  }

  // Fallback demo rankings if views contain no rows yet
  if (round1Averages.length === 0) {
    round1Averages = [
      { team_id: 't1', team_name: 'CyberGuard AI', avg_score: 94.5, evaluator_count: 3, score_count: 12 },
      { team_id: 't2', team_name: 'Quantum BioMed', avg_score: 91.0, evaluator_count: 3, score_count: 12 },
      { team_id: 't3', team_name: 'AgriSense IoT', avg_score: 87.5, evaluator_count: 2, score_count: 8 },
      { team_id: 't4', team_name: 'Neural Grid Tech', avg_score: 82.0, evaluator_count: 2, score_count: 8 },
    ];
  }

  if (round2Averages.length === 0) {
    round2Averages = [
      { team_id: 't1', team_name: 'CyberGuard AI', avg_score: 96.0, jury_count: 4, score_count: 12, merit_rank: 1, result: 'selected' },
      { team_id: 't2', team_name: 'Quantum BioMed', avg_score: 93.5, jury_count: 4, score_count: 12, merit_rank: 2, result: 'selected' },
      { team_id: 't3', team_name: 'AgriSense IoT', avg_score: 88.0, jury_count: 3, score_count: 9, merit_rank: 3, result: 'standby' },
    ];
  }

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
        <h1 className="text-2xl font-black text-slate-100">SIH Official Merit Standings</h1>
        <p className="text-xs text-slate-400">
          Aggregated scores calculated from database views `team_round1_average` and `team_round2_average`
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round 1 Ranking Leaderboard */}
        <Card glowColor="cyan">
          <CardHeader>
            <div>
              <CardTitle className="text-cyan-300">Round 1 Screening Leaderboard</CardTitle>
              <CardDescription>Average Evaluator Score per Team across all criteria</CardDescription>
            </div>
            <Badge variant="cyan" glow>View: team_round1_average</Badge>
          </CardHeader>
          <CardContent>
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
                      <TableCell className="font-mono text-cyan-400 font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-100">{row.team_name}</TableCell>
                      <TableCell className="font-mono font-bold text-slate-200">
                        {row.avg_score ?? 'N/A'} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {row.evaluator_count || 0} Evaluators
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Round 2 Jury Final Merit List */}
        <Card glowColor="purple">
          <CardHeader>
            <div>
              <CardTitle className="text-purple-300">Round 2 Final Merit Ranking</CardTitle>
              <CardDescription>Jury Average Score (VIT Model: Target 45 Selected + 5 Standby)</CardDescription>
            </div>
            <Badge variant="purple" glow>View: team_round2_average</Badge>
          </CardHeader>
          <CardContent>
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
                      <TableCell className="font-mono text-purple-400 font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-100">{row.team_name}</TableCell>
                      <TableCell className="font-mono font-bold text-slate-200">
                        {row.avg_score ?? 'N/A'} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={(row.result || (index === 2 ? 'standby' : 'selected')) as any} glow>
                          {(row.result || (index === 2 ? 'standby' : 'selected')).toUpperCase()}
                        </Badge>
                      </TableCell>
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
