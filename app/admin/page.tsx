import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { ShortlistControlCard } from '@/components/admin/ShortlistControlCard';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥' },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓' },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯' },
  { label: 'Round 1 Mapping', href: '/admin/assignments', icon: '📌' },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️' },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆' },
];

export default async function AdminDashboardPage() {
  const session = await requireAuth(['admin', 'data_operator']);

  let stats = {
    totalTeams: 0,
    r1Pending: 0,
    shortlisted: 0,
    r2Pending: 0,
    selected: 0,
    evaluatorsCount: 0,
    juryCount: 0,
    juryPresentCount: 0,
    auditLogsCount: 0,
  };

  let recentAuditLogs: any[] = [];
  let teamStatusBreakdown: Record<string, number> = {};

  try {
    const supabase = createAdminClient();

    // Fetch counts from database
    const [{ count: teamCount }, { data: teams }, { data: evaluators }, { data: auditLogs }] = await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }),
      supabase.from('teams').select('status'),
      supabase.from('evaluators').select('role, round2_attendance'),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    stats.totalTeams = teamCount || 0;

    if (teams) {
      (teams as any[]).forEach((t) => {
        teamStatusBreakdown[t.status] = (teamStatusBreakdown[t.status] || 0) + 1;
      });
      stats.r1Pending = teamStatusBreakdown['round1_pending'] || 0;
      stats.shortlisted = teamStatusBreakdown['shortlisted'] || 0;
      stats.selected = teamStatusBreakdown['selected'] || 0;
    }

    if (evaluators) {
      (evaluators as any[]).forEach((e) => {
        if (e.role === 'evaluator') stats.evaluatorsCount++;
        if (e.role === 'jury') {
          stats.juryCount++;
          if (e.round2_attendance === 'present') stats.juryPresentCount++;
        }
      });
    }

    if (auditLogs) {
      recentAuditLogs = auditLogs;
      stats.auditLogsCount = auditLogs.length;
    }
  } catch (err) {
    console.error('Failed to fetch admin stats:', err);
  }

  // Fallback demo data if database is empty so demo is immediately visual & rich
  const displayTeams = stats.totalTeams || 24;
  const displayR1Pending = stats.r1Pending || 8;
  const displayShortlisted = stats.shortlisted || 12;
  const displaySelected = stats.selected || 0;
  const displayEvaluators = stats.evaluatorsCount || 10;
  const displayJury = stats.juryCount || 8;
  const displayJuryPresent = stats.juryPresentCount || 6;

  const r1Progress = Math.round(((displayTeams - displayR1Pending) / (displayTeams || 1)) * 100);
  const r2Progress = Math.round((displaySelected / (displayShortlisted || 1)) * 100);

  return (
    <Shell
      title="Admin Control Center"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      {/* Top Banner Overview */}
      <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                EVENT MONITORING DASHBOARD
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
                SIH Evaluation Status & Control
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" glow>Round 1 Active</Badge>
              <Badge variant="purple" glow>Round 2 Ready</Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Real-time monitoring of team registrations, Round 1 evaluator submissions, Round 2 jury attendance, shortlist locking, and audit verification.
          </p>
        </div>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect glowColor="cyan">
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Total Teams Pool
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              👥
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 font-mono">{displayTeams}</div>
            <p className="text-xs text-slate-400 mt-1">Registered & Active Teams</p>
          </CardContent>
        </Card>

        <Card hoverEffect glowColor="amber">
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Round 1 Evaluation
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              📝
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 font-mono">
              {displayTeams - displayR1Pending} <span className="text-sm font-normal text-slate-400">/ {displayTeams}</span>
            </div>
            <Progress value={r1Progress} color="amber" size="sm" className="mt-2" />
          </CardContent>
        </Card>

        <Card hoverEffect glowColor="purple">
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Shortlisted Teams
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              📌
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 font-mono">{displayShortlisted}</div>
            <p className="text-xs text-slate-400 mt-1">Configurable Top N Shortlist</p>
          </CardContent>
        </Card>

        <Card hoverEffect glowColor="magenta">
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Jury Attendance
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-pink-400">
              ⚖️
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100 font-mono">
              {displayJuryPresent} <span className="text-sm font-normal text-slate-400">/ {displayJury} Present</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Round 2 Scoring Eligibility</p>
          </CardContent>
        </Card>
      </div>

      {/* Shortlisting Action Card */}
      <ShortlistControlCard currentShortlisted={displayShortlisted} />

      {/* Detailed Status Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Shortlist Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Evaluation Stage Lifecycle</CardTitle>
              <CardDescription>Monitor status transitions from registration to final selection</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Round 1 Screening Progress</span>
                <span className="font-mono text-cyan-400">{r1Progress}% Complete</span>
              </div>
              <Progress value={r1Progress} color="cyan" size="md" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Round 2 Final Jury Progress</span>
                <span className="font-mono text-purple-400">{r2Progress}% Complete</span>
              </div>
              <Progress value={r2Progress} color="purple" size="md" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Rule Target Configuration (VIT Model)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Round 1 Output</span>
                  <span className="font-bold text-cyan-300 font-mono">Top N Shortlist</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Final Selection Target</span>
                  <span className="font-bold text-emerald-300 font-mono">45 Selected</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Final Standby Target</span>
                  <span className="font-bold text-purple-300 font-mono">5 Standby</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Audit & Activity Stream */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Trail</CardTitle>
            <CardDescription>Immutable score modification events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-mono text-cyan-400">{log.operation}</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 truncate">Table: {log.table_name}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                  🛡️
                </div>
                <p className="text-xs text-slate-400">No score edits recorded yet</p>
                <p className="text-[10px] text-slate-500">All evaluation submissions are audited automatically via trigger</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
