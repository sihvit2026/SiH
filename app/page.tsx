import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 synthwave-grid flex flex-col justify-between text-slate-100 p-4 sm:p-8">
      {/* Header Bar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-black text-cyan-400 text-base">
              SIH
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-slate-100">SIH EVALUATION CENTER</h1>
            <p className="text-[10px] font-mono text-cyan-400">VIT DIGITAL PLATFORM</p>
          </div>
        </div>
        <Link href="/login">
          <Button variant="primary" size="sm">
            Sign In to Platform →
          </Button>
        </Link>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl w-full mx-auto text-center space-y-8 py-12 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>PRODUCTION-READY EVALUATION PORTAL</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-tight">
          Role-Based Evaluation & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-400">
            Real-Time Merit Tallying
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Secure multi-role evaluation platform built with Next.js 16, Supabase RLS, and a high-performance Synthwave control interface. Built for internal screening and external jury panels.
        </p>

        {/* Quick Portal Access Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
          <Link href="/admin" className="block">
            <div className="glass-panel p-5 rounded-xl border-pink-500/30 hover:border-pink-400/60 glass-panel-hover text-left space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="font-bold text-pink-300 text-base">Admin Panel</h3>
              <p className="text-xs text-slate-400">Dashboard, Team Roster, Criteria Builder & Audit Logs</p>
            </div>
          </Link>

          <Link href="/round1" className="block">
            <div className="glass-panel p-5 rounded-xl border-cyan-500/30 hover:border-cyan-400/60 glass-panel-hover text-left space-y-2">
              <div className="text-2xl">📝</div>
              <h3 className="font-bold text-cyan-300 text-base">Round 1 Evaluator</h3>
              <p className="text-xs text-slate-400">Assigned team scoring, criteria inputs & comments</p>
            </div>
          </Link>

          <Link href="/round2" className="block">
            <div className="glass-panel p-5 rounded-xl border-purple-500/30 hover:border-purple-400/60 glass-panel-hover text-left space-y-2">
              <div className="text-2xl">⚖️</div>
              <h3 className="font-bold text-purple-300 text-base">Round 2 Jury</h3>
              <p className="text-xs text-slate-400">Jury panel evaluation with attendance locking</p>
            </div>
          </Link>

          <Link href="/reports" className="block">
            <div className="glass-panel p-5 rounded-xl border-emerald-500/30 hover:border-emerald-400/60 glass-panel-hover text-left space-y-2">
              <div className="text-2xl">🏆</div>
              <h3 className="font-bold text-emerald-300 text-base">Merit & Reports</h3>
              <p className="text-xs text-slate-400">Aggregated leaderboards, 45 selected & 5 standby</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        SIH Evaluation Web App • VIT Requirements Compliant • Supabase Row Level Security Enforced
      </footer>
    </div>
  );
}
