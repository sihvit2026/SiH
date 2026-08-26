import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { ShortlistControlCard } from '@/components/admin/ShortlistControlCard';

export const dynamic = 'force-dynamic';

import { adminNavItems } from '@/lib/nav';

export default async function AdminDashboardPage() {
  const session = await requireAuth(['admin', 'data_operator']);

  const stats = {
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
  const recentAuditLogs: { id: string; operation: string; table_name: string; created_at: string }[] = [];
  const teamStatusBreakdown: Record<string, number> = {};

  try {
    const supabase = createAdminClient();

    // Use count queries instead of fetching all rows
    const [
      { count: totalTeams },
      { count: r1Pending },
      { count: shortlisted },
      { count: selected },
      { count: evaluatorsCount },
      { count: juryCount },
      { count: juryPresentCount },
      { data: auditLogs },
    ] = await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'round1_pending'),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'shortlisted'),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'selected'),
      supabase.from('evaluators').select('*', { count: 'exact', head: true }).eq('role', 'evaluator'),
      supabase.from('evaluators').select('*', { count: 'exact', head: true }).eq('role', 'jury'),
      supabase.from('evaluators').select('*', { count: 'exact', head: true }).eq('role', 'jury').eq('round2_attendance', 'present'),
      supabase.from('audit_log').select('id, operation, table_name, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    stats.totalTeams = totalTeams || 0;
    stats.r1Pending = r1Pending || 0;
    stats.shortlisted = shortlisted || 0;
    stats.selected = selected || 0;
    stats.evaluatorsCount = evaluatorsCount || 0;
    stats.juryCount = juryCount || 0;
    stats.juryPresentCount = juryPresentCount || 0;

    if (auditLogs) {
      recentAuditLogs.push(...auditLogs);
      stats.auditLogsCount = auditLogs.length;
    }
  } catch (err) {
    console.error('Failed to fetch admin stats:', err);
  }

  const displayTeams = stats.totalTeams || 0;
  const displayR1Pending = stats.r1Pending || 0;
  const displayShortlisted = stats.shortlisted || 0;
  const displaySelected = stats.selected || 0;
  const displayJury = stats.juryCount || 0;
  const displayJuryPresent = stats.juryPresentCount || 0;

  const r1Progress = displayTeams > 0 ? Math.round(((displayTeams - displayR1Pending) / displayTeams) * 100) : 0;
  const r2Progress = displayShortlisted > 0 ? Math.round((displaySelected / displayShortlisted) * 100) : 0;

  return (
    <Shell
      title="Admin Control Center"
      roleName={session.role === 'admin' ? 'SIH Super Admin' : 'Data Operator'}
      roleType="admin"
      userName={session.name}
      navItems={adminNavItems}
    >
      {/* Top Banner Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-blue-600 uppercase tracking-widest">
                EVENT MONITORING DASHBOARD
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                SIH Evaluation Status & Control
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">Round 1 Active</Badge>
              <Badge variant="purple">Round 2 Ready</Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time monitoring of team registrations, Round 1 evaluator submissions, Round 2 jury attendance, shortlist locking, and audit verification.
          </p>
        </div>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Total Teams Pool
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              👥
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 font-mono">{displayTeams}</div>
            <p className="text-xs text-slate-500 mt-1">Registered & Active Teams</p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Round 1 Evaluation
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              📝
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {displayTeams - displayR1Pending} <span className="text-sm font-normal text-slate-500">/ {displayTeams}</span>
            </div>
            <Progress value={r1Progress} color="amber" size="sm" className="mt-2" />
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Shortlisted Teams
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              📌
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 font-mono">{displayShortlisted}</div>
            <p className="text-xs text-slate-500 mt-1">Configurable Top N Shortlist</p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="mb-2 pb-0 border-b-0">
            <CardDescription className="uppercase tracking-wider font-mono text-[10px]">
              Jury Attendance
            </CardDescription>
            <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
              ⚖️
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {displayJuryPresent} <span className="text-sm font-normal text-slate-500">/ {displayJury} Present</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Round 2 Scoring Eligibility</p>
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
                <span className="font-semibold text-slate-700">Round 1 Screening Progress</span>
                <span className="font-mono text-blue-600">{r1Progress}% Complete</span>
              </div>
              <Progress value={r1Progress} color="cyan" size="md" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Round 2 Final Jury Progress</span>
                <span className="font-mono text-purple-600">{r2Progress}% Complete</span>
              </div>
              <Progress value={r2Progress} color="purple" size="md" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Rule Target Configuration (VIT Model)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white shadow-sm border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Round 1 Output</span>
                  <span className="font-bold text-blue-600 font-mono">Top N Shortlist</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white shadow-sm border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Final Selection Target</span>
                  <span className="font-bold text-emerald-600 font-mono">45 Selected</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white shadow-sm border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Final Standby Target</span>
                  <span className="font-bold text-purple-600 font-mono">5 Standby</span>
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
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono text-blue-600">{log.operation}</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 truncate">Table: {log.table_name}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center mx-auto text-slate-500">
                  🛡️
                </div>
                <p className="text-xs text-slate-500">No score edits recorded yet</p>
                <p className="text-[10px] text-slate-500">All evaluation submissions are audited automatically via trigger</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}